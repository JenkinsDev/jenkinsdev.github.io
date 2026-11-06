import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { Math }; context.window = context; vm.createContext(context);
vm.runInContext(readFileSync('static/fun/rocket-lander/rules.js', 'utf8'), context);
vm.runInContext(readFileSync('static/fun/rocket-lander/render.js', 'utf8'), context);
const { RL, RLRender } = context;
const rng = (seed) => () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;

test('a rocket with thrust off on the Moon falls at about 1.62 m/s²', () => {
  const g = RL.create('moon');
  const r = g.rockets[0];
  const start = r.y;
  const idle = { rotate: 0, thrust: false };
  RL.step(g, 1, [idle, idle]);
  assert.ok(Math.abs(r.vy - 1.62) < 0.03, `vy=${r.vy}`);
  assert.ok(Math.abs((start - r.y) - 1.62 / 2) < 0.05, `y=${r.y}`);
});

test('Earth and Jupiter use 9.80 and 24.79', () => {
  assert.equal(RL.WORLDS.earth.g, 9.80);
  assert.equal(RL.WORLDS.jupiter.g, 24.79);
  assert.equal(RL.WORLDS.moon.g, 1.62);
  assert.equal(RL.WORLDS.mars.g, 3.73);
  assert.equal(RL.WORLDS.pluto.g, 0.62);
  const earth = RL.create('earth'), jup = RL.create('jupiter');
  const idle = { rotate: 0, thrust: false };
  RL.step(earth, 1, [idle, idle]);
  RL.step(jup, 1, [idle, idle]);
  assert.ok(Math.abs(earth.rockets[0].vy - 9.80) < 0.05);
  assert.ok(Math.abs(jup.rockets[0].vy - 24.79) < 0.05);
});

test('holding thrust with fuel reduces vy by (THRUST - g) * dt when upright', () => {
  const g = RL.create('moon');
  const r = g.rockets[0];
  r.vy = 10;
  const go = { rotate: 0, thrust: true };
  RL.step(g, 1, [go, go]);
  const expected = 10 - (RL.THRUST - 1.62) * 1;
  assert.ok(Math.abs(r.vy - expected) < 0.08, `vy=${r.vy} expected ${expected}`);
  assert.ok(r.fuel < 100 - 17 && r.fuel > 100 - 19);
});

test('fuel hits 0 and further thrust requests do nothing', () => {
  const g = RL.create('moon');
  const r = g.rockets[0];
  r.fuel = 0; r.vy = 4;
  const go = { rotate: 0, thrust: true };
  RL.step(g, 0.5, [go, go]);
  assert.equal(r.fuel, 0);
  assert.ok(Math.abs(r.vy - (4 + 1.62 * 0.5)) < 0.05, `vy=${r.vy}`);
  assert.equal(r.thrust, false);
});

test('safe-landing predicates match documented boundaries', () => {
  const w = RL.WORLDS.moon;
  const base = { x: RL.PAD_X, y: 0, vx: 0, vy: 2.4, angle: 0 };
  assert.equal(RL.safeLanding(base, w), true);
  assert.equal(RL.safeLanding({ ...base, vy: 2.41 }, w), false);
  assert.equal(RL.safeLanding({ ...base, vx: 1.8 }, w), true);
  assert.equal(RL.safeLanding({ ...base, vx: 1.81 }, w), false);
  assert.equal(RL.safeLanding({ ...base, angle: 12 * Math.PI / 180 }, w), true);
  assert.equal(RL.safeLanding({ ...base, angle: 12.2 * Math.PI / 180 }, w), false);
  assert.equal(RL.safeLanding({ ...base, x: RL.PAD_X + w.pad / 2 + 0.15 }, w), true);
  assert.equal(RL.safeLanding({ ...base, x: RL.PAD_X + w.pad / 2 + 0.16 }, w), false);
});

