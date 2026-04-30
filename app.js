import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, query, orderBy, onSnapshot, limit, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBX77uMe5MQdzvOEcymqyZzl9FjU__3lP0",
  authDomain: "oppressed-chat.firebaseapp.com",
  projectId: "oppressed-chat"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let userAddress = null;

function shortAddress(addr) {
  return addr.slice(0,5) + "..." + addr.slice(-4);
}

window.handleWallet = async function () {
  const btn = document.getElementById("walletBtn");

  if (userAddress) {
    userAddress = null;
    btn.innerText = "Connect Wallet";
    return;
  }

  if (!window.ethereum) return alert("Install wallet");

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  userAddress = accounts[0];

  btn.innerText = shortAddress(userAddress);
};

window.send = async function () {
  const text = document.getElementById("text").value;
  if (!text.trim()) return;

  await addDoc(collection(db, "posts"), {
    content: text,
    createdAt: Date.now(),
    reactions: 0,
    reactedBy: [],
    wallet: userAddress || null
  });

  document.getElementById("text").value = "";
};

window.react = async function (id, btn) {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);
  const data = snap.data();
  const user = localStorage.getItem("device") || "x";

  if (data.reactedBy && data.reactedBy.includes(user)) return;

  btn.innerText = "❤️ " + (data.reactions + 1);

  await updateDoc(ref, {
    reactions: data.reactions + 1,
    reactedBy: [...(data.reactedBy || []), user]
  });
};

function createPostCard(d, isTrending=false) {
  const el = document.createElement("div");
  el.className = "post";

  const authorRow = document.createElement("div");
  authorRow.className = "author-row";

  const author = document.createElement("div");
  author.className = "author";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.innerText = "Copy";

  if (d.wallet) {
    author.innerText = shortAddress(d.wallet);

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(d.wallet);
      copyBtn.innerText = "Copied";
      setTimeout(()=>copyBtn.innerText="Copy",1000);
    };

  } else {
    author.innerText = "Anonymous";
    copyBtn.style.display = "none";
  }

  authorRow.appendChild(author);
  authorRow.appendChild(copyBtn);

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

  el.appendChild(authorRow);
  el.appendChild(time);
  el.appendChild(content);
  el.appendChild(btn);

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

  trends.sort((a,b)=>(b.reactions||0)-(a.reactions||0));

  feed.innerHTML = "";
  trendingBox.innerHTML = "";

  trends.slice(0,5).forEach(d=>{
    trendingBox.appendChild(createPostCard(d,true));
  });

  posts.forEach(d=>{
    feed.appendChild(createPostCard(d));
  });
});
