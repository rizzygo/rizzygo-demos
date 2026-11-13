// Tira os prints das cinco demos rodando no seu computador.
// Antes: rode "npm run dev" em cada demo (as portas ficam no wrangler.jsonc e no firebase.json).
// Precisa do Playwright: npm i -D playwright && npx playwright install chromium
// Uso: npm run prints
const path = require("path");
const fs = require("fs");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Instale o Playwright: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

const RAIZ = path.join(__dirname, "..");
const PC = { viewport: { width: 1100, height: 760 }, deviceScaleFactor: 2 };
const CELULAR = { viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function destino(demo, nome) {
  const pasta = path.join(RAIZ, "demos", demo, "prints");
  fs.mkdirSync(pasta, { recursive: true });
  return path.join(pasta, nome);
}

async function encurtai(navegador) {
  const p = await navegador.newPage(PC);
  await p.goto("http://localhost:8787/");
  await p.fill("#chave", "troque-esta-chave");
  await p.click("#entrar");
  await p.fill("#url", "https://ako.rizzygo.com.br/trilhas/");
  await p.fill("#slug", "trilhas-ako");
  await p.click("button[type=submit]");
  await p.waitForSelector("text=Pronto:");
  // Três cliques no link novo, para o contador mudar.
  for (let i = 0; i < 3; i++) await fetch("http://localhost:8787/trilhas-ako", { redirect: "manual" });
  await espera(500);
  await p.click("#entrar");
  await espera(500);
  await p.screenshot({ path: destino("encurtai", "painel.png"), fullPage: true });
  await p.close();
}

async function taNoAr(navegador) {
  for (const [nome, opcoes] of [["status.png", PC], ["status-celular.png", CELULAR]]) {
    const p = await navegador.newPage(opcoes);
    await p.goto("http://localhost:8788/");
    await p.waitForSelector(".barras span");
    await p.screenshot({ path: destino("ta-no-ar", nome), fullPage: true });
    await p.close();
  }
}

async function caixinha(navegador) {
  const p = await navegador.newPage(PC);
  await p.goto("http://localhost:8789/");
  await p.waitForSelector("#categoria option", { state: "attached" });
  await p.selectOption("#categoria", "Ideia");
  await p.fill("#texto", "Que tal uma sessão de estudo em grupo toda quinta, meia hora antes da daily?");
  await p.click("#enviar");
  await p.waitForSelector(".msg.ok");
  await p.screenshot({ path: destino("caixinha-anonima", "enviar.png"), fullPage: true });
  await p.goto("http://localhost:8789/admin.html");
  await p.fill("#chave", "troque-esta-chave");
  await p.click("#entrar");
  await p.waitForSelector(".sugestao");
  await p.screenshot({ path: destino("caixinha-anonima", "leitura.png"), fullPage: true });
  await p.close();
}

async function salaDoCafe(navegador) {
  const sala = "retro-da-sprint-" + Date.now().toString(36);
  const a = await navegador.newPage(PC);
  const b = await navegador.newPage(CELULAR);
  await a.goto(`http://localhost:8790/?sala=${sala}`);
  await b.goto(`http://localhost:8790/?sala=${sala}`);
  await a.waitForSelector("text=ao vivo");
  await b.waitForSelector("text=ao vivo");
  const criar = async (pagina, coluna, texto) => {
    const col = pagina.locator(".coluna", { has: pagina.locator(`h2:text-is("${coluna}")`) });
    await col.locator("input").fill(texto);
    await col.locator("input").press("Enter");
    await espera(300);
  };
  await criar(a, "Foi bem", "Deploy de quarta sem nenhum susto");
  await criar(b, "Foi bem", "Pair programming no bug do login");
  await criar(b, "Pode melhorar", "Daily passou de 30 minutos três vezes");
  await criar(a, "Ações", "Testar o rollback antes do próximo release");
  await b.locator("button", { hasText: "👍" }).first().click();
  await espera(300);
  await b.locator("button", { hasText: "👍" }).first().click();
  await espera(500);
  await a.screenshot({ path: destino("sala-do-cafe", "quadro.png"), fullPage: true });
  await b.screenshot({ path: destino("sala-do-cafe", "quadro-celular.png"), fullPage: true });
  await a.close();
  await b.close();
}

async function muralVivo(navegador) {
  // Duas pessoas em navegadores separados: o recado de uma aparece na tela da outra sem recarregar.
  const ctxA = await navegador.newContext(PC);
  const ctxB = await navegador.newContext(CELULAR);
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();
  for (const [p, nome] of [[a, "Ana"], [b, "Bruno"]]) {
    await p.goto("http://127.0.0.1:5000/");
    await p.waitForSelector("#entrada:not([hidden])");
    await p.fill("#apelido", nome);
    await p.click("#form-entrar button");
    await p.waitForSelector("#mural:not([hidden])");
  }
  const recado = async (p, texto) => {
    await p.fill("#texto", texto);
    await p.click("#form-recado button");
    await espera(600);
  };
  await recado(a, "Bom dia, turma! Hoje tem revisão de Docker às 19h.");
  await recado(b, "Vou chegar 10 minutos atrasado, guardem um lugar!");
  await recado(a, "Material da aula de ontem está no Ako, trilha Cloud.");
  await espera(800);
  await a.screenshot({ path: destino("mural-vivo", "mural.png"), fullPage: true });
  await b.screenshot({ path: destino("mural-vivo", "mural-celular.png"), fullPage: true });
  await ctxA.close();
  await ctxB.close();
}

(async () => {
  const navegador = await chromium.launch();
  const demos = { encurtai, taNoAr, caixinha, salaDoCafe, muralVivo };
  const escolhidas = process.argv.slice(2);
  for (const [nome, fn] of Object.entries(demos)) {
    if (escolhidas.length && !escolhidas.includes(nome)) continue;
    try {
      await fn(navegador);
      console.log("ok", nome);
    } catch (erro) {
      console.error("falhou", nome, "->", erro.message.split("\n")[0], "(a demo está rodando?)");
    }
  }
  await navegador.close();
})();
