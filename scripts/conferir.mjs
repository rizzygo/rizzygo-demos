// Confere o monorepo: o mesmo que o CI roda.
// 1. Cada demo tem README.md, PROMPT.md e a pasta prints/.
// 2. O public/estilo.css de cada demo é igual ao scripts/estilo-base.css.
// 3. Nenhum segredo de verdade no git (.dev.vars fica fora; só o .dev.vars.example entra).
// 4. Cada demo monta sem erro (npm run conferir de cada workspace: wrangler --dry-run ou esbuild).
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const raiz = new URL("..", import.meta.url).pathname;
const base = readFileSync(join(raiz, "scripts/estilo-base.css"), "utf8");
const demos = readdirSync(join(raiz, "demos"));
let erros = 0;
const falha = (msg) => { console.error("✘", msg); erros++; };

for (const demo of demos) {
  const pasta = join(raiz, "demos", demo);
  for (const arquivo of ["README.md", "PROMPT.md", "prints", "public/estilo.css"]) {
    if (!existsSync(join(pasta, arquivo))) falha(`${demo}: falta ${arquivo}`);
  }
  if (existsSync(join(pasta, "public/estilo.css")) && readFileSync(join(pasta, "public/estilo.css"), "utf8") !== base) {
    falha(`${demo}: public/estilo.css diferente de scripts/estilo-base.css (copie de novo)`);
  }
}

const rastreados = execSync("git ls-files", { cwd: raiz, encoding: "utf8" }).split("\n");
for (const f of rastreados) {
  if (/(^|\/)\.dev\.vars$|(^|\/)\.env$|serviceAccount.*\.json$/.test(f)) falha(`arquivo de segredo no git: ${f}`);
}

for (const demo of demos) {
  try {
    execSync("npm run conferir --silent", { cwd: join(raiz, "demos", demo), stdio: "pipe" });
    console.log("✔", demo, "monta sem erro");
  } catch (e) {
    falha(`${demo}: npm run conferir falhou\n${e.stdout}${e.stderr}`);
  }
}

if (erros) { console.error(`\n${erros} problema(s).`); process.exit(1); }
console.log("\nTudo certo.");
