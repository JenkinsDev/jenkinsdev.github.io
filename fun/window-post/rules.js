(function () {
  'use strict';
  const Math = globalThis.Math;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const settings = (a, p) => ({ angle: clamp(Math.round(a), 20, 80), power: clamp(Math.round(p), 30, 100) });
  function create(random = Math.random, start = 0) {
    const shift = Math.floor(random() * 13) - 6;
    const top = Math.floor(random() * 4), bottom = Math.floor(random() * 4);
    const windows = Array.from({ length: 8 }, (_, i) => {
      const points = i < 4 ? [3, 3, 2, 2][(i + top) % 4] : [2, 2, 1, 1][(i + bottom) % 4];
      const row = i < 4 ? 0 : 1, col = i % 4;
      return { x: 85 + col * 35 + shift, y: (row ? 102 : 46) + Math.floor(random() * 13) - 6,
        w: points === 1 ? 26 : points === 2 ? 21 : 17, h: points === 3 ? 18 : 23, points, owner: null };
    });
    return { windows, wind: Math.round(random() * 36) - 18, scores: [0, 0], turn: start,
      throws: 0, over: false, closedAt: {}, solutions: null };
  }
  function point(game, aim, t) {
    const r = aim.angle * Math.PI / 180, v = aim.power * 3;
    return { x: 28 + Math.cos(r) * v * t + game.wind * t * t / 2,
      y: 153 - Math.sin(r) * v * t + 240 * t * t / 2 };
  }
  // Segment clipping catches a parcel even when it crosses a mouth between frames.
  function entry(a, b, w) {
    let lo = 0, hi = 1;
    for (const [p, d, min, max] of [[a.x, b.x - a.x, w.x - 2, w.x + w.w + 2], [a.y, b.y - a.y, w.y - 2, w.y + w.h + 2]]) {
      if (!d) { if (p < min || p > max) return null; }
      else { const x = (min - p) / d, y = (max - p) / d; lo = Math.max(lo, Math.min(x, y)); hi = Math.min(hi, Math.max(x, y)); }
    }
    return lo <= hi ? lo : null;
  }
  function flight(game, aim) {
    aim = settings(aim.angle, aim.power);
    let a = point(game, aim, 0);
    for (let t = 1 / 40; t <= 2.001; t += 1 / 40) {
      const b = point(game, aim, t);
      let hit = -1, first = 2;
      game.windows.forEach((w, i) => {
        if (w.owner !== null) return;
        const f = entry(a, b, w);
        if (f !== null && f < first) { first = f; hit = i; }
      });
      if (hit >= 0) return { hit, time: t - (1 - first) / 40, aim };
      if (b.y >= 166 || b.x > 239 || b.x < 0) return { hit: -1, time: t, aim };
      a = b;
    }
    return { hit: -1, time: 2, aim };
  }
  function deliver(game, result) {
    if (game.over) return;
    if (result.hit >= 0 && game.windows[result.hit].owner === null) {
      const w = game.windows[result.hit]; w.owner = game.turn; game.scores[game.turn] += w.points;
    }
    game.throws++; game.turn = 1 - game.turn; game.over = game.throws >= 8;
  }
  function search(game, step = 1) {
    const best = Array(8).fill(null);
    for (let angle = 20; angle <= 80; angle += step) for (let power = 30; power <= 100; power += step) {
      const aim = { angle, power }, f = flight(game, aim);
      if (f.hit < 0) continue;
      const w = game.windows[f.hit], p = point(game, aim, f.time + 0.035);
      const margin = Math.min(p.x - w.x, w.x + w.w - p.x, p.y - w.y, w.y + w.h - p.y);
      if (!best[f.hit] || margin > best[f.hit].margin) best[f.hit] = { ...aim, margin, hit: f.hit };
    }
    return best;
  }
  function computer(game, level, random = Math.random) {
    const step = { easy: 10, medium: 6, hard: 2, impossible: 1 }[level] || 6;
    let choices = search(game, step).filter(Boolean);
    if (!choices.length) return settings(45 + random() * 25, 45 + random() * 30);
    choices.sort((a, b) => {
      const value = (s) => game.windows[s.hit].points * (level === 'easy' ? -1 : 10) + s.margin;
      return value(b) - value(a);
    });
    let chosen = choices[0];
    if (level === 'impossible') {
      // Among equal deliveries, leave the smallest best reply to the opponent.
      const value = (s) => {
        const remaining = game.windows.filter((w, i) => w.owner === null && i !== s.hit).map(w => w.points);
        return game.windows[s.hit].points * 100 - Math.max(0, ...remaining) * 10 + s.margin;
      };
      chosen = choices.sort((a, b) => value(b) - value(a))[0];
    }
    const error = { easy: 12, medium: 5, hard: 1, impossible: 0 }[level] || 0;
    return settings(chosen.angle + (random() * 2 - 1) * error, chosen.power + (random() * 2 - 1) * error);
  }
  window.WP = { create, point, flight, deliver, search, computer, settings };
})();
