(function () {
  "use strict";
  const COLORS = ["#ff3d3d", "#2c7bff"];
  const SKY = { moon: "#0a1024", mars: "#2b140e", earth: "#071428", pluto: "#0b0c18", jupiter: "#24160a" };
  const GROUND = { moon: "#8b93a0", mars: "#b5532d", earth: "#2f6a3c", pluto: "#cbb892", jupiter: "#d9a15a" };
  const DARK = { moon: "#5c6574", mars: "#7a3018", earth: "#1d4527", pluto: "#8a7a5c", jupiter: "#a56a2c" };
  function r(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
  function stars(g, w, h, world, still, seed, camX, camB, ppm, t) {
    let s = (seed || 1) % 2147483646 || (world === "mars" ? 11 : world === "earth" ? 23 : 41);
    const rand = () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
    const period = 36;
    const base = Math.floor(camB / period) * period;
    for (let i = 0; i < 56; i++) {
      const wx = rand() * 22 - 2, wy0 = rand() * period, layer = 0.45 + (i % 3) * 0.25;
      for (let k = -1; k <= 3; k++) {
        const wy = wy0 + base + k * period;
        const x = (wx - camX * layer) * ppm, y = h - (wy - camB) * ppm * layer;
        if (x < -2 || x > w || y < -2 || y > h) continue;
        const tw = still ? 1 : (i % 7 === 0 ? 2 : 1);
        r(g, x, y, tw, tw, i % 5 ? "#dce6ff" : "#fff4c8");
      }
    }
    if (world === "earth" || world === "jupiter") {
      const col = world === "earth" ? "#c5d4ee" : "#f0d4a8";
      for (let i = 0; i < 4; i++) {
        const wx = rand() * 28, wy = 8 + rand() * 14;
        const x = (wx - camX * 0.55) * ppm, y = h - (wy - camB) * ppm * 0.55;
        const cw = (2.2 + rand() * 1.6) * ppm, ch = (0.9 + rand() * 0.5) * ppm;
        r(g, x, y, cw, ch, col);
        r(g, x + cw * 0.25, y - ch * 0.45, cw * 0.5, ch * 0.7, col);
      }
    }
  }
  function altitude(g, ppm, camB, w, h) {
    const top = camB + h / ppm;
    const step = top > 50 ? 20 : top > 28 ? 10 : 5;
    const start = Math.max(0, Math.floor(camB / step) * step);
    const end = Math.ceil(top / step) * step;
    g.font = "22px VT323, monospace";
    g.textAlign = "left";
    g.fillStyle = "#d6e7ff";
    for (let m = start; m <= end; m += step) {
      const y = h - (m - camB) * ppm;
      if (y < 16 || y > h - 12) continue;
      r(g, 8, y - 1, m === 0 ? 26 : 18, 4, m === 0 ? "#ffe38a" : "#9ec7ff");
      g.fillText(m === 0 ? "PAD" : m + "m", 32, y + 7);
    }
  }
  function speedLines(g, rocket, still, t) {
    if (still || rocket.status !== "fly") return;
    const spd = Math.max(0, rocket.vy);
    if (spd < 0.35) return;
    const n = 5 + Math.min(8, Math.floor(spd));
    for (let i = 0; i < n; i++) {
      const x = ((i * 13 + Math.floor(t * 18)) % 40) - 20;
      const y = 10 + ((i * 11 + Math.floor(t * (10 + spd * 8))) % 36);
      r(g, x, y, 1, 5 + spd, i % 2 ? "#c5d4ee" : "#8aa0c8");
    }
  }
  function ground(g, world, ppm, camX, camB, vw, vh) {
    const gy = vh - (0 - camB) * ppm;
    const id = world.id;
    let s = world.seed || 99;
    const rand = () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
    if (id === "jupiter") {
      const shift = Math.floor(rand() * 6);
      for (let i = 0; i < 8; i++) r(g, 0, gy - 18 + i * 10, vw, 10, (i + shift) % 2 ? "#c4843c" : "#e8c070");
      r(g, 0, gy + 8, vw, vh, "#7a4a18");
    } else {
      r(g, 0, gy, vw, vh, GROUND[id]);
      r(g, 0, gy, vw, 3, DARK[id]);
      for (let i = 0; i < 10; i++) {
        const cx = (rand() * 28 - camX) * ppm;
        r(g, cx, gy + 6 + rand() * 18, 10 + rand() * 16, 5 + rand() * 7, DARK[id]);
      }
      if (id === "earth") {
        r(g, 0, gy - 0.7 * ppm, vw, 0.7 * ppm, "#1e4d6c");
      }
    }
    (world.bumps || []).forEach((b) => {
      const x = (b.x - b.w / 2 - camX) * ppm, y = gy - b.h * ppm, w = b.w * ppm, h = b.h * ppm;
      r(g, x, y, w, h + 2, DARK[id] || "#a56a2c");
      r(g, x + 2, y, Math.max(2, w - 4), 2, GROUND[id] || "#e8c070");
    });
    return gy;
  }
  const PAD = {
    moon: { deck: "#d5dce4", edge: "#6a7380", stripe: "#ffd23f", alt: "#2a2d38", light: "#ffe38a", dim: "#6b5a28", leg: "#5c6574" },
    mars: { deck: "#e08a52", edge: "#7a3018", stripe: "#fff4e4", alt: "#6b2410", light: "#ffb347", dim: "#7a4a18", leg: "#8a3a20" },
    earth: { deck: "#9db4c4", edge: "#2f4a5c", stripe: "#ffffff", alt: "#2c7bff", light: "#7dffb0", dim: "#2a5a40", leg: "#4a5c68" },
    pluto: { deck: "#efe4c8", edge: "#8a7a5c", stripe: "#9ee7ff", alt: "#4a5a68", light: "#c8f4ff", dim: "#4a6878", leg: "#9a8a6c" },
    jupiter: { deck: "#f7f0e0", edge: "#c4b494", stripe: "#e8c070", alt: "#8a5a28", light: "#ffe38a", dim: "#8a6a30", leg: "#d4c4a0" }
  };
  function pad(g, world, ppm, camX, camB, vh, time, still) {
    const half = world.pad / 2, padY = world.padY || 0, shelf = world.shelf || 0.28;
    const y = vh - (padY - camB) * ppm, gy = vh - (0 - camB) * ppm;
    const px = world.padX ?? ((window.RL && RL.PAD_X) || 14), x = (px - half - camX) * ppm, w = world.pad * ppm;
    const pal = PAD[world.id] || PAD.moon;
    const sx = (px - half - shelf - camX) * ppm, sw = (world.pad + shelf * 2) * ppm;
    r(g, sx, y + 2, sw, Math.max(4, gy - y + 2), DARK[world.id] || pal.leg);
    r(g, sx, y + 2, sw, 3, pal.edge);
    const legW = Math.max(2, Math.round(0.1 * ppm)), legH = Math.max(4, Math.round(0.28 * ppm));
    [0.22, 0.78].forEach((f) => {
      const lx = x + w * f - legW / 2;
      r(g, lx, y + 2, legW, legH, pal.leg);
    });
    const dh = Math.max(5, Math.round(0.28 * ppm));
    r(g, x - 2, y - 1, w + 4, dh + 2, pal.edge);
    r(g, x, y - 3, w, dh, pal.deck);
    r(g, x + 3, y - 1, w - 6, 2, pal.stripe);
    r(g, x + w / 2 - 2, y - 3, 4, dh, pal.alt);
    const blink = world.padLook && world.padLook.blink || 0;
    [x + 3, x + w - 7].forEach((lx, i) => {
      const on = still || (Math.floor((time || 0) * 5 + i + blink) % 2 === 0);
      r(g, lx, y - 6, 4, 4, on ? pal.light : pal.dim);
    });
  }
  function ship(g, rocket, color, label, still, t) {
    g.save();
    g.translate(0, 0);
    if (rocket.status === "crash") {
      g.rotate(0.95);
      g.translate(0, 4);
    }
    g.rotate(rocket.angle);
    g.scale(2, 2);
    const body = rocket.status === "crash" ? "#6d645c" : color;
    r(g, -3, -11, 6, 14, body);
    r(g, -2, -14, 4, 4, "#f2f4f8");
    r(g, -1, -16, 2, 3, "#f2f4f8");
    r(g, -4, -6, 2, 8, "#2a2d38");
    r(g, 2, -6, 2, 8, "#2a2d38");
    r(g, -6, 2, 3, 2, "#c5ccd6");
    r(g, 3, 2, 3, 2, "#c5ccd6");
    r(g, -1, 3, 2, 3, "#c5ccd6");
    r(g, -7, 3, 2, 3, "#8a909c");
    r(g, 5, 3, 2, 3, "#8a909c");
    r(g, -2, 5, 1, 3, "#8a909c");
    r(g, 1, 5, 1, 3, "#8a909c");
    if (rocket.status === "crash") {
      r(g, -5, -4, 10, 6, "#3a3530");
      r(g, -2, -8, 3, 2, "#1a1816");
    } else {
      r(g, -1, -8, 2, 2, "#120f1f");
      r(g, -3, 0, 6, 2, "#120f1f");
    }
    if (rocket.thrust && rocket.status === "fly" && !still) {
      const f = Math.floor(t * 14) % 2;
      r(g, -2, 7, 4, 4 + f * 3, "#ffb347");
      r(g, -1, 8, 2, 5 + f * 4, "#fff3a0");
    }
    g.restore();
    g.font = "11px Silkscreen, sans-serif";
    g.textAlign = "center";
    g.fillStyle = color;
    g.fillText(label, 0, -36);
  }
  function soot(g, still, t) {
    if (still) return;
    for (let i = 0; i < 8; i++) {
      const a = t * 1.4 + i;
      r(g, Math.cos(a) * (6 + i), -2 - (t * 8 + i) % 16, 2, 2, i % 2 ? "#4a4540" : "#2c2a28");
    }
  }
  function fireball(g, x, y, size, heat) {
    const s = Math.max(3, Math.round(size));
    const hot = heat == null ? 1 : heat;
    r(g, x - s, y - s + 2, s * 2, s * 2 - 4, hot > 0.45 ? "#e24a12" : "#c43d18");
    r(g, x - s + 2, y - s, s * 2 - 4, s * 2, hot > 0.45 ? "#e24a12" : "#c43d18");
    r(g, x - s + 2, y - s + 2, s * 2 - 4, s * 2 - 4, hot > 0.7 ? "#ff9a2a" : "#e56b1c");
    const core = Math.max(2, Math.round(s * (0.45 + hot * 0.35)));
    r(g, x - core / 2, y - core / 2, core, core, hot > 0.55 ? "#ffe566" : "#ffb347");
    if (hot > 0.75 && s > 4) r(g, x - 1, y - 2, 3, 3, "#fffce8");
  }
  function explode(g, rocket, still) {
    const t = still ? 0.42 : (rocket.boom || 0);
    if (t > 1.75) return;
    const gvt = 210;
    if (t < 0.1) r(g, -14, -14, 28, 28, "#fffce8");
    const n = 10;
    for (let i = 0; i < n; i++) {
      const delay = i * 0.018;
      const age = Math.max(0, t - delay);
      if (age <= 0) continue;
      const life = 0.85 + (i % 4) * 0.22;
      const u = age / life;
      if (u > 1.15) continue;
      const a = (i / n) * Math.PI * 2 + 0.22;
      const spd = 70 + (i % 4) * 22;
      const vx = Math.cos(a) * spd;
      const vy0 = Math.sin(a) * 38 - 95;
      const flicker = still ? 1 : (((Math.floor(t * 26) + i * 3) % 3) === 0 ? 1.18 : 0.84);
      const punch = u < 0.12 ? 1.35 : 1;
      const grow = u < 0.18 ? u / 0.18 : Math.max(0.15, 1 - (u - 0.18) * 0.95);
      const heat = Math.max(0.25, 1.05 - u * 0.7);
      const pos = (ta) => ({ x: vx * ta, y: vy0 * ta + 0.5 * gvt * ta * ta });
      for (let k = 4; k >= 1; k--) {
        const ta = Math.max(0, age - k * 0.035);
        if (ta <= 0 || still) continue;
        const p = pos(ta);
        fireball(g, p.x, p.y, (6 + (i % 3) * 2) * grow * punch * (1 - k * 0.18), heat * (1 - k * 0.2));
      }
      const p = pos(age);
      fireball(g, p.x, p.y, (10 + (i % 3) * 3) * grow * punch * flicker, heat);
    }
    const center = Math.max(0, 1 - t * 1.1);
    if (center > 0) fireball(g, 0, -6 - t * 8, 14 * (0.7 + center * 0.6), 1);
    if (t >= 0.08 && t <= 1.15) {
      const pop = t < 0.16 ? 0.75 + t * 3 : t < 0.28 ? 1.2 : Math.max(0.85, 1.2 - (t - 0.28));
      g.save();
      g.rotate(-0.1);
      g.scale(pop, pop);
      g.font = "bold 22px Bungee, sans-serif";
      g.textAlign = "center";
      g.lineWidth = 5;
      g.strokeStyle = "#1a1020";
      g.fillStyle = "#ffe566";
      g.strokeText("BOOM!", 0, -36);
      g.fillText("BOOM!", 0, -36);
      g.restore();
    }
  }

  function padCue(world, camX, camB, viewWm, viewHm) {
    const half = ((world && world.pad) || 2) / 2;
    const px = world && world.padX != null ? world.padX : ((window.RL && RL.PAD_X) || 14);
    const padY = (world && world.padY) || 0;
    const padLeft = px - half, padRight = px + half;
    const padBottom = padY - 0.05, padTop = padY + 0.4;
    const hitX = padRight > camX && padLeft < camX + viewWm;
    const hitY = padTop > camB && padBottom < camB + viewHm;
    if (hitX && hitY) return null;
    const below = padTop <= camB;
    const left = padRight <= camX;
    const right = padLeft >= camX + viewWm;
    let dir = "";
    if (below && left) dir = "down-left";
    else if (below && right) dir = "down-right";
    else if (below) dir = "down";
    else if (left) dir = "left";
    else if (right) dir = "right";
    else return null;
    const gapX = left ? camX - padRight : right ? padLeft - (camX + viewWm) : 0;
    const gapY = below ? camB - padTop : 0;
    return { dir, padX: px, dist: Math.max(1, Math.round(Math.hypot(gapX, gapY))) };
  }
  function drawPadCue(g, w, h, cue, camX, ppm, still, t) {
    if (!cue || !cue.dir) return;
    const rot = { down: 0, "down-left": Math.PI / 4, "down-right": -Math.PI / 4, left: Math.PI / 2, right: -Math.PI / 2 }[cue.dir];
    if (rot == null) return;
    const pulse = still ? 1 : 1 + Math.sin((t || 0) * 7) * 0.07;
    const x = Math.max(52, Math.min(w - 52, (cue.padX - camX) * ppm));
    const y = h - 66;
    g.save();
    g.translate(x, y);
    g.scale(pulse, pulse);
    r(g, -50, -58, 100, 80, "#1a1408");
    r(g, -46, -54, 92, 72, "#ffe38a");
    r(g, -42, -50, 84, 64, "#2a1c08");
    g.fillStyle = "#fff4c8";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "700 14px VT323, Bungee, sans-serif";
    g.fillText("PAD", 0, cue.dist ? -36 : -16);
    if (cue.dist) {
      g.font = "700 30px VT323, Bungee, sans-serif";
      g.fillText(cue.dist + "m", 0, -8);
    }
    g.save();
    g.translate(0, 46);
    g.rotate(rot);
    g.fillStyle = "#ffe38a";
    g.beginPath();
    g.moveTo(0, 10); g.lineTo(-12, -2); g.lineTo(12, -2);
    g.moveTo(0, 2); g.lineTo(-12, -10); g.lineTo(12, -10);
    g.fill();
    g.restore();
    g.restore();
  }
  function paint(g, game, view) {
    const w = view.w || g.canvas.width, h = view.h || g.canvas.height;
    g.save();
    if (view.x || view.y) { g.beginPath(); g.rect(view.x || 0, view.y || 0, w, h); g.clip(); g.translate(view.x || 0, view.y || 0); }
    g.imageSmoothingEnabled = false;
    const world = game.world, follow = game.rockets[view.follow || 0];
    const high = follow.y > 11;
    const span = high ? 12 : Math.max(9, follow.y + 4);
    const ppm = Math.max(6, Math.min(w / 13, h / span));
    const viewWm = w / ppm, viewHm = h / ppm;
    const WW = world.width || (window.RL && RL.WORLD_W) || 28;
    const camX = viewWm >= WW ? (WW - viewWm) / 2 : Math.max(0, Math.min(WW - viewWm, follow.x - viewWm / 2));
    let camB = high ? follow.y - viewHm * 0.42 : -1.7;
    if (!high && follow.y < viewHm * 0.62) camB = Math.min(-1.7, follow.y - viewHm * 0.55);
    if (!high) camB = Math.max(-2.2, camB);
    r(g, 0, 0, w, h, SKY[world.id] || SKY.moon);
    stars(g, w, h, world.id, view.still, world.seed, camX, camB, ppm, view.time || 0);
    ground(g, world, ppm, camX, camB, w, h);
    pad(g, world, ppm, camX, camB, h, view.time || 0, view.still);
    altitude(g, ppm, camB, w, h);
    const labels = view.labels || ["P1", "P2"];
    const order = view.follow === 1 ? [0, 1] : [1, 0];
    order.forEach((i) => {
      const rk = game.rockets[i];
      const sx = (rk.x - camX) * ppm, sy = h - (rk.y - camB) * ppm;
      g.save(); g.translate(sx, sy);
      if (i === (view.follow || 0)) speedLines(g, rk, view.still, view.time || 0);
      if (rk.status === "crash") {
        explode(g, rk, view.still);
        soot(g, view.still, view.time || 0);
      }
      ship(g, rk, COLORS[i], labels[i], view.still, view.time || 0);
      g.restore();
    });
    drawPadCue(g, w, h, padCue(world, camX, camB, viewWm, viewHm), camX, ppm, view.still, view.time || 0);
    g.restore();
  }
  window.RLRender = { paint, padCue, colors: COLORS };
})();
