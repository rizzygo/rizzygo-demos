# Construa o Mural Vivo com IA

Cole o texto abaixo em qualquer IA de código (no chat ou num agente como Claude Code, Codex ou Gemini CLI). Ele pede para a IA ir em etapas, explicar antes de rodar e esperar você confirmar. O objetivo é você entender cada peça do código.

Se travar, compare com o código desta pasta.

---

```text
Quero construir um projeto de estudo chamado Mural Vivo: um mural de recados da turma que atualiza em tempo real na tela de todo mundo.

Regras:
- Custo zero. Use só o plano Spark do Firebase (Authentication, Firestore e Hosting) e os emuladores do Firebase CLI. Nada que peça cartão de crédito ou plano pago.
- Vá em etapas. Em cada etapa: explique o que vai fazer e por quê, mostre o código ou o comando,
  diga como eu confiro que funcionou e espere eu responder "ok" antes de seguir.
- Antes de qualquer comando que mude algo fora da pasta do projeto (login, deploy, criar banco),
  diga o que muda e como desfazer.
- Use JavaScript puro, sem framework no front-end. Comente o código em português.
- Termos técnicos podem ficar em inglês.

Etapas:
1. Monte a pasta com firebase.json, um projeto com id começando por "demo-" e os emuladores de Auth, Firestore e Hosting.
   Explique por que o prefixo demo- deixa rodar sem conta.
2. Crie a página com login anônimo e apelido (updateProfile). Conecte nos emuladores quando estiver em localhost.
3. Grave recados no Firestore com addDoc e serverTimestamp.
4. Mostre os recados com onSnapshot, orderBy e limit(50). Explique quantas leituras cada recado novo gera.
5. Escreva o firestore.rules: só quem entrou lê; cria só no próprio nome, texto de 1 a 280 caracteres,
   criadoEm igual a request.time; ninguém edita; só o autor apaga. Teste uma gravação que a regra deve barrar.
6. Use esbuild para juntar o SDK num arquivo só (public/app.js).
7. Publique: crie o projeto no console sem ligar faturamento, ative o login anônimo, copie a config e rode firebase deploy.

No fim, me faça 3 perguntas para eu explicar com as minhas palavras o que construí.
```
