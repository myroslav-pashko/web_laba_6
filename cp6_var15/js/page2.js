const renderEl = document.getElementById("render");
const pollInfoEl = document.getElementById("pollInfo");

let lastVersion = null;

function glitchNode(item) {
  const wrap = document.createElement("div");
  wrap.className = "glitch-wrap";
  wrap.style.setProperty("--g-pad", item.pad + "px");
  wrap.style.setProperty("--g-bg", item.bg);
  wrap.style.setProperty("--g-fg", item.fg);
  wrap.style.setProperty("--g-c1", item.c1);
  wrap.style.setProperty("--g-c2", item.c2);
  wrap.style.setProperty("--g-dur", item.dur + "ms");
  wrap.style.setProperty("--g-shift", item.shift + "px");

  const t = document.createElement("div");
  t.className = "glitch";
  t.textContent = item.text;
  t.setAttribute("data-text", item.text);

  wrap.appendChild(t);
  return wrap;
}

async function loadAndRender() {
  const res = await fetch("api/load.php", { cache: "no-store" });
  const data = await res.json();

  renderEl.innerHTML = "";
  (data.items || []).forEach((it) => renderEl.appendChild(glitchNode(it)));

  lastVersion = data.version ?? lastVersion;
  pollInfoEl.textContent = `version=${lastVersion} (оновлено ${new Date().toLocaleTimeString()})`;
}

async function pollChanges() {
  try {
    const res = await fetch("api/meta.php", { cache: "no-store" });
    const meta = await res.json();

    if (lastVersion === null) {
      lastVersion = meta.version;
    } else if (meta.version !== lastVersion) {
      await loadAndRender();
      return;
    }
    pollInfoEl.textContent = `version=${lastVersion} (перевірка ${new Date().toLocaleTimeString()})`;
  } catch (e) {
    pollInfoEl.textContent = `Помилка polling: ${e.message}`;
  }
}

(async () => {
  await loadAndRender();
  setInterval(pollChanges, 3000); // кожні 3 секунди
})();