test('addRound is first-to-two and draws stand', () => {
  const m = RL.match('moon');
  RL.addRound(m, 0); assert.equal(m.over, false); assert.equal(m.scores[0], 1); assert.equal(m.scores[1], 0);
  RL.addRound(m, -1); assert.equal(m.over, false); assert.equal(m.scores[0], 1); assert.equal(m.scores[1], 0);
  RL.addRound(m, 0); assert.equal(m.over, true); assert.equal(m.winner, 0);
  const d = RL.match('mars');
  RL.addRound(d, -1); RL.addRound(d, -1); RL.addRound(d, -1);
  assert.equal(d.over, true); assert.equal(d.winner, -1);
  const split = RL.match('earth');
  RL.addRound(split, 0); RL.addRound(split, 1); RL.addRound(split, -1);
  assert.equal(split.over, true); assert.equal(split.winner, -1);
});

test('Impossible never thrusts with empty fuel and no level exceeds THRUST', () => {
  for (const level of ['easy', 'medium', 'hard', 'impossible']) {
    const g = RL.create('earth');
    const r = g.rockets[0];
    r.fuel = 0; r.vy = 8;
    const mem = {};
    const inp = RL.cpuInput(r, g.world, level, 1, mem, rng(99));
    assert.equal(inp.thrust, false);
    assert.ok([-1, 0, 1].includes(inp.rotate));
    assert.ok(inp.thrust === true || inp.thrust === false);
  }
  const live = RL.create('moon').rockets[0];
  const inp = RL.cpuInput(live, RL.WORLDS.moon, 'impossible', 0, {}, () => 0);
  assert.equal(RL.THRUST, 30);
});

test('seeded Easy crash-rate on Earth is higher than Impossible', () => {
  let easy = 0, hard = 0;
  for (let i = 1; i <= 30; i++) {
    const e = RL.play('earth', 'easy', rng(i * 7919), RL.LIMIT + 1);
    const n = RL.play('earth', 'impossible', rng(i * 7919), RL.LIMIT + 1);
    if (e.rockets[0].status !== 'land') easy++;
    if (n.rockets[0].status !== 'land') hard++;
  }
  console.log('Earth crash rates Easy/Impossible:', easy, hard);
  assert.ok(easy > hard, `easy ${easy} vs impossible ${hard}`);
});

test('Jupiter updraft applies only near the pad and to both rockets', () => {
  const g = RL.create('jupiter');
  const high = { x: g.world.padX, y: 20 };
  const low = { x: g.world.padX, y: 1 };
  const side = { x: 1, y: 1 };
  assert.equal(RL.updraftAt(g.world, high), 0);
  assert.equal(RL.updraftAt(g.world, low), 8);
  assert.equal(RL.updraftAt(g.world, side), 0);
  assert.equal(RL.updraftAt(RL.WORLDS.moon, low), 0);
  g.rockets[0].x = g.world.padX; g.rockets[1].x = g.world.padX;
  g.rockets[0].y = 2; g.rockets[1].y = 2;
  g.rockets[0].vy = 0; g.rockets[1].vy = 0;
  const idle = { rotate: 0, thrust: false };
  RL.step(g, 0.2, [idle, idle]);
  const expected = (24.79 - 8) * 0.2;
  assert.ok(g.rockets[0].y > 0 && g.rockets[1].y > 0);
  assert.ok(Math.abs(g.rockets[0].vy - expected) < 0.08, String(g.rockets[0].vy));
  assert.ok(Math.abs(g.rockets[1].vy - expected) < 0.08, String(g.rockets[1].vy));
});

test('same-frame double landing uses the cleaner score, equal is a draw', () => {
  const g = RL.create('moon');
  for (const r of g.rockets) Object.assign(r, { x: g.world.padX, y: (g.world.padY || 0) + 0.001, vx: 0, vy: 1, angle: 0, fuel: 50, status: 'fly' });
  g.rockets[1].fuel = 80;
  RL.tick(g, [{ rotate: 0, thrust: false }, { rotate: 0, thrust: false }]);
  assert.equal(g.over, true);
  assert.equal(g.winner, 1);
  const t = RL.create('moon');
  for (const r of t.rockets) Object.assign(r, { x: t.world.padX, y: (t.world.padY || 0) + 0.001, vx: 0, vy: 1, angle: 0, fuel: 40, status: 'fly' });
  RL.tick(t, [{ rotate: 0, thrust: false }, { rotate: 0, thrust: false }]);
  assert.equal(t.winner, -1);
});

