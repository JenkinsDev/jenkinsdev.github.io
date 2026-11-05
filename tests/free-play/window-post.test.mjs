import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const context = { Math }; context.window = context; vm.createContext(context);
vm.runInContext(readFileSync('static/fun/window-post/rules.js', 'utf8'), context);
const { WP } = context;
const rng = seed => () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
test('eight windows have paired point values and legal winds', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const g = WP.create(rng(seed * 291)); assert.equal(g.windows.length, 8);
    assert.equal(g.windows.reduce((s, w) => s + w.points, 0), 16);
    assert.ok(Math.abs(g.wind) <= 18);
  }
});
test('every window is reachable at every allowed wind across varied layouts', () => {
  let checks = 0;
  for (let seed = 1; seed <= 12; seed++) for (let wind = -18; wind <= 18; wind++) {
    const g = WP.create(rng(seed * 8147)); g.wind = wind;
    const solutions = WP.search(g);
    solutions.forEach((s, i) => { assert.ok(s, `seed ${seed}, wind ${wind}, window ${i}`); assert.equal(WP.flight(g, s).hit, i); checks++; });
  }
  console.log('Window Post reachability:', checks);
});
test('deliveries close windows for both players; exactly eight throws finish a match', () => {
  const g = WP.create(rng(412)); const shot = WP.flight(g, WP.computer(g, 'impossible'));
  WP.deliver(g, shot); const score = g.scores[0]; assert.ok(score > 0);
  WP.deliver(g, shot); assert.equal(g.scores[1], 0);
  for (let i = 2; i < 8; i++) WP.deliver(g, { hit: -1 });
  assert.ok(g.over); WP.deliver(g, { hit: -1 }); assert.equal(g.throws, 8);
});
test('computer levels improve in paired matches, with alternating starts', () => {
  const levels = ['easy', 'medium', 'hard', 'impossible']; const points = [0, 0, 0, 0], wins = [0, 0, 0, 0], games = [0, 0, 0, 0];
  let first = 0, decisive = 0;
  for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) for (let seed = 1; seed <= 12; seed++) for (let start = 0; start < 2; start++) {
    const g = WP.create(rng(seed * 1821), start), random = rng(seed * 713 + start);
    while (!g.over) { const level = levels[g.turn === 0 ? a : b]; WP.deliver(g, WP.flight(g, WP.computer(g, level, random))); }
    points[a] += g.scores[0]; points[b] += g.scores[1]; games[a]++; games[b]++;
    const winner = g.scores[0] === g.scores[1] ? -1 : g.scores[0] > g.scores[1] ? 0 : 1;
    if (winner < 0) { wins[a] += .5; wins[b] += .5; } else { wins[winner === 0 ? a : b]++; decisive++; if (winner === start) first++; }
  }
  const rates = wins.map((n, i) => n / games[i]); console.log('Window Post rates:', JSON.stringify({ levels, rates, points, first: first / decisive, matches: decisive }));
  for (let i = 1; i < 4; i++) assert.ok(rates[i] > rates[i - 1], rates.join(','));
  assert.ok(first / decisive > .35 && first / decisive < .65);
});
test('no throw is a universal best choice; same settings and flight cap for computers', () => {
  const games = Array.from({ length: 8 }, (_, i) => WP.create(rng(18713 * (i + 1))));
  const candidates = [];
  for (let angle = 20; angle <= 80; angle++) for (let power = 30; power <= 100; power++) {
    const aim = { angle, power }, f = WP.flight(games[0], aim);
    if (f.hit >= 0 && games[0].windows[f.hit].points === 3) candidates.push(aim);
  }
  for (const aim of candidates) assert.ok(games.some(g => { const f = WP.flight(g, aim); return f.hit < 0 || g.windows[f.hit].points < 3; }));
  for (const g of games) for (const level of ['easy', 'medium', 'hard', 'impossible']) {
    const aim = WP.computer(g, level, rng(87)); assert.ok(Number.isInteger(aim.angle) && aim.angle >= 20 && aim.angle <= 80);
    assert.ok(Number.isInteger(aim.power) && aim.power >= 30 && aim.power <= 100); assert.ok(WP.flight(g, aim).time <= 2.001);
  }
});
