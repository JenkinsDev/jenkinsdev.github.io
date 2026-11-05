/*
 * Air Puck: draws the rink, mallets and puck. Shared with the hub preview.
 *   const view = APRender.fit(canvasW, canvasH, landscape)   → mapping between table and canvas
 *   APRender.paint(ctx, view, world, { t, trail, flash })
 *   APRender.toTable(view, canvasX, canvasY)                  → { x, y } in table space (for touch / mouse)
 * Portrait: player 0 at the bottom. Landscape: player 0 on the left.
 */
(function () {
  "use strict";

  const COLORS = ["#ff3d3d", "#2c7bff"];

  function fit(cw, ch, landscape) {
    const { width: W, length: L } = AP.RINK;
    const across = landscape ? L : W, down = landscape ? W : L;
    const s = Math.min(cw / across, ch / down) * 0.92;
    return { s, landscape, cw, ch, ox: (cw - across * s) / 2, oy: (ch - down * s) / 2 };
  }

  /** Table point → canvas point. */
  function toCanvas(v, x, y) {
    const L = AP.RINK.length;
    return v.landscape ? [v.ox + (L - y) * v.s, v.oy + x * v.s] : [v.ox + x * v.s, v.oy + y * v.s];
  }

  /** Canvas point → table point. */
  function toTable(v, cx, cy) {
    const L = AP.RINK.length;
    return v.landscape ? { x: (cy - v.oy) / v.s, y: L - (cx - v.ox) / v.s } : { x: (cx - v.ox) / v.s, y: (cy - v.oy) / v.s };
  }

  /** Rounded rectangle path for the rink, in canvas space. */
  function rinkPath(g, v, inset) {
    const { width: W, length: L, corner } = AP.RINK;
    const [x0, y0] = toCanvas(v, 0, v.landscape ? L : 0);
    const w = (v.landscape ? L : W) * v.s, h = (v.landscape ? W : L) * v.s, r = corner * v.s;
    g.beginPath();
    g.roundRect(x0 + inset, y0 + inset, w - inset * 2, h - inset * 2, Math.max(0, r - inset));
  }

  function circle(g, v, x, y, r, fill) {
    const [cx, cy] = toCanvas(v, x, y);
    g.beginPath();
    g.arc(cx, cy, r * v.s, 0, Math.PI * 2);
    g.fillStyle = fill;
    g.fill();
  }

  function paint(g, v, world, opts = {}) {
    const { width: W, length: L, goal, puck: pr, mallet: mr } = AP.RINK;
    const s = v.s;
    g.clearRect(0, 0, v.cw, v.ch);

    // ice, with the air holes a real table has
    rinkPath(g, v, 0);
    g.fillStyle = "#0b2433";
    g.fill();
    g.save();
    rinkPath(g, v, 0);
    g.clip();
    g.fillStyle = "rgba(120, 210, 255, 0.10)";
    const gap = 0.05;
    for (let x = gap / 2; x < W; x += gap)
      for (let y = gap / 2; y < L; y += gap) {
        const [hx, hy] = toCanvas(v, x, y);
        g.fillRect(hx - 0.6, hy - 0.6, 1.2, 1.2);
      }
    // markings: centre line + circle, goal creases in each player's colour
    g.lineWidth = Math.max(1.5, s * 0.006);
    g.strokeStyle = "rgba(255, 61, 160, 0.7)";
    g.beginPath();
    const [a1, a2] = toCanvas(v, 0, L / 2), [b1, b2] = toCanvas(v, W, L / 2);
    g.moveTo(a1, a2); g.lineTo(b1, b2); g.stroke();
    const [cx, cy] = toCanvas(v, W / 2, L / 2);
    g.beginPath(); g.arc(cx, cy, 0.14 * s, 0, Math.PI * 2); g.stroke();
    [[L, 0], [0, 1]].forEach(([gy, i]) => {
      const [gx2, gy2] = toCanvas(v, W / 2, gy);
      g.strokeStyle = COLORS[i] + "aa";
      g.beginPath(); g.arc(gx2, gy2, 0.22 * s, 0, Math.PI * 2); g.stroke();
    });
    g.restore();

    // boards (flash in the scorer's colour after a goal)
    const flash = opts.flash && opts.t < opts.flash.until ? COLORS[opts.flash.scorer] : null;
    rinkPath(g, v, 0);
    g.lineWidth = Math.max(3, s * 0.014);
    g.strokeStyle = flash || "#00e5ff";
    g.shadowColor = flash || "#00e5ff";
    g.shadowBlur = s * 0.03;
    g.stroke();
    g.shadowBlur = 0;

    // goal mouths: dark slots cut into the boards
    [L, 0].forEach((gy) => {
      const [p1x, p1y] = toCanvas(v, W / 2 - goal / 2, gy), [p2x, p2y] = toCanvas(v, W / 2 + goal / 2, gy);
      g.lineWidth = Math.max(5, s * 0.03);
      g.strokeStyle = "#020306";
      g.beginPath(); g.moveTo(p1x, p1y); g.lineTo(p2x, p2y); g.stroke();
    });

    // puck trail, then puck
    const p = world.puck;
    if (p.live && opts.trail) {
      opts.trail.forEach((pt, i) => circle(g, v, pt.x, pt.y, pr * (0.4 + (i / opts.trail.length) * 0.5), `rgba(255,255,255,${0.04 + (i / opts.trail.length) * 0.16})`));
    }
    if (p.live) {
      g.shadowColor = "#ffffff"; g.shadowBlur = s * 0.03;
      circle(g, v, p.x, p.y, pr, "#f4f8ff");
      g.shadowBlur = 0;
      circle(g, v, p.x, p.y, pr * 0.55, "#c9d6e6");
    }

    // mallets: rim, body, handle
    world.mallets.forEach((m, i) => {
      g.shadowColor = COLORS[i]; g.shadowBlur = s * 0.04;
      circle(g, v, m.x, m.y, mr, COLORS[i]);
      g.shadowBlur = 0;
      circle(g, v, m.x, m.y, mr * 0.72, i === 0 ? "#b81f1f" : "#1a4fb0");
      circle(g, v, m.x, m.y, mr * 0.38, i === 0 ? "#ff8a8a" : "#8ab8ff");
      circle(g, v, m.x - mr * 0.12, m.y - mr * 0.12, mr * 0.14, "rgba(255,255,255,0.7)");
    });
  }

  window.APRender = { fit, paint, toTable, toCanvas, COLORS };
})();
