/* Borrowed Blocks: Seeded dealing, legal placement and public-information computer search. */
(function () {
  "use strict";
  const shapes = [
    [
      [0, 0],
      [1, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
  ];
  const names = ["Pair", "Bar", "Corner", "Square", "Hook", "Tee", "Step"];
  function rotate(c) {
    const a = c.map(([x, y]) => [-y, x]),
      mx = Math.min(...a.map((p) => p[0])),
      my = Math.min(...a.map((p) => p[1]));
    return a.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }
  const variants = shapes.map((c) => {
    const a = [];
    for (let r = 0; r < 4; r++) {
      a.push(c);
      c = rotate(c);
    }
    return a;
  });
  const count = (n) => {
    let c = 0;
    while (n) {
      n &= n - 1;
      c++;
    }
    return c;
  };
  const blocked = [(1 << 1) | (1 << 14), (1 << 2) | (1 << 13)];
  const table = variants.map((v) =>
    v.map((c) => {
      const out = [];
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          if (c.every(([a, b]) => x + a < 4 && y + b < 4)) out.push({ x, y, mask: c.reduce((n, [a, b]) => n | (1 << ((y + b) * 4 + x + a)), 0) });
        }
      return out;
    }),
  );
  function rng(seed) {
    let n = seed >>> 0;
    return () => {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      return n / 4294967296;
    };
  }
  function create(seed = Date.now(), first = 0) {
    const random = rng(seed),
      supply = Array.from({ length: 9 }, () => {
        const id = Math.floor(random() * shapes.length);
        return [id, id];
      }).flat();
    return {
      boards: [...blocked],
      scores: [0, 0],
      turns: [0, 0],
      player: first,
      rack: supply.splice(0, 3),
      queue: supply.splice(0, 3),
      supply,
      over: false,
    };
  }
  function moves(s) {
    const out = [],
      occupied = s.boards[s.player];
    s.rack.forEach((id, slot) => {
      const seen = new Set();
      table[id].forEach((v, r) =>
        v.forEach((p) => {
          if (!(p.mask & occupied) && !seen.has(p.mask)) {
            seen.add(p.mask);
            out.push({ ...p, r, slot, id });
          }
        }),
      );
    });
    return out;
  }
  function preview(s, slot, r, x, y) {
    const id = s.rack[slot];
    if (id === undefined) return null;
    return table[id][r % 4].find((p) => p.x === x && p.y === y && !(p.mask & s.boards[s.player])) || null;
  }
  function step(s, m, publicOnly = false) {
    if (s.over) return s;
    if (m) {
      const p = preview(s, m.slot, m.r, m.x, m.y);
      if (!p) return null;
    } else if (moves(s).length) return null;
    const n = {
      ...s,
      boards: [...s.boards],
      scores: [...s.scores],
      turns: [...s.turns],
      rack: [...s.rack],
      queue: [...s.queue],
      supply: publicOnly ? [] : [...s.supply],
    };
    const p = s.player;
    if (m) {
      const id = n.rack[m.slot];
      n.boards[p] |= preview(s, m.slot, m.r, m.x, m.y).mask;
      n.scores[p] += shapes[id].length;
      n.rack.splice(m.slot, 1);
      if (n.queue.length) n.rack.push(n.queue.shift());
      if (n.supply.length) n.queue.push(n.supply.shift());
    }
    n.turns[p]++;
    n.over = n.turns.every((t) => t >= 6);
    n.player = n.turns[1 - p] < 6 ? 1 - p : p;
    return n;
  }
  function holes(mask) {
    let cost = 0;
    for (let i = 0; i < 16; i++)
      if (!(mask & (1 << i))) {
        let adjacent = 0;
        for (const j of [i % 4 ? i - 1 : -1, i % 4 < 3 ? i + 1 : -1, i - 4, i + 4]) if (j >= 0 && j < 16 && !(mask & (1 << j))) adjacent++;
        if (!adjacent) cost += 1;
        else if (adjacent === 1) cost += 0.12;
      }
    return cost;
  }
  const value = (s, p) => s.scores[p] * 4 - holes(s.boards[p]) * 1.7;
  function ranked(s) {
    return moves(s)
      .map((m) => ({ m, v: shapes[m.id].length * 4 - holes(s.boards[s.player] | m.mask) * 1.7 }))
      .sort((a, b) => b.v - a.v);
  }
  function choose(s, level = "medium", random = Math.random) {
    const all = moves(s);
    if (!all.length) return null;
    if (level === "easy") return all[Math.floor(random() * all.length)];
    const rank = ranked(s);
    if (level === "medium") return rank[0].m;
    // The search receives only the public queue. No hidden supply is copied into it.
    const root = { ...s, supply: [] },
      p = s.player;
    let nodes = 0;
    const limit = level === "impossible" ? 1500 : 500,
      depth = level === "impossible" ? 4 : 3;
    function search(a, d) {
      if (!d || a.over || nodes++ >= limit) return value(a, p) - value(a, 1 - p);
      const options = ranked(a).slice(0, level === "impossible" ? 6 : 4);
      if (!options.length) {
        const n = step(a, null, true);
        return search(n, d - 1);
      }
      const vals = options.map((o) => search(step(a, o.m, true), d - 1));
      return a.player === p ? Math.max(...vals) : Math.min(...vals);
    }
    let best = rank[0].m,
      score = -Infinity;
    for (const o of rank.slice(0, level === "impossible" ? 12 : 8)) {
      const v = search(step(root, o.m, true), depth - 1) + o.v * 0.001;
      if (v > score) {
        score = v;
        best = o.m;
      }
    }
    return best;
  }
  window.BB = { shapes, names, variants, blocked, count, rng, create, moves, preview, step, choose, rotate };
})();