test('each round gets a seeded pad and terrain shared by both ships', () => {
  const a = RL.create('moon', rng(17)), b = RL.create('moon', rng(17));
  assert.equal(a.world.padX, b.world.padX);
  assert.equal(a.world.seed, b.world.seed);
  assert.equal(a.rockets[0].x, RL.PAD_X);
  assert.equal(a.rockets[1].x, RL.PAD_X);
  assert.ok(Math.abs(a.world.padX - RL.PAD_X) > 1.5, 'pad should not spawn under the ships');
  assert.equal(a.world.padY, b.world.padY);
  assert.ok(Math.abs(a.rockets[0].y - (22 + (a.world.padY || 0))) < 1e-9);
  assert.deepEqual(a.world.bumps, b.world.bumps);
  const half = a.world.pad / 2;
  assert.ok(a.world.padX >= half + 2.2 && a.world.padX <= RL.WORLD_W - half - 2.2);
  let moved = false;
  for (let i = 3; i <= 60 && !moved; i++) {
    const other = RL.create('moon', rng(17 + i * 31));
    if (Math.abs(other.world.padX - a.world.padX) > 0.8) moved = true;
  }
  assert.ok(moved, 'different seeds should be able to move the pad');
  const j = RL.create('jupiter', rng(4));
  const jh = j.world.pad / 2;
  assert.ok(j.world.padX >= jh + 2.2 && j.world.padX <= RL.WORLD_W - jh - 2.2);
  const shifted = { ...RL.WORLDS.moon, padX: 6 };
  assert.equal(RL.safeLanding({ x: 6, vx: 0, vy: 1, angle: 0 }, shifted), true);
  assert.equal(RL.safeLanding({ x: 9, vx: 0, vy: 1, angle: 0 }, shifted), false);
});

test('a round lasts 45 seconds before a timeout crash', () => {
  assert.equal(RL.LIMIT, 45);
  const g = RL.create('moon', rng(3));
  g.rockets[0].y = 12; g.rockets[1].status = 'freeze';
  g.time = 45 - RL.STEP / 2;
  RL.tick(g, [{ rotate: 0, thrust: false }, { rotate: 0, thrust: false }]);
  assert.ok(g.time >= 45);
  assert.equal(g.rockets[0].status, 'crash');
});

test('each world has many facts and pickFact skips the last line', () => {
  for (const id of ['moon', 'mars', 'earth', 'pluto', 'jupiter']) {
    const facts = RL.WORLDS[id].facts;
    assert.ok(facts.length >= 8, id + ' ' + facts.length);
    assert.equal(new Set(facts).size, facts.length);
  }
  const moon = RL.WORLDS.moon;
  const first = RL.pickFact(moon, () => 0);
  assert.equal(first, moon.facts[0]);
  const next = RL.pickFact(moon, () => 0, first);
  assert.notEqual(next, first);
  const g = RL.create('moon', rng(12));
  assert.ok(moon.facts.includes(g.world.fact));
});

test('pads land clearly left or right of center across seeds, never off the world', () => {
  let left = false, right = false;
  for (let i = 1; i <= 40; i++) {
    const g = RL.create('mars', rng(300 + i * 17));
    const half = g.world.pad / 2;
    assert.ok(g.world.padX >= half + 2.2 && g.world.padX <= RL.WORLD_W - half - 2.2);
    assert.equal(g.rockets[0].x, g.rockets[1].x);
    if (g.world.padX < RL.PAD_X - 1) left = true;
    if (g.world.padX > RL.PAD_X + 1) right = true;
  }
  assert.ok(left && right, 'expected both left and right pads');
});

test('flying high does not crash into a ceiling', () => {
  const g = RL.create('moon', rng(8));
  const r = g.rockets[0];
  r.y = 120; r.vy = -4; r.x = g.world.padX;
  g.rockets[1].status = 'freeze';
  RL.tick(g, [{ rotate: 0, thrust: true }, { rotate: 0, thrust: false }]);
  assert.equal(r.status, 'fly');
  assert.ok(r.y > 120);
});

