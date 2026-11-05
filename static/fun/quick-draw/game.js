/*
 * Quick Draw: screens, timing and input. Rules live in duel.js (window.QD), the town in scene.js, shared basics in
 * ../shared/engine.js (window.FP). Player 0 is "you" / player 1; player 1 is the computer or player 2.
 */
(function () {
  "use strict";

  const store = FP.store("quick-draw");
  const $ = (id) => document.getElementById(id);
  const pads = [$("pad-0"), $("pad-1")];
  const scene = QDScene($("scene"));
  const KEYS = { two: { a: 0, A: 0, l: 1, L: 1 }, one: { " ": 0, Enter: 0, a: 0, A: 0 } };

  FP.shell({ title: "Quick Draw" });

  const state = {
    mode: "1p",
    level: "medium",
    rounds: 5, // best of 3, 5 or 7
    fastest: null, // ms, best on this device
    match: null,
    phase: "idle", // idle | ready | wait | go | done | paused
    signalAt: null,
    timers: [],
    matchFastest: null,
  };

  const names = () => (state.mode === "1p" ? ["You", "Computer"] : ["Player 1", "Player 2"]);
  const later = (ms, fn) => state.timers.push(setTimeout(fn, ms));
  const clearTimers = () => { state.timers.forEach(clearTimeout); state.timers = []; };

  const bang = () => {
    if (!window.FunSound) return;
    FunSound.noise({ duration: 0.22, freq: 900, q: 0.5, volume: 0.6 });
    FunSound.tone(140, { duration: 0.2, type: "square", volume: 0.05, slideTo: 60 });
  };

  // ---------- title ----------
  function buildLevels() {
    $("levels").replaceChildren(...Object.entries(QD.LEVELS).map(([key, L]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.level = key;
      b.textContent = L.label;
      return b;
    }));
  }

  function buildRounds() {
    $("rounds").replaceChildren(...QD.ROUNDS.map((n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.rounds = String(n);
      b.textContent = `Best of ${n}`;
      return b;
    }));
  }

  function syncTitle() {
    $("modes").querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
    $("levels").querySelectorAll("[data-level]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.level === state.level)));
    $("rounds").querySelectorAll("[data-rounds]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.rounds) === state.rounds)));
    $("level-option").hidden = state.mode !== "1p";
    FP.controlCards($("control-cards"), state.mode === "1p"
      ? [{ who: "You", how: "Tap DRAW", keys: [["Space"], ["Enter"], ["A"]] }]
      : [
          { who: "Player 1", how: "Tap your DRAW button", keys: [["A"]] },
          { who: "Player 2", how: "Tap your DRAW button", keys: [["L"]] },
        ]);
    $("best").textContent = state.fastest ? `Fastest draw on this device: ${state.fastest} ms` : "";
  }

  $("modes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (!b) return;
    state.mode = b.dataset.mode;
    store.set("mode", state.mode);
    FP.sfx.move();
    syncTitle();
  });
  $("levels").addEventListener("click", (e) => {
    const b = e.target.closest("[data-level]");
    if (!b) return;
    state.level = b.dataset.level;
    store.set("level", state.level);
    FP.sfx.move();
    syncTitle();
  });

  $("rounds").addEventListener("click", (e) => {
    const b = e.target.closest("[data-rounds]");
    if (!b) return;
    state.rounds = Number(b.dataset.rounds);
    store.set("rounds", state.rounds);
    FP.sfx.move();
    syncTitle();
  });

  function showTitle() {
    clearTimers();
    scene.stop();
    state.phase = "idle";
    syncTitle();
    FP.screens.go("title");
  }

  // ---------- a match ----------
  function startMatch() {
    clearTimers();
    state.match = QD.newMatch(state.rounds);
    state.matchFastest = null;
    const two = state.mode === "2p";
    const keys = FP.layout.current.size !== "phone"; // show keyboard keys where there's likely a keyboard
    pads[1].disabled = !two; // in 1P the computer draws for itself
    names().forEach((n, i) => { $("name-" + i).textContent = n; });
    $("key-0").textContent = keys ? (two ? "A" : "Space") : "";
    $("key-1").textContent = keys && two ? "L" : "";
    pads[1].querySelector(".draw-label").textContent = two ? "DRAW" : `COMPUTER · ${QD.LEVELS[state.level].label.toUpperCase()}`;
    pads[0].setAttribute("aria-label", two ? "Player 1: draw" : "Draw");
    pads[1].setAttribute("aria-label", two ? "Player 2: draw" : `Computer, ${QD.LEVELS[state.level].label}`);
    scene.reset();
    scene.start();
    updateScores();
    FP.sfx.start();
    FP.screens.go("duel");
    later(600, startRound);
  }

  function updateScores() {
    state.match.scores.forEach((s, i) => { $("score-" + i).textContent = String(s); });
  }

  function startRound() {
    pads.forEach((p) => p.classList.remove("won", "foul", "pressed"));
    scene.reset();
    $("signal").hidden = true;
    $("detail").textContent = "";
    $("status").textContent = "Get ready…";
    state.phase = "ready";
    state.signalAt = null;
    later(900, () => {
      state.phase = "wait";
      $("status").textContent = "Wait for it…";
      const waitStart = performance.now();
      const delay = QD.signalDelay();
      later(delay, signal);
      if (state.mode === "1p") {
        const plan = QD.cpuPlan(state.level, Math.random, delay);
        later(plan.at, () => tap(1, waitStart + plan.at));
      }
    });
  }

  function signal() {
    if (state.phase !== "wait") return;
    state.phase = "go";
    state.signalAt = performance.now();
    $("status").textContent = "";
    $("signal").hidden = false;
    bang();
  }

  /** Player i hit DRAW at time t (performance.now() timeline). The first draw decides the round. */
  function tap(i, t) {
    if (state.phase !== "wait" && state.phase !== "go") return false;
    const n = names();
    const result = QD.judge(t, state.phase === "go" ? state.signalAt : null);
    const winner = result.early ? 1 - i : i;
    state.phase = "done";
    clearTimers(); // cancels the pending signal and the computer's planned draw
    pads[i].classList.add("pressed");
    pads[winner].classList.add("won");
    $("signal").hidden = true;

    if (result.early) {
      pads[i].classList.add("foul");
      scene.pose(i, "draw"); // drew before the signal: gun out, no shot fired
      $("status").textContent = `${n[i]} drew too early!`;
      $("detail").textContent = `Point to ${n[winner]}.`;
      FP.sfx.wrong();
    } else {
      $("status").textContent = state.mode === "1p" ? (i === 0 ? "You win the round!" : "The computer got you!") : `${n[i]} wins the round!`;
      $("detail").textContent = `${result.ms} ms`;
      scene.shoot(i);
      setTimeout(() => scene.pose(1 - i, "down"), 140);
      const human = state.mode === "2p" || i === 0;
      if (human) recordReaction(result.ms);
      FP.sfx.right();
    }

    state.match = QD.addPoint(state.match, winner);
    updateScores();
    if (state.match.winner !== null) later(1800, matchOver);
    else later(1800, startRound);
  }

  function recordReaction(ms) {
    if (state.matchFastest === null || ms < state.matchFastest) state.matchFastest = ms;
    if (state.fastest === null || ms < state.fastest) {
      state.fastest = ms;
      store.set("fastest", ms);
    }
  }

  function matchOver() {
    const n = names();
    const w = state.match.winner;
    $("over-title").textContent = state.mode === "1p" ? (w === 0 ? "You win!" : "The computer wins") : `${n[w]} wins!`;
    $("over-score").textContent = state.match.scores.join(" – ");
    $("over-fastest").textContent = state.matchFastest !== null
      ? `Fastest draw this match: ${state.matchFastest} ms`
      : "Nobody drew after the signal this match.";
    state.phase = "idle";
    scene.stop();
    FP.screens.go("over");
  }

  // ---------- input ----------
  // pointerdown, not click: it fires the moment the button is pressed, which is what a reaction game needs.
  pads.forEach((pad, i) => {
    pad.addEventListener("pointerdown", (e) => {
      if (pad.disabled) return;
      e.preventDefault();
      tap(i, e.timeStamp);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (FP.screens.current !== "duel" || e.repeat) return;
    const map = state.mode === "2p" ? KEYS.two : KEYS.one;
    if (!(e.key in map)) return;
    e.preventDefault();
    tap(map[e.key], e.timeStamp);
  });

  FP.input.tap($("play"), startMatch);
  FP.input.tap($("again"), startMatch);
  FP.input.tap($("change"), showTitle);

  // Leaving the tab mid-round would make the timing unfair: pause, then restart the round on return.
  document.addEventListener("visibilitychange", () => {
    if (FP.screens.current !== "duel") return;
    if (document.hidden && ["ready", "wait", "go"].includes(state.phase)) {
      clearTimers();
      state.phase = "paused";
    } else if (!document.hidden && state.phase === "paused") {
      startRound();
    }
  });

  FP.ready.then(() => {
    state.mode = store.get("mode", "1p") === "2p" ? "2p" : "1p";
    const lvl = store.get("level", "medium");
    state.level = QD.LEVELS[lvl] ? lvl : "medium";
    state.fastest = store.get("fastest", null);
    const rounds = store.get("rounds", QD.DEFAULT_ROUNDS);
    state.rounds = QD.ROUNDS.includes(rounds) ? rounds : QD.DEFAULT_ROUNDS;
    buildLevels();
    buildRounds();
    showTitle();
  });
})();
