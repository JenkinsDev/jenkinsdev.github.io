/*
 * Higher or Lower: choosing each round's pair.
 * "Gap" measures how far apart two values feel (always ≥ 1). The streak sets a target
 * gap range, so early rounds are obvious and later ones are close. Pairs outside
 * MIN_GAP..MAX_GAP are never used: too close feels like a trick, too far is a silly matchup.
 */
(function () {
  "use strict";

  const HOL = window.HOL;
  const MIN_GAP = 1.25; // closer than this feels like a trick (values are "about"), so never used
  const MAX_GAP = 10; // further apart is too easy or a silly matchup (an astronaut vs the Earth), so never used
  const RECENT = 6; // don't reuse the last few items

  function gap(cat, a, b) {
    if (cat.kind === "temp") return 1 + Math.abs(a - b) / (15 + 0.3 * Math.min(Math.abs(a), Math.abs(b)));
    if (cat.kind === "db") return Math.pow(2, Math.abs(a - b) / 10);
    const lo = Math.min(a, b);
    return lo <= 0 ? Infinity : Math.max(a, b) / lo;
  }

  function tierFor(streak) {
    if (streak < 3) return [3, MAX_GAP];
    if (streak < 8) return [1.8, 3];
    if (streak < 15) return [1.4, 1.8];
    return [MIN_GAP, 1.4];
  }

  // all usable pairs per category, built once
  const pairCache = {};
  function pairsFor(key) {
    if (!pairCache[key]) {
      const cat = HOL.CATEGORIES[key];
      const list = HOL.items.filter((i) => i.category === key);
      const pairs = [];
      for (let i = 0; i < list.length; i++)
        for (let j = i + 1; j < list.length; j++) {
          if (list[i].d !== list[j].d) continue; // sizes: tall vs tall, long vs long only
          const g = gap(cat, list[i].v, list[j].v);
          if (g >= MIN_GAP && g <= MAX_GAP) pairs.push({ a: list[i], b: list[j], g });
        }
      pairCache[key] = pairs;
    }
    return pairCache[key];
  }

  // 0 inside the target range, otherwise how far outside it (on a log scale)
  function distance(g, [lo, hi]) {
    if (g >= lo && g < hi) return 0;
    return g < lo ? Math.log(lo / g) : Math.log(g / hi);
  }

  /**
   * pickPair({ streak, category: "all" | key, recent: [ids], random }) → { category, known, mystery }
   */
  function pickPair({ streak, category = "all", recent = [], random = Math.random }) {
    const keys = category === "all" ? Object.keys(HOL.CATEGORIES) : [category];
    const key = keys[Math.floor(random() * keys.length)];
    const avoid = new Set(recent.slice(-RECENT));
    let pool = pairsFor(key).filter((p) => !avoid.has(p.a.id) && !avoid.has(p.b.id));
    if (!pool.length) pool = pairsFor(key);

    const tier = tierFor(streak);
    let best = Infinity;
    for (const p of pool) best = Math.min(best, distance(p.g, tier));
    const choices = pool.filter((p) => distance(p.g, tier) <= best + 1e-9);
    const p = choices[Math.floor(random() * choices.length)];
    const flip = random() < 0.5;
    return { category: key, known: flip ? p.a : p.b, mystery: flip ? p.b : p.a };
  }

  Object.assign(HOL, { gap, tierFor, pickPair, pairsFor, MIN_GAP, MAX_GAP });
})();
