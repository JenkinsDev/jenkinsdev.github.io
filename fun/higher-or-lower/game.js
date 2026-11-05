/*
 * Higher or Lower: screens and flow. Data in data/*.js, formatting in format.js,
 * pair choice in pick.js, shared basics in ../shared/engine.js (window.FP).
 *
 * A round: two cards, both numbers hidden, one question ("Which is heavier?").
 * The player taps a card, then both numbers count up and the winner is shown.
 */
(function () {
  "use strict";

  const H = window.HOL;
  const store = FP.store("higher-or-lower");
  const $ = (id) => document.getElementById(id);
  const cards = [$("card-a"), $("card-b")];

  FP.shell({ title: "Higher or Lower" });

  const state = {
    category: "all",
    units: "us",
    best: {},
    streak: 0,
    recent: [],
    round: null, // { category, items: [a, b] }
    answered: false,
    lastCorrect: false,
  };

  const catLabel = (key) => (key === "all" ? "All categories" : H.CATEGORIES[key].label);
  const unitOf = (item) => H.CATEGORIES[item.category].unit;
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);

  /** Put a value in an element, with a small "about" in front when the number is approximate.
   *  `ref` is the round's smaller value, so both cards show the same unit (lb next to lb). */
  function setValue(el, item, v = item.v, ref = item.v) {
    el.replaceChildren();
    if (item.about) { const s = document.createElement("small"); s.textContent = "about"; el.append(s, " "); }
    el.append(H.format(unitOf(item), v, state.units, ref));
  }
  const roundRef = () => Math.min(state.round.items[0].v, state.round.items[1].v);

  // ---------- title ----------
  function buildCategoryChips() {
    const keys = ["all", ...Object.keys(H.CATEGORIES)];
    $("cats").replaceChildren(...keys.map((key) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.innerHTML = "<span></span><small></small>";
      b.firstChild.textContent = key === "all" ? "All" : H.CATEGORIES[key].label;
      b.lastChild.textContent = "Best " + (state.best[key] || 0);
      b.setAttribute("aria-pressed", String(key === state.category));
      b.addEventListener("click", () => {
        state.category = key;
        store.set("category", key);
        FP.sfx.move();
        buildCategoryChips();
        $("cats").querySelector('[aria-pressed="true"]').focus();
      });
      return b;
    }));
  }

  function syncUnits() {
    $("units").querySelectorAll("[data-units]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.units === state.units)));
  }
  $("units").addEventListener("click", (e) => {
    const b = e.target.closest("[data-units]");
    if (!b) return;
    state.units = b.dataset.units;
    store.set("units", state.units);
    FP.sfx.move();
    syncUnits();
  });

  function showTitle() {
    buildCategoryChips();
    syncUnits();
    FP.controlCards($("control-cards"), [{ who: "You", how: "Tap a card", keys: [["←", "→"], ["↑", "↓"]] }]);
    FP.screens.go("title");
  }

  // ---------- a round ----------
  function fillCard(el, item) {
    el.classList.remove("right", "wrong", "winner");
    el.disabled = false;
    el.querySelector(".art").replaceChildren(FP.pixel.emoji(item.e, 24));
    el.querySelector(".item-name").textContent = item.n;
    el.querySelector(".item-note").textContent = item.note || "";
    el.querySelector(".item-value").textContent = "?";
    el.setAttribute("aria-label", item.n + (item.note ? ` (${item.note})` : ""));
  }

  function startGame() {
    state.streak = 0;
    state.recent = [];
    $("streak").textContent = "0";
    FP.sfx.start();
    FP.screens.go("play");
    nextRound();
  }

  function nextRound() {
    const r = H.pickPair({ streak: state.streak, category: state.category, recent: state.recent });
    const items = [r.known, r.mystery]; // pickPair already randomises the order
    state.round = { category: r.category, items };
    state.answered = false;
    state.recent.push(items[0].id, items[1].id);

    const cat = H.CATEGORIES[r.category];
    $("hud-cat").textContent = cat.label;
    $("prompt").textContent = H.prompt(cat, items[0], items[1]);
    cards.forEach((el, i) => fillCard(el, items[i]));
    $("result").hidden = true;
    // focus the question, not a card, so neither card looks pre-selected
    $("prompt").tabIndex = -1;
    $("prompt").focus({ preventScroll: true });
  }

  function choose(index) {
    if (FP.screens.current !== "play" || state.answered) return false;
    state.answered = true;
    const { items } = state.round;
    const winner = items[0].v > items[1].v ? 0 : 1;
    const correct = index === winner;
    cards.forEach((el) => { el.disabled = true; });

    let lastTick = 0;
    FP.animate(900, (p) => {
      cards.forEach((el, i) => setValue(el.querySelector(".item-value"), items[i], items[i].v * p, roundRef()));
      const now = performance.now();
      if (p < 1 && now - lastTick > 70) { FP.sfx.tick(); lastTick = now; }
    }, () => showResult(index, winner, correct));
  }

  function showResult(picked, winner, correct) {
    const { items, category } = state.round;
    const cat = H.CATEGORIES[category];
    state.lastCorrect = correct;
    cards.forEach((el, i) => setValue(el.querySelector(".item-value"), items[i], items[i].v, roundRef()));
    cards[winner].classList.add("winner");
    cards[picked].classList.add(correct ? "right" : "wrong");

    if (correct) {
      state.streak += 1;
      $("streak").textContent = String(state.streak);
      FP.sfx.right();
    } else {
      FP.sfx.wrong();
    }
    const verdict = $("verdict");
    verdict.textContent = correct ? "Right!" : "Not this time";
    verdict.className = "verdict " + (correct ? "right" : "wrong");
    $("ratio").textContent = cap(items[winner].n) + ": " + lower(H.describe(cat, items[winner], items[1 - winner], state.units));
    $("fact").textContent = items[winner].f;
    $("next").textContent = correct ? "NEXT" : "SEE SCORE";
    $("result").hidden = false;
    $("next").focus({ preventScroll: true });
  }

  // ---------- game over ----------
  function miniCard(item) {
    const d = document.createElement("div");
    d.className = "mini";
    d.append(FP.pixel.emoji(item.e, 24));
    const n = document.createElement("span");
    n.textContent = item.n;
    const v = document.createElement("b");
    setValue(v, item, item.v, roundRef());
    d.append(n, v);
    return d;
  }

  function gameOver() {
    const prev = state.best[state.category] || 0;
    const isBest = state.streak > prev;
    if (isBest) {
      state.best[state.category] = state.streak;
      store.set("best", state.best);
    }
    $("final").textContent = String(state.streak);
    $("best-note").textContent = isBest
      ? `New best for ${catLabel(state.category).toLowerCase()}!`
      : `Best for ${catLabel(state.category).toLowerCase()}: ${prev}`;
    $("missed").replaceChildren(...state.round.items.map(miniCard));
    FP.screens.go("over");
  }

  // ---------- wiring ----------
  FP.input.tap($("play"), startGame);
  cards.forEach((el, i) => FP.input.tap(el, () => choose(i)));
  FP.input.tap($("next"), () => (state.lastCorrect ? nextRound() : gameOver()));
  FP.input.tap($("again"), startGame);
  FP.input.tap($("change"), showTitle);
  // left/right when the cards sit side by side, up/down when they're stacked on phones
  FP.input.keys({
    ArrowLeft: () => choose(0),
    ArrowUp: () => choose(0),
    ArrowRight: () => choose(1),
    ArrowDown: () => choose(1),
  });

  // saved settings and best streaks load from IndexedDB first
  FP.ready.then(() => {
    const cat = store.get("category", "all");
    state.category = cat === "all" || H.CATEGORIES[cat] ? cat : "all";
    state.units = store.get("units", "us") === "metric" ? "metric" : "us";
    state.best = store.get("best", {});
    showTitle();
  });
})();
