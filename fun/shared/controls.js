/*
 * FP.controlCards: the Controls section on a game's setup screen. One card per player, saying how to
 * play on a touch screen, with keyboard keys drawn as key caps (hidden on phones by shared/crt.css).
 *
 *   FP.controlCards(el, [
 *     { who: "Player 1", how: "Tap your DRAW button", keys: [["A"]] },
 *     { who: "You", how: "Tap a card", keys: [["←", "→"], ["↑", "↓"]] },  // groups are joined by "or"
 *   ]);
 * Cards are coloured per player: the first red, the second blue (classes p0, p1).
 */
(function () {
  "use strict";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  window.FP.controlCards = (el, cards) => {
    el.classList.toggle("single", cards.length === 1);
    el.innerHTML = cards.map((c, i) => {
      const groups = (c.keys || []).map((g) => g.map((k) => `<kbd>${esc(k)}</kbd>`).join(""));
      const keys = groups.length ? `<div class="keys">${groups.join('<span class="or">or</span>')}</div>` : "";
      return `<div class="control-card p${i}"><span class="control-who">${esc(c.who)}</span><p class="control-how">${esc(c.how)}</p>${keys}</div>`;
    }).join("");
  };
})();
