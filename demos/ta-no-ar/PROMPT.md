# Construa o Tá no Ar? com IA

Cole o texto abaixo em qualquer IA de código (no chat ou num agente como Claude Code, Codex ou Gemini CLI). Ele pede para a IA ir em etapas, explicar antes de rodar e esperar você confirmar. O objetivo é você entender cada peça do código.

Se travar, compare com o código desta pasta.

---

```text
Quero construir um projeto de estudo chamado Tá no Ar?: uma página de status que testa meus sites a cada 5 minutos e mostra as últimas 24 horas.

Regras:
- Custo zero. Use só o plano Free da Cloudflare (Workers, Cron Triggers e D1) e o wrangler. Nada que peça cartão de crédito ou plano pago.
- Vá em etapas. Em cada etapa: explique o que vai fazer e por quê, mostre o código ou o comando,
  diga como eu confiro que funcionou e espere eu responder "ok" antes de seguir.
- Antes de qualquer comando que mude algo fora da pasta do projeto (login, deploy, criar banco),
  diga o que muda e como desfazer.
- Use JavaScript puro, sem framework no front-end. Comente o código em português.
- Termos técnicos podem ficar em inglês.

Etapas:
1. Crie o Worker com um handler scheduled() que testa uma lista de sites (variável SITES no wrangler.jsonc)
   com fetch, timeout de 10 segundos e os testes em paralelo. Explique por que esperar a rede não gasta os 10 ms de CPU.
2. Crie um D1 com a tabela testes (site, em, status, ms, no_ar) e grave os resultados com um batch.
3. Configure o Cron Trigger a cada 5 minutos e mostre como disparar local com wrangler dev --test-scheduled.
4. Crie GET /api/status com uptime, tempo médio e uma marcação por hora das últimas 24 horas.
5. Faça a página em public/index.html com uma barra por hora (verde ou vermelha).
6. Apague testes com mais de 7 dias. Calcule quantas linhas por dia o projeto grava e compare com o limite do D1.
7. Publique: d1 create, d1 execute --remote e deploy.

No fim, me faça 3 perguntas para eu explicar com as minhas palavras o que construí.
```
