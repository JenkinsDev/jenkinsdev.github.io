(function () {
  "use strict";

  const GAMES = window.FP_GAMES;
  const MACHINES = window.FP_MACHINES;
  const SCENES = window.FP_SCENES;
  const NS = "http://www.w3.org/2000/svg";
  const STAT_NAMES = ["BRAINS", "SILLY", "SPEED"];
  const $ = (id) => document.getElementById(id);

  const sfx = {
    coin() { if (!window.FunSound) return; FunSound.tone(988, { duration: 0.08, type: "square", volume: 0.08 }); setTimeout(() => FunSound.tone(1319, { duration: 0.3, type: "square", volume: 0.08 }), 80); },
    blip() { window.FunSound && FunSound.tone(660, { duration: 0.06, type: "square", volume: 0.06 }); },
    back() { window.FunSound && FunSound.tone(440, { duration: 0.12, type: "square", volume: 0.06, slideTo: 220 }); },
  };

  // ---------- the floor ----------
  function addBulbs(svg) {
    svg.querySelectorAll("g.bulbs").forEach((g) => {
      const [x, y, w, h] = ["x", "y", "w", "h"].map((k) => Number(g.dataset[k]));
      let i = 0;
      const add = (cx, cy) => {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", cx);
        c.setAttribute("cy", cy);
        c.setAttribute("r", 2.6);
        c.setAttribute("class", "bulb");
        c.style.animationDelay = (i++ % 2) * -0.5 + "s";
        g.append(c);
      };
      for (let cx = x + 10; cx <= x + w - 10; cx += 13) { add(cx, y + 5); add(cx, y + h - 5); }
    });
  }

  function renderFloor() {
    const lineup = $("lineup");
    lineup.replaceChildren(...GAMES.map((game, i) => {
      const m = MACHINES[game.machine](game);
      const li = document.createElement("li");
      li.style.setProperty("--w", m.w);
      if (game.teaser) li.className = "teaser";
      li.innerHTML = `
        <button class="machine" type="button">
          <svg viewBox="0 0 ${m.w} ${m.h}" aria-hidden="true">${m.svg}</svg>
          <span class="plaque">${game.teaser ? "" : `<b class="badge p${game.players}">${game.players}P</b>`}<span class="plaque-text"></span></span>
        </button>`;
      li.querySelector(".plaque-text").textContent = game.plaque;
      const btn = li.querySelector(".machine");
      btn.setAttribute("aria-label", `${game.name}, ${game.players === 2 ? "2 players" : "1 player"}${game.live ? "" : ", coming soon"}`);
      btn.addEventListener("click", () => openCard(i));
      addBulbs(li.querySelector("svg"));
      return li;
    }));
  }

  // ---------- select card ----------
  const card = $("card");
  const preview = $("preview");
  const ctx = preview.getContext("2d");
  let current = 0;
  let raf = 0;
  let lastStatic = 0;

  function fillCard() {
    const g = GAMES[current];
    card.style.setProperty("--accent", g.color);
    $("card-name").textContent = g.name;
    $("card-players").textContent = g.teaser ? "◇ ???" : g.players === 2 ? "◆◆ 2 PLAYERS · same screen" : "◆ 1 PLAYER";
    $("card-stats").innerHTML = g.teaser ? "" : STAT_NAMES.map((s, k) =>
      `<span>${s}</span><span class="bar">${[0, 1, 2, 3, 4].map((n) => `<i class="${n < g.stats[k] ? "on" : ""}"></i>`).join("")}</span>`).join("");
    $("card-hook").textContent = g.hook;
    const start = $("start");
    if (g.live) {
      start.href = g.slug + "/";
      start.textContent = "▶ PRESS START";
      start.removeAttribute("aria-disabled");
    } else {
      start.removeAttribute("href");
      start.textContent = "COMING SOON";
      start.setAttribute("aria-disabled", "true");
    }
  }

  function loop(t) {
    const scene = SCENES[GAMES[current].scene] || SCENES.soon;
    if (GAMES[current].scene !== "soon" || t - lastStatic > 90) {
      scene(ctx, t);
      lastStatic = t;
    }
    raf = requestAnimationFrame(loop);
  }

  function openCard(i) {
    current = i;
    fillCard();
    sfx.coin();
    if (!card.open) card.showModal();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function step(dir) {
    current = (current + dir + GAMES.length) % GAMES.length;
    fillCard();
    sfx.blip();
  }

  function closeCard() { card.close(); }

  card.addEventListener("close", () => { cancelAnimationFrame(raf); sfx.back(); });
  card.addEventListener("click", (e) => { // tap on the backdrop (outside the card's box) closes it
    const r = card.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (e.target === card && !inside) closeCard();
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });
  $("prev").addEventListener("click", () => step(-1));
  $("next").addEventListener("click", () => step(1));
  $("close").addEventListener("click", closeCard);
  $("start").addEventListener("click", (e) => { if (!GAMES[current].live) e.preventDefault(); });

  // ---------- sound toggle ----------
  function setupMute() {
    const btn = $("mute");
    const sync = () => {
      const muted = window.FunSound ? FunSound.muted : true;
      btn.setAttribute("aria-pressed", String(muted));
      btn.setAttribute("aria-label", muted ? "Sound off" : "Sound on");
    };
    btn.addEventListener("click", () => { if (!window.FunSound) return; FunSound.setMuted(!FunSound.muted); sync(); sfx.blip(); });
    sync();
  }

  renderFloor();
  setupMute();
})();
