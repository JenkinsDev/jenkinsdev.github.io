/*
 * Stack It drawing. The canvas is low resolution (about one art pixel per 3 CSS pixels) and scaled up with
 * crisp pixels, so rotated objects stay chunky pixel art. Objects become sprites once per size, painted from
 * the same outlines the physics uses (objects.js), with a dark 1-pixel outline.
 *
 *   SKRender.fit(width, height)                 → view { w, h, ppm } for a canvas of that many pixels
 *   SKRender.paint(g, view, scene)              scene: { game, held: { kind, x, y } | null, camY, t, line: { height, colour } | null }
 *   SKRender.sprite(kind, ppm)                  → { canvas, ox, oy } (the hub preview reuses these)
 */
(function () {
  "use strict";

  const { OBJECTS, bounds } = window.SKObjects;
  const VIEW = { width: 5.4, height: 7.2 }; // metres that must fit on screen
  const OUTLINE = "#0b0a10";

  function fit(w, h) {
    const ppm = Math.max(12, Math.floor(Math.min(w / VIEW.width, h / VIEW.height)));
    return { w, h, ppm };
  }

  // ---------- sprites ----------
  const rgba = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = hex.length === 4 ? [(n >> 8) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17] : [n >> 16, (n >> 8) & 255, n & 255];
    return (255 << 24) | (b << 16) | (g << 8) | r;
  };
  const cache = new Map();

  function sprite(kind, ppm) {
    const key = kind + "@" + ppm;
    if (cache.has(key)) return cache.get(key);
    const obj = OBJECTS[kind], b = bounds(obj);
    const art = { minX: b.minX - 0.12, maxX: b.maxX + 0.12, minY: b.minY - 0.12, maxY: b.maxY + 0.12 }; // room for ears, stems…
    const W = Math.ceil((art.maxX - art.minX) * ppm) + 2, H = Math.ceil((art.maxY - art.minY) * ppm) + 2;
    const px = new Uint32Array(W * H);
    const at = (i, j) => [art.minX + (i - 0.5) / ppm, art.maxY - (j - 0.5) / ppm]; // pixel centre → local metres
    const fill = (x0, y0, x1, y1, test, colour) => {
      const c = rgba(colour);
      const i0 = Math.max(0, Math.floor((x0 - art.minX) * ppm)), i1 = Math.min(W - 1, Math.ceil((x1 - art.minX) * ppm) + 1);
      const j0 = Math.max(0, Math.floor((art.maxY - y1) * ppm)), j1 = Math.min(H - 1, Math.ceil((art.maxY - y0) * ppm) + 1);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const [x, y] = at(i, j); if (test(x, y)) px[j * W + i] = c; }
    };
    obj.art({
      rect: (x, y, w, h, c) => fill(x, y, x + w, y + h, (px_, py) => px_ >= x && px_ < x + w && py >= y && py < y + h, c),
      oval: (cx, cy, rx, ry, c) => fill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, c),
      poly: (pts, c) => {
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        fill(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y) => {
          let inside = false;
          for (let k = 0, l = pts.length - 1; k < pts.length; l = k++) {
            const [xi, yi] = pts[k], [xj, yj] = pts[l];
            if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
          }
          return inside;
        }, c);
      },
    });
    // dark outline around the silhouette
    const edge = rgba(OUTLINE), solid = px.slice();
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (solid[j * W + i]) continue;
      if ((i > 0 && solid[j * W + i - 1]) || (i < W - 1 && solid[j * W + i + 1]) || (j > 0 && solid[(j - 1) * W + i]) || (j < H - 1 && solid[(j + 1) * W + i])) px[j * W + i] = edge;
    }
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const img = new ImageData(new Uint8ClampedArray(px.buffer), W, H);
    canvas.getContext("2d").putImageData(img, 0, 0);
    const s = { canvas, ox: -art.minX * ppm + 1, oy: art.maxY * ppm + 1 };
    cache.set(key, s);
    return s;
  }

  // ---------- scene ----------
  const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const SKY = ["#1a0b2e", "#24103f", "#2f1450", "#3d1a5e", "#52206a", "#6b2a72"];

  function paint(g, view, scene) {
    const { w, h, ppm } = view, { game, camY } = scene;
    const sx = (x) => w / 2 + x * ppm, sy = (y) => h - (y - camY) * ppm;
    g.imageSmoothingEnabled = false;

    // sky: bands that warm towards the horizon, then stars that drift slowly with the camera
    const horizon = sy(0);
    SKY.forEach((c, i) => R(g, c, 0, horizon - (SKY.length - i) * 0.9 * ppm, w, 0.9 * ppm + 1));
    R(g, SKY[0], 0, 0, w, Math.max(0, horizon - SKY.length * 0.9 * ppm));
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % w, y = ((i * 53 + camY * ppm * 0.3) % (h * 1.2)) - h * 0.1;
      if (y < horizon - 3 * ppm) R(g, i % 7 ? "#5b4a8a" : "#ffe9a8", x, y, 1, 1);
    }
    // far skyline
    for (let i = 0, x = 0; x < w; i++) {
      const bw = (2 + ((i * 7) % 4)) * ppm * 0.35, bh = (1 + ((i * 5) % 6) * 0.45) * ppm;
      R(g, "#1d0f33", x, horizon - bh, bw, bh);
      if ((i * 3) % 4 === 0) R(g, "#ffd23f", x + bw / 3, horizon - bh + ppm * 0.3, 1, 1);
      x += bw;
    }
    R(g, "#120a20", 0, horizon, w, h); // ground

    // plinth: stone block with a lit top edge
    const P = SK.PLINTH, px0 = sx(-P.width / 2), pw = P.width * ppm, ptop = sy(P.top);
    R(g, "#6d628c", px0, ptop, pw, horizon - ptop);
    R(g, "#8a7fa8", px0, ptop, pw, Math.max(2, ppm * 0.12));
    R(g, "#544a72", px0 + pw - ppm * 0.15, ptop, ppm * 0.15, horizon - ptop);
    for (let k = 1; k < 3; k++) R(g, "#544a72", px0, ptop + (k * (horizon - ptop)) / 3, pw, 1);

    // a height to reach (your best, or the other player's pile): a dashed line across the screen
    if (scene.line) {
      const y = sy(P.top + scene.line.height);
      for (let x = 0; x < w; x += 6) R(g, scene.line.colour, x, y, 3, 1);
    }

    // the pile
    for (const b of game.bodies) drawObject(g, b.getUserData().kind, sx(b.getPosition().x), sy(b.getPosition().y), b.getAngle(), ppm);

    // crane: a girder along the top of the screen, a trolley over the hook, the cable and the held object
    R(g, "#c99a12", 0, 0, w, Math.max(4, ppm * 0.3));
    for (let x = 4; x < w; x += 8) R(g, "#8a6608", x, 1, 1, Math.max(2, ppm * 0.3) - 2);
    if (scene.held) {
      const { kind, x, y } = scene.held, b = bounds(OBJECTS[kind]);
      const hx = sx(x), top = sy(y + b.maxY);
      R(g, "#ffd23f", hx - ppm * 0.3, 0, ppm * 0.6, Math.max(5, ppm * 0.42));
      R(g, "#2a2d36", hx, Math.max(5, ppm * 0.42), 1, top - ppm * 0.18 - Math.max(5, ppm * 0.42));
      R(g, "#ffd23f", hx - ppm * 0.12, top - ppm * 0.18, ppm * 0.24, ppm * 0.12);
      R(g, "#ffd23f", hx - ppm * 0.12, top - ppm * 0.08, 1, ppm * 0.08);
      R(g, "#ffd23f", hx + ppm * 0.12 - 1, top - ppm * 0.08, 1, ppm * 0.08);
      drawObject(g, kind, hx, sy(y), 0, ppm);
    }
  }

  function drawObject(g, kind, x, y, angle, ppm) {
    const s = sprite(kind, ppm);
    g.save();
    g.translate(Math.round(x), Math.round(y));
    g.rotate(-angle);
    g.drawImage(s.canvas, -Math.round(s.ox), -Math.round(s.oy));
    g.restore();
  }

  window.SKRender = { fit, paint, sprite, VIEW };
})();
