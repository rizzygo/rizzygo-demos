// Encurtaí: encurtador de links no plano Free da Cloudflare.
// GET /<slug>        -> lê o KV e redireciona (302). O clique vai para o D1 depois da resposta.
// POST /api/links    -> cria um link (pede a CHAVE_ADMIN).
// GET /api/links     -> lista os links com o total de cliques (pede a CHAVE_ADMIN).
// O painel (public/index.html) é servido pelos static assets, sem passar por aqui.

const SLUG_VALIDO = /^[a-z0-9-]{3,40}$/;
const RESERVADOS = new Set(["api", "index", "estilo", "painel"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/links") {
        if (!autorizado(request, env)) return json({ erro: "Chave inválida." }, 401);
        if (request.method === "POST") return criar(request, env);
        if (request.method === "GET") return listar(env);
        return json({ erro: "Método não aceito." }, 405);
      }
      const slug = url.pathname.slice(1).toLowerCase();
      if (request.method === "GET" && SLUG_VALIDO.test(slug)) return redirecionar(slug, env, ctx);
      return new Response("Link não encontrado.", { status: 404 });
    } catch (erro) {
      console.error(erro);
      return json({ erro: "Algo deu errado. Veja o log com: npx wrangler tail" }, 500);
    }
  },
};

function autorizado(request, env) {
  const chave = (request.headers.get("Authorization") || "").replace(/^Bearer /, "");
  return Boolean(env.CHAVE_ADMIN) && chave === env.CHAVE_ADMIN;
}

async function redirecionar(slug, env, ctx) {
  const destino = await env.LINKS.get(slug); // 1 leitura de KV (100 mil por dia de graça)
  if (!destino) return new Response("Link não encontrado.", { status: 404 });
  // waitUntil: a gravação do clique roda depois que a pessoa já foi redirecionada.
  ctx.waitUntil(env.DB.prepare("INSERT INTO cliques (slug) VALUES (?)").bind(slug).run());
  return Response.redirect(destino, 302);
}

async function criar(request, env) {
  const dados = await request.json().catch(() => ({}));
  let destino;
  try {
    destino = new URL(dados.url);
  } catch {
    return json({ erro: "Cole um endereço completo, começando com https://" }, 400);
  }
  if (!["http:", "https:"].includes(destino.protocol)) return json({ erro: "Só endereços http ou https." }, 400);

  const slug = (dados.slug || gerarSlug()).toLowerCase();
  if (!SLUG_VALIDO.test(slug) || RESERVADOS.has(slug)) {
    return json({ erro: "Use de 3 a 40 letras minúsculas, números ou hífen." }, 400);
  }
  const existe = await env.DB.prepare("SELECT 1 FROM links WHERE slug = ?").bind(slug).first();
  if (existe) return json({ erro: "Esse nome já está em uso." }, 409);

  await env.DB.prepare("INSERT INTO links (slug, url) VALUES (?, ?)").bind(slug, destino.href).run();
  await env.LINKS.put(slug, destino.href); // 1 gravação de KV (mil por dia de graça)
  return json({ slug, url: destino.href }, 201);
}

async function listar(env) {
  const { results } = await env.DB.prepare(
    `SELECT l.slug, l.url, l.criado_em, COUNT(c.id) AS cliques
       FROM links l LEFT JOIN cliques c ON c.slug = l.slug
      GROUP BY l.slug ORDER BY l.criado_em DESC LIMIT 100`
  ).all();
  return json({ links: results });
}

function gerarSlug() {
  const letras = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => letras[b % letras.length]).join("");
}

function json(dados, status = 200) {
  return Response.json(dados, { status });
}
