/*
 * Stack It: screens, turns, input, camera, sounds, saving. Physics + computer in physics.js (window.SK),
 * objects in objects.js (window.SKObjects), drawing in render.js (window.SKRender), basics in ../shared/engine.js.
 *
 * Solo: stack until something falls; the height is your score.
 * 1P / 2P rounds: the first player builds a pile until something falls. Then the other player builds a fresh
 * pile and has to beat that height: they win the round the moment they pass it, or lose it when their pile
 * falls first. Who goes first alternates each round. Player 0 is "you" / player 1; player 1 is the computer or player 2.
 */
(function () {
  "use strict";

  const store = FP.store("stack-it");
  const $ = (id) => document.getElementById(id);
  const canvas = $("scene");
  const g = canvas.getContext("2d");
  const PIXEL = 3; // CSS pixels per art pixel
  const FT = 3.28084;
  const COLOURS = ["#ff3d3d", "#2c7bff"];
  const RULES = {
    solo: "Build as high as you can.",
    "1p": "You build, then the computer. The taller pile wins the round.",
    "2p": "Player 1 builds, then Player 2. The taller pile wins the round.",
  };

  FP.shell({ title: "Stack It" });

  const state = {
    mode: "solo", level: "medium", rounds: SK.DEFAULT_ROUNDS, best: 0,
    game: null, match: null, view: null,
    phase: "idle", // idle | ready (banner, crane waits) | aim (crane swinging) | fall (pile settling) | pause (result) | over
    builder: 0, starter: 0, target: null, // in rounds: who's building, who built first, the height to beat
    kind: null, aimT: 0, fallT: 0, stillT: 0, cpuAim: 0,
    camY: 0, clock: 0, lastThump: -1, placed: 0, height: 0,
  };
  const names = () => (state.mode === "1p" ? ["You", "Computer"] : ["Player 1", "Player 2"]);
  const rounds = () => state.mode !== "solo";
  const cpuTurn = () => state.mode === "1p" && state.builder === 1;
  const ft = (m) => Math.round(m * FT);
  const later = (ms, fn) => { const round = state.match; setTimeout(() => { if (state.match === round && state.phase !== "idle") fn(); }, ms); };

  // ---------- setup ----------
  function chipsFor(box, items, key) {
    box.replaceChildren(...items.map(([value, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.dataset[key] = String(value); b.textContent = label;
      return b;
    }));
  }
  function syncTitle() {
    const press = (box, key, value) => box.querySelectorAll(`[data-${key}]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[key] === String(value))));
    press($("modes"), "mode", state.mode);
    press($("levels"), "level", state.level);
    press($("rounds"), "rounds", state.rounds);
    $("mode-rule").textContent = RULES[state.mode];
    $("level-option").hidden = state.mode !== "1p";
    $("rounds-option").hidden = state.mode === "solo";
    $("best").textContent = state.mode === "solo" && state.best ? `Best height on this device: ${ft(state.best)} ft` : "";
    FP.controlCards($("control-cards"), state.mode === "2p"
      ? [{ who: "Player 1", how: "Tap on your turn", keys: [["A"], ["Space"]] }, { who: "Player 2", how: "Tap on your turn", keys: [["L"], ["Space"]] }]
      : [{ who: "You", how: "Tap to drop", keys: [["Space"], ["Enter"]] }]);
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
  pick($("rounds"), "rounds", (v) => { state.rounds = Number(v); store.set("rounds", state.rounds); });

  function showTitle() {
    loop.stop();
    state.phase = "idle";
    syncTitle();
    FP.screens.go("title");
  }

  // ---------- canvas ----------
  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    canvas.width = Math.round(r.width / PIXEL);
    canvas.height = Math.round(r.height / PIXEL);
    state.view = SKRender.fit(canvas.width, canvas.height);
  }
  new ResizeObserver(resize).observe(canvas);

  // ---------- a match ----------
  function start() {
    state.match = rounds() ? SK.newMatch(state.rounds) : { solo: true };
    state.starter = 0;
    $("stage").classList.toggle("rounds", rounds());
    [0, 1].forEach((i) => { $("chip-" + i).hidden = !rounds(); $("name-" + i).textContent = names()[i]; $("score-" + i).textContent = "0"; });
    FP.screens.go("play");
    resize();
    FP.sfx.start();
    loop.start();
    build(0, null);
  }
  /** A fresh pile for `who`, with a height to beat (or none). */
  function build(who, target) {
    state.builder = who;
    state.target = target;
    state.game = SK.newGame();
    state.kind = null;
    state.placed = 0;
    state.height = 0;
    state.camY = -0.3;
    $("hud-who").textContent = rounds() ? names()[who] : "";
    $("solo-hud").style.setProperty("--who", rounds() ? COLOURS[who] : "transparent");
    [0, 1].forEach((i) => $("chip-" + i).classList.toggle("on", rounds() && i === who));
    showHeight();
    if (!rounds()) return nextObject();
    state.phase = "ready";
    const turn = state.mode === "1p" ? (who === 0 ? "Your turn" : "Computer's turn") : `${names()[who]}'s turn`;
    $("banner").textContent = target === null ? turn : `${turn} · Beat ${ft(target)} ft`;
    FP.sfx.move();
    later(1700, nextObject);
  }
  function nextObject() {
    state.kind = SKObjects.deal(state.kind);
    state.phase = "aim";
    state.aimT = 0;
    if (cpuTurn()) state.cpuAim = SK.aim(state.game, state.level);
    $("banner").textContent = "";
  }
  function release() {
    if (state.phase !== "aim" || state.aimT < 0.25) return; // a short beat so a double tap can't drop two
    const h = SK.hook(state.game, state.aimT);
    SK.drop(state.game, state.kind, h.x, SK.hangY(state.game, state.kind), h.vx);
    state.phase = "fall";
    state.fallT = 0;
    state.stillT = 0;
    if (window.FunSound) FunSound.tone(520, { duration: 0.12, type: "square", slideTo: 260, volume: 0.04 });
  }
  function landed() {
    state.placed += 1;
    state.height = SK.height(state.game);
    showHeight();
    if (rounds() && state.target !== null && state.height > state.target) return roundOver(state.builder, "Higher!");
    FP.sfx.tick();
    nextObject();
  }
  const who = () => (state.mode === "1p" ? (state.builder === 0 ? "You" : "The computer") : names()[state.builder]);
  function toppled() {
    state.phase = "pause";
    FP.sfx.wrong();
    if (!rounds()) { $("banner").textContent = "Timber!"; return later(1400, soloOver); }
    const other = 1 - state.builder;
    if (state.target === null) {
      // first pile of the round is done: its height is the one to beat
      $("banner").textContent = `${who()}: ${ft(state.height)} ft`;
      return later(1800, () => build(other, state.height));
    }
    roundOver(other, "Timber!");
  }
  function roundOver(winner, text) {
    state.phase = "pause";
    const m = state.match;
    m.score[winner] += 1;
    $("score-" + winner).textContent = String(m.score[winner]);
    $("banner").textContent = `${text}\n${state.mode === "1p" ? (winner === 0 ? "You win the round" : "Computer wins the round") : `${names()[winner]} wins the round`}`;
    if (winner === state.builder) FP.sfx.right();
    later(2200, () => {
      if (m.score[winner] >= m.winAt) return matchOver(winner);
      state.starter = 1 - state.starter;
      build(state.starter, null);
    });
  }
  function soloOver() {
    loop.stop();
    state.phase = "over";
    const h = state.height, record = h > state.best;
    if (record) { state.best = h; store.set("best", h); FP.sfx.right(); }
    $("over-title").textContent = record && h > 0 ? "New best!" : "Timber!";
    $("over-score").textContent = `${ft(h)} ft`;
    $("over-note").textContent = `${state.placed} ${state.placed === 1 ? "thing" : "things"} stacked, ${h.toFixed(1)} m high.`;
    FP.screens.go("over");
  }
  function matchOver(w) {
    loop.stop();
    state.phase = "over";
    const s = state.match.score;
    $("over-title").textContent = state.mode === "1p" ? (w === 0 ? "You win!" : "The computer wins") : `${names()[w]} wins!`;
    $("over-score").textContent = `${s[0]} – ${s[1]}`;
    $("over-note").textContent = "";
    FP.screens.go("over");
  }
  function showHeight() {
    $("height").textContent = String(ft(state.height));
    $("height-m").textContent = `${state.height.toFixed(1)} m`;
  }

  // ---------- input ----------
  const human = (player) => state.phase === "aim" && !cpuTurn() && (player === undefined || player === state.builder);
  canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); if (human()) release(); });
  const key = (player) => () => (human(player) ? release() : false);
  FP.input.keys({ " ": key(), Enter: key(), a: key(0), A: key(0), l: key(1), L: key(1) });

  // ---------- loop ----------
  function update(dt) {
    if (!state.game || state.phase === "over" || state.phase === "idle") return;
    state.clock += dt;
    const thump = SK.step(state.game, dt);
    if (thump > 1.2 && state.clock - state.lastThump > 0.08 && window.FunSound) {
      FunSound.noise({ duration: 0.06, freq: 260 + Math.min(thump, 8) * 40, volume: Math.min(0.5, 0.1 + thump * 0.05) });
      state.lastThump = state.clock;
    }
    if (state.phase !== "pause" && SK.fallen(state.game).length) return toppled();
    if (state.phase === "aim") {
      state.aimT += dt;
      if (cpuTurn() && SK.cpuShouldDrop(state.game, state.kind, state.level, state.cpuAim, state.aimT)) release();
    } else if (state.phase === "fall") {
      state.fallT += dt;
      state.stillT = SK.settled(state.game) ? state.stillT + dt : 0;
      if ((state.fallT > 0.5 && state.stillT > 0.3) || state.fallT > 6) landed();
    }
    // camera: keep the held object, the hook and the girder above it on screen
    const v = state.view;
    if (v) {
      const kind = state.kind || "fridge";
      const top = SK.hangY(state.game, kind) + SKObjects.bounds(SKObjects.OBJECTS[kind]).maxY + 1.0;
      const target = Math.max(-0.3, top - v.h / v.ppm);
      state.camY += (target - state.camY) * Math.min(1, dt * 2.5);
    }
  }
  function draw() {
    if (!state.view || !state.game) return;
    let held = null;
    if (state.phase === "aim") held = { kind: state.kind, x: SK.hook(state.game, state.aimT).x, y: SK.hangY(state.game, state.kind) };
    // the dashed line: your best (solo) or the height to beat, in the colour of whoever set it
    let line = null;
    if (!rounds() && state.best > 0) line = { height: state.best, colour: "#ffd23f" };
    if (rounds() && state.target !== null) line = { height: state.target, colour: COLOURS[1 - state.builder] };
    SKRender.paint(g, state.view, { game: state.game, held, camY: state.camY, t: state.clock, line });
  }
  const loop = FP.loop(update, draw);

  FP.input.tap($("play"), start);
  FP.input.tap($("again"), start);
  FP.input.tap($("change"), showTitle);
  FP.layout.on(() => { if (FP.screens.current === "title") syncTitle(); });

  FP.ready.then(() => {
    const mode = store.get("mode", "solo");
    state.mode = ["solo", "1p", "2p"].includes(mode) ? mode : "solo";
    const lvl = store.get("level", "medium");
    state.level = SK.LEVELS[lvl] ? lvl : "medium";
    const r = store.get("rounds", SK.DEFAULT_ROUNDS);
    state.rounds = SK.ROUNDS.includes(r) ? r : SK.DEFAULT_ROUNDS;
    state.best = Number(store.get("best", 0)) || 0;
    chipsFor($("levels"), Object.entries(SK.LEVELS).map(([k, L]) => [k, L.label]), "level");
    chipsFor($("rounds"), SK.ROUNDS.map((n) => [n, `Best of ${n}`]), "rounds");
    showTitle();
  });
})();
