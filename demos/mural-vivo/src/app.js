// Mural Vivo: recados em tempo real com Firebase (plano Spark).
// Login anônimo com apelido, Firestore com listener (onSnapshot) e regras de segurança.
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously, updateProfile, signOut } from "firebase/auth";
import {
  getFirestore, connectFirestoreEmulator, collection, addDoc, deleteDoc, doc,
  query, orderBy, limit, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// No seu computador, a página conversa com os emuladores, não com a nuvem.
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

const $ = (id) => document.getElementById(id);
const recados = collection(db, "recados");
let pararDeOuvir = null;

onAuthStateChanged(auth, (usuario) => {
  $("entrada").hidden = Boolean(usuario);
  $("mural").hidden = !usuario;
  if (pararDeOuvir) { pararDeOuvir(); pararDeOuvir = null; }
  if (!usuario) return;
  $("quem").textContent = usuario.displayName || "Anônimo";
  // onSnapshot: o Firestore avisa a página a cada mudança. Cada recado novo = 1 leitura por pessoa com a tela aberta.
  // limit(50) segura a conta: sem ele, abrir a página leria o mural inteiro.
  const q = query(recados, orderBy("criadoEm", "desc"), limit(50));
  pararDeOuvir = onSnapshot(q, (snap) => desenhar(snap, usuario.uid), (erro) => mostrarErro(erro.message));
});

function desenhar(snap, uid) {
  const lista = $("lista");
  lista.innerHTML = snap.empty ? '<p class="vazio">Nenhum recado ainda. Escreva o primeiro!</p>' : "";
  snap.forEach((d) => {
    const r = d.data();
    const el = document.createElement("article");
    el.className = "recado" + (r.autorId === uid ? " meu" : "");
    el.innerHTML = '<header><b></b><time></time></header><p></p>';
    el.querySelector("b").textContent = r.autorNome;
    el.querySelector("time").textContent = r.criadoEm ? r.criadoEm.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "agora";
    el.querySelector("p").textContent = r.texto;
    if (r.autorId === uid) {
      const b = document.createElement("button");
      b.className = "secundario"; b.type = "button"; b.textContent = "apagar";
      b.onclick = () => deleteDoc(doc(db, "recados", d.id)).catch((e) => mostrarErro(e.message));
      el.querySelector("header").append(b);
    }
    lista.append(el);
  });
}

$("form-entrar").onsubmit = async (ev) => {
  ev.preventDefault();
  const nome = $("apelido").value.trim().slice(0, 40) || "Anônimo";
  const { user } = await signInAnonymously(auth);
  await updateProfile(user, { displayName: nome });
  $("quem").textContent = nome;
};

$("form-recado").onsubmit = async (ev) => {
  ev.preventDefault();
  const texto = $("texto").value.trim();
  if (!texto) return;
  try {
    await addDoc(recados, {
      texto,
      autorId: auth.currentUser.uid,
      autorNome: auth.currentUser.displayName || "Anônimo",
      criadoEm: serverTimestamp(), // a regra exige a hora do servidor
    });
    $("texto").value = "";
    contar();
  } catch (e) {
    mostrarErro(e.message);
  }
};

$("sair").onclick = () => signOut(auth);
$("texto").oninput = contar;
function contar() { $("contador").textContent = `${$("texto").value.length}/280`; }
function mostrarErro(texto) { $("erro").textContent = texto; setTimeout(() => { $("erro").textContent = ""; }, 5000); }
