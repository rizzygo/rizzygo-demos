# Construa a Sala do Café com IA

Cole o texto abaixo em qualquer IA de código (no chat ou num agente como Claude Code, Codex ou Gemini CLI). Ele pede para a IA ir em etapas, explicar antes de rodar e esperar você confirmar. O objetivo é você entender cada peça do código.

Se travar, compare com o código desta pasta.

---

```text
Quero construir um projeto de estudo chamado Sala do Café: um quadro de retrospectiva em tempo real, em que várias pessoas mexem nos mesmos cartões.

Regras:
- Custo zero. Use só o plano Free da Cloudflare (Workers e Durable Objects com SQLite) e o wrangler. Nada que peça cartão de crédito ou plano pago.
- Vá em etapas. Em cada etapa: explique o que vai fazer e por quê, mostre o código ou o comando,
  diga como eu confiro que funcionou e espere eu responder "ok" antes de seguir.
- Antes de qualquer comando que mude algo fora da pasta do projeto (login, deploy, criar banco),
  diga o que muda e como desfazer.
- Use JavaScript puro, sem framework no front-end. Comente o código em português.
- Termos técnicos podem ficar em inglês.

Etapas:
1. Explique o que é um Durable Object e por que um por sala resolve a edição ao mesmo tempo.
2. Crie o Worker e a classe Sala, com a migração new_sqlite_classes (a única aceita no plano Free).
3. Faça GET /sala/<nome>/ws abrir um WebSocket com o objeto idFromName(nome), usando a Hibernation API (acceptWebSocket).
4. Guarde os cartões no SQLite do objeto (ctx.storage.sql) e trate as mensagens criar, votar, mover e apagar.
   Depois de cada mudança, mande o estado inteiro para todos os sockets.
5. Faça a página com três colunas (Foi bem, Pode melhorar, Ações), contagem de pessoas na sala e reconexão com espera crescente.
6. Teste com duas janelas na mesma sala.
7. Publique com wrangler deploy e explique como o tempo hibernando ajuda a caber na cota.

No fim, me faça 3 perguntas para eu explicar com as minhas palavras o que construí.
```
