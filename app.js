import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBX77uMe5MQdzvOEcymqyZzl9FjU__3lP0",
  authDomain: "oppressed-chat.firebaseapp.com",
  projectId: "oppressed-chat",
  storageBucket: "oppressed-chat.firebasestorage.app",
  messagingSenderId: "597084815974",
  appId: "1:597084815974:web:ffa9464d6df444455fe3a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function key() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function count() {
  return parseInt(localStorage.getItem(key())) || 0;
}

function inc() {
  localStorage.setItem(key(), count() + 1);
}

function updateLimit() {
  document.getElementById("limit").innerText = count() + "/3";
}

window.send = async function () {
  const text = document.getElementById("text").value;

  if (!text.trim()) return;
  if (count() >= 3) return alert("Limit reached");

  await addDoc(collection(db, "posts"), {
    content: text,
    createdAt: Date.now(),
    reactions: 0
  });

  inc();
  updateLimit();
  document.getElementById("text").value = "";
};

window.randomPost = async function () {
  const text = document.getElementById("text").value;

  if (!text.trim()) return;

  await addDoc(collection(db, "random"), {
    content: text,
    createdAt: Date.now()
  });

  document.getElementById("text").value = "";
};

window.react = async function (id, current) {
  await updateDoc(doc(db, "posts", id), {
    reactions: current + 1
  });
};

function format(t) {
  return new Date(t).toLocaleString();
}

const feed = document.getElementById("feed");

const q = query(
  collection(db, "posts"),
  orderBy("createdAt", "desc"),
  limit(50)
);

onSnapshot(q, (snap) => {
  feed.innerHTML = "";

  snap.forEach(docSnap => {
    const d = docSnap.data();

    const el = document.createElement("div");
    el.className = "post";

    const time = document.createElement("div");
    time.className = "time";
    time.innerText = format(d.createdAt);

    const content = document.createElement("div");
    content.innerText = d.content;

    const actions = document.createElement("div");
    actions.className = "actions";

    const btn = document.createElement("button");
    btn.className = "reaction";
    btn.innerText = "I feel this (" + (d.reactions || 0) + ")";
    btn.onclick = () => react(docSnap.id, d.reactions || 0);

    actions.appendChild(btn);

    el.appendChild(time);
    el.appendChild(content);
    el.appendChild(actions);

    feed.appendChild(el);
  });
});

updateLimit();
