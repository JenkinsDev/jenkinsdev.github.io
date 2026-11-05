/*
 * Air Puck: screens, input, loop, sounds, saving. Physics + computer in physics.js (window.AP),
 * drawing in render.js (window.APRender), shared basics in ../shared/engine.js (window.FP).
 * Player 0 is "you" / player 1 (bottom in portrait, left in landscape); player 1 is the computer or player 2.
 */
(function () {
  "use strict";

  const store = FP.store("air-puck");
  const $ = (id) => document.getElementById(id);
  const canvas = $("rink");
  const g = canvas.getContext("2d");

  FP.shell({ title: "Air Puck" });

  const state = {
    mode: "1p",
    level: "medium",
    goals: AP.DEFAULT_GOALS,
    sense: 5, // keyboard sensitivity 1–10 (non-phone screens): how fast the keys move a mallet
    match: null,
    world: null,
    phase: "idle", // idle | play | pause (after a goal) | over
    clock: 0,
    resumeAt: 0,
    after: null,
    view: null,
    dpr: 1,
    targets: [null, null], // where each person's finger / mouse last put their mallet (table space)
    pointers: new Map(), // pointerId → player
    keys: new Set(),
    trail: [],
    flash: null,
    lastHitSound: -1,
    lastWallSound: -1,
  };

  const names = () => (state.mode === "1p" ? ["You", "Computer"] : ["Player 1", "Player 2"]);
  const landscape = () => FP.layout.current.orient === "landscape";

  // ---------- setup ----------
  function chipsFor(box, items, key) {
    box.replaceChildren(...items.map(([value, label]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset[key] = String(value);
      b.textContent = label;
      return b;
    }));
  }
  function syncTitle() {
    const press = (box, key, value) => box.querySelectorAll(`[data-${key}]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[key] === String(value))));
    press($("modes"), "mode", state.mode);
    press($("levels"), "level", state.level);
    press($("goals"), "goals", state.goals);
    $("level-option").hidden = state.mode !== "1p";
    $("sense-option").hidden = FP.layout.current.size === "phone"; // 1P and 2P, wherever there's likely a keyboard
    $("sense").value = String(state.sense);
    $("sense-value").textContent = String(state.sense);
    renderControls();
  }
  /** One card per player: how to move on this device, with keys drawn as key caps. */
  function renderControls() {
    const mouse = FP.layout.current.size !== "phone";
    const WASD = ["W", "A", "S", "D"], ARROWS = ["↑", "←", "↓", "→"];
    FP.controlCards($("control-cards"), state.mode === "1p"
      ? [{ who: "You", how: mouse ? "Mouse or drag" : "Drag on your side", keys: [WASD, ARROWS] }]
      : [
          { who: "Player 1", how: "Drag on your side", keys: [WASD] },
          { who: "Player 2", how: "Drag on your side", keys: [ARROWS] },
        ]);
  }

  function pick(box, key, apply) {
    box.addEventListener("click", (e) => {
      const b = e.target.closest(`[data-${key}]`);
      if (!b) return;
      apply(b.dataset[key]);
      FP.sfx.move();
      syncTitle();
    });
  }
  pick($("modes"), "mode", (v) => { state.mode = v; store.set("mode", v); });
  pick($("levels"), "level", (v) => { state.level = v; store.set("level", v); });
  pick($("goals"), "goals", (v) => { state.goals = Number(v); store.set("goals", state.goals); });
  $("sense").addEventListener("input", () => {
    state.sense = Number($("sense").value);
    $("sense-value").textContent = String(state.sense);
    store.set("sense", state.sense);
  });

  function showTitle() {
    loop.stop();
    state.phase = "idle";
    syncTitle();
    FP.screens.go("title");
  }

  // ---------- canvas size + orientation ----------
  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(r.width * state.dpr);
    canvas.height = Math.round(r.height * state.dpr);
    state.view = APRender.fit(canvas.width, canvas.height, landscape());
  }
  new ResizeObserver(resize).observe(canvas);
  FP.layout.on(() => resize());

  // ---------- input: touch / mouse ----------
  function toTable(e) {
    const r = canvas.getBoundingClientRect();
    return APRender.toTable(state.view, (e.clientX - r.left) * state.dpr, (e.clientY - r.top) * state.dpr);
  }
  const sideOf = (pt) => (pt.y > AP.RINK.length / 2 ? 0 : 1);
  const playing = () => state.phase === "play" || state.phase === "pause";

  canvas.addEventListener("pointerdown", (e) => {
    if (!playing() || !state.view) return;
    e.preventDefault();
    const pt = toTable(e);
    const player = state.mode === "1p" ? 0 : sideOf(pt); // in 2P, each person drags on their own side
    state.pointers.set(e.pointerId, player);
    state.targets[player] = pt;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* the drag still works without capture */ }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!playing() || !state.view) return;
    const pt = toTable(e);
    let player = state.pointers.get(e.pointerId);
    if (player === undefined && e.pointerType === "mouse") player = state.mode === "1p" ? 0 : sideOf(pt); // a mouse steers without clicking
    if (player !== undefined) state.targets[player] = pt;
  });
  const release = (e) => state.pointers.delete(e.pointerId);
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  // ---------- input: keys ----------
  const KEYS = {
    w: [0, 0, -1], s: [0, 0, 1], a: [0, -1, 0], d: [0, 1, 0],
    ArrowUp: [1, 0, -1], ArrowDown: [1, 0, 1], ArrowLeft: [1, -1, 0], ArrowRight: [1, 1, 0],
  };
  document.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!(k in KEYS) || !playing()) return;
    e.preventDefault();
    state.keys.add(k);
  });
  document.addEventListener("keyup", (e) => state.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));

  /** Where held keys steer player i's mallet, or null. Arrow keys drive player 1 in 1P. Keys are screen directions. */
  function keyTarget(i) {
    let sx = 0, sy = 0;
    state.keys.forEach((k) => {
      const [who, dx, dy] = KEYS[k];
      const owner = state.mode === "1p" ? 0 : who;
      if (owner === i) { sx += dx; sy += dy; }
    });
    if (!sx && !sy) return null;
    const [tx, ty] = landscape() ? [sy, -sx] : [sx, sy]; // screen direction → table direction
    const m = state.world.mallets[i];
    // sensitivity 5 = normal; 1 is about half speed, 10 about 1.6× (more precise vs. faster)
    const speed = AP.RINK.malletSpeed * (0.4 + state.sense * 0.12);
    return { x: m.x + tx * 0.3, y: m.y + ty * 0.3, speed };
  }

  // ---------- the match ----------
  function startMatch() {
    state.match = AP.newMatch(state.goals);
    state.world = AP.newWorld();
    AP.serve(state.world, Math.random() < 0.5 ? 0 : 1);
    state.world.puck.live = false; // short countdown before the first serve
    state.targets = [null, null];
    state.pointers.clear();
    state.keys.clear();
    state.trail = [];
    state.flash = null;
    state.clock = 0;
    $("stage").classList.toggle("two", state.mode === "2p");
    names().forEach((n, i) => { $("name-" + i).textContent = n; });
    updateScores();
    FP.sfx.start();
    FP.screens.go("play");
    resize();
    pauseThen(0.9, "Ready…", () => { state.world.puck.live = true; });
    loop.start();
  }

  function updateScores() {
    state.match.scores.forEach((s, i) => { $("score-" + i).textContent = String(s); });
  }

  function pauseThen(seconds, text, fn) {
    state.phase = "pause";
    $("banner").textContent = text;
    state.resumeAt = state.clock + seconds;
    state.after = fn;
  }

  function goal(scorer) {
    state.match = AP.addGoal(state.match, scorer);
    updateScores();
    state.flash = { scorer, until: state.clock + 0.9 };
    state.trail = [];
    const n = names();
    if (state.mode === "1p") (scorer === 0 ? FP.sfx.right : FP.sfx.wrong)();
    else FP.sfx.right();
    const text = state.mode === "1p" ? (scorer === 0 ? "Goal!" : "The computer scores") : `${n[scorer]} scores!`;
    if (state.match.winner !== null) pauseThen(1.3, text, matchOver);
    else pauseThen(1.1, text, () => AP.serve(state.world, 1 - scorer)); // the player who conceded serves
  }

  function matchOver() {
    loop.stop();
    state.phase = "over";
    const w = state.match.winner;
    $("over-title").textContent = state.mode === "1p" ? (w === 0 ? "You win!" : "The computer wins") : `${names()[w]} wins!`;
    $("over-score").textContent = state.match.scores.join(" – ");
    FP.screens.go("over");
  }

  // ---------- loop ----------
  function update(dt) {
    state.clock += dt;
    if (state.phase === "pause" && state.clock >= state.resumeAt) {
      $("banner").textContent = "";
      state.phase = "play";
      const fn = state.after;
      state.after = null;
      if (fn) fn();
      if (state.phase !== "play") return;
    }
    const w = state.world;
    const inputs = [0, 1].map((i) => {
      if (i === 1 && state.mode === "1p") return AP.cpuInput(w, state.level, state.clock, Math.random, 1);
      const k = keyTarget(i);
      if (k) { state.targets[i] = null; return k; }
      return state.targets[i];
    });
    const events = AP.step(w, dt, inputs);
    // A mallet pressing on the puck reports a hit on many tiny physics steps in a row. Play at most one
    // sound per frame (the hardest hit), and none within a short cooldown, so it never turns into a buzz.
    let hardest = 0, wall = false;
    for (const e of events) {
      if (e.type === "hit") hardest = Math.max(hardest, e.speed);
      else if (e.type === "wall") wall = true;
      else if (e.type === "goal") goal(e.scorer);
    }
    if (window.FunSound) {
      if (hardest > 0.08 && state.clock - state.lastHitSound > 0.09) {
        FunSound.tone(260 + hardest * 520, { duration: 0.06, type: "triangle", volume: 0.05 + hardest * 0.05 });
        state.lastHitSound = state.clock;
      }
      if (wall && state.clock - state.lastWallSound > 0.07) {
        FunSound.noise({ duration: 0.03, freq: 2600, volume: 0.15 });
        state.lastWallSound = state.clock;
      }
    }
    if (w.puck.live) {
      state.trail.push({ x: w.puck.x, y: w.puck.y });
      if (state.trail.length > 8) state.trail.shift();
    }
  }

  function draw() {
    if (!state.view || !state.world) return;
    APRender.paint(g, state.view, state.world, { t: state.clock, trail: state.trail, flash: state.flash });
  }

  const loop = FP.loop(update, draw);

  FP.input.tap($("play"), startMatch);
  FP.input.tap($("again"), startMatch);
  FP.input.tap($("change"), showTitle);
  FP.layout.on(() => { if (FP.screens.current === "title") syncTitle(); });

  FP.ready.then(() => {
    state.mode = store.get("mode", "1p") === "2p" ? "2p" : "1p";
    const lvl = store.get("level", "medium");
    state.level = AP.LEVELS[lvl] ? lvl : "medium";
    const goals = store.get("goals", AP.DEFAULT_GOALS);
    state.goals = AP.GOALS.includes(goals) ? goals : AP.DEFAULT_GOALS;
    const sense = Number(store.get("sense", 5));
    state.sense = sense >= 1 && sense <= 10 ? sense : 5;
    chipsFor($("levels"), Object.entries(AP.LEVELS).map(([k, L]) => [k, L.label]), "level");
    chipsFor($("goals"), AP.GOALS.map((n) => [n, `First to ${n}`]), "goals");
    showTitle();
  });
})();
