(function () {
  "use strict";
  const $ = (id) => document.getElementById(id), store = FP.store("rocket-lander");
  const canvases = [$("view-0"), $("view-1")];
  const ctx = canvases.map((c) => c.getContext("2d"));
  const state = {
    mode: "1p", level: "medium", world: "moon", match: null, game: null,
    phase: "idle", clock: 0, wait: 0, dpr: 1,
    keys: new Set(), holds: [{ left: new Set(), right: new Set(), thrust: new Set() }, { left: new Set(), right: new Set(), thrust: new Set() }],
    cpu: {}, lastThrust: -1, lastTick: -1, thrusting: [false, false], lastFact: {}
  };
  const names = () => state.mode === "1p" ? ["You", "Computer"] : ["Player 1", "Player 2"];
  const labels = () => state.mode === "1p" ? ["YOU", "CPU"] : ["P1", "P2"];
  FP.shell({ title: "Rocket Lander" });
  $("split-back").innerHTML = FP.icon("back");
  FP.muteButton($("split-mute"));
  if (window.FunSound && FunSound.onMute) {
    FunSound.onMute(() => {
      const muted = FunSound.muted;
      document.querySelectorAll(".fp-bar button, #split-mute").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(muted));
        btn.setAttribute("aria-label", muted ? "Sound off" : "Sound on");
        btn.innerHTML = FP.icon(muted ? "off" : "sound");
      });
    });
  }
  ["easy", "medium", "hard", "impossible"].forEach((level) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.level = level;
    b.textContent = level[0].toUpperCase() + level.slice(1); $("levels").append(b);
  });
  [["moon", "Moon"], ["mars", "Mars"], ["earth", "Earth"], ["pluto", "Pluto"], ["jupiter", "Jupiter"]].forEach(([id, name]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.world = id;
    b.textContent = name; $("worlds").append(b);
  });
  function setup() {
    state.phase = "idle";
    $("modes").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
    $("levels").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.level === state.level)));
    $("worlds").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.world === state.world)));
    $("level-option").hidden = state.mode !== "1p";
    $("mode-rule").textContent = state.mode === "1p" ? "Race the computer to a soft landing." : "Two players race on a split screen.";
    const how = "Hold THRUST to fire. Rotate left and right to aim the nose.";
    FP.controlCards($("control-cards"), state.mode === "1p"
      ? [{ who: "You", how, keys: [["A", "D", "W"], ["←", "→", "↑", "Space"]] }]
      : [{ who: "Player 1", how, keys: [["A", "D", "W", "Space"]] }, { who: "Player 2", how, keys: [["←", "→", "↑"]] }]);
    document.querySelector(".rl").classList.toggle("two", state.mode === "2p");
    FP.screens.go("title");
  }
  for (const [id, key] of [["modes", "mode"], ["levels", "level"], ["worlds", "world"]]) {
    $(id).addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      state[key] = b.dataset[key]; store.set(key, state[key]); FP.sfx.move(); setup();
    });
  }
  function resize() {
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvases.forEach((c) => {
      const box = c.getBoundingClientRect();
      if (!box.width || !box.height) return;
      c.width = Math.round(box.width * state.dpr);
      c.height = Math.round(box.height * state.dpr);
    });
  }
  function mobileChrome() {
    const l = FP.layout.current || { size: "desktop", w: innerWidth, h: innerHeight };
    const mobile = l.size === "phone" || l.h <= 520 || Math.min(l.w, l.h) < 500;
    document.documentElement.classList.toggle("rl-mobile", mobile);
  }
  new ResizeObserver(resize).observe($("arena"));
  FP.layout.on(() => { mobileChrome(); resize(); clearHolds(); });
  mobileChrome();
  function clearHolds() {
    state.holds.forEach((h) => { h.left.clear(); h.right.clear(); h.thrust.clear(); });
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) clearHolds(); });
  function bindPad(btn) {
    const player = Number(btn.dataset.p), act = btn.dataset.act;
    const down = (e) => {
      if (state.phase !== "fly") return;
      e.preventDefault();
      state.holds[player][act].add(e.pointerId);
      try { btn.setPointerCapture(e.pointerId); } catch (_) { /* hold still works */ }
    };
    const up = (e) => state.holds[player][act].delete(e.pointerId);
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
  }
  document.querySelectorAll(".pad").forEach(bindPad);
  document.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!["a", "d", "w", " ", "arrowleft", "arrowright", "arrowup"].includes(k) && !["ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) return;
    if (state.phase !== "fly") return;
    e.preventDefault();
    state.keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });
  document.addEventListener("keyup", (e) => {
    state.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (e.key === " ") state.keys.delete(" ");
  });
  function held(player, act) {
    if (state.holds[player][act].size) return true;
    const k = state.keys;
    if (state.mode === "1p") {
      if (player !== 0) return false;
      if (act === "left") return k.has("a") || k.has("ArrowLeft");
      if (act === "right") return k.has("d") || k.has("ArrowRight");
      return k.has("w") || k.has("arrowup") || k.has("ArrowUp") || k.has(" ");
    }
    if (player === 0) {
      if (act === "left") return k.has("a");
      if (act === "right") return k.has("d");
      return k.has("w") || k.has(" ");
    }
    if (act === "left") return k.has("ArrowLeft");
    if (act === "right") return k.has("ArrowRight");
    return k.has("ArrowUp");
  }
  function humanInput(player) {
    const rotate = (held(player, "left") ? -1 : 0) + (held(player, "right") ? 1 : 0);
    return { rotate, thrust: held(player, "thrust") };
  }
  function scores() {
    const m = state.match, n = names(), g = state.game;
    $("name-0").textContent = n[0]; $("name-1").textContent = n[1];
    $("score-0").textContent = m.scores[0]; $("score-1").textContent = m.scores[1];
    $("world-tag").textContent = g.world.name;
    const left = Math.max(0, RL.LIMIT - (g ? g.time : 0));
    $("timer").textContent = left.toFixed(1);
    $("timer").classList.toggle("low", left <= 10);
    [0, 1].forEach((i) => {
      const fuel = Math.max(0, Math.round(g.rockets[i].fuel));
      $("fuel-" + i).textContent = String(fuel);
      $("fuel-bar-" + i).style.width = fuel + "%";
      const seatScore = $("seat-score-" + i), seatTimer = $("seat-timer-" + i);
      if (seatScore) seatScore.textContent = String(m.scores[i]);
      if (seatTimer) {
        seatTimer.textContent = left.toFixed(1);
        seatTimer.classList.toggle("low", left <= 10);
      }
    });
  }
  function say(text) { $("live").textContent = text; $("banner").textContent = text; }
  function begin() {
    state.match = RL.match(state.world);
    nextRound(true);
    FP.sfx.start();
  }
  function nextRound(first) {
    state.game = RL.create(state.world, Math.random, state.lastFact[state.world]);
    state.cpu = {}; state.clock = 0; state.wait = 0; state.phase = "fly";
    clearHolds();
    document.querySelector(".rl").classList.toggle("two", state.mode === "2p");
    $("fact").hidden = true;
    const note = state.game.world.banner || "Land upright and gently on the pad.";
    say(note);
    scores();
    FP.screens.go("play");
    resize();
    if (!first) { /* keep playing music */ }
  }
  function endRound() {
    const g = state.game, n = names();
    RL.addRound(state.match, g.winner);
    scores();
    let line = g.winner < 0 ? (g.why === "crash" ? "Both tipped over — a draw." : "A draw.") : n[g.winner] + (g.winner === 0 && state.mode === "1p" ? " land safely!" : " lands safely!");
    if (g.why === "land") { FP.sfx.right(); if (window.FunSound) FunSound.ding(); say("Safe landing!"); }
    else say("Oops!");
    $("banner").textContent = line;
    state.lastFact[g.world.id] = g.world.fact;
    $("fact-text").textContent = g.world.fact;
    $("fact").hidden = false;
    $("live").textContent = (g.winner >= 0 ? "Safe landing! " : "Oops! ") + g.world.fact;
    state.phase = "fact"; state.wait = 0;
  }
  function finishMatch() {
    const m = state.match, n = names();
    state.phase = "over";
    $("result").textContent = m.winner < 0 ? "A draw" : n[m.winner] + (m.winner === 0 && state.mode === "1p" ? " win" : " wins");
    $("final-score").textContent = n[0] + ": " + m.scores[0] + "\n" + n[1] + ": " + m.scores[1];
    FP.screens.go("over");
  }
  $("play").addEventListener("click", begin);
  $("rematch").addEventListener("click", begin);
  $("setup").addEventListener("click", setup);
  function ageBoom(dt) {
    if (!state.game) return;
    state.game.rockets.forEach((r) => { if (r.status === "crash") r.boom = (r.boom || 0) + dt; });
  }
  FP.loop((dt) => {
    if (state.phase === "idle" || state.phase === "over") return;
    state.clock += dt;
    ageBoom(dt);
    if (state.phase === "fact") {
      state.wait += dt;
      if (state.wait > (FP.reducedMotion ? 0.5 : 2.8)) {
        if (state.match.over) finishMatch(); else nextRound(false);
      }
      return;
    }
    if (state.phase !== "fly") return;
    const inputs = [humanInput(0), state.mode === "2p" ? humanInput(1) : RL.cpuInput(state.game.rockets[1], state.game.world, state.level, state.game.time, state.cpu, Math.random)];
    const was = state.game.rockets.map((r) => r.status);
    RL.step(state.game, dt, inputs);
    if (state.game.rockets.some((r, i) => r.status === "crash" && was[i] === "fly") && window.FunSound) {
      FunSound.tone(42, { duration: 0.4, type: "sine", volume: 0.48, slideTo: 18 });
      FunSound.tone(86, { duration: 0.26, type: "triangle", volume: 0.32, slideTo: 30 });
      FunSound.noise({ duration: 0.28, freq: 80, q: 0.4, volume: 0.78 });
      FunSound.noise({ duration: 0.32, freq: 260, q: 0.5, volume: 0.58 });
      FunSound.boing();
      setTimeout(() => {
        if (!window.FunSound) return;
        FunSound.noise({ duration: 0.38, freq: 850, q: 0.45, volume: 0.42 });
        FunSound.tone(150, { duration: 0.2, type: "square", volume: 0.12, slideTo: 38 });
      }, 35);
    }
    const now = state.clock;
    inputs.forEach((inp, i) => {
      if (inp.thrust && state.game.rockets[i].status === "fly" && now - state.lastThrust > 0.07 && window.FunSound && !FP.reducedMotion) {
        FunSound.tone(140, { duration: 0.08, type: "sawtooth", volume: 0.04, slideTo: 90 });
        state.lastThrust = now;
      }
      if (inp.rotate && now - state.lastTick > 0.2) { FP.sfx.tick(); state.lastTick = now; }
    });
    scores();
    if (state.game.over) endRound();
  }, () => {
    if (!state.game || state.phase === "idle" || state.phase === "over") return;
    canvases.forEach((c, i) => {
      RLRender.paint(ctx[i], state.game, {
        w: c.width, h: c.height, follow: i, time: state.clock,
        still: FP.reducedMotion, labels: labels()
      });
    });
    if (FP.reducedMotion) $("banner").classList.add("static"); else $("banner").classList.remove("static");
  }).start();
  window.__rocketLander = {
    snapshot() {
      if (!state.game) return { phase: state.phase, mode: state.mode, rockets: null };
      return {
        phase: state.phase,
        mode: state.mode,
        holds: state.holds.map((h) => ({ left: h.left.size, right: h.right.size, thrust: h.thrust.size })),
        rockets: state.game.rockets.map((r) => ({
          x: r.x, y: r.y, vx: r.vx, vy: r.vy, angle: r.angle, fuel: r.fuel, thrust: !!r.thrust, status: r.status
        }))
      };
    },
    release() {
      state.holds.forEach((h) => { h.left.clear(); h.right.clear(); h.thrust.clear(); });
    }
  };
  FP.ready.then(() => {
    const mode = store.get("mode", "1p"), level = store.get("level", "medium"), world = store.get("world", "moon");
    state.mode = ["1p", "2p"].includes(mode) ? mode : "1p";
    state.level = ["easy", "medium", "hard", "impossible"].includes(level) ? level : "medium";
    state.world = RL.WORLDS[world] ? world : "moon";
    setup();
  });
})();
