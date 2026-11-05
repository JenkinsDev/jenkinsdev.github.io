/*
 * Stack It: the world, the crane, settling, falls, tower height and the computer player. Physics is
 * Planck.js (../vendor/planck.min.js, a Box2D port). No DOM, so it's testable (tests/free-play/stack-it.test.mjs)
 * and the hub preview can reuse it.
 *
 * World space: metres, y up. The plinth is centred on x = 0 with its top at PLINTH.top; the ground is y = 0.
 * Anything whose centre drops below the plinth top has fallen off.
 */
(function () {
  "use strict";

  const pl = window.planck;
  const { OBJECTS, bounds, area } = window.SKObjects;

  const PLINTH = { width: 2.6, top: 1.2 };
  const STEP = 1 / 120;
  const CRANE = {
    span: 1.75, // the hook swings this far either side of centre
    speed: 1.25, // radians per second at the start…
    speedUp: 0.045, // …a little faster after every drop…
    maxSpeed: 2.6, // …up to this
    carry: 0, // a dropped object falls straight down from where it was let go (fair and easy to read)
    gap: 0.6, // clear air between the top of the pile and the bottom of the held object
  };
  const ROUNDS = [3, 5, 7];
  const DEFAULT_ROUNDS = 3;

  /** Computer: how far off its aim can be (m, standard deviation), and how long it looks before dropping (s). */
  const LEVELS = {
    easy: { label: "Easy", error: 0.32, think: 1.1 },
    medium: { label: "Medium", error: 0.16, think: 0.8 },
    hard: { label: "Hard", error: 0.07, think: 0.6 },
    impossible: { label: "Impossible", error: 0.015, think: 0.45 },
  };

  function newGame() {
    const world = new pl.World({ gravity: { x: 0, y: -10 } });
    const ground = world.createBody();
    ground.createFixture(new pl.Box(30, 0.5, { x: 0, y: -0.5 }, 0), { friction: 0.8 });
    const plinth = world.createBody();
    plinth.createFixture(new pl.Box(PLINTH.width / 2, PLINTH.top / 2, { x: 0, y: PLINTH.top / 2 }, 0), { friction: 0.85 });
    return { world, bodies: [], acc: 0, drops: 0, time: 0 };
  }

  /** Swing speed for the next drop: starts gentle, gets quicker as the pile grows. */
  const swingSpeed = (game) => Math.min(CRANE.maxSpeed, CRANE.speed * (1 + CRANE.speedUp * game.drops));
  /** The hook's x and sideways speed at time t (s) into this turn. */
  function hook(game, t) {
    const w = swingSpeed(game);
    return { x: CRANE.span * Math.sin(w * t), vx: CRANE.span * w * Math.cos(w * t) };
  }
  /** Where the held object hangs: its centre's height above the current pile. */
  function hangY(game, kind) {
    const b = bounds(OBJECTS[kind]);
    return PLINTH.top + height(game) + CRANE.gap - b.minY;
  }

  /** Let go of the held object at (x, y) moving sideways at vx. Returns the new body. */
  function drop(game, kind, x, y, vx) {
    const obj = OBJECTS[kind];
    const round = obj.parts.some((p) => p.circle);
    const body = game.world.createBody({
      type: "dynamic",
      position: { x, y },
      linearVelocity: { x: vx * CRANE.carry, y: 0 },
      angularDamping: round ? 2.2 : 0.4, // round things roll, but not forever
    });
    const fix = { density: obj.mass / area(obj), friction: obj.friction, restitution: 0.05 };
    for (const part of obj.parts) {
      let shape;
      if (part.box) { const [w, h, cx, cy] = part.box; shape = new pl.Box(w / 2, h / 2, { x: cx, y: cy }, 0); }
      else if (part.circle) { const [r, cx, cy] = part.circle; shape = new pl.Circle({ x: cx, y: cy }, r); }
      else shape = new pl.Polygon(part.poly.map(([px, py]) => ({ x: px, y: py })));
      body.createFixture(shape, fix);
    }
    body.setUserData({ kind });
    game.bodies.push(body);
    game.drops += 1;
    return body;
  }

  /** Advance the world by dt seconds in fixed steps. Returns the hardest new landing speed (for sounds). */
  function step(game, dt) {
    game.acc += dt;
    let thump = 0;
    while (game.acc >= STEP) {
      const before = game.bodies.map((b) => b.getLinearVelocity().y);
      game.world.step(STEP, 10, 4);
      game.bodies.forEach((b, i) => { const dv = b.getLinearVelocity().y - before[i]; if (dv > thump) thump = dv; });
      game.acc -= STEP;
      game.time += STEP;
    }
    return thump;
  }

  /** Everything has come to rest. */
  const settled = (game) => game.bodies.every((b) => {
    const v = b.getLinearVelocity();
    return Math.hypot(v.x, v.y) < 0.06 && Math.abs(b.getAngularVelocity()) < 0.08;
  });
  /** Bodies that have fallen off the plinth. */
  const fallen = (game) => game.bodies.filter((b) => b.getPosition().y < PLINTH.top);

  /** Height of the pile above the plinth top (m), from the highest point of anything on it. */
  function height(game) {
    let top = PLINTH.top;
    for (const b of game.bodies) {
      if (b.getPosition().y < PLINTH.top) continue;
      for (let f = b.getFixtureList(); f; f = f.getNext()) top = Math.max(top, f.getAABB(0).upperBound.y);
    }
    return top - PLINTH.top;
  }

  /**
   * Where a careful player would aim: over the top of the highest thing on the pile (or the plinth's middle).
   * The computer adds its level's error once per turn, so it commits to a spot like a person does.
   */
  function aim(game, level, random = Math.random) {
    let best = null;
    for (const b of game.bodies) if (b.getPosition().y >= PLINTH.top && (!best || b.getPosition().y > best.getPosition().y)) best = b;
    const x = best ? best.getPosition().x : 0;
    const gauss = Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
    const limit = PLINTH.width / 2 - 0.25;
    return Math.max(-limit, Math.min(limit, x + gauss * LEVELS[level].error));
  }
  /** Where something let go now would land, allowing for the sideways speed it keeps while falling. */
  function landingX(game, kind, t) {
    const h = hook(game, t);
    const time = Math.sqrt((2 * CRANE.gap) / 10); // the held object's underside is always CRANE.gap above the pile
    return h.x + h.vx * CRANE.carry * time;
  }
  /** Should the computer let go at time t into its turn? */
  function cpuShouldDrop(game, kind, level, target, t) {
    if (t < LEVELS[level].think) return false;
    if (t > 8) return true; // never stall the game
    const dt = 1 / 60;
    const now = landingX(game, kind, t), next = landingX(game, kind, t + dt);
    return Math.abs(now - target) < 0.03 || (now - target) * (next - target) < 0; // on target, or about to pass it
  }

  /** A turn-based match (1P vs computer or 2P): first to more than half the rounds. */
  function newMatch(rounds) {
    return { rounds, winAt: Math.floor(rounds / 2) + 1, score: [0, 0], round: 0 };
  }

  window.SK = { PLINTH, CRANE, LEVELS, ROUNDS, DEFAULT_ROUNDS, newGame, hook, hangY, drop, step, settled, fallen, height, aim, landingX, cpuShouldDrop, newMatch, swingSpeed };
})();
