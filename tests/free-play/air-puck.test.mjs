// Unit tests for Air Puck's physics and computer opponent (physics.js).
// Run: node --test tests/free-play/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { console, Math };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../../static/fun/air-puck/physics.js", import.meta.url), "utf8"), ctx);
const AP = ctx.AP;
const R = AP.RINK;

const run = (world, seconds, inputs = [null, null]) => {
  const events = [];
  for (let t = 0; t < seconds; t += 1 / 60) events.push(...AP.step(world, 1 / 60, inputs));
  return events;
};

test("the puck bounces off the side walls and stays inside", () => {
  const w = AP.newWorld();
  w.puck.x = 0.5; w.puck.y = 0.8; w.puck.vx = 2; w.puck.vy = 0;
  run(w, 1);
  assert.ok(w.puck.x >= R.puck && w.puck.x <= R.width - R.puck, `x ${w.puck.x}`);
  assert.ok(w.puck.vx < 0 || Math.abs(w.puck.vx) < 2, "it bounced back");
});

test("a puck into the top goal mouth scores for player 0 (bottom)", () => {
  const w = AP.newWorld();
  w.mallets[1].x = 0.05; // move the top mallet out of the way
  w.puck.x = 0.5; w.puck.y = 0.3; w.puck.vx = 0; w.puck.vy = -2;
  const events = run(w, 1);
  assert.ok(events.some((e) => e.type === "goal" && e.scorer === 0), JSON.stringify(events));
});

test("a puck hitting the end wall beside the goal bounces instead of scoring", () => {
  const w = AP.newWorld();
  w.mallets[1].x = 0.9; w.mallets[1].y = 0.5;
  w.puck.x = 0.1; w.puck.y = 0.3; w.puck.vx = 0; w.puck.vy = -2;
  const events = run(w, 0.5);
  assert.ok(!events.some((e) => e.type === "goal"), "no goal outside the mouth");
  assert.ok(w.puck.vy > 0, "came back off the end wall");
});

test("a moving mallet hits the puck away and the puck never exceeds max speed", () => {
  const w = AP.newWorld();
  w.puck.x = 0.5; w.puck.y = 1.2; w.puck.vx = 0; w.puck.vy = 0;
  w.mallets[0].x = 0.5; w.mallets[0].y = 1.45;
  run(w, 0.15, [{ x: 0.5, y: 0.9 }, null]); // shove straight up through the puck (short, so it measures the hit, not a later bounce)
  assert.ok(w.puck.vy < -0.5, `puck should fly up, vy ${w.puck.vy}`);
  const speed = Math.hypot(w.puck.vx, w.puck.vy);
  assert.ok(speed <= R.maxSpeed + 1e-9, `speed ${speed}`);
});

test("mallets stay in their own half and inside the rink", () => {
  const w = AP.newWorld();
  run(w, 1, [{ x: -1, y: -5 }, { x: 9, y: 9 }]);
  const [m0, m1] = w.mallets;
  assert.ok(m0.y >= R.length / 2 + R.mallet - 1e-9, `bottom mallet crossed the line: ${m0.y}`);
  assert.ok(m1.y <= R.length / 2 - R.mallet + 1e-9, `top mallet crossed the line: ${m1.y}`);
  assert.ok(m0.x >= R.mallet - 1e-9 && m1.x <= R.width - R.mallet + 1e-9);
});

test("mallets move at a capped speed (no teleporting)", () => {
  const w = AP.newWorld();
  const start = { x: w.mallets[0].x, y: w.mallets[0].y };
  AP.step(w, 1 / 60, [{ x: 0.05, y: 1.55 }, null]);
  const moved = Math.hypot(w.mallets[0].x - start.x, w.mallets[0].y - start.y);
  assert.ok(moved <= R.malletSpeed / 60 + 1e-9, `moved ${moved}`);
});

test("serve puts the puck still in the conceding player's half", () => {
  const w = AP.newWorld();
  AP.serve(w, 1); // player 1 (top) conceded
  assert.equal(w.puck.vx, 0); assert.equal(w.puck.vy, 0);
  assert.ok(w.puck.y < R.length / 2);
  AP.serve(w, 0);
  assert.ok(w.puck.y > R.length / 2);
});

test("computer levels: same four as the arcade, faster as they go up", () => {
  assert.deepEqual(Object.keys(AP.LEVELS), ["easy", "medium", "hard", "impossible"]);
  const s = Object.values(AP.LEVELS).map((l) => l.speed);
  assert.ok(s.every((v, i) => i === 0 || v > s[i - 1]), "speeds increase");
});

test("the computer defends: its target sits between the puck and its own goal", () => {
  const w = AP.newWorld();
  w.puck.x = 0.8; w.puck.y = 1.2; w.puck.vx = 0; w.puck.vy = 0; // puck deep on the other side
  const target = AP.cpuTarget(w, "hard", () => 0.5);
  assert.ok(target.y < R.length / 2, "stays on its side");
  assert.ok(target.x > 0.5, "leans toward the puck's side");
});

