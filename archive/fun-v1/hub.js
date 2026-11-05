(function () {
  "use strict";

  const NEW_FOR_DAYS = 14;
  const FAV_KEY = "fun:favourites";
  const MAG_KEY = "fun:magnets";

  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} },
  };

  // ---------- alphabet magnets ----------
  const COLORS = ["#e8432e", "#f2892b", "#f7c531", "#3aa356", "#2f7fd6", "#8a4fbf", "#f27ba6"];
  const WORD = ["F", "U", "N", " ", "H", "O", "U", "S", "E"];
  const SPARES = ["A", "B", "C", "M", "O", "R", "!", "?", "1", "2", "3", "Z"];

  // Lays the title out from measured letter widths: one row when it fits, otherwise
  // "FUN" over "HOUSE". Spares pack loosely below. Grows the freezer door to fit.
  function homePositions(board, nodes) {
    const w = board.clientWidth;
    const titleNodes = nodes.slice(0, WORD.length - 1);
    const words = [titleNodes.slice(0, 3), titleNodes.slice(3)];
    const lineH = titleNodes[0].offsetHeight;
    const gap = lineH * 0.35;
    const kern = lineH * 0.04;
    const wordW = (ws) => ws.reduce((s, m) => s + m.offsetWidth + kern, -kern);
    const oneRow = wordW(words[0]) + gap + wordW(words[1]) <= w - 150;
    const rows = oneRow ? [words.flat()] : words;
    const pos = [];
    let y = 24;
    rows.forEach((row) => {
      const rowW = oneRow ? wordW(words[0]) + gap + wordW(words[1]) : wordW(row);
      let x = Math.max(16, (w - rowW) / 2 - (oneRow ? 30 : 0));
      row.forEach((m, i) => {
        const k = pos.length;
        pos.push({ x, y: y + (k % 3) * 5 - 4, r: ((k * 37) % 13) - 6 });
        x += m.offsetWidth + kern + (oneRow && i === 2 ? gap : 0);
      });
      y += lineH * 0.95;
    });
    y += 14;
    let x = 22;
    const spares = nodes.slice(WORD.length - 1);
    spares.forEach((m, i) => {
      if (x + m.offsetWidth > w - 90) { x = 22; y += m.offsetHeight + 6; }
      pos.push({ x: x + ((i * 13) % 9), y: y + ((i * 7) % 11), r: ((i * 53) % 30) - 15 });
      x += m.offsetWidth + 18;
    });
    const needed = y + spares[0].offsetHeight + 56;
    board.parentElement.style.minHeight = needed + "px";
    return pos;
  }

  function buildMagnets() {
    const board = document.getElementById("magnets");
    const letters = [...WORD.filter((c) => c !== " "), ...SPARES];
    const saved = store.get(MAG_KEY, null);

    const nodes = letters.map((ch, i) => {
      const m = document.createElement("span");
      m.className = "magnet" + (i >= WORD.length - 1 ? " small" : "");
      m.textContent = ch;
      m.dataset.l = ch;
      m.style.setProperty("--c", COLORS[(i * 3) % COLORS.length]);
      board.append(m);
      return m;
    });

    const place = (m, p) => {
      m._p = p;
      m.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
    };
    const clamp = (p, m) => ({
      x: Math.min(Math.max(p.x, -10), board.clientWidth - m.offsetWidth + 10),
      y: Math.min(Math.max(p.y, -10), board.clientHeight - m.offsetHeight + 10),
      r: p.r,
    });

    const home = homePositions(board, nodes);
    nodes.forEach((m, i) => place(m, clamp((saved && saved[i]) || home[i], m)));
    const save = () => store.set(MAG_KEY, nodes.map((m) => m._p));

    nodes.forEach((m) => {
      let start = null;
      m.addEventListener("pointerdown", (e) => {
        m.setPointerCapture(e.pointerId);
        start = { px: e.clientX, py: e.clientY, x: m._p.x, y: m._p.y, moved: false };
        m.classList.add("held");
        board.append(m); // bring to front
      });
      m.addEventListener("pointermove", (e) => {
        if (!start) return;
        const dx = e.clientX - start.px;
        const dy = e.clientY - start.py;
        if (Math.abs(dx) + Math.abs(dy) > 4) start.moved = true;
        place(m, clamp({ x: start.x + dx, y: start.y + dy, r: m._p.r }, m));
      });
      const drop = () => {
        if (!start) return;
        m.classList.remove("held");
        if (!start.moved) m._p.r = ((m._p.r + 25) % 50) - 25; // a tap spins it a little
        place(m, m._p);
        start = null;
        FunSound.clack();
        save();
      };
      m.addEventListener("pointerup", drop);
      m.addEventListener("pointercancel", drop);
    });

    document.getElementById("tidy").addEventListener("click", () => {
      const fresh = homePositions(board, nodes);
      nodes.forEach((m, i) => setTimeout(() => { place(m, clamp(fresh[i], m)); FunSound.clack(); }, i * 45));
      store.set(MAG_KEY, null);
    });
  }

  // ---------- drawings on the fridge ----------
  const PAPERS = ["notebook", "construction", "graph"];
  const PAPER_COLORS = ["var(--cp-yellow)", "var(--cp-blue)", "var(--cp-green)", "var(--cp-orange)"];
  const MAGNET_COLORS = ["#e8432e", "#2f7fd6", "#3aa356", "#f2892b"];
  const STAR = '<svg viewBox="0 0 60 60" aria-hidden="true"><path class="foil" d="M30 4l7.6 16.4 17.9 2-13.3 12.2 3.7 17.7L30 43.4 14.1 52.3l3.7-17.7L4.5 22.4l17.9-2z"/></svg>';

  function isNew(added) {
    const t = Date.parse(added);
    return !Number.isNaN(t) && Date.now() - t < NEW_FOR_DAYS * 864e5;
  }

  function render() {
    const grid = document.getElementById("grid");
    const favs = new Set(store.get(FAV_KEY, []));
    const toys = [...window.FUN_TOYS].sort((a, b) => favs.has(b.slug) - favs.has(a.slug));

    const items = toys.map((toy, i) => {
      const li = document.createElement("li");
      const paper = PAPERS[i % PAPERS.length];
      const holder = i % 2
        ? `<span class="fun-tape"></span>`
        : `<span class="magnet-dot" style="--m:${MAGNET_COLORS[i % MAGNET_COLORS.length]}"></span>`;
      li.innerHTML = `
        <a class="sheet ${paper}" href="${toy.slug}/" style="--paper-c:${PAPER_COLORS[i % PAPER_COLORS.length]}">
          ${holder}
          <span class="art"><svg viewBox="0 0 200 160" aria-hidden="true"><g filter="url(#crayon)">${(window.FUN_ART || {})[toy.slug] || ""}</g></svg></span>
          <span class="sheet-name"></span>
          <span class="sheet-blurb"></span>
        </a>
        <button class="star" type="button">${STAR}</button>`;
      li.querySelector(".sheet-name").textContent = toy.name;
      if (isNew(toy.added)) li.querySelector(".sheet-name").insertAdjacentHTML("beforeend", ' <span class="new-scribble">new!</span>');
      li.querySelector(".sheet-blurb").textContent = toy.blurb;
      li.querySelector(".sheet").addEventListener("pointerdown", () => FunSound.rustle());

      const star = li.querySelector(".star");
      const fav = favs.has(toy.slug);
      star.setAttribute("aria-pressed", String(fav));
      star.setAttribute("aria-label", (fav ? "Take the star off " : "Give a gold star to ") + toy.name);
      star.addEventListener("click", () => {
        const next = new Set(store.get(FAV_KEY, []));
        next.has(toy.slug) ? next.delete(toy.slug) : next.add(toy.slug);
        store.set(FAV_KEY, [...next]);
        next.has(toy.slug) ? FunSound.ding() : FunSound.rustle();
        render();
        const again = [...grid.querySelectorAll(".star")].find((s) => s.getAttribute("aria-label").endsWith(toy.name));
        if (again) again.focus();
      });
      return li;
    });

    const soon = document.createElement("li");
    soon.innerHTML = `<div class="sheet soon" style="--r:2deg"><span class="fun-tape"></span>
      <span class="art"><svg viewBox="0 0 200 160" aria-hidden="true"><g filter="url(#wobble)">${(window.FUN_ART || {}).soon || ""}</g></svg></span>
      <span class="sheet-name">your idea here…</span><span class="sheet-blurb">next drawing goes here</span></div>`;
    grid.replaceChildren(...items, soon);
  }

  function setupMute() {
    const btn = document.getElementById("mute");
    const sync = () => {
      btn.textContent = FunSound.muted ? "🔇" : "🔊";
      btn.setAttribute("aria-pressed", String(FunSound.muted));
      btn.setAttribute("aria-label", FunSound.muted ? "Sound off" : "Sound on");
    };
    btn.addEventListener("click", () => { FunSound.setMuted(!FunSound.muted); sync(); FunSound.clack(); });
    sync();
  }

  function foilDefs() {
    document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff2a8"/><stop offset=".35" stop-color="#f2c230"/>
        <stop offset=".55" stop-color="#fff6c2"/><stop offset="1" stop-color="#d79b12"/>
      </linearGradient></defs></svg>`);
  }

  foilDefs();
  render();
  setupMute();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildMagnets); // measure letters with the real font
})();
