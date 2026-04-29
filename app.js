onSnapshot(q, (snap) => {
  const posts = [];

  snap.forEach(docSnap => {
    const d = docSnap.data();

    const age = (Date.now() - d.createdAt) / 3600000;
    const score = (d.reactions || 0) / (age + 2);

    posts.push({
      id: docSnap.id,
      ...d,
      score
    });
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

    const time = document.createElement("div");
    time.className = "time";
    time.innerText = new Date(d.createdAt).toLocaleString();

    const content = document.createElement("div");
    content.className = "content";
    content.innerText = d.content;

    const btn = document.createElement("button");
    btn.className = "reaction";
    btn.innerText = "I feel this (" + (d.reactions || 0) + ")";
    btn.onclick = () => react(d.id, d.reactions || 0);

    el.appendChild(time);
    el.appendChild(content);
    el.appendChild(btn);

    feed.appendChild(el);
  });
});
