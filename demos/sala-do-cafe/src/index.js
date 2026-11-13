// Sala do Café: quadro de retrospectiva em tempo real no plano Free da Cloudflare.
// Cada sala é um Durable Object: um único "dono" do estado, que todo mundo da sala conversa por WebSocket.
// GET /sala/<nome>/ws -> abre o WebSocket com o objeto da sala <nome>.

import { DurableObject } from "cloudflare:workers";

const COLUNAS = ["Foi bem", "Pode melhorar", "Ações"];
const NOME_VALIDO = /^[a-z0-9-]{3,40}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/sala\/([^/]+)\/ws$/);
    if (m) {
      const nome = m[1].toLowerCase();
      if (!NOME_VALIDO.test(nome)) return new Response("Nome de sala inválido.", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Use WebSocket.", { status: 426 });
      // idFromName: o mesmo nome sempre cai no mesmo objeto, em qualquer lugar do mundo.
      return env.SALAS.get(env.SALAS.idFromName(nome)).fetch(request);
    }
    return new Response("Não encontrado.", { status: 404 });
  },
};

export class Sala extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql; // banco SQLite só desta sala
    this.sql.exec(`CREATE TABLE IF NOT EXISTS cartoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, coluna TEXT NOT NULL, texto TEXT NOT NULL, votos INTEGER NOT NULL DEFAULT 0)`);
  }

  async fetch() {
    const par = new WebSocketPair();
    // acceptWebSocket (Hibernation API): o objeto pode "dormir" entre mensagens sem derrubar as conexões.
    // Tempo dormindo não conta como duração, o que ajuda a caber na cota gratuita.
    this.ctx.acceptWebSocket(par[1]);
    this.enviarEstado();
    return new Response(null, { status: 101, webSocket: par[0] });
  }

  async webSocketMessage(ws, mensagem) {
    let m;
    try { m = JSON.parse(mensagem); } catch { return; }
    const texto = String(m.texto || "").trim().slice(0, 200);
    if (m.tipo === "criar" && texto && COLUNAS.includes(m.coluna)) {
      this.sql.exec("INSERT INTO cartoes (coluna, texto) VALUES (?, ?)", m.coluna, texto);
    } else if (m.tipo === "votar") {
      this.sql.exec("UPDATE cartoes SET votos = votos + 1 WHERE id = ?", Number(m.id));
    } else if (m.tipo === "mover" && COLUNAS.includes(m.coluna)) {
      this.sql.exec("UPDATE cartoes SET coluna = ? WHERE id = ?", m.coluna, Number(m.id));
    } else if (m.tipo === "apagar") {
      this.sql.exec("DELETE FROM cartoes WHERE id = ?", Number(m.id));
    } else {
      return;
    }
    this.enviarEstado();
  }

  async webSocketClose() {
    this.enviarEstado(); // atualiza o "quem está aqui" para quem ficou
  }

  enviarEstado() {
    const sockets = this.ctx.getWebSockets();
    const cartoes = this.sql.exec("SELECT id, coluna, texto, votos FROM cartoes ORDER BY votos DESC, id").toArray();
    const estado = JSON.stringify({ colunas: COLUNAS, cartoes, pessoas: sockets.length });
    for (const ws of sockets) {
      try { ws.send(estado); } catch { /* conexão fechando */ }
    }
  }
}
