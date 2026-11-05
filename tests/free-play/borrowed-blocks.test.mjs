import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
const c = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../../static/fun/borrowed-blocks/rules.js", import.meta.url), "utf8"), c);
const B = c.window.BB;
const levels = ["easy", "medium", "hard", "impossible"];
function match(seed, a, b, first = seed % 2) {
  let s = B.create(seed, first),
    random = B.rng(seed + 99),
    steps = 0;
  while (!s.over) {
    const m = B.choose(s, [a, b][s.player], random);
    assert.ok(m ? B.preview(s, m.slot, m.r, m.x, m.y) : !B.moves(s).length);
    s = B.step(s, m);
    assert.ok(++steps <= 12);
  }
  return s;
}
test("boards mirror and have fourteen available cells", () => {
  assert.equal(B.count(B.blocked[0]), 2);
  let mirror = 0;
  for (let i = 0; i < 16; i++) if (B.blocked[0] & (1 << i)) mirror |= 1 << (Math.floor(i / 4) * 4 + 3 - (i % 4));
  assert.equal(mirror, B.blocked[1]);
});
test("pieces are connected, two to four cells, and rotate four times", () => {
  for (const shape of B.shapes) {
    assert.ok(shape.length >= 2 && shape.length <= 4);
    let seen = new Set([shape[0].join()]);
    for (let k = 0; k < 4; k++)
      for (const [x, y] of shape)
        if (shape.some(([a, b]) => seen.has([a, b].join()) && Math.abs(a - x) + Math.abs(b - y) === 1)) seen.add([x, y].join());
    assert.equal(seen.size, shape.length);
    const sort = (a) =>
      a
        .map((p) => p.join())
        .sort()
        .join(";");
    let a = shape;
    for (let i = 0; i < 4; i++) a = B.rotate(a);
    assert.equal(sort(a), sort(shape));
  }
});
test("placement scores cells, advances rack and public queue without mutating input", () => {
  const s = B.create(10),
    before = JSON.stringify(s),
    m = B.moves(s)[0],
    n = B.step(s, m);
  assert.equal(JSON.stringify(s), before);
  assert.equal(n.scores[0], B.shapes[m.id].length);
  assert.equal(n.rack[2], s.queue[0]);
  assert.equal(n.queue[2], s.supply[0]);
  assert.equal(n.player, 1);
  assert.equal(B.step(s, null), null);
  assert.equal(B.step(s, { slot: 0, r: 0, x: 99, y: 99 }), null);
});
test("passes consume turns only when nothing fits; ties stand after twelve turns", () => {
  let s = B.create(0);
  s.boards = [65535, 65535];
  for (let i = 0; i < 12; i++) s = B.step(s, null);
  assert.ok(s.over);
  assert.deepEqual(Array.from(s.turns), [6, 6]);
  assert.equal(s.scores[0], s.scores[1]);
});
test("all levels ignore unrevealed supply", () => {
  for (const l of levels) {
    const s = B.create(42),
      n = { ...s, supply: [6, 6, 6, 6, 6] };
    assert.equal(JSON.stringify(B.choose(s, l, B.rng(3))), JSON.stringify(B.choose(n, l, B.rng(3))));
  }
});
test("seeded games finish legally and scores match occupied area", () => {
  for (let k = 0; k < 100; k++) {
    const s = match(k, "hard", "impossible");
    for (let p = 0; p < 2; p++) assert.equal(s.scores[p], B.count(s.boards[p]) - 2);
    assert.deepEqual(Array.from(s.turns), [6, 6]);
  }
});
test("stronger levels win more across six hundred alternating starts per pairing", () => {
  for (let i = 0; i < 4; i++)
    for (let j = i + 1; j < 4; j++) {
      let weak = 0,
        strong = 0;
      for (let k = 0; k < 600; k++) {
        const s = match(k, levels[i], levels[j]);
        if (s.scores[0] > s.scores[1]) weak++;
        if (s.scores[1] > s.scores[0]) strong++;
      }
      assert.ok(strong > weak, `${levels[i]} ${weak}, ${levels[j]} ${strong}`);
    }
});
test("equal-level first-player advantage stays small", () => {
  for (const l of levels) {
    let first = 0,
      second = 0;
    for (let k = 0; k < 400; k++) {
      const s = match(k, l, l);
      const a = s.scores[k % 2],
        b = s.scores[1 - (k % 2)];
      if (a > b) first++;
      if (b > a) second++;
    }
    assert.ok(Math.abs(first - second) / 400 < 0.12, `${l}: ${first} vs ${second}`);
  }
});
test("Impossible has bounded work on a fresh board", () => {
  let max = 0;
  for (let k = 0; k < 30; k++) {
    const s = B.create(k),
      start = performance.now();
    B.choose(s, "impossible");
    max = Math.max(max, performance.now() - start);
  }
  assert.ok(max < 100, `max ${max} ms`);
});