test('hitting a mountain is a kid-safe crash; the pad stays the only safe landing', () => {
  const idle = { rotate: 0, thrust: false };
  const g = RL.create('moon', rng(1));
  g.world.padX = 13; g.world.padY = 0; g.world.shelf = 0;
  g.world.bumps = [{ x: 4, w: 4, h: 2.5 }];
  assert.ok(RL.groundHeight(g.world, 4) > 2);
  assert.equal(RL.groundHeight(g.world, 13), 0);
  Object.assign(g.rockets[0], { x: 4, y: 2.52, vx: 0, vy: 6, angle: 0, status: 'fly' });
  g.rockets[1].status = 'freeze';
  RL.tick(g, [idle, idle]);
  assert.equal(g.rockets[0].status, 'crash');
  const soft = RL.create('moon', rng(2));
  soft.world.padX = 13; soft.world.padY = 0; soft.world.shelf = 0;
  soft.world.bumps = [{ x: 4, w: 4, h: 2.5 }];
  Object.assign(soft.rockets[0], { x: 4, y: 2.49, vx: 0, vy: 0.2, angle: 0, status: 'fly' });
  soft.rockets[1].status = 'freeze';
  RL.tick(soft, [idle, idle]);
  assert.equal(soft.rockets[0].status, 'crash', 'a gentle sit on a mountain is still a crash');
  const land = RL.create('moon', rng(3));
  land.world.padX = 13; land.world.padY = 0; land.world.shelf = 0;
  land.world.bumps = [{ x: 4, w: 4, h: 2.5 }];
  Object.assign(land.rockets[0], { x: 13, y: 0.001, vx: 0, vy: 1, angle: 0, fuel: 40, status: 'fly' });
  land.rockets[1].status = 'freeze';
  RL.tick(land, [idle, idle]);
  assert.equal(land.rockets[0].status, 'land');
});

test('shared mountains never cover the pad', () => {
  for (let i = 1; i <= 30; i++) {
    const g = RL.create('earth', rng(400 + i * 13));
    assert.equal(g.rockets[0].x, g.rockets[1].x);
    assert.deepEqual(g.world.bumps, RL.create('earth', rng(400 + i * 13)).world.bumps);
    assert.ok(Math.abs(RL.groundHeight(g.world, g.world.padX) - (g.world.padY || 0)) < 0.05, 'pad must stay clear of mountains');
    const half = g.world.pad / 2;
    g.world.bumps.forEach((b) => {
      assert.ok(Math.abs(b.x - g.world.padX) >= half + b.w / 2 * 0.5);
    });
  }
});

test('pad look is seeded, shared, and stays clear of mountains', () => {
  const a = RL.create('moon', rng(21)), b = RL.create('moon', rng(21));
  assert.deepEqual(a.world.padLook, b.world.padLook);
  assert.equal(a.world.padX, b.world.padX);
  assert.equal(a.world.padY, b.world.padY);
  assert.ok(a.world.padY >= 0 && a.world.padY <= 1.15);
  for (let i = 1; i <= 20; i++) {
    const g = RL.create('earth', rng(500 + i));
    assert.ok(Math.abs(RL.groundHeight(g.world, g.world.padX) - (g.world.padY || 0)) < 0.05);
  }
});

test('a raised pad is the only safe shelf and both ships share its height', () => {
  const idle = { rotate: 0, thrust: false };
  const g = RL.create('moon', rng(9));
  g.world.padX = 10; g.world.padY = 0.8; g.world.shelf = 0.28; g.world.bumps = [];
  Object.assign(g.rockets[0], { x: 10, y: 0.805, vx: 0, vy: 1, angle: 0, fuel: 40, status: 'fly' });
  g.rockets[1].status = 'freeze';
  RL.tick(g, [idle, idle]);
  assert.equal(g.rockets[0].status, 'land');
  assert.ok(Math.abs(g.rockets[0].y - 0.8) < 0.02);
  const miss = RL.create('moon', rng(10));
  miss.world.padX = 10; miss.world.padY = 0.8; miss.world.shelf = 0.28; miss.world.bumps = [];
  Object.assign(miss.rockets[0], { x: 10 + miss.world.pad / 2 + 0.2, y: 0.805, vx: 0, vy: 1, angle: 0, status: 'fly' });
  miss.rockets[1].status = 'freeze';
  RL.tick(miss, [idle, idle]);
  assert.equal(miss.rockets[0].status, 'crash');
});

test('ships start together at center and the pad is offset so they must aim', () => {
  for (let i = 1; i <= 25; i++) {
    const g = RL.create('moon', rng(900 + i * 11));
    assert.equal(g.rockets[0].x, RL.PAD_X);
    assert.equal(g.rockets[1].x, g.rockets[0].x);
    assert.ok(Math.abs(g.world.padX - RL.PAD_X) > 1.5, `padX ${g.world.padX}`);
  }
});

