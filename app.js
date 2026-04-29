import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE_AUTH_DOMAIN",
  projectId: "REPLACE_PROJECT_ID",
  storageBucket: "REPLACE_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_SENDER_ID",
  appId: "REPLACE_APP_ID"
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
  load();
};

async function load() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "post";
    div.innerText = data.content;

    feed.appendChild(div);
  });
}

load();
