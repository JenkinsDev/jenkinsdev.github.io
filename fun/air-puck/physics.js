/*
 * Air Puck: rink, puck, mallets, collisions, scoring and the computer opponent. No DOM, so it's
 * testable (tests/free-play/air-puck.test.mjs) and reusable (the hub preview runs a live match with it).
 *
 * Table space: x across (0 … width), y along (0 … length). Player 0 defends the bottom goal
 * (y = length) and plays in the bottom half; player 1 defends the top goal (y = 0).
 */
(function () {
  "use strict";

  const RINK = {
    width: 1,
    length: 1.6,
    goal: 0.34, // goal mouth width
    puck: 0.035, // radius
    mallet: 0.065, // radius
    maxSpeed: 3.2, // puck, units per second
    malletSpeed: 4.5, // a person's mallet, units per second
    friction: 0.35, // the puck loses about this fraction of its speed per second
    wallBounce: 0.88,
    corner: 0.16, // rounded corners, like a real table: a puck can't wedge into a corner
    hitBounce: 0.92,
  };
  const SUBSTEP = 1 / 240; // small fixed steps so a fast puck can't pass through a mallet or wall

  /** Computer opponent: mallet speed, how often it re-aims (s), aim error, and whether it reads bounces. */
  const LEVELS = {
    easy: { label: "Easy", speed: 1.6, reaction: 0.25, error: 0.1, predict: false },
    medium: { label: "Medium", speed: 2.4, reaction: 0.14, error: 0.05, predict: false },
    hard: { label: "Hard", speed: 3.4, reaction: 0.07, error: 0.02, predict: true },
    impossible: { label: "Impossible", speed: 5, reaction: 0, error: 0, predict: true },
  };

  const GOALS = [3, 5, 7];
  const DEFAULT_GOALS = 5;

  function newWorld() {
    return {
      puck: { x: RINK.width / 2, y: RINK.length / 2, vx: 0, vy: 0, live: true },
      mallets: [
        { x: RINK.width / 2, y: RINK.length - 0.2, vx: 0, vy: 0 },
        { x: RINK.width / 2, y: 0.2, vx: 0, vy: 0 },
      ],
      cpu: [],
    };
  }

  /** Put the puck, still, in the conceding player's half: they serve. */
  function serve(world, conceder) {
    const p = world.puck;
    p.x = RINK.width / 2;
    p.y = conceder === 0 ? RINK.length * 0.72 : RINK.length * 0.28;
    p.vx = p.vy = 0;
    p.live = true;
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function moveMallet(m, i, target, h) {
    const ox = m.x, oy = m.y;
    if (target) {
      const speed = target.speed || RINK.malletSpeed;
      let dx = target.x - m.x, dy = target.y - m.y;
      const d = Math.hypot(dx, dy), max = speed * h;
      if (d > max) { dx *= max / d; dy *= max / d; }
      m.x += dx; m.y += dy;
    }
    const r = RINK.mallet, half = RINK.length / 2;
    m.x = clamp(m.x, r, RINK.width - r);
    m.y = i === 0 ? clamp(m.y, half + r, RINK.length - r) : clamp(m.y, r, half - r);
    m.vx = (m.x - ox) / h;
    m.vy = (m.y - oy) / h;
  }

  function collide(p, m, events) {
    const min = RINK.puck + RINK.mallet;
    let dx = p.x - m.x, dy = p.y - m.y;
    let d = Math.hypot(dx, dy);
    if (d >= min) return;
    if (d === 0) { dx = 0; dy = -1; d = 1; }
    const nx = dx / d, ny = dy / d;
    p.x = m.x + nx * min;
    p.y = m.y + ny * min;
    const rel = (p.vx - m.vx) * nx + (p.vy - m.vy) * ny;
    if (rel < 0) {
      p.vx -= (1 + RINK.hitBounce) * rel * nx;
      p.vy -= (1 + RINK.hitBounce) * rel * ny;
      events.push({ type: "hit", speed: Math.min(1, -rel / RINK.maxSpeed) });
    }
  }

  /** Rounded corners: if the puck is in a corner's zone and past the curve, push it back along the curve's normal. */
  function corners(p, events) {
    const c = RINK.corner, r = RINK.puck, W = RINK.width, L = RINK.length;
    const cx = p.x < c ? c : p.x > W - c ? W - c : null;
    const cy = p.y < c ? c : p.y > L - c ? L - c : null;
    if (cx === null || cy === null) return;
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy), max = c - r;
    if (d <= max) return;
    const nx = dx / d, ny = dy / d;
    p.x = cx + nx * max;
    p.y = cy + ny * max;
    const out = p.vx * nx + p.vy * ny;
    if (out > 0) {
      p.vx -= (1 + RINK.wallBounce) * out * nx;
      p.vy -= (1 + RINK.wallBounce) * out * ny;
      events.push({ type: "wall" });
    }
  }

  function walls(p, events) {
    corners(p, events);
    const r = RINK.puck, W = RINK.width, L = RINK.length;
    if (p.x < r) { p.x = r; if (p.vx < 0) { p.vx = -p.vx * RINK.wallBounce; events.push({ type: "wall" }); } }
    if (p.x > W - r) { p.x = W - r; if (p.vx > 0) { p.vx = -p.vx * RINK.wallBounce; events.push({ type: "wall" }); } }
    const inMouth = Math.abs(p.x - W / 2) < RINK.goal / 2 - r * 0.5;
    if (!inMouth) {
      if (p.y < r) { p.y = r; if (p.vy < 0) { p.vy = -p.vy * RINK.wallBounce; events.push({ type: "wall" }); } }
      if (p.y > L - r) { p.y = L - r; if (p.vy > 0) { p.vy = -p.vy * RINK.wallBounce; events.push({ type: "wall" }); } }
    } else if (p.y < -r) {
      p.live = false; p.vx = p.vy = 0;
      events.push({ type: "goal", scorer: 0 }); // into the top goal: player 0 scores
    } else if (p.y > L + r) {
      p.live = false; p.vx = p.vy = 0;
      events.push({ type: "goal", scorer: 1 });
    }
  }

  /**
   * Advance the world by dt seconds. inputs[i] is where mallet i is heading ({ x, y, speed? }) or null.
   * Returns events: { type: "hit", speed 0–1 } | { type: "wall" } | { type: "goal", scorer }.
   */
  function step(world, dt, inputs) {
    const events = [];
    const n = Math.max(1, Math.ceil(dt / SUBSTEP));
    const h = dt / n;
    const p = world.puck;
    for (let s = 0; s < n; s++) {
      world.mallets.forEach((m, i) => moveMallet(m, i, inputs[i], h));
      if (!p.live) continue;
      const keep = Math.exp(-RINK.friction * h);
      p.vx *= keep; p.vy *= keep;
      p.x += p.vx * h; p.y += p.vy * h;
      world.mallets.forEach((m) => collide(p, m, events));
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > RINK.maxSpeed) { p.vx *= RINK.maxSpeed / sp; p.vy *= RINK.maxSpeed / sp; }
      walls(p, events);
      if (!p.live) break;
    }
    return events;
  }

  /** Where the puck crosses y = lineY, following bounces off the side walls (null if it won't). */
  function predictX(p, lineY) {
    if ((lineY - p.y) * p.vy <= 0 || Math.abs(p.vy) < 0.05) return null;
    const t = (lineY - p.y) / p.vy;
    const span = RINK.width - 2 * RINK.puck;
    let x = p.x - RINK.puck + p.vx * t;
    x = ((x % (2 * span)) + 2 * span) % (2 * span); // unfold the bounces
    if (x > span) x = 2 * span - x;
    return x + RINK.puck;
  }

  /** Where the computer (player 1, top) wants its mallet: attack a slow puck on its side, otherwise guard. */
  function cpuTarget(world, levelKey, random = Math.random) {
    const L = LEVELS[levelKey];
    const p = world.puck, half = RINK.length / 2, r = RINK.mallet;
    const jitter = (random() - 0.5) * 2 * L.error;
    let tx, ty;
    if (p.live && p.y < half && p.vy > -1) {
      // attack: aim at the other player's goal. If the puck is jammed against our own end wall,
      // knock it out toward the middle instead (aiming at the goal from there would pin it).
      let dx = RINK.width / 2 - p.x, dy = RINK.length - p.y;
      if (p.y < RINK.puck + r) { dx = RINK.width / 2 - p.x; dy = 0.25; }
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      // get behind the puck first (on the side away from where it should go), then strike through it
      const m = world.mallets[1];
      const behind = (m.x - p.x) * dx + (m.y - p.y) * dy < -(RINK.puck + r) * 0.5;
      const reach = RINK.puck + r + 0.02;
      if (behind) { tx = p.x + dx * 0.12 + jitter; ty = p.y + dy * 0.12; }
      else {
        tx = p.x - dx * reach + jitter;
        ty = p.y - dy * reach;
        if (ty < r) { ty = p.y; tx = p.x + (p.x > RINK.width / 2 ? reach : -reach); } // no room behind: come from the side
      }
    } else {
      // guard: sit on the defence line, between the puck and the goal
      ty = 0.2;
      const guessed = L.predict ? predictX(p, ty) : null;
      tx = (guessed !== null ? guessed : RINK.width / 2 + (p.x - RINK.width / 2) * 0.6) + jitter;
    }
    return { x: clamp(tx, r, RINK.width - r), y: clamp(ty, r, half - r), speed: L.speed };
  }

  /** The same brain for either side: player 0 sees a flipped rink (the hub preview plays both sides). */
  function cpuTargetFor(world, player, levelKey, random = Math.random) {
    if (player === 1) return cpuTarget(world, levelKey, random);
    const L = RINK.length, p = world.puck, [m0, m1] = world.mallets;
    const flipped = {
      puck: { x: p.x, y: L - p.y, vx: p.vx, vy: -p.vy, live: p.live },
      mallets: [{ x: m1.x, y: L - m1.y }, { x: m0.x, y: L - m0.y }],
    };
    const t = cpuTarget(flipped, levelKey, random);
    return { x: t.x, y: L - t.y, speed: t.speed };
  }

  /** cpuTargetFor, but only re-aimed every `reaction` seconds: slower levels react late. */
  function cpuInput(world, levelKey, now, random = Math.random, player = 1) {
    const c = world.cpu[player] || (world.cpu[player] = { at: -1, target: null });
    if (!c.target || now - c.at >= LEVELS[levelKey].reaction) {
      c.target = cpuTargetFor(world, player, levelKey, random);
      c.at = now;
    }
    return c.target;
  }

  const newMatch = (goals = DEFAULT_GOALS) => ({ scores: [0, 0], winner: null, winAt: goals });
  function addGoal(match, scorer) {
    if (match.winner !== null) throw new Error("match is over");
    const scores = match.scores.slice();
    scores[scorer] += 1;
    return Object.assign({}, match, { scores, winner: scores[scorer] >= match.winAt ? scorer : null });
  }

  window.AP = { RINK, LEVELS, GOALS, DEFAULT_GOALS, newWorld, serve, step, predictX, cpuTarget, cpuTargetFor, cpuInput, newMatch, addGoal };
})();
