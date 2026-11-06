import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { Math };
context.window = context;
vm.createContext(context);
vm.runInContext(readFileSync('static/fun/tug-of-war/rules.js', 'utf8'), context);
const { TW } = context;
const rng = (seed) => () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;

function pulling(random) {
  const s = TW.newRound(random || (() => 0.5));
  s.phase = 'pull';
  s.time = TW.COUNTDOWN;
  return s;
}

test('TW.tap only moves the owning side and clamps to the rate cap', () => {
  const s = pulling();
  const a = TW.tap(s, 0, 1);
  assert.equal(a.ok, true);
  assert.ok(Math.abs(s.x + TW.PULL) < 1e-9);
  TW.tap(s, 1, 1.02);
  assert.ok(Math.abs(s.x) < 1e-9);
  const s2 = pulling();
  let ok = 0;
  for (let i = 0; i < 9; i++) if (TW.tap(s2, 0, 0.05 * i).ok) ok++;
  assert.equal(ok, 8);
  assert.ok(Math.abs(s2.x + TW.PULL * 8) < 1e-9);
});

test('held pointer produces a single tap until it is released', () => {
  const s = pulling();
  const map = new Map();
  assert.equal(TW.down(map, 7, 0, s, 1).ok, true);
  assert.equal(TW.down(map, 7, 0, s, 1.05).ok, false);
  assert.ok(Math.abs(s.x + TW.PULL) < 1e-9);
  TW.up(map, 7);
  assert.equal(TW.down(map, 7, 0, s, 1.2).ok, true);
  assert.ok(Math.abs(s.x + TW.PULL * 2) < 1e-9);
});

test('crossing a win line awards the round; centre expiry is a draw', () => {
  const s = pulling();
  const need = Math.ceil(TW.WIN / TW.PULL);
  for (let i = 0; i < need; i++) TW.tap(s, 0, 1 + i * 0.13);
  assert.equal(s.phase, 'over');
  assert.equal(s.winner, 0);

  const s1 = pulling();
  for (let i = 0; i < need; i++) TW.tap(s1, 1, 1 + i * 0.13);
  assert.equal(s1.winner, 1);

  const d = pulling();
  d.x = 0.01;
  d.time = TW.COUNTDOWN;
  TW.step(d, TW.ROUND + 0.01);
  assert.equal(d.phase, 'over');
  assert.equal(d.winner, null);

  const late = pulling();
  late.x = -0.1;
  TW.step(late, TW.ROUND + 0.01);
  assert.equal(late.winner, 0);
});

test('TW.addRound is first-to-two, draws after three, and ignores later scores', () => {
  const m = TW.newMatch();
  assert.equal(m.scores[0], 0); assert.equal(m.scores[1], 0);
  TW.addRound(m, 0);
  TW.addRound(m, 0);
  assert.equal(m.winner, 0);
  assert.equal(m.scores[0], 2); assert.equal(m.scores[1], 0);
  TW.addRound(m, 1);
  assert.equal(m.scores[0], 2); assert.equal(m.scores[1], 0);

  const d = TW.newMatch();
  TW.addRound(d, 0);
  TW.addRound(d, 1);
  TW.addRound(d, null);
  assert.equal(d.winner, 'draw');
  assert.equal(d.scores[0], 1); assert.equal(d.scores[1], 1);

  const split = TW.newMatch();
  TW.addRound(split, 0);
  TW.addRound(split, null);
  TW.addRound(split, 1);
  assert.equal(split.winner, 'draw');
});

test('power-up claims apply the documented effect; a slip rejects the victim', () => {
  const s = pulling();
  s.powerup = { kind: 'banana', t0: s.time, until: s.time + TW.LIFE, claimed: null };
  const claim = TW.tap(s, 0, s.time);
  assert.equal(claim.ok, true);
  assert.equal(claim.claimed, 'banana');
  const blocked = TW.tap(s, 1, s.time + 0.2);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'slip');
  const after = TW.tap(s, 1, s.time + 0.91);
  assert.equal(after.ok, true);

  const sn = pulling();
  const t0 = sn.time;
  sn.powerup = { kind: 'sneakers', t0, until: t0 + TW.LIFE, claimed: null };
  TW.tap(sn, 1, t0);
  const before = sn.x;
  TW.tap(sn, 1, t0 + 0.2);
  assert.ok(Math.abs((sn.x - before) - TW.PULL * 2) < 1e-9);

  const sp = pulling();
  sp.powerup = { kind: 'sparkle', t0: sp.time, until: sp.time + TW.LIFE, claimed: null };
  TW.tap(sp, 0, sp.time);
  assert.ok(Math.abs(sp.x - (-TW.PULL - TW.SPARKLE)) < 1e-9);
});

test('computer levels stay under 8 taps/s and Impossible is fastest', () => {
  const seconds = 200;
  const dt = 1 / 60;
  const rates = {};
  for (const level of ['easy', 'medium', 'hard', 'impossible']) {
    const random = rng({ easy: 11, medium: 23, hard: 41, impossible: 71 }[level]);
    const s = TW.newRound(random);
    s.practice = true;
    s.spawnAt = 1e9;
    s.phase = 'pull';
    s.time = TW.COUNTDOWN;
    const mem = TW.newCpu(level);
    let accepted = 0;
    const taps = [];
    for (let i = 0; i < seconds / dt; i++) {
      TW.step(s, dt);
      if (TW.cpuShouldTap(s, 1, s.time, mem, random, dt)) {
        const r = TW.tap(s, 1, s.time);
        TW.cpuNote(mem, s.time, r.ok, random);
        if (r.ok) { accepted++; taps.push(s.time); }
      }
    }
    for (let i = 0; i < taps.length; i++) {
      let n = 0;
      for (let j = i; j < taps.length && taps[j] - taps[i] < 1; j++) n++;
      assert.ok(n <= 8, `${level} rolled ${n} taps/s`);
    }
    rates[level] = accepted / seconds;
    assert.ok(rates[level] <= 8.0001, `${level} mean ${rates[level]}`);
  }
  console.log('Tug of War cpu rates:', rates);
  assert.ok(rates.impossible > rates.hard, 'impossible > hard');
  assert.ok(rates.hard > rates.medium, 'hard > medium');
  assert.ok(rates.medium > rates.easy, 'medium > easy');
});

test('Impossible does not learn a spawn time before the power-up appears', () => {
  const random = rng(99);
  const s = TW.newRound(() => 0.4);
  s.spawnAt = 8;
  s.spawnKind = 'sparkle';
  const mem = TW.newCpu('impossible');
  while (s.time < TW.COUNTDOWN + 7.5) {
    TW.step(s, 0.05);
    TW.cpuShouldTap(s, 1, s.time, mem, random, 0.05);
  }
  assert.equal(s.powerup, null);
  assert.equal(mem.seen, null);
  while (!s.powerup) {
    TW.step(s, 0.05);
    TW.cpuShouldTap(s, 1, s.time, mem, random, 0.05);
    assert.ok(s.time < TW.COUNTDOWN + 9, 'should spawn near spawnAt');
  }
  TW.cpuShouldTap(s, 1, s.time, mem, random, 0.05);
  assert.equal(mem.seen, s.powerup.t0);
  assert.ok(mem.contestAt >= s.powerup.t0);
  assert.ok(mem.contestAt - s.powerup.t0 <= 0.08 + 1e-9);
});
