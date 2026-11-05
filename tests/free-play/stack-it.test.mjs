// Unit tests for Stack It's objects and physics (static/fun/stack-it/objects.js + physics.js on Planck.js).
// Run: node --test tests/free-play/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { console, Math };
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["vendor/planck.min.js", "stack-it/objects.js", "stack-it/physics.js"]) {
  vm.runInContext(readFileSync(new URL(`../../static/fun/${f}`, import.meta.url), "utf8"), ctx);
}
const { SK, SKObjects } = ctx;
const { OBJECTS } = SKObjects;

/** A repeatable random sequence. */
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const run = (game, seconds) => { for (let t = 0; t < seconds; t += 1 / 60) SK.step(game, 1 / 60); };
/** Drop `kind` straight down over x and let it settle (or fall). */
function place(game, kind, x = 0) {
  SK.drop(game, kind, x, SK.hangY(game, kind), 0);
  for (let t = 0; t < 8 && !(t > 0.5 && SK.settled(game)); t += 1 / 60) SK.step(game, 1 / 60);
}

test("every object has a name, physics parts and art that stays inside its outline", () => {
  for (const [key, o] of Object.entries(OBJECTS)) {
    assert.ok(o.name && o.parts.length && o.mass > 0, key);
    const b = SKObjects.bounds(o);
    const w = b.maxX - b.minX, h = b.maxY - b.minY;
    assert.ok(w >= 0.3 && w <= 1.6 && h >= 0.2 && h <= 1.8, `${key} is ${w.toFixed(2)} × ${h.toFixed(2)} m`);
    // paint the art and check every rectangle and oval sits within the outline (with a small margin for ears, stems…)
    const slack = 0.16, inside = (x, y) => x >= b.minX - slack && x <= b.maxX + slack && y >= b.minY - slack && y <= b.maxY + slack;
    o.art({
      rect: (x, y, rw, rh) => assert.ok(inside(x, y) && inside(x + rw, y + rh), `${key} rect at ${x},${y}`),
      oval: (cx, cy, rx, ry) => assert.ok(inside(cx - rx, cy - ry) && inside(cx + rx, cy + ry), `${key} oval at ${cx},${cy}`),
      poly: (pts) => pts.forEach(([x, y]) => assert.ok(inside(x, y), `${key} poly point ${x},${y}`)),
    });
  }
});

test("weights stay within about 3:1, so light things aren't squashed out from under heavy ones", () => {
  const masses = Object.values(OBJECTS).map((o) => o.mass);
  assert.ok(Math.max(...masses) / Math.min(...masses) <= 3.01, masses.join(", "));
});

test("a fridge stays up on a toaster when its middle is over the toaster", () => {
  const game = SK.newGame();
  place(game, "toaster");
  place(game, "fridge", 0.1);
  assert.equal(SK.fallen(game).length, 0);
});

test("dealing: never the same object twice running and never two hard ones in a row; the first is easy", () => {
  const random = seeded(7);
  let prev = null;
  for (let i = 0; i < 500; i++) {
    const next = SKObjects.deal(prev, random);
    assert.ok(OBJECTS[next], next);
    assert.notEqual(next, prev);
    if (!prev || OBJECTS[prev].hard) assert.ok(!OBJECTS[next].hard, `${prev} → ${next}`);
    prev = next;
  }
});

test("flat things dropped straight down stack up and stay up", () => {
  const game = SK.newGame();
  for (const kind of ["washer", "suitcase", "barrel", "microwave", "tank"]) place(game, kind);
  assert.equal(SK.fallen(game).length, 0);
  assert.ok(SK.settled(game));
  const h = SK.height(game);
  assert.ok(h > 2.8 && h < 3.2, `pile is ${h.toFixed(2)} m`); // 0.85 + 0.5 + 0.82 + 0.4 + 0.5 = 3.07
});

test("something dropped past the edge of the plinth falls off", () => {
  const game = SK.newGame();
  place(game, "suitcase", SK.PLINTH.width / 2 + 0.6);
  assert.equal(SK.fallen(game).length, 1);
  assert.equal(SK.height(game), 0, "fallen things don't count towards the height");
});

test("the held object always hangs the same gap above the pile", () => {
  const game = SK.newGame();
  place(game, "washer");
  const kind = "fridge", b = SKObjects.bounds(OBJECTS[kind]);
  const under = SK.hangY(game, kind) + b.minY;
  assert.ok(Math.abs(under - (SK.PLINTH.top + SK.height(game) + SK.CRANE.gap)) < 1e-9);
});

test("the crane swings faster as the pile grows, up to a limit", () => {
  const game = SK.newGame();
  const first = SK.swingSpeed(game);
  game.drops = 10;
  assert.ok(SK.swingSpeed(game) > first);
  game.drops = 1000;
  assert.equal(SK.swingSpeed(game), SK.CRANE.maxSpeed);
});

test("the computer lands closer to its spot the higher its level", () => {
  const miss = {};
  for (const level of Object.keys(SK.LEVELS)) {
    const random = seeded(42);
    let total = 0;
    for (let i = 0; i < 40; i++) {
      const game = SK.newGame();
      const target = SK.aim(game, level, random);
      let t = 0;
      while (!SK.cpuShouldDrop(game, "suitcase", level, target, t)) t += 1 / 60;
      const h = SK.hook(game, t);
      const body = SK.drop(game, "suitcase", h.x, SK.hangY(game, "suitcase"), h.vx);
      run(game, 1.5);
      total += Math.abs(body.getPosition().x);
    }
    miss[level] = total / 40;
  }
  assert.ok(miss.easy > miss.medium && miss.medium > miss.hard && miss.hard > miss.impossible, JSON.stringify(miss));
  assert.ok(miss.impossible < 0.08, `impossible misses by ${miss.impossible.toFixed(3)} m`);
});

test("a match is won by taking more than half the rounds", () => {
  assert.equal(SK.newMatch(3).winAt, 2);
  assert.equal(SK.newMatch(5).winAt, 3);
  assert.equal(SK.newMatch(7).winAt, 4);
});