test("the computer attacks a slow puck on its side by moving at it", () => {
  const w = AP.newWorld();
  w.puck.x = 0.3; w.puck.y = 0.4; w.puck.vx = 0; w.puck.vy = 0;
  const target = AP.cpuTarget(w, "hard", () => 0.5);
  const m = w.mallets[1];
  const before = Math.hypot(m.x - w.puck.x, m.y - w.puck.y);
  const after = Math.hypot(target.x - w.puck.x, target.y - w.puck.y);
  assert.ok(after < before, "target is closer to the puck than the mallet is");
});

test("a match ends when someone reaches the goal target", () => {
  let m = AP.newMatch(3);
  m = AP.addGoal(m, 0); m = AP.addGoal(m, 1); m = AP.addGoal(m, 0);
  assert.equal(m.winner, null);
  m = AP.addGoal(m, 0);
  assert.equal(m.winner, 0);
  assert.deepEqual([...AP.GOALS], [3, 5, 7]);
});

test("the computer gets a puck out of its own back corner instead of pinning it", () => {
  for (const level of Object.keys(AP.LEVELS)) {
    const w = AP.newWorld();
    // deep in its own back corner (the closest the rounded corner allows)
    const c = AP.RINK.corner, k = (c - AP.RINK.puck) / Math.SQRT2;
    w.puck.x = 1 - c + k; w.puck.y = c - k; w.puck.vx = 0; w.puck.vy = 0;
    w.mallets[1].x = 0.6; w.mallets[1].y = 0.2;
    let t = 0;
    for (let i = 0; i < 60 * 3; i++) { t += 1 / 60; AP.step(w, 1 / 60, [null, AP.cpuInput(w, level, t, () => 0.5)]); }
    assert.ok(w.puck.y > 0.3 || !w.puck.live, `${level}: puck still stuck at ${w.puck.x.toFixed(2)}, ${w.puck.y.toFixed(2)}`);
  }
});

test("computer vs computer keeps playing: goals happen and the puck never sits still for long", () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const w = AP.newWorld();
  AP.serve(w, 0);
  let t = 0, goals = 0, still = 0, longest = 0;
  for (let i = 0; i < 60 * 90; i++) {
    t += 1 / 60;
    const ev = AP.step(w, 1 / 60, [AP.cpuInput(w, "medium", t, rnd, 0), AP.cpuInput(w, "medium", t, rnd, 1)]);
    for (const e of ev) if (e.type === "goal") { goals++; AP.serve(w, 1 - e.scorer); }
    still = Math.hypot(w.puck.vx, w.puck.vy) < 0.02 ? still + 1 / 60 : 0;
    longest = Math.max(longest, still);
  }
  assert.ok(goals >= 3, `only ${goals} goals in 90 s`);
  assert.ok(longest < 3, `puck sat still for ${longest.toFixed(1)} s`);
});

test("rounded corners: a puck sent into a corner comes back out", () => {
  const { corner: c, puck: r, width: W, length: L } = AP.RINK;
  const insideRink = (p) => [[c, c], [W - c, c], [c, L - c], [W - c, L - c]].every(([cx, cy]) => {
    const inZone = Math.abs(p.x - cx) <= c && Math.abs(p.y - cy) <= c && (p.x < c || p.x > W - c) && (p.y < c || p.y > L - c);
    return !inZone || Math.hypot(p.x - cx, p.y - cy) <= c - r + 1e-6;
  });
  const w = AP.newWorld();
  w.mallets[1].x = 0.5;
  w.puck.x = 0.8; w.puck.y = 0.3; w.puck.vx = 2; w.puck.vy = -2; // straight into the top-right corner
  for (let i = 0; i < 15; i++) { // 0.25 s: long enough to reach the corner and bounce
    AP.step(w, 1 / 60, [null, null]);
    assert.ok(insideRink(w.puck), `outside the rounded rink at ${w.puck.x.toFixed(3)}, ${w.puck.y.toFixed(3)}`);
  }
  assert.ok(w.puck.vy > 0, "heading back out of the corner");
  assert.ok(Math.hypot(w.puck.vx, w.puck.vy) > 0.5, "still moving");
});


test("mobile 2P chrome keeps back and music off the ice", () => {
  const html = readFileSync(new URL("../../static/fun/air-puck/index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../../static/fun/air-puck/game.css", import.meta.url), "utf8");
  assert.match(html, /id="split-back"/);
  assert.match(html, /id="split-mute"/);
  assert.match(css, /html\.ap-mobile:has\(\.ap\.two \.play-screen:not\(\[hidden\]\)\) \.fp-bar/);
  assert.match(css, /#split-back/);
  assert.match(css, /#split-mute/);
});
