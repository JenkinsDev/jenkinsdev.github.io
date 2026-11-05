/*
 * Pixel "attract mode" loops for the hub. Each scene draws one frame at time t (ms) into its
 * canvas (64×48 unless FP_SCENE_SIZES says otherwise); CSS scales it up with crisp pixels.
 * Built games show what they really look like: Higher or Lower's cards, Quick Draw's own town.
 */
(function () {
  "use strict";

  const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  function ellipse(g, cx, cy, rx, ry, col) {
    g.fillStyle = col;
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) g.fillRect(x, y, 1, 1);
  }

  // pairs taken from the game's data, shown in US units like the game's default
  const HOL_PAIRS = [
    { q: "Which is heavier?", items: [{ e: "🐻", n: ["Grizzly bear"], value: 661, unit: "lb", v: "661 lb" }, { e: "🎹", n: ["Concert grand", "piano"], value: 1060, unit: "lb", v: "1,060 lb" }], winner: 1 },
    { q: "Which is faster?", items: [{ e: "🐈", n: ["House cat"], value: 30, unit: "mph", v: "30 mph" }, { e: "🐕", n: ["Greyhound"], value: 45, unit: "mph", v: "45 mph" }], winner: 1 },
    { q: "Which is taller?", items: [{ e: "🦒", n: ["Giraffe"], value: 18, unit: "ft", v: "18 ft" }, { e: "🏀", n: ["Basketball", "hoop"], value: 10, unit: "ft", v: "10 ft" }], winner: 0 },
    { q: "Which lives longer?", items: [{ e: "🐕", n: ["Dog"], value: 12, unit: "years", v: "12 years" }, { e: "🦜", n: ["Macaw"], value: 60, unit: "years", v: "60 years" }], winner: 1 },
  ];
  const artCache = new Map();
  const emojiArt = (e) => {
    if (!window.FP) return null;
    if (!artCache.has(e)) artCache.set(e, FP.pixel.emoji(e, 24));
    return artCache.get(e);
  };

  // one shared live match for the Air Puck preview
  const puckSim = { world: null, last: 0, clock: 0, resumeAt: 0, conceded: 0, trail: [], flash: null };

  // one shared real pile for the Stack It preview, built by the Hard computer
  const stackSim = { game: null, last: 0, kind: null, phase: "aim", aimT: 0, fallT: 0, stillT: 0, aim: 0, camY: -0.3, wait: 0, placed: 0 };

  /** Canvas size per scene: the town, the cards, the rink and the pile need more pixels than the simple loops. */
  window.FP_SCENE_SIZES = { hol: [240, 180], draw: [192, 144], puck: [384, 288], stack: [192, 144] };

  window.FP_SCENES = {
    // Higher or Lower: the real round layout. Two cards, "?" on both, then the numbers
    // appear and the winner's card turns green. Cycles through pairs from the game.
    hol(g, t) {
      const W = g.canvas.width, H = g.canvas.height;
      const phase = t % 4800;
      const pair = HOL_PAIRS[Math.floor(t / 4800) % HOL_PAIRS.length];
      const revealed = phase >= 2000;
      const pressed = phase >= 1760 && !revealed;
      R(g, "#0d1226", 0, 0, W, H);
      g.imageSmoothingEnabled = false;
      const cw = (W - 24) / 2, ch = H - 34, top = 25;
      pair.items.forEach((it, i) => {
        const x = 8 + i * (cw + 8), y = top + (pressed && i === pair.winner ? 2 : 0);
        const win = revealed && i === pair.winner;
        R(g, win ? "#37e27d" : pressed && i === pair.winner ? "#ffd23f" : "#2a3150", x, y, cw, ch);
        R(g, "#070912", x + 2, y + 2, cw - 4, ch - 4);
        const art = emojiArt(it.e);
        if (art) g.drawImage(art, x + (cw - 56) / 2, y + 9, 56, 56);
        g.font = "15px VT323, monospace";
        g.textAlign = "center";
        g.fillStyle = "#e8f6ff";
        it.n.forEach((line, j) => g.fillText(line, x + cw / 2, y + 84 + j * 14));
        g.font = "19px VT323, monospace";
        g.fillStyle = win ? "#37e27d" : "#ffd23f";
        const count = Math.min(1, Math.max(0, (phase - 2000) / 550));
        const value = count === 1 ? it.v : Math.round(it.value * count).toLocaleString("en-US") + " " + it.unit;
        g.fillText(revealed ? value : "?", x + cw / 2, y + ch - 12);
      });
      g.font = "17px VT323, monospace";
      g.fillStyle = "#e8f6ff";
      g.textAlign = "center";
      g.fillText(pair.q, W / 2, 17);
    },
    // Stack It: the game's own crane, objects and physics. The computer stacks until the pile
    // falls or reaches 7 things, then starts again.
    stack(g, t) {
      if (!window.SK || !window.SKRender) return;
      const sim = stackSim;
      const next = () => { sim.kind = SKObjects.deal(sim.kind); sim.phase = "aim"; sim.aimT = 0; sim.aim = SK.aim(sim.game, "hard"); };
      if (!sim.game) { sim.game = SK.newGame(); sim.kind = null; sim.placed = 0; sim.camY = -0.3; sim.last = t; next(); }
      const dt = Math.min(0.1, Math.max(0, (t - sim.last) / 1000));
      sim.last = t;
      SK.step(sim.game, dt);
      if (sim.phase === "aim") {
        sim.aimT += dt;
        if (SK.cpuShouldDrop(sim.game, sim.kind, "hard", sim.aim, sim.aimT)) {
          const h = SK.hook(sim.game, sim.aimT);
          SK.drop(sim.game, sim.kind, h.x, SK.hangY(sim.game, sim.kind), h.vx);
          sim.phase = "fall"; sim.fallT = 0; sim.stillT = 0;
        }
      } else if (sim.phase === "fall") {
        sim.fallT += dt;
        sim.stillT = SK.settled(sim.game) ? sim.stillT + dt : 0;
        if (SK.fallen(sim.game).length) { sim.phase = "done"; sim.wait = 1.6; }
        else if (sim.fallT > 0.5 && sim.stillT > 0.3) { if (++sim.placed >= 7) { sim.phase = "done"; sim.wait = 1.6; } else next(); }
      } else if ((sim.wait -= dt) <= 0) sim.game = null;
      if (!sim.game) return;
      const view = { w: g.canvas.width, h: g.canvas.height, ppm: Math.floor(g.canvas.height / 4.6) }, kind = sim.kind; // closer than the game, so the small card reads
      const top = SK.hangY(sim.game, kind) + SKObjects.bounds(SKObjects.OBJECTS[kind]).maxY + 1.0;
      sim.camY += (Math.max(-0.3, top - view.h / view.ppm) - sim.camY) * Math.min(1, dt * 2.5);
      const held = sim.phase === "aim" ? { kind, x: SK.hook(sim.game, sim.aimT).x, y: SK.hangY(sim.game, kind) } : null;
      SKRender.paint(g, view, { game: sim.game, held, camY: sim.camY, t, line: null });
    },
    // Quick Draw: the game's own town (quick-draw/scene.js). Wait, "!", one draws, the other falls.
    // The winner alternates each loop.
    draw(g, t) {
      if (!window.QDScene) return;
      const H = g.canvas.height - 26, cycle = Math.floor(t / 4800), p = t % 4800;
      const winner = cycle % 2, shot = 2240;
      const st = QDScene.newState();
      if (p >= shot) { st.poses[winner] = "draw"; st.shotAt[winner] = cycle * 4800 + shot; }
      if (p >= shot + 140) st.poses[1 - winner] = "down";
      QDScene.paint(g, H, t, st);
      if (p >= 2000 && p < shot) {
        const cx = QDScene.W / 2, cy = 28, r = 13;
        g.fillStyle = "#ffffff"; g.beginPath(); g.arc(cx, cy, r + 2, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#ff3d3d"; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
        R(g, "#ffffff", cx - 2, cy - 8, 4, 10); R(g, "#ffffff", cx - 2, cy + 5, 4, 4);
      }
      R(g, "#0b0a10", 0, H, 192, 26);
      for (let i = 0; i < 2; i++) {
        const pressed = i === winner && p >= shot && p < shot + 450;
        const x = i * 98, y = H + 3 + (pressed ? 3 : 0);
        R(g, i ? "#153c7d" : "#801e1e", x, H + 6, 94, 20);
        R(g, i ? "#2c7bff" : "#ff3d3d", x, y, 94, 18);
        g.font = "12px Bungee, monospace";
        g.textAlign = "center"; g.fillStyle = "#ffffff";
        g.fillText("DRAW", x + 47, y + 13);
      }
    },
    // Air Puck: the real rink and physics (air-puck/physics.js + render.js), computer vs computer.
    puck(g, t) {
      if (!window.AP || !window.APRender) return;
      const sim = puckSim;
      if (!sim.world) { sim.world = AP.newWorld(); AP.serve(sim.world, 0); sim.last = t; }
      const elapsed = Math.min(0.1, Math.max(0, (t - sim.last) / 1000));
      sim.last = t;
      const w = sim.world;
      // Fixed substeps keep the match honest at 30fps and on slower iPads.
      sim.pending = (sim.pending || 0) + elapsed;
      while (sim.pending >= 1 / 120) {
        const dt = 1 / 120;
        sim.pending -= dt; sim.clock += dt;
        if (!w.puck.live && sim.clock > sim.resumeAt) AP.serve(w, sim.conceded);
        const events = AP.step(w, dt, [AP.cpuInput(w, "hard", sim.clock, Math.random, 0), AP.cpuInput(w, "medium", sim.clock, Math.random, 1)]);
        for (const e of events) if (e.type === "goal") {
          sim.conceded = 1 - e.scorer; sim.resumeAt = sim.clock + 0.8;
          sim.flash = { scorer: e.scorer, until: sim.clock + 0.6 };
        }
      }
      if (w.puck.live) { sim.trail.push({ x: w.puck.x, y: w.puck.y }); if (sim.trail.length > 8) sim.trail.shift(); } else sim.trail = [];
      const view = APRender.fit(g.canvas.width, g.canvas.height, true);
      R(g, "#0d1226", 0, 0, g.canvas.width, g.canvas.height);
      APRender.paint(g, view, w, { t: sim.clock, trail: sim.trail, flash: sim.flash });
    },
    soon(g) {
      for (let y = 0; y < 48; y++)
        for (let x = 0; x < 64; x++) {
          const v = ((x * 37 + y * 61 + (x ^ y) * 17) % 43) + 10;
          g.fillStyle = `rgb(${v},${v},${v + 12})`;
          g.fillRect(x, y, 1, 1);
        }
    },
  };
  window.FP_SCENES.puck.reset = () => {
    Object.assign(puckSim, { world: null, last: 0, clock: 0, pending: 0, resumeAt: 0, conceded: 0, trail: [], flash: null });
  };
  window.FP_SCENES.stack.reset = () => { stackSim.game = null; };
  window.FP_SCENE_STILLS = { hol: 3100, draw: 2100, puck: 0, stack: 0, soon: 0 };
})();
