# Construa a Caixinha Anônima com IA

Cole o texto abaixo em qualquer IA de código (no chat ou num agente como Claude Code, Codex ou Gemini CLI). Ele pede para a IA ir em etapas, explicar antes de rodar e esperar você confirmar. O objetivo é você entender cada peça do código.

Se travar, compare com o código desta pasta.

---

```text
Quero construir um projeto de estudo chamado Caixinha Anônima: uma caixa de sugestões anônima para um time ou turma, protegida contra robôs.

Regras:
- Custo zero. Use só o plano Free da Cloudflare (Workers, D1 e Turnstile) e o wrangler. Nada que peça cartão de crédito ou plano pago.
- Vá em etapas. Em cada etapa: explique o que vai fazer e por quê, mostre o código ou o comando,
  diga como eu confiro que funcionou e espere eu responder "ok" antes de seguir.
- Antes de qualquer comando que mude algo fora da pasta do projeto (login, deploy, criar banco),
  diga o que muda e como desfazer.
- Use JavaScript puro, sem framework no front-end. Comente o código em português.
- Termos técnicos podem ficar em inglês.

Etapas:
1. Crie o Worker com static assets e um formulário em public/index.html (categoria e texto).
2. Crie um D1 com a tabela sugestoes guardando só texto, categoria e o dia. Explique por que não guardar IP nem horário.
3. Adicione o Turnstile na página (render explícito) usando a sitekey de teste da Cloudflare.
4. No Worker, confira o token no siteverify antes de gravar. Use a chave secreta de teste em .dev.vars.
   Mostre o que acontece se eu mandar sem token.
5. Crie uma página de leitura (admin.html) protegida por CHAVE_ADMIN.
6. Publique: crie o widget do Turnstile no painel, d1 create, d1 execute --remote, secret put para TURNSTILE_SECRET e CHAVE_ADMIN, e deploy.

No fim, me faça 3 perguntas para eu explicar com as minhas palavras o que construí.
```
