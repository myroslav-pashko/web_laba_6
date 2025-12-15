const itemsEl = document.getElementById("items");
const previewEl = document.getElementById("preview");
const statusEl = document.getElementById("status");

const addItemBtn = document.getElementById("addItemBtn");
const saveBtn = document.getElementById("saveBtn");

const text1El = document.getElementById("text1");
const text2El = document.getElementById("text2");
document.getElementById("swapBtn").addEventListener("click", () => {
  // Поміняти місцями тексти 1 і 2 (залишив як міні-демо маніпуляції)
  const a = text1El.textContent;
  text1El.textContent = text2El.textContent;
  text2El.textContent = a;
});

let model = {
  items: [
    {
      text: "GLITCH TEXT",
      pad: 12,
      bg: "#0b0b0f",
      fg: "#ffffff",
      c1: "#ff3b8d",
      c2: "#31d0ff",
      dur: 1500,
      shift: 2
    }
  ]
};

function makeItemCard(item, idx) {
  const card = document.createElement("div");
  card.className = "item";

  card.innerHTML = `
    <div class="item-grid">
      <label>Text
        <input data-k="text" value="${escapeHtml(item.text)}" />
      </label>
      <label>Duration (ms)
        <input data-k="dur" type="number" min="100" max="10000" value="${item.dur}" />
      </label>
      <label>Padding (px)
        <input data-k="pad" type="number" min="0" max="60" value="${item.pad}" />
      </label>

      <label>BG (hex)
        <input data-k="bg" value="${item.bg}" />
      </label>
      <label>FG (hex)
        <input data-k="fg" value="${item.fg}" />
      </label>
      <label>Shift (px)
        <input data-k="shift" type="number" min="0" max="20" value="${item.shift}" />
      </label>

      <label>Color 1 (hex)
        <input data-k="c1" value="${item.c1}" />
      </label>
      <label>Color 2 (hex)
        <input data-k="c2" value="${item.c2}" />
      </label>
      <div></div>
    </div>

    <div class="item-actions">
      <button data-act="up">↑</button>
      <button data-act="down">↓</button>
      <button data-act="del">🗑 Видалити</button>
    </div>
  `;

  // Input binding
  card.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      const k = inp.dataset.k;
      let v = inp.value;

      if (["dur", "pad", "shift"].includes(k)) v = Number(v);

      model.items[idx][k] = v;
      renderPreview();
    });
  });

  // Actions
  card.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      if (act === "del") {
        model.items.splice(idx, 1);
      } else if (act === "up" && idx > 0) {
        [model.items[idx - 1], model.items[idx]] = [model.items[idx], model.items[idx - 1]];
      } else if (act === "down" && idx < model.items.length - 1) {
        [model.items[idx + 1], model.items[idx]] = [model.items[idx], model.items[idx + 1]];
      }
      renderItems();
      renderPreview();
    });
  });

  return card;
}

function renderItems() {
  itemsEl.innerHTML = "";
  model.items.forEach((it, idx) => itemsEl.appendChild(makeItemCard(it, idx)));
}

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

function renderPreview() {
  previewEl.innerHTML = "";
  model.items.forEach((it) => previewEl.appendChild(glitchNode(it)));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

addItemBtn.addEventListener("click", () => {
  model.items.push({
    text: "NEW GLITCH",
    pad: 12,
    bg: "#0b0b0f",
    fg: "#ffffff",
    c1: "#ff3b8d",
    c2: "#31d0ff",
    dur: 1500,
    shift: 2
  });
  renderItems();
  renderPreview();
});

saveBtn.addEventListener("click", async () => {
  statusEl.textContent = "Saving...";
  try {
    const res = await fetch("api/save.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Save failed");
    statusEl.textContent = `✅ Saved. version=${data.version}`;
  } catch (e) {
    statusEl.textContent = `❌ ${e.message}`;
  }
});

// init
renderItems();
renderPreview();
