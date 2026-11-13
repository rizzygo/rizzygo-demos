# AGENTS.md: rizzygo-demos

Este arquivo vale para qualquer agente de IA (Claude Code, Codex, Gemini CLI, Copilot, Cursor) e para pessoas. O `CLAUDE.md` só aponta para cá.

## O que é este repositório

Demos públicas do artigo [Dez projetos reais que custam zero real](https://rizzygo.com.br/projetos-free-tier-firebase-cloudflare). Cada demo roda só no plano Spark do Firebase e no plano Free da Cloudflare. Público: estudantes e mentorados começando em cloud. Conteúdo em português.

## Cada demo é uma pasta completa

Cada pasta em `demos/` é um projeto completo: código, página, banco, README, prompt e prints. Para mexer numa demo, abra só a pasta dela. Uma demo não importa código de outra.

| Demo | Peças |
| --- | --- |
| `demos/encurtai/` | Workers, KV, D1 |
| `demos/ta-no-ar/` | Workers, Cron Triggers, D1 |
| `demos/mural-vivo/` | Firebase Authentication, Firestore, Hosting, emuladores |
| `demos/caixinha-anonima/` | Workers, Turnstile, D1 |
| `demos/sala-do-cafe/` | Workers, Durable Objects (SQLite), WebSocket |

**Compartilhado:** `scripts/estilo-base.css` (cada demo tem uma cópia igual em `public/estilo.css`), `scripts/conferir.mjs` e `scripts/prints.cjs`.

## Comandos

```sh
npm install            # na raiz, uma vez (npm workspaces)
npm run conferir       # o mesmo que o CI: estrutura das demos e build de cada uma
npm run prints         # refaz os prints (demos rodando + Playwright)
```

Em cada demo: `npm run dev` roda local, `npm run deploy` publica.

## Regras

- **Custo zero sempre.** Nada que exija Blaze, Workers Paid, R2 ou cartão. Toda demo nova cabe no plano gratuito e o README mostra a conta da cota.
- **Roda sem conta.** `npm run dev` funciona sem login: `wrangler dev` local e projeto Firebase com id `demo-*`.
- **Segredos fora do git.** `.dev.vars` é ignorado; só `.dev.vars.example` entra, com valores de exemplo. Em produção, `wrangler secret put`.
- **Código simples e comentado em português.** JavaScript puro, sem framework no front-end. Termos técnicos em inglês ficam em inglês.
- **Toda demo tem** `README.md` (problema, aprendizado, arquitetura em mermaid, rodar, publicar, cota, desafios), `PROMPT.md` e `prints/`.
- **Print honesto.** Dado de exemplo ou modo local aparece avisado no README.
- **Versões fixas** no `package.json`. Atualize todas as demos juntas.
- Textos passam pelo Slop Stopper antes do commit.

## Commits

Conventional Commits em português, com a demo no escopo: `feat(encurtai): ...`, `docs(mural-vivo): ...`. Nada de push direto na `main` nem `--force`.
