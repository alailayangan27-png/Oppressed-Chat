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

function truncateWords(text, limit = 50) {
  const words = text.split(" ");
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}

async function translateText(text) {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: navigator.language.slice(0,2),
        format: "text"
      })
    });
    const data = await res.json();
    return data.translatedText || "Translation failed";
  } catch {
    return "Translation unavailable";
  }
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
    [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
    { duration: 250 }
  );

  await updateDoc(ref, {
    reactions: current + 1,
    reactedBy: [...(data.reactedBy || []), user]
  });
};

function createPostCard(d, isTrending = false) {
  const el = document.createElement("div");
  el.className = "post";

  const author = document.createElement("div");
  author.className = "author";
  author.innerText = "Anonymous";

  const time = document.createElement("div");
  time.className = "time";
  time.innerText = new Date(d.createdAt).toLocaleString();

  const content = document.createElement("div");
  content.className = "content";
  content.innerText = isTrending ? truncateWords(d.content) : d.content;

  const btn = document.createElement("button");
  btn.className = "reaction";
  btn.innerText = "❤️ " + (d.reactions || 0);
  btn.onclick = () => react(d.id, btn);

  const translateBtn = document.createElement("button");
  translateBtn.className = "translate";
  translateBtn.innerText = "🌐 Translate";

  const translated = document.createElement("div");
  translated.className = "translated";
  translated.style.display = "none";

  translateBtn.onclick = async () => {
    if (translated.innerText) {
      translated.style.display = translated.style.display === "none" ? "block" : "none";
      return;
    }

    translateBtn.innerText = "Translating...";
    const result = await translateText(d.content);
    translated.innerText = result;
    translated.style.display = "block";
    translateBtn.innerText = "🌐 Translated";
  };

  el.appendChild(author);
  el.appendChild(time);
  el.appendChild(content);
  el.appendChild(btn);
  el.appendChild(translateBtn);
  el.appendChild(translated);

  return el;
}

const feed = document.getElementById("feed");
const trendingBox = document.getElementById("trending");

const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));

onSnapshot(q, (snap) => {
  const posts = [];
  const trends = [];

  snap.forEach(docSnap => {
    const d = docSnap.data();
    const item = { id: docSnap.id, ...d };
    posts.push(item);
    trends.push(item);
  });

  posts.sort((a, b) => b.createdAt - a.createdAt);
  trends.sort((a, b) => (b.reactions || 0) - (a.reactions || 0));

  feed.innerHTML = "";
  trendingBox.innerHTML = "";

  trends.slice(0, 5).forEach(d => {
    trendingBox.appendChild(createPostCard(d, true));
  });

  posts.forEach(d => {
    feed.appendChild(createPostCard(d));
  });
});
