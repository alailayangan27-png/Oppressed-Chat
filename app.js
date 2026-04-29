import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

let lastPostTime = 0;

window.send = async function () {
  const text = document.getElementById("text").value;
  const now = Date.now();

  if (!text.trim()) return;
  if (now - lastPostTime < 5000) return;

  lastPostTime = now;

  await addDoc(collection(db, "posts"), {
    content: text,
    createdAt: now
  });

  document.getElementById("text").value = "";
};

function formatTime(ts) {
  const date = new Date(ts);
  return date.toLocaleString();
}

const feed = document.getElementById("feed");

const q = query(
  collection(db, "posts"),
  orderBy("createdAt", "desc"),
  limit(50)
);

onSnapshot(q, (snapshot) => {
  feed.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "post";

    const time = document.createElement("div");
    time.className = "time";
    time.innerText = formatTime(data.createdAt);

    const content = document.createElement("div");
    content.innerText = data.content;

    div.appendChild(time);
    div.appendChild(content);

    feed.appendChild(div);
  });
});
