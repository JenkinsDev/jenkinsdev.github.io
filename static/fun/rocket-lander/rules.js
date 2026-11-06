(function () {
  "use strict";
  const Math = globalThis.Math;
  const STEP = 1 / 120;
  const THRUST = 30, ROT = 6.4, DAMP = 2.8, BURN = 18, FUEL0 = 100;
  const WORLD_W = 28, PAD_X = 14, START_Y = 22, LIMIT = 45;
  const SAFE_VY = 2.4, SAFE_VX = 1.8, SAFE_ANG = 12 * Math.PI / 180, FORGIVE = 0.15;
  const DEG = Math.PI / 180;
  // Kid-safe facts; source URLs stay here, not on screen.
  // Moon: https://spaceplace.nasa.gov/all-about-the-moon/en/
  // Mars: NSSDC Mars Fact Sheet (sidereal orbit 686.980 days)
  // Earth: NASA planetary fact sheets treat it as the comparison body
  // Pluto: https://spaceplace.nasa.gov/all-about-pluto/en/
  // Jupiter: NSSDC gravity at the 1-bar level; 95 natural satellites
  const WORLDS = {
    moon: { id: "moon", name: "Moon", g: 1.62, pad: 3.4, updraft: 0, banner: "", facts: [
      "The Moon does not make its own light — it shines by reflecting the Sun.",
      "The Moon is about a quarter of the width of Earth.",
      "A day on the Moon lasts about 29 Earth days from sunrise to sunrise.",
      "There is almost no air on the Moon, so the sky stays black even in daytime.",
      "Footprints on the Moon can last a very long time because there is no wind or rain.",
      "The Moon's gravity is about one sixth as strong as Earth's.",
      "From Earth we always see the same side of the Moon.",
      "The dark patches on the Moon are wide plains of old lava.",
      "The Moon helps pull Earth's oceans and make the tides.",
      "The Moon is Earth's only natural satellite."
    ]},
    mars: { id: "mars", name: "Mars", g: 3.73, pad: 3.4, updraft: 0, banner: "", facts: [
      "A year on Mars is about 687 Earth days, because Mars is farther from the Sun.",
      "Mars looks red because its soil is rich in rusty iron.",
      "A day on Mars is about 24 hours and 37 minutes — close to an Earth day.",
      "Mars has the tallest volcano we know, Olympus Mons.",
      "Mars has two small moons named Phobos and Deimos.",
      "Mars is colder than Earth.",
      "Mars has ice at its north and south poles.",
      "Dust storms on Mars can cover the whole planet.",
      "You would weigh less on Mars than you do on Earth.",
      "Mars has a huge canyon system called Valles Marineris."
    ]},
    earth: { id: "earth", name: "Earth", g: 9.80, pad: 3.4, updraft: 0, banner: "", facts: [
      "Earth is the world we live on, with air to breathe and oceans of liquid water.",
      "Earth is the only planet we know that has life.",
      "About 70 percent of Earth's surface is covered by ocean.",
      "Earth has one moon.",
      "A year on Earth is about 365 days — the time it takes to travel around the Sun.",
      "Earth's blanket of air is called the atmosphere.",
      "Earth spins once each day, which is why we have day and night.",
      "Earth is the third planet from the Sun.",
      "Earth's gravity is what we feel as our everyday weight.",
      "Liquid water on Earth makes our blue planet look bright from space."
    ]},
    pluto: { id: "pluto", name: "Pluto", g: 0.62, pad: 3.4, updraft: 0, banner: "", facts: [
      "Pluto is a dwarf planet in the distant Kuiper Belt.",
      "A year on Pluto lasts about 248 Earth years.",
      "Pluto is smaller than Earth's Moon.",
      "Pluto has a bright, heart-shaped region of ice on its surface.",
      "Pluto has five known moons. The largest is named Charon.",
      "Pluto is extremely cold because it is so far from the Sun.",
      "One day on Pluto is about six Earth days long.",
      "Pluto's path around the Sun is more stretched and tilted than the planets'.",
      "Sometimes Pluto's path brings it closer to the Sun than Neptune, then it swings farther out.",
      "NASA's New Horizons spacecraft flew past Pluto in 2015."
    ]},
    jupiter: { id: "jupiter", name: "Jupiter", g: 24.79, pad: 4.2, updraft: 8,
      banner: "No solid ground — aim for the cloud pad.", facts: [
      "Jupiter is a giant ball of gas — there is no solid ground to park on. This pad is a floating cloud deck.",
      "Jupiter is the largest planet in our solar system.",
      "A day on Jupiter is only about 10 hours long.",
      "Jupiter has a giant storm called the Great Red Spot.",
      "Jupiter has dozens of moons — scientists have counted 95 natural satellites.",
      "Jupiter is made mostly of hydrogen and helium, like the Sun.",
      "Four of Jupiter's moons were first seen by Galileo: Io, Europa, Ganymede and Callisto.",
      "Jupiter has faint rings, much harder to see than Saturn's.",
      "You cannot stand on Jupiter because it has no solid surface.",
      "Jupiter is the fifth planet from the Sun."
    ]}
  };
  const pickFact = (world, random, avoid) => {
    const list = (world && world.facts) || [];
    const rng = random || Math.random;
    const pool = list.filter((f) => f !== avoid);
    const use = pool.length ? pool : list;
    return use.length ? use[Math.floor(rng() * use.length)] : "";
  };
  const LEVELS = {
    easy: { every: 0.35, err: 18 * DEG, late: 0.55 },
    medium: { every: 0.18, err: 8 * DEG, late: 0.8 },
    hard: { every: 0.08, err: 3 * DEG, late: 1 },
    impossible: { every: 0, err: 0, late: 1 }
  };
  const worldOf = (id) => WORLDS[id] || WORLDS.moon;
  const padCenter = (w) => (typeof w === "string" ? worldOf(w) : w).padX ?? PAD_X;
  const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function rocket(x, y) {
    return { x: x ?? PAD_X, y: y ?? START_Y, vx: 0, vy: 0, angle: 0, omega: 0, fuel: FUEL0, status: "fly", thrust: false, impact: 0 };
  }
  function layout(world, random) {
    const rng = random || Math.random;
    rng();
    const half = world.pad / 2;
    const lo = half + 2.2, hi = WORLD_W - half - 2.2;
    const mid = WORLD_W / 2, maxOff = 5.8;
    if (rng() < 0.5) world.padX = mid - maxOff + rng() * Math.max(0.4, maxOff - 2);
    else world.padX = mid + 2 + rng() * Math.max(0.4, maxOff - 2);
    world.padX = Math.max(lo, Math.min(hi, world.padX));
    world.padY = Math.round(rng() * 1.15 * 100) / 100;
    world.shelf = 0.28;
    world.width = WORLD_W;
    world.padLook = { blink: Math.floor(rng() * 4) };
    world.seed = 1 + Math.floor(rng() * 2147483646);
    world.bumps = [];
    for (let i = 0; i < 14 && world.bumps.length < 5; i++) {
      const w = 1.8 + rng() * 3.0, h = 1.2 + rng() * 2.3, x = rng() * WORLD_W;
      if (Math.abs(x - world.padX) < half + w / 2 + 0.9) continue;
      world.bumps.push({ x, w, h });
    }
    return world;
  }
  function create(worldId, random, avoidFact) {
    const world = layout({ ...worldOf(worldId) }, random);
    world.fact = pickFact(world, random, avoidFact);
    const y0 = START_Y + (world.padY || 0);
    return { world, rockets: [rocket(PAD_X, y0), rocket(PAD_X, y0)], time: 0, acc: 0, over: false, winner: null, why: "" };
  }
  function groundHeight(world, x) {
    const px = padCenter(world), ph = world.pad / 2, shelf = world.shelf || 0;
    let h = Math.abs(x - px) <= ph + shelf ? (world.padY || 0) : 0;
    (world.bumps || []).forEach((b) => {
      const half = b.w / 2, d = Math.abs(x - b.x);
      if (d >= half) return;
      const peak = b.h * (1 - d / half);
      if (peak > h) h = peak;
    });
    return h;
  }
  function nearPad(r, world) {
    if (!world.updraft) return false;
    const half = world.pad / 2, px = padCenter(world);
    const cx = clamp(r.x, px - half, px + half);
    return Math.hypot(r.x - cx, r.y - (world.padY || 0)) <= 2.5;
  }
  function updraftAt(world, r) { return nearPad(r, world) ? world.updraft : 0; }
  function safeLanding(r, world) {
    const w = typeof world === "string" ? worldOf(world) : world;
    return Math.abs(r.x - padCenter(w)) <= w.pad / 2 + FORGIVE
      && Math.abs(r.vy) <= SAFE_VY && Math.abs(r.vx) <= SAFE_VX
      && Math.abs(wrap(r.angle)) <= SAFE_ANG;
  }
  function landingScore(r, world) {
    const impact = Math.hypot(r.vx, r.vy);
    const offset = Math.abs(r.x - padCenter(world));
    const fuel = Math.max(0, Math.floor(r.fuel * 4));
    const soft = Math.max(0, Math.floor((1 - impact / 3) * 150));
    const center = Math.max(0, Math.floor((1 - offset / (world.pad / 2)) * 120));
    return fuel + soft + center;
  }
  function apply(r, world, input, dt) {
    if (r.status !== "fly") return;
    const rot = input && input.rotate ? clamp(input.rotate, -1, 1) : 0;
    r.omega += rot * ROT * dt;
    r.omega -= r.omega * DAMP * dt;
    r.angle = wrap(r.angle + r.omega * dt);
    const want = !!(input && input.thrust) && r.fuel > 0;
    r.thrust = want;
    const push = want ? THRUST : 0;
    if (want) r.fuel = Math.max(0, r.fuel - BURN * dt);
    const lift = push * Math.cos(r.angle);
    const side = push * Math.sin(r.angle);
    const up = updraftAt(world, r);
    r.vx += side * dt;
    r.vy += (world.g - lift - up) * dt;
    r.x += r.vx * dt;
    r.y -= r.vy * dt;
  }
  function settle(game) {
    const land = [], crash = [], fly = [];
    game.rockets.forEach((r, i) => {
      if (r.status === "land") land.push(i);
      else if (r.status === "crash") crash.push(i);
      else if (r.status === "fly") fly.push(i);
    });
    if (land.length === 1 && fly.length) {
      fly.forEach((i) => { game.rockets[i].status = "freeze"; game.rockets[i].thrust = false; });
      game.over = true; game.winner = land[0]; game.why = "land";
    } else if (land.length === 2) {
      const a = landingScore(game.rockets[0], game.world), b = landingScore(game.rockets[1], game.world);
      game.over = true; game.winner = a === b ? -1 : (a > b ? 0 : 1); game.why = "land";
    } else if (!fly.length && land.length === 1) {
      game.over = true; game.winner = land[0]; game.why = "land";
    } else if (!fly.length && !land.length) {
      game.over = true; game.winner = -1; game.why = "crash";
    }
  }
  function tick(game, inputs) {
    if (game.over) return;
    const dt = STEP;
    game.time += dt;
    for (let i = 0; i < 2; i++) {
      const r = game.rockets[i];
      if (r.status !== "fly") continue;
      const oldY = r.y;
      apply(r, game.world, inputs[i] || { rotate: 0, thrust: false }, dt);
      const gh = groundHeight(game.world, r.x);
      if (r.y <= gh) {
        const fromAbove = oldY >= gh;
        r.impact = Math.hypot(r.vx, r.vy);
        r.thrust = false;
        if (fromAbove && safeLanding(r, game.world)) { r.y = gh; r.status = "land"; }
        else { if (fromAbove) r.y = gh; r.status = "crash"; r.boom = 0; }
      } else if (r.x < 0 || r.x > WORLD_W || game.time >= LIMIT) {
        r.status = "crash"; r.thrust = false; r.boom = 0;
      }
    }
    settle(game);
  }
  function step(game, dt, inputs) {
    if (game.over) return;
    game.acc += Math.max(0, dt);
    while (game.acc >= STEP && !game.over) { game.acc -= STEP; tick(game, inputs); }
  }
  function match(worldId) {
    return { world: worldOf(worldId).id, scores: [0, 0], played: 0, over: false, winner: null };
  }
  function addRound(m, winner) {
    if (m.over) return m;
    m.played++;
    if (winner === 0 || winner === 1) m.scores[winner]++;
    if (m.scores[0] >= 2 || m.scores[1] >= 2 || m.played >= 3) {
      m.over = true;
      m.winner = m.scores[0] === m.scores[1] ? -1 : (m.scores[0] > m.scores[1] ? 0 : 1);
    }
    return m;
  }
  function cpuInput(r, world, level, clock, mem, random) {
    const rng = random || Math.random;
    const cfg = LEVELS[level] || LEVELS.medium;
    const out = mem || {};
    if (r.fuel <= 0) { out.rotate = out.rotate || 0; out.thrust = false; }
    if (r.status !== "fly") return { rotate: 0, thrust: false };
    const due = cfg.every <= 0 || clock >= (out.next || 0) || out.rotate === undefined;
    if (due) {
      const a = Math.max(0.3, THRUST - world.g + updraftAt(world, r));
      const v = r.vy, d = Math.max(r.y - (world.padY || 0), 0.001), safe = 1.55;
      const tBurn = (-v + Math.sqrt(Math.max(0, v * v + 2 * a * d))) / a;
      const tCoast = world.g > 0.01 ? (-v + Math.sqrt(Math.max(0, v * v + 2 * world.g * d))) / world.g : 99;
      const stop = v > safe ? (v * v - safe * safe) / (2 * a) : 0;
      const dx = padCenter(world) - r.x;
      let target = Math.abs(dx) > 0.2 ? clamp(Math.atan2(dx, Math.max(d, 2)), -0.65, 0.65) : 0;
      if (level === "impossible" && d < 12) target *= Math.max(0, (d - 3) / 9);
      target += (rng() * 2 - 1) * cfg.err;
      const diff = wrap(target - r.angle);
      out.rotate = Math.abs(diff) < 0.05 ? (Math.abs(r.omega) > 0.35 ? (r.omega > 0 ? -1 : 1) : 0) : (diff > 0 ? 1 : -1);
      let thrust = r.fuel > 0 && v > 0.35 && (d <= stop * cfg.late + (level === "impossible" ? 0.9 : 0.25) || tCoast <= tBurn * cfg.late);
      if (out.burning && v > 1.1 && r.fuel > 0) thrust = true;
      if (d < 3.4 && v > 1.15 && r.fuel > 0) thrust = true;
      if (v < 0.2 && d > 1.15) thrust = false;
      out.burning = thrust && v > 0.8;
      if (level === "easy") {
        const sec = Math.floor(clock);
        if (out.mark !== sec) { out.mark = sec; if (rng() < 0.2) out.forget = clock + 0.25; }
      }
      out.plan = thrust;
      out.next = clock + cfg.every;
    }
    if (out.forget && clock < out.forget) out.thrust = false;
    else out.thrust = r.fuel > 0 && !!out.plan;
    if (r.fuel <= 0) out.thrust = false;
    return { rotate: out.rotate || 0, thrust: !!out.thrust };
  }
  function play(worldId, level, random, seconds) {
    const game = create(worldId, random), mem = {};
    const limit = seconds || LIMIT + 1;
    while (!game.over && game.time < limit) {
      const input = cpuInput(game.rockets[0], game.world, level, game.time, mem, random);
      tick(game, [input, { rotate: 0, thrust: false }]);
    }
    return game;
  }
  window.RL = {
    STEP, THRUST, ROT, BURN, WORLD_W, PAD_X, LIMIT, SAFE_VY, SAFE_VX, WORLDS,
    create, step, tick, match, addRound, safeLanding, landingScore, cpuInput,
    updraftAt, nearPad, play, worldOf, padCenter, layout, pickFact, groundHeight
  };
})();
