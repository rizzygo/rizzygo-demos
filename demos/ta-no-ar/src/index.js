// Tá no Ar?: página de status no plano Free da Cloudflare.
// scheduled()       -> roda a cada 5 minutos (Cron Trigger), testa cada site e grava no D1.
// GET /api/status   -> resumo das últimas 24 horas para a página (public/index.html).
// Local: npm run dev e depois abra http://localhost:8788/__scheduled para disparar um teste na hora.

export default {
  async scheduled(evento, env, ctx) {
    const sites = JSON.parse(env.SITES);
    // Os testes rodam em paralelo. Esperar a rede não conta nos 10 ms de CPU do plano Free.
    const resultados = await Promise.all(sites.map(testar));
    await env.DB.batch(resultados.map((r) =>
      env.DB.prepare("INSERT INTO testes (site, status, ms, no_ar) VALUES (?, ?, ?, ?)")
        .bind(r.site, r.status, r.ms, r.noAr ? 1 : 0)
    ));
    // Guarda só 7 dias, para o banco não crescer sem fim.
    ctx.waitUntil(env.DB.prepare("DELETE FROM testes WHERE em < datetime('now', '-7 days')").run());
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/status") return Response.json(await resumo(env));
    return new Response("Não encontrado.", { status: 404 });
  },
};

async function testar(site) {
  const inicio = Date.now();
  try {
    const r = await fetch(site, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(10_000) });
    return { site, status: r.status, ms: Date.now() - inicio, noAr: r.status < 400 };
  } catch {
    return { site, status: null, ms: Date.now() - inicio, noAr: false };
  }
}

async function resumo(env) {
  const sites = JSON.parse(env.SITES);
  const { results } = await env.DB.prepare(
    `SELECT site, em, status, ms, no_ar FROM testes
      WHERE em >= datetime('now', '-24 hours') ORDER BY em`
  ).all();
  return {
    atualizado: new Date().toISOString(),
    sites: sites.map((site) => {
      const testes = results.filter((t) => t.site === site);
      const noAr = testes.filter((t) => t.no_ar).length;
      const ultimo = testes.at(-1) || null;
      return {
        site,
        ultimo,
        uptime: testes.length ? Math.round((noAr / testes.length) * 10000) / 100 : null,
        mediaMs: testes.length ? Math.round(testes.reduce((s, t) => s + t.ms, 0) / testes.length) : null,
        // Uma barra por hora: verde se todos os testes da hora passaram.
        horas: porHora(testes),
      };
    }),
  };
}

function porHora(testes) {
  const horas = [];
  for (let h = 23; h >= 0; h--) {
    const fim = Date.now() - h * 3_600_000;
    const doIntervalo = testes.filter((t) => {
      const em = Date.parse(t.em.replace(" ", "T") + "Z");
      return em > fim - 3_600_000 && em <= fim;
    });
    horas.push(doIntervalo.length === 0 ? "sem-dado" : doIntervalo.every((t) => t.no_ar) ? "ok" : "falha");
  }
  return horas;
}
