import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, query, orderBy, onSnapshot, limit, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

function deviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = Math.random().toString(36).substring(2);
    localStorage.setItem("device_id", id);
  }
  return id;
}

window.send = async function () {
  const text = document.getElementById("text").value;

  if (!text.trim()) return;
  if (count() >= 10) return alert("Limit reached");

  await addDoc(collection(db, "posts"), {
    content: text,
    createdAt: Date.now(),
    reactions: 0,
    reactedBy: []
  });

  inc();
  document.getElementById("text").value = "";
};

window.react = async function (id, btn) {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);
  const data = snap.data();

  const user = deviceId();

  if (data.reactedBy && data.reactedBy.includes(user)) return;

  let current = data.reactions || 0;

  btn.innerText = "❤️ " + (current + 1);

  btn.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.3)" },
      { transform: "scale(1)" }
    ],
    { duration: 250, easing: "ease-out" }
  );

  await updateDoc(ref, {
    reactions: current + 1,
    reactedBy: [...(data.reactedBy || []), user]
  });
};

const feed = document.getElementById("feed");

const q = query(
  collection(db, "posts"),
  orderBy("createdAt", "desc"),
  limit(50)
);

onSnapshot(q, (snap) => {
  const posts = [];

  snap.forEach(docSnap => {
    const d = docSnap.data();
    const age = (Date.now() - d.createdAt) / 3600000;
    const score = (d.reactions || 0) / (age + 2);

    posts.push({ id: docSnap.id, ...d, score });
  });

  posts.sort((a, b) => b.score - a.score);

  feed.innerHTML = "";

  posts.forEach(d => {
    const el = document.createElement("div");
    el.className = "post";

    if (d.score > 1) {
      const badge = document.createElement("div");
      badge.className = "trending";
      badge.innerText = "🔥 TRENDING";
      el.appendChild(badge);
    }

    const author = document.createElement("div");
    author.className = "author";
    author.innerText = "Anonymous";

    const time = document.createElement("div");
    time.className = "time";
    time.innerText = new Date(d.createdAt).toLocaleString();

    const content = document.createElement("div");
    content.className = "content";
    content.innerText = d.content;

    const btn = document.createElement("button");
    btn.className = "reaction";
    btn.innerText = "❤️ " + (d.reactions || 0);
    btn.onclick = () => react(d.id, btn);

    el.appendChild(author);
    el.appendChild(time);
    el.appendChild(content);
    el.appendChild(btn);

    feed.appendChild(el);
  });
});
