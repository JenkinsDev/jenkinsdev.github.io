(function () {
  "use strict";

  const GAMES = window.FP_GAMES;
  const SCENES = window.FP_SCENES;
  const STAT_NAMES = ["BRAINS", "SPEED", "SKILL", "LUCK", "SILLY"];
  const $ = (id) => document.getElementById(id);
  const screens = []; // canvas contexts, visibility and local preview clocks

  const sound = (fn) => window.FunSound && fn(window.FunSound);
  const sfx = {
    start: () => sound((s) => { s.tone(988, { duration: 0.08, type: "square", volume: 0.08 }); setTimeout(() => s.tone(1319, { duration: 0.3, type: "square", volume: 0.08 }), 80); }),
    nope: () => sound((s) => s.tone(180, { duration: 0.15, type: "square", volume: 0.06 })),
  };

  const both = (g) => Array.isArray(g.players);
  // spoken only (aria-label); on screen the 1P / 2P tags say it
  const playersText = (g) => (both(g) ? "1 or 2 players" : g.players === 2 ? "2 players" : "1 player");
  const tagHtml = (g) => {
    if (both(g)) return `<span class="tag p1" aria-hidden="true">1P</span> <span class="tag p2" aria-hidden="true">2P</span>`;
    return `<span class="tag p${g.players}" aria-hidden="true">${g.players}P</span>`;
  };
  const barHtml = (n, label) =>
    `<span class="bar" role="img" aria-label="${label} ${n} of 5">${[0, 1, 2, 3, 4].map((k) => `<i class="${k < n ? "on" : ""}"></i>`).join("")}</span>`;

  function addScreen(canvas, name, replay) {
    const s = { el: canvas, ctx: canvas.getContext("2d"), name, visible: false, time: 0, last: 0, dirty: true };
    screens.push(s);
    if (replay) replay.addEventListener("click", () => {
      if (motion.matches) return;
      s.time = 0; s.last = 0; s.dirty = true;
      if (SCENES[name].reset) SCENES[name].reset();
      wake();
    });
  }
  /** Give each canvas the pixel size its scene expects. */
  function fitCanvas(el, name) {
    const [w, h] = (window.FP_SCENE_SIZES || {})[name] || [64, 48];
    if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
  }

  function go(i) {
    const g = GAMES[i];
    if (!g.live) { sfx.nope(); return; }
    sfx.start();
    setTimeout(() => { location.href = g.slug + "/"; }, 350);
  }

  function buildList() {
    const list = $("list");
    GAMES.forEach((g, i) => {
      const li = document.createElement("li");
      li.className = "row" + (g.live ? " live" : "") + (g.teaser ? " locked" : "");
      li.style.setProperty("--accent", g.color);
      li.innerHTML = `
        <div class="preview"><canvas class="thumb" width="64" height="48" aria-hidden="true"></canvas>
          ${g.live ? `<button class="preview-replay" type="button" aria-label="Replay ${g.name} preview">Replay preview</button>` : ""}</div>
        <div class="info"><h2 class="row-name"></h2><p class="row-players"></p><p class="row-hook"></p></div>
        ${g.teaser ? "" : `<div class="stats">${STAT_NAMES.map((s, k) => `<div class="stat"><span>${s}</span>${barHtml(g.stats[k], s.toLowerCase())}</div>`).join("")}</div>`}
        ${g.live ? '<a class="fp-btn"></a>' : '<p class="row-soon">Coming soon</p>'}`;
      // the teaser stays a mystery: no name, tags or stats until it's built
      li.querySelector(".row-name").textContent = g.teaser ? "?" : g.name;
      li.querySelector(".row-players").innerHTML = g.teaser ? "" : tagHtml(g);
      if (!g.teaser) li.querySelector(".row-players").setAttribute("aria-label", playersText(g));
      li.querySelector(".row-hook").textContent = g.hook;
      const btn = li.querySelector(".fp-btn");
      if (btn) {
        btn.href = g.slug + "/";
        btn.textContent = "PLAY";
        btn.setAttribute("aria-label", `Play ${g.name}`);
        btn.addEventListener("click", (e) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          go(i);
        });
      }
      list.append(li);
      addScreen(li.querySelector("canvas"), g.scene, li.querySelector(".preview-replay"));
    });
  }

  // One scheduler, at most 30fps; no physics or painting off screen or in hidden tabs.
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0, lastFrame = 0;
  const animated = (s) => s.name !== "soon" && s.name !== "stack";
  function paint(s, t) {
    fitCanvas(s.el, s.name);
    (SCENES[s.name] || SCENES.soon)(s.ctx, t);
    s.dirty = false;
  }
  function wake() {
    if (!raf && !document.hidden && screens.some((s) => s.visible && (s.dirty || (!motion.matches && animated(s)))))
      raf = requestAnimationFrame(frame);
  }
  function frame(t) {
    raf = 0;
    if (document.hidden) return;
    if (t - lastFrame >= 1000 / 30) {
      lastFrame = t;
      for (const s of screens) {
        if (!s.visible) continue;
        if (motion.matches || !animated(s)) {
          if (s.dirty) paint(s, (window.FP_SCENE_STILLS || {})[s.name] || 0);
        } else {
          if (s.last) s.time += Math.min(100, t - s.last);
          s.last = t;
          paint(s, s.time);
        }
      }
    }
    wake();
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const s = screens.find((item) => item.el === entry.target);
      s.visible = entry.isIntersecting;
      s.last = 0;
      if (s.visible) {
        s.time = 0; s.dirty = true;
        if (SCENES[s.name]?.reset) SCENES[s.name].reset();
      }
    }
    wake();
  });
  function refresh() {
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    for (const s of screens) { s.dirty = true; s.last = 0; }
    wake();
  }

  buildList();
  FP.muteButton($("mute"));
  screens.forEach((s) => observer.observe(s.el));
  motion.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);
  document.fonts.ready.then(refresh);
})();
