# Construa o Encurtaí com IA

Cole o texto abaixo em qualquer IA de código (no chat ou num agente como Claude Code, Codex ou Gemini CLI). Ele pede para a IA ir em etapas, explicar antes de rodar e esperar você confirmar. O objetivo é você entender cada peça do código.

Se travar, compare com o código desta pasta.

---

```text
Quero construir um projeto de estudo chamado Encurtaí: um encurtador de links com contagem de cliques.

Regras:
- Custo zero. Use só o plano Free da Cloudflare (Workers, KV e D1) e o wrangler. Nada que peça cartão de crédito ou plano pago.
- Vá em etapas. Em cada etapa: explique o que vai fazer e por quê, mostre o código ou o comando,
  diga como eu confiro que funcionou e espere eu responder "ok" antes de seguir.
- Antes de qualquer comando que mude algo fora da pasta do projeto (login, deploy, criar banco),
  diga o que muda e como desfazer.
- Use JavaScript puro, sem framework no front-end. Comente o código em português.
- Termos técnicos podem ficar em inglês.

Etapas:
1. Crie o Worker com o wrangler e um endpoint que responde "ok". Rode local com wrangler dev.
2. Crie um KV e faça GET /<slug> ler o destino no KV e responder com redirect 302.
3. Crie POST /api/links que grava slug -> URL no KV, protegido por uma CHAVE_ADMIN em .dev.vars.
   Valide a URL (só http e https) e o slug (3 a 40 letras minúsculas, números e hífen).
4. Crie um D1 com as tabelas links e cliques. Grave cada clique no D1 com ctx.waitUntil,
   e explique por que os cliques não vão para o KV (limite de gravações por dia do plano Free).
5. Crie GET /api/links com a lista e o total de cliques, e um painel em public/index.html (static assets).
6. Publique: kv namespace create, d1 create, d1 execute --remote, secret put e deploy.
   Mostre como ver o consumo da cota no painel da Cloudflare.

No fim, me faça 3 perguntas para eu explicar com as minhas palavras o que construí.
```
