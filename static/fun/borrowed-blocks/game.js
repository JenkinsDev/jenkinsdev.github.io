/* Borrowed Blocks: screens, input and turn flow. Rules in rules.js; canvas and DOM views in render.js. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    store = FP.store("borrowed-blocks");
  let mode = "1p",
    level = "medium",
    first = 0,
    state = null,
    slot = -1,
    rotation = 0,
    x = 0,
    y = 0,
    aim = false,
    locked = false,
    epoch = 0,
    rackCursor = 0;
  FP.shell({ title: "Borrowed Blocks" });
  const who = (p) => (mode === "1p" ? (p ? "Computer" : "You") : `Player ${p + 1}`);
  const human = () => state && !state.over && !(mode === "1p" && state.player === 1) && !locked && FP.screens.current === "play";
  function setup() {
    epoch++;
    FP.screens.go("title");
    document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    $("level-option").hidden = mode === "2p";
    $("levels").innerHTML = ["easy", "medium", "hard", "impossible"]
      .map((l) => `<button class="chip" data-level="${l}" aria-pressed="${l === level}">${l[0].toUpperCase() + l.slice(1)}</button>`)
      .join("");
    $("mode-rule").textContent = mode === "1p" ? "Play the computer. Six turns each." : "Share the screen. Six turns each.";
    FP.controlCards(
      $("control-cards"),
      Array.from({ length: mode === "1p" ? 1 : 2 }, (_, p) => ({
        who: who(p),
        how: "Pick a piece. Tap your board, then PLACE. Tap ROTATE to turn it.",
        keys: [
          ["1", "2", "3"],
          ["Arrows", "R", "Enter", "Esc"],
        ],
      })),
    );
  }
  function ghost() {
    return slot < 0 || !aim ? null : BB.preview(state, slot, rotation, x, y);
  }
  function paint() {
    for (let p = 0; p < 2; p++) {
      const c = $(`board-${p}`),
        g = c.getContext("2d");
      BBRender.board(g, state, p, 0, 0, 32, p === state.player ? ghost() : null);
    }
    $("place").disabled = !human() || !ghost();
    $("rotate").disabled = !human() || slot < 0;
    $("cancel").disabled = !human() || slot < 0;
    $("pass").disabled = !human() || BB.moves(state).length > 0;
    $("rack")
      .querySelectorAll("button")
      .forEach((b, i) => {
        b.disabled = !human();
        b.setAttribute("aria-pressed", i === slot);
        BBRender.fittedPiece(b.querySelector("canvas").getContext("2d"), state.rack[i], i === slot ? rotation : 0);
      });
    $("hint").textContent = !human()
      ? "Computer is choosing."
      : !BB.moves(state).length
        ? "Nothing fits. Tap PASS."
        : slot < 0
          ? "Pick a piece from the rack."
          : !aim
            ? "Tap a square on your board."
            : ghost()
              ? "Fits here. Tap PLACE."
              : "Try another square or rotate.";
  }
  function render() {
    const p = state.player;
    $("play").blur();
    document.querySelector(".play-screen").style.setProperty("--who", BBRender.colors[p]);
    $("banner").textContent = mode === "1p" ? (p ? "Computer's turn" : "Your turn") : `Player ${p + 1}'s turn`;
    $("turn-count").textContent = `Turn ${Math.min(6, state.turns[p] + 1)} of 6`;
    $("actions").setAttribute("aria-label", `${who(p)} controls`);
    BBRender.mount(state, who, human());
    paint();
  }
  function finish() {
    const [a, b] = state.scores;
    $("result").textContent = a === b ? "Tie" : mode === "1p" ? (a > b ? "You win" : "Computer wins") : `Player ${a > b ? 1 : 2} wins`;
    $("final-score").textContent = `${who(0)} ${a} · ${who(1)} ${b}`;
    FP.screens.go("over");
    FP.sfx.right();
  }
  function commit(m) {
    const next = BB.step(state, m);
    if (!next) {
      FP.sfx.nope();
      return;
    }
    const placed = m ? { player: state.player, mask: BB.preview(state, m.slot, m.r, m.x, m.y).mask } : null;
    state = next;
    slot = -1;
    aim = false;
    rotation = 0;
    locked = false;
    FunSound.noise({ duration: 0.045, freq: 950, volume: 0.12 });
    FunSound.tone(150, { duration: 0.075, type: "triangle", volume: 0.1, slideTo: 70 });
    render();
    BBRender.snap(placed);
    if (state.over) {
      setTimeout(finish, FP.reducedMotion ? 0 : 190);
      return;
    }
    const token = epoch;
    FP.animate(220, (p) => {
      $("rack").style.transform = `translateX(${(1 - p) * 18}px)`;
    });
    if (mode === "1p" && state.player === 1) {
      locked = true;
      paint();
      setTimeout(() => computer(token), 420);
    }
  }
  function computer(token) {
    if (token !== epoch || FP.screens.current !== "play") return;
    const m = BB.choose(state, level);
    if (m) {
      slot = m.slot;
      rotation = m.r;
      x = m.x;
      y = m.y;
      aim = true;
      paint();
    }
    setTimeout(
      () => {
        if (token === epoch && FP.screens.current === "play") commit(m);
      },
      FP.reducedMotion ? 100 : 450,
    );
  }
  function start() {
    epoch++;
    state = BB.create(Date.now(), first);
    first = 1 - first;
    slot = -1;
    aim = false;
    rotation = 0;
    locked = false;
    FP.screens.go("play");
    FP.sfx.start();
    render();
    if (mode === "1p" && state.player === 1) {
      locked = true;
      paint();
      const token = epoch;
      setTimeout(() => computer(token), 400);
    }
  }
  function pick(i) {
    if (!human() || i >= state.rack.length) return;
    slot = i;
    rackCursor = i;
    rotation = 0;
    aim = false;
    FP.sfx.move();
    paint();
  }
  function turn() {
    if (!human() || slot < 0) return;
    rotation = (rotation + 1) % 4;
    FP.sfx.move();
    paint();
  }
  function cell(e) {
    const b = e.target.closest("[data-cell]");
    if (!b || b.disabled || !human() || slot < 0) return;
    x = +b.dataset.cell % 4;
    y = Math.floor(+b.dataset.cell / 4);
    aim = true;
    paint();
  }
  $("boards").addEventListener("click", cell);
  let dragging = false;
  $("boards").addEventListener("pointerdown", (e) => {
    if (e.target.closest(".cell") && human()) {
      dragging = true;
      cell(e);
    }
  });
  $("boards").addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const b = document.elementFromPoint(e.clientX, e.clientY);
    if (b) cell({ target: b });
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
  });
  window.addEventListener("pointercancel", () => {
    dragging = false;
  });
  $("rack").addEventListener("click", (e) => {
    const b = e.target.closest("[data-slot]");
    if (b) pick(+b.dataset.slot);
  });
  FP.input.tap($("rotate"), turn);
  FP.input.tap($("cancel"), () => {
    if (human()) {
      slot = -1;
      aim = false;
      paint();
    }
  });
  FP.input.tap($("place"), () => {
    if (human() && ghost()) commit({ slot, r: rotation, x, y });
  });
  FP.input.tap($("pass"), () => {
    if (human() && !BB.moves(state).length) commit(null);
  });
  $("modes").addEventListener("click", (e) => {
    if (e.target.dataset.mode) {
      mode = e.target.dataset.mode;
      store.set("mode", mode);
      setup();
    }
  });
  $("levels").addEventListener("click", (e) => {
    if (e.target.dataset.level) {
      level = e.target.dataset.level;
      store.set("level", level);
      setup();
    }
  });
  FP.input.tap($("play"), start);
  FP.input.tap($("again"), start);
  FP.input.tap($("change"), setup);
  function arrow(dx, dy) {
    if (!human()) return false;
    if (slot < 0) {
      rackCursor = (rackCursor + dx + 3) % 3;
      $("rack").children[rackCursor].focus();
    } else {
      x = Math.max(0, Math.min(3, x + dx));
      y = Math.max(0, Math.min(3, y + dy));
      aim = true;
      paint();
    }
  }
  FP.input.keys({
    1: () => pick(0),
    2: () => pick(1),
    3: () => pick(2),
    r: turn,
    R: turn,
    ArrowLeft: () => arrow(-1, 0),
    ArrowRight: () => arrow(1, 0),
    ArrowUp: () => arrow(0, -1),
    ArrowDown: () => arrow(0, 1),
    Escape: () => {
      if (human()) {
        slot = -1;
        aim = false;
        paint();
      }
    },
    Enter: () => {
      if (!human()) return false;
      if (slot < 0) pick(rackCursor);
      else if (ghost()) commit({ slot, r: rotation, x, y });
      else {
        aim = true;
        paint();
      }
    },
    p: () => {
      if (human() && !BB.moves(state).length) commit(null);
    },
  });
  FP.ready.then(() => {
    mode = store.get("mode", "1p") === "2p" ? "2p" : "1p";
    const l = store.get("level", "medium");
    level = ["easy", "medium", "hard", "impossible"].includes(l) ? l : "medium";
    setup();
  });
})();