test('pad cue points toward an off-camera pad and hides when the pad is visible', () => {
  const low = { pad: 2, padX: 4, padY: 0 };
  assert.equal(RLRender.padCue(low, 10, -2, 12, 10).dir, 'left');
  assert.equal(RLRender.padCue({ pad: 2, padX: 24, padY: 0 }, 10, -2, 12, 10).dir, 'right');
  assert.equal(RLRender.padCue({ pad: 2, padX: 14, padY: 0 }, 8, -2, 12, 10), null);
  assert.equal(RLRender.padCue({ pad: 2, padX: 10.2, padY: 0 }, 10, -2, 12, 10), null);
  assert.equal(RLRender.padCue({ pad: 2, padX: 21.8, padY: 0 }, 10, -2, 12, 10), null);
  const below = RLRender.padCue({ pad: 2, padX: 14, padY: 0.5 }, 8, 16, 12, 12);
  assert.equal(below.dir, 'down');
  assert.equal(below.padX, 14);
  assert.ok(below.dist >= 15, `dist ${below.dist}`);
  assert.equal(RLRender.padCue({ pad: 2, padX: 4, padY: 0 }, 10, 16, 12, 12).dir, 'down-left');
  assert.equal(RLRender.padCue({ pad: 2, padX: 26, padY: 0 }, 10, 16, 12, 12).dir, 'down-right');
});

test('each 2P control cluster sits in the same seat as that player\'s view', () => {
  const html = readFileSync('static/fun/rocket-lander/index.html', 'utf8');
  const css = readFileSync('static/fun/rocket-lander/game.css', 'utf8');
  const seat = (id) => {
    const start = html.indexOf(`id="${id}"`);
    assert.ok(start > 0, id);
    const from = html.lastIndexOf('<div', start);
    let depth = 0, i = from;
    while (i < html.length) {
      const open = html.indexOf('<div', i);
      const close = html.indexOf('</div>', i);
      if (close < 0) break;
      if (open >= 0 && open < close) { depth++; i = open + 4; }
      else { depth--; i = close + 6; if (depth === 0) return html.slice(from, i); }
    }
    return '';
  };
  const p0 = seat('seat-0'), p1 = seat('seat-1');
  assert.ok(p0.includes('id="view-wrap-0"') && p0.includes('id="view-0"'));
  assert.ok(p0.includes('id="cluster-0"') && p0.includes('data-p="0"') && !p0.includes('data-p="1"'));
  assert.ok(p1.includes('id="view-wrap-1"') && p1.includes('id="view-1"'));
  assert.ok(p1.includes('id="cluster-1"') && p1.includes('data-p="1"') && !p1.includes('data-p="0"'));
  assert.match(p0, /data-p="0"[^>]*data-act="left"/);
  assert.match(p0, /data-p="0"[^>]*data-act="thrust"/);
  assert.match(p0, /data-p="0"[^>]*data-act="right"/);
  assert.match(p1, /data-p="1"[^>]*data-act="left"/);
  assert.match(p1, /data-p="1"[^>]*data-act="thrust"/);
  assert.match(p1, /data-p="1"[^>]*data-act="right"/);
  assert.match(css, /\.rl\.two \.seat\.p1 \{ order: -2; transform: rotate\(180deg\); \}/);
  assert.match(css, /\.rl\.two \.seat\.p0 \.cluster \{ order: -1; \}/);
  assert.match(css, /#view-wrap-1 \{ display: none !important; \}/);
  assert.ok(p0.includes('id="seat-score-0"') && p0.includes('id="seat-timer-0"'));
  assert.ok(p1.includes('id="seat-score-1"') && p1.includes('id="seat-timer-1"'));
  assert.match(css, /html\.rl-mobile \.rl\.two \.scoreboard/);
  assert.match(css, /html\.rl-mobile \.rl\.two #banner/);
  assert.match(html, /id="split-back"/);
  assert.match(html, /id="split-mute"/);
  assert.match(css, /html\.rl-mobile:has\(\.rl\.two \.playing:not\(\[hidden\]\)\) \.fp-bar/);
});
