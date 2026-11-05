// Unit tests for Quick Draw's rules (duel.js).
// Run: node --test tests/free-play/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../../static/fun/quick-draw/duel.js", import.meta.url), "utf8"), ctx);
const QD = ctx.QD;

function rng(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

test("signal comes 1.5–4.5 s after the wait starts", () => {
  const r = rng(9);
  for (let i = 0; i < 200; i++) {
    const d = QD.signalDelay(r);
    assert.ok(d >= 1500 && d <= 4500, `delay ${d}`);
  }
});

test("computer reaction times stay inside each level's range", () => {
  for (const [level, L] of Object.entries(QD.LEVELS)) {
    const r = rng(3);
    for (let i = 0; i < 300; i++) {
      const plan = QD.cpuPlan(level, r, 3000);
      if (plan.early) {
        assert.ok(plan.at > 0 && plan.at < 3000, `${level}: early tap should land during the wait`);
      } else {
        const reaction = plan.at - 3000;
        assert.ok(reaction >= L.min && reaction <= L.max, `${level}: reaction ${reaction}`);
      }
    }
  }
});

test("hard never jumps the gun; easy sometimes does", () => {
  const r = rng(5);
  const earlies = (level) => Array.from({ length: 1000 }, () => QD.cpuPlan(level, r, 3000)).filter((p) => p.early).length;
  assert.equal(earlies("hard"), 0);
  const easy = earlies("easy");
  assert.ok(easy > 40 && easy < 180, `easy early count ${easy} of 1000`);
});

test("judge: before the signal is a foul, after it is a draw with a reaction time", () => {
  assert.deepEqual({ ...QD.judge(1200, null) }, { early: true, ms: null });
  assert.deepEqual({ ...QD.judge(3300, 3000) }, { early: false, ms: 300 });
  // a finger that landed just before the signal (its event handled just after) is still a foul
  assert.deepEqual({ ...QD.judge(2995, 3000) }, { early: true, ms: null });
});

test("a match is first to 3", () => {
  let m = QD.newMatch();
  m = QD.addPoint(m, 0);
  m = QD.addPoint(m, 1);
  m = QD.addPoint(m, 0);
  assert.equal(m.winner, null);
  m = QD.addPoint(m, 0);
  assert.equal(m.winner, 0);
  assert.deepEqual([...m.scores], [3, 1]);
  assert.throws(() => QD.addPoint(m, 1), /over/);
});

test("match length: best of 3, 5 or 7 means first to 2, 3 or 4", () => {
  assert.deepEqual([...QD.ROUNDS], [3, 5, 7]);
  assert.equal(QD.newMatch(3).winAt, 2);
  assert.equal(QD.newMatch(5).winAt, 3);
  assert.equal(QD.newMatch(7).winAt, 4);
  let m = QD.newMatch(3);
  m = QD.addPoint(m, 1);
  assert.equal(m.winner, null);
  m = QD.addPoint(m, 1);
  assert.equal(m.winner, 1, "best of 3 ends at 2 wins");
  assert.equal(QD.newMatch().winAt, 3, "default stays best of 5");
});

test("impossible: faster than hard and never jumps the gun", () => {
  const L = QD.LEVELS;
  assert.ok(L.impossible, "impossible level exists");
  assert.ok(L.impossible.max < L.hard.min, "impossible is always quicker than hard");
  assert.equal(L.impossible.early, 0);
  assert.deepEqual(Object.keys(L), ["easy", "medium", "hard", "impossible"]);
});
