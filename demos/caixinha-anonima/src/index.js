// Caixinha Anônima: caixa de sugestões no plano Free da Cloudflare.
// GET  /api/config     -> título e sitekey do Turnstile para a página.
// POST /api/sugestoes  -> confere o Turnstile no servidor e grava no D1.
// GET  /api/sugestoes  -> lista para quem lê (pede a CHAVE_ADMIN).

const CATEGORIAS = ["Ideia", "Problema", "Elogio", "Outro"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/config") {
        return Response.json({ titulo: env.TITULO, sitekey: env.TURNSTILE_SITEKEY, modoLocal: env.MODO_LOCAL === "1", categorias: CATEGORIAS });
      }
      if (url.pathname === "/api/sugestoes" && request.method === "POST") return enviar(request, env);
      if (url.pathname === "/api/sugestoes" && request.method === "GET") return listar(request, env);
      return new Response("Não encontrado.", { status: 404 });
    } catch (erro) {
      console.error(erro);
      return Response.json({ erro: "Algo deu errado. Tente de novo." }, { status: 500 });
    }
  },
};

async function enviar(request, env) {
  const dados = await request.json().catch(() => ({}));
  const texto = String(dados.texto || "").trim();
  const categoria = CATEGORIAS.includes(dados.categoria) ? dados.categoria : "Outro";
  if (texto.length < 5 || texto.length > 1000) {
    return Response.json({ erro: "Escreva entre 5 e 1000 caracteres." }, { status: 400 });
  }
  // O navegador manda o token do Turnstile. Quem confere é o servidor, nunca a página.
  if (!(await turnstileValido(dados.token, env))) {
    return Response.json({ erro: "Não conseguimos confirmar que você não é um robô. Recarregue e tente de novo." }, { status: 403 });
  }
  await env.DB.prepare("INSERT INTO sugestoes (categoria, texto) VALUES (?, ?)").bind(categoria, texto).run();
  return Response.json({ ok: true }, { status: 201 });
}

async function turnstileValido(token, env) {
  if (env.MODO_LOCAL === "1") return true; // só para testar sem internet
  if (!token) return false;
  const corpo = new FormData();
  corpo.append("secret", env.TURNSTILE_SECRET);
  corpo.append("response", token);
  // Repare: não mandamos o IP (remoteip é opcional). Assim a Caixinha não depende dele.
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: corpo });
  const resultado = await r.json();
  return resultado.success === true;
}

async function listar(request, env) {
  const chave = (request.headers.get("Authorization") || "").replace(/^Bearer /, "");
  if (!env.CHAVE_ADMIN || chave !== env.CHAVE_ADMIN) return Response.json({ erro: "Chave inválida." }, { status: 401 });
  const { results } = await env.DB.prepare("SELECT id, categoria, texto, dia FROM sugestoes ORDER BY id DESC LIMIT 200").all();
  return Response.json({ sugestoes: results });
}
