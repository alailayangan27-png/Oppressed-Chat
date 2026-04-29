import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

window.send = async function () {
  const text = document.getElementById("text").value;

  if (!text.trim()) {
    return;
  }

  await addDoc(collection(db, "posts"), {
    content: text,
    createdAt: Date.now()
  });

  document.getElementById("text").value = "";
};

const feed = document.getElementById("feed");

const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  feed.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "post";
    div.innerText = data.content;

    feed.appendChild(div);
  });
});
