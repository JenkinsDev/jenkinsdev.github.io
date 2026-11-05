// Unit tests for Higher or Lower's logic (formatting + pair picking).
// Run: node --test tests/free-play/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ROOT = new URL("../../static/fun/higher-or-lower/", import.meta.url);
const FILES = ["data/categories.js", "data/weight.js", "data/size.js", "data/speed.js", "data/ago.js", "data/life.js", "format.js", "pick.js"];

function load() {
  const ctx = { window: {}, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(readFileSync(new URL(f, ROOT), "utf8"), ctx, { filename: f });
  return ctx;
}
const { HOL } = load();
const { format, gap, tierFor, pickPair, describe } = HOL;

// deterministic RNG for repeatable picks
function rng(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

test("format: US units by default", () => {
  assert.equal(format("mass", 70, "us"), "154 lb");
  assert.equal(format("mass", 0.2, "us"), "7.1 oz");
  assert.equal(format("mass", 6000, "us"), "6.6 tons");
  assert.equal(format("length", 1.7, "us"), "5.6 ft");
  assert.equal(format("length", 0.007, "us"), "0.28 in");
  assert.equal(format("length", 8849, "us"), "29,000 ft");
  assert.equal(format("speed", 110, "us"), "68 mph");
  assert.equal(format("temp", 100, "us"), "212 °F");
  assert.equal(format("temp", -18, "us"), "0 °F");
});

test("format: metric", () => {
  assert.equal(format("mass", 0.000003, "metric"), "3 mg");
  assert.equal(format("mass", 0.2, "metric"), "200 g");
  assert.equal(format("mass", 6000, "metric"), "6 tonnes");
  assert.equal(format("length", 0.46, "metric"), "46 cm");
  assert.equal(format("length", 8849, "metric"), "8.8 km");
  assert.equal(format("speed", 110, "metric"), "110 km/h");
  assert.equal(format("temp", 37, "metric"), "37 °C");
});

test("format: unit-free categories and big numbers", () => {
  assert.equal(format("db", 60, "us"), "60 dB");
  assert.equal(format("yearsAgo", 4540000000, "us"), "4.5 billion years ago");
  assert.equal(format("years", 1.5, "us"), "1.5 years");
  assert.equal(format("years", 0.07, "us"), "4 weeks");
  assert.equal(format("years", 0.5, "us"), "6 months");
});

test("gap: ratio, temperature and loudness are all ≥ 1 and symmetric", () => {
  const c = HOL.CATEGORIES;
  assert.equal(gap(c.weight, 10, 120), 12);
  assert.equal(gap(c.weight, 120, 10), 12);
});

test("tierFor: difficulty tightens as the streak grows", () => {
  assert.deepEqual([...tierFor(0)], [3, 10]);
  assert.deepEqual([...tierFor(5)], [1.8, 3]);
  assert.deepEqual([...tierFor(10)], [1.4, 1.8]);
  assert.deepEqual([...tierFor(30)], [1.25, 1.4]);
});

test("pickPair: same category, never a near-tie, never a silly mismatch", () => {
  const r = rng(42);
  for (let streak = 0; streak < 40; streak++) {
    const { known, mystery, category } = pickPair({ streak, category: "all", recent: [], random: r });
    assert.equal(known.category, mystery.category);
    assert.equal(known.category, category);
    const g = gap(HOL.CATEGORIES[category], known.v, mystery.v);
    assert.ok(g >= 1.25, `near-tie ${known.n} vs ${mystery.n}`);
    assert.ok(g <= 10, `too easy or silly: ${known.n} vs ${mystery.n} (${g.toFixed(1)}×)`);
  }
  const easy = pickPair({ streak: 0, category: "weight", recent: [], random: rng(7) });
  assert.ok(gap(HOL.CATEGORIES.weight, easy.known.v, easy.mystery.v) >= 3);
});

test("pickPair: respects a chosen category and avoids recent items", () => {
  const r = rng(3);
  const recent = [];
  for (let i = 0; i < 15; i++) {
    const p = pickPair({ streak: i, category: "speed", recent, random: r });
    assert.equal(p.category, "speed");
    assert.ok(!recent.slice(-4).includes(p.mystery.id), "mystery repeated too soon");
    recent.push(p.known.id, p.mystery.id);
  }
});

test("describe: plain comparison sentence", () => {
  const ant = { n: "an ant", v: 1 };
  const bee = { n: "a honeybee", v: 12 };
  assert.equal(describe(HOL.CATEGORIES.weight, bee, ant, "us"), "About 12× heavier than an ant.");
  assert.equal(describe(HOL.CATEGORIES.weight, ant, bee, "us"), "About 12× lighter than a honeybee.");
});

test("data: every item is complete and categories have enough pairs", () => {
  for (const it of HOL.items) {
    assert.ok(it.e && it.n && it.f, `incomplete item ${it.id}`);
    assert.ok(Number.isFinite(it.v), `bad value ${it.id}`);
  }
  assert.ok(HOL.items.length >= 180, `only ${HOL.items.length} items`);
  for (const key of Object.keys(HOL.CATEGORIES)) {
    const n = HOL.items.filter((i) => i.category === key).length;
    assert.ok(n >= 35, `only ${n} items in ${key}; aim for 35+ so rounds stay varied`);
  }
  const ids = HOL.items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate item in a category");
  // every item must have at least one sensible partner, or it would never be asked
  for (const it of HOL.items) {
    assert.ok(HOL.pairsFor(it.category).some((p) => p.a === it || p.b === it), `${it.n} has no sensible partner`);
  }
});

test("prompt: one short question per round, no number given away", () => {
  const C = HOL.CATEGORIES;
  assert.equal(HOL.prompt(C.weight, { n: "a hippo" }, { n: "a rhino" }), "Which is heavier?");
  assert.equal(HOL.prompt(C.speed, {}, {}), "Which is faster?");
  assert.equal(HOL.prompt(C.size, { d: "tall" }, { d: "tall" }), "Which is taller?");
  assert.equal(HOL.prompt(C.size, { d: "long" }, { d: "long" }), "Which is longer?");
  assert.equal(HOL.prompt(C.ago, {}, {}), "Which came first?");
  assert.equal(HOL.prompt(C.life, {}, {}), "Which lives longer?");
  const moon = HOL.items.find((i) => i.n === "the first Moon landing");
  assert.equal(moon.about, false, "dated events are exact");
});
test("sizes only pair tall with tall and long with long", () => {
  for (const p of HOL.pairsFor("size")) assert.equal(p.a.d, p.b.d, `${p.a.n} (${p.a.d}) vs ${p.b.n} (${p.b.d})`);
});

test("bracketed detail moves out of the name into a note", () => {
  const tree = HOL.items.find((i) => i.n === "the tallest known tree");
  assert.ok(tree, "name should drop the brackets");
  assert.equal(tree.note, "a coast redwood");
  assert.ok(HOL.items.every((i) => !i.n.includes("(")), "no brackets left in names");
});

test("temperatures get thousands separators", () => {
  assert.equal(format("temp", 1100, "us"), "2,012 °F");
});

test("both cards in a round use the same unit (chosen by the smaller value)", () => {
  assert.equal(format("mass", 11000, "us", 2300), "24,300 lb"); // school bus next to a rhino
  assert.equal(format("mass", 2300, "us", 2300), "5,070 lb");
  assert.equal(format("length", 8849, "metric", 5895), "8.8 km"); // both mountains in km
  assert.equal(format("length", 0.8, "us", 0.8), "2.6 ft");
  assert.equal(format("mass", 0.43, "us", 0.06), "15 oz"); // ball next to an egg
});
