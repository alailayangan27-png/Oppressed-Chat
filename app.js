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

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getCount() {
  return parseInt(localStorage.getItem(getTodayKey())) || 0;
}

function increase() {
  localStorage.setItem(getTodayKey(), getCount() + 1);
}

window.openModal = function () {
  document.getElementById("modal").classList.add("show");
};

window.closeModal = function () {
  document.getElementById("modal").classList.remove("show");
};

window.send = async function () {
  const text = document.getElementById("text").value;

  if (!text.trim()) return;

  if (getCount() >= 3) {
    alert("Daily limit reached");
    return;
  }

  await addDoc(collection(db, "posts"), {
    content: text,
    createdAt: Date.now()
  });

  increase();
  document.getElementById("text").value = "";
  closeModal();
};

function formatTime(ts) {
  return new Date(ts).toLocaleString();
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

    const post = document.createElement("div");
    post.className = "post";

    const time = document.createElement("div");
    time.className = "time";
    time.innerText = formatTime(data.createdAt);

    const content = document.createElement("div");
    content.className = "content";
    content.innerText = data.content;

    post.appendChild(time);
    post.appendChild(content);

    feed.appendChild(post);
  });
});
