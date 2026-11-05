(function () {
  'use strict';
  const colors = ['#ff3d3d', '#2c7bff'];
  function paint(g, game, view = {}) {
    g.save(); g.scale(g.canvas.width / 240, g.canvas.height / 180); g.imageSmoothingEnabled = false;
    const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    r(0, 0, 240, 180, '#acc7be'); r(0, 102, 240, 65, '#7c9b91');
    for (let x = 3; x < 240; x += 19) { r(x, 80, 15, 84, '#91aea4'); r(x + 2, 85, 3, 4, '#b4c7b3'); }
    r(64, 23, 169, 143, '#533f40'); r(68, 25, 161, 141, '#ae6650');
    for (let y = 29; y < 166; y += 7) {
      r(68, y, 161, 1, '#89503f');
      for (let x = 68 + (y % 2) * 7; x < 229; x += 15) r(x, y, 1, 7, '#89503f');
    }
    r(62, 20, 173, 4, '#efe0bb'); r(65, 16, 167, 4, '#72645d');
    r(70, 13, 160, 3, '#e1cea8'); r(206, 4, 10, 10, '#79483e');
    r(68, 156, 161, 10, '#d4b491'); r(68, 154, 161, 2, '#efe0bb');
    game.windows.forEach((w, i) => {
      r(w.x - 3, w.y - 3, w.w + 6, w.h + 7, '#e1c799');
      r(w.x - 1, w.y - 1, w.w + 2, w.h + 2, '#503e39');
      r(w.x, w.y, w.w, w.h, '#263f43'); r(w.x + 2, w.y + 2, w.w - 4, w.h - 4, '#172b30');
      const closed = w.owner !== null;
      const progress = closed ? Math.min(1, (view.time - (game.closedAt[i] || 0)) / 0.18) : 0;
      if (closed) {
        const width = Math.ceil(w.w / 2 * (Number.isFinite(progress) ? progress : 1));
        r(w.x, w.y, width, w.h, '#648b79'); r(w.x + w.w - width, w.y, width, w.h, '#648b79');
        for (let y = w.y + 3; y < w.y + w.h; y += 4) r(w.x, y, w.w, 1, '#355b53');
        r(w.x + w.w / 2, w.y, 1, w.h, '#253f3c'); r(w.x + w.w / 2 - 2, w.y + w.h / 2, 4, 2, '#d5bd85');
      } else {
        r(w.x - 6, w.y, 3, w.h, '#4f7968'); r(w.x + w.w + 3, w.y, 3, w.h, '#4f7968');
        if (i === 2) { r(w.x + 6, w.y + w.h - 6, 8, 6, '#d9a866'); r(w.x + 6, w.y + w.h - 9, 2, 4, '#d9a866'); r(w.x + 12, w.y + w.h - 9, 2, 4, '#d9a866'); r(w.x + 8, w.y + w.h - 5, 1, 1, '#172b30'); }
      }
      r(w.x - 4, w.y + w.h, w.w + 8, 5, '#f1d7a4');
      const digits = { 1: ['010','110','010','010','111'], 2: ['111','001','111','100','111'], 3: ['111','001','111','001','111'] };
      // points: a big gold number in the open window's glass (shutters cover it once it's taken)
      if (!closed) {
        const dx = w.x + Math.floor(w.w / 2) - 3, dy = w.y + 3;
        digits[w.points].forEach((line, y) => [...line].forEach((bit, x) => {
          if (bit !== '1') return;
          r(dx + x * 2 + 1, dy + y * 2 + 1, 2, 2, '#0b1418');
          r(dx + x * 2, dy + y * 2, 2, 2, '#ffd23f');
        }));
      }
      if (i === 4 || i === 7) {
        r(w.x - 4, w.y + w.h + 7, w.w + 8, 2, '#374f47');
        for (let x = w.x - 3; x < w.x + w.w + 5; x += 5) r(x, w.y + w.h + 2, 1, 7, '#374f47');
      }
    });
    r(69, 141, 30, 5, '#f0d7a8');
    for (let x = 69; x < 99; x += 8) r(x, 141, 4, 5, '#b84543');
    r(0, 166, 240, 14, '#8c8b7c'); r(0, 166, 240, 2, '#d2ceb4');
    for (let x = 0; x < 240; x += 19) r(x, 170, 1, 10, '#72746a');
    [111, 213].forEach(x => { r(x, 159, 17, 7, '#426952'); r(x + 2, 155, 12, 8, '#638454'); r(x + 6, 153, 5, 5, '#7c9e5e'); r(x + 4, 161, 1, 1, '#e6b47b'); });
    // Both couriers use the same throwing spot; the waiting courier stands behind it.
    [1 - game.turn, game.turn].forEach(p => {
      const active = p === game.turn, x = active ? 24 : 8;
      r(x - 3, 165, 14, 2, '#606f65');
      if (active) r(x - 4, 169, 16, 2, colors[p]);
      r(x, 155, 3, 9, '#344452'); r(x + 5, 155, 3, 9, '#344452');
      r(x - 1, 163, 5, 3, '#302e35'); r(x + 5, 163, 5, 3, '#302e35');
      r(x - 1, 145, 10, 11, colors[p]); r(x + 1, 137, 7, 8, '#e9b785');
      r(x, 135, 9, 3, colors[p]); r(x + 6, 138, 5, 2, colors[p]); r(x + 6, 140, 1, 1, '#302e35');
      r(x + 8, 148, active ? 6 : 2, 3, '#e9b785'); r(x - 2, 149, 6, 6, '#ba8c59');
    });
    r(34, 89, 2, 39, '#5c6c62'); r(34, 90, 20, 1, '#5c6c62');
    const dir = game.wind >= 0 ? 1 : -1, fx = dir > 0 ? 35 : 54;
    for (let i = 0; i < 17; i++) r(fx + i * dir, 91 + i / 5, 1, Math.max(2, 7 - i / 3), i % 5 < 3 ? '#eac68e' : '#b9694e');
    if (view.guide && view.aim) for (let t = 0.055; t < 0.29; t += 0.055) { const p = WP.point(game, view.aim, t); r(p.x, p.y, 2, 2, '#fff0c5'); }
    if (view.parcel) {
      const p = view.parcel; g.save(); g.translate(Math.round(p.x), Math.round(p.y));
      g.rotate(view.still ? 0 : (p.spin || 0)); r(-3, -2, 7, 5, '#f6dcaa'); r(-1, -2, 1, 5, '#a6744b'); r(-3, 0, 7, 1, '#a6744b'); g.restore();
    }
    g.restore();
  }
  window.WPRender = { paint, colors };
})();
