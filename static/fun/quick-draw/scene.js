/*
 * Quick Draw: the pixel-art town at sunset, drawn at low resolution and scaled up crisp.
 *   QDScene(canvas) → { start(), stop(), pose(i, "idle" | "draw" | "down"), shoot(i), reset(), setBandanas([c0, c1]) }
 *   QDScene.paint(ctx, height, t, state)  draws one frame into a W×height canvas (the hub's preview uses this too)
 * Player 0 stands on the left facing right, player 1 on the right facing left.
 */
(function () {
  "use strict";

  const W = 192; // logical width; height follows the canvas's shape so the scene always fills it

  // 14×21 cowboy facing right (rows run longer when the arm and gun are out).
  // H hat, h hat band, S skin, s skin shade, E eye, B neckerchief, b its shaded tip, W shirt, V vest,
  // L belt, Y buckle, O holster, G gun metal, g gun dark/grip, P trousers, p trouser shade, K boots, k soles
  const IDLE = [
    "......HH......",
    ".....HHHH.....",
    ".....hhhh.....",
    "...HHHHHHHH...",
    "......SSS.....",
    "......SSE.....",
    ".....sSSS.....",
    "......BBB.....",
    "....WVBBBVW...",
    "....WVVbVVW...",
    "....WVVVVVW...",
    "....SVVVVVS...",
    ".....LLYLLg...",
    ".....PPPPOg...",
    ".....PP.PO....",
    ".....PP.PP....",
    ".....PP.PP....",
    ".....pP.pP....",
    ".....PP.PP....",
    ".....KK.KK....",
    "....KKKkKKKk..",
  ];
  // drawing: right arm straight out, revolver level (hammer, cylinder, barrel), holster empty
  const DRAW = IDLE.slice();
  DRAW[8] = "....WVBBBVWWWSgGGGGG";
  DRAW[9] = "....WVVbVVW..SgGg...";
  DRAW[10] = "....WVVVVVW...gg....";
  DRAW[11] = "....SVVVVV....";
  DRAW[12] = ".....LLYLL....";
  DRAW[13] = ".....PPPPO....";
  const SPRITE_W = 14;
  const SPRITE_H = IDLE.length;
  const GUN_ROW = 8;
  const COLORS = {
    H: "#3a2214", h: "#8a5a30", S: "#d9a066", s: "#b07a4a", E: "#1e1410", W: "#d8c8a0", V: "#5a3a28",
    L: "#1e1410", Y: "#e0b040", O: "#6b4228", G: "#b4afa8", g: "#4a4744", P: "#2f3550", p: "#252a40", K: "#3a2214", k: "#1e1410",
  };
  const shade = (hex, f) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("");

  // 3×5 pixel letters for the shop signs
  const FONT = {
    S: ["111", "100", "111", "001", "111"], A: ["010", "101", "111", "101", "101"], L: ["100", "100", "100", "100", "111"],
    O: ["111", "101", "101", "101", "111"], N: ["101", "111", "111", "101", "101"], H: ["101", "101", "111", "101", "101"],
    E: ["111", "100", "111", "100", "111"], R: ["110", "101", "110", "101", "101"], I: ["111", "010", "010", "010", "111"],
    F: ["111", "100", "110", "100", "100"],
  };

  const newState = () => ({ poses: ["idle", "idle"], shotAt: [-1e9, -1e9], bandanas: ["#ff3d3d", "#2c7bff"] });

  /** Draw one frame of the town into ctx (canvas W wide, H tall) at time t. */
  function paint(g, H, t, st) {
    const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    const horizon = Math.round(H * 0.6);
    const scale = Math.max(1, Math.round(H / 60));

    // sky, with dithered seams between the bands, and the sun sitting on the horizon
    const bands = ["#d9432e", "#ea5a2c", "#f7742f", "#ff8f38", "#ffaa45", "#ffc457", "#ffdc78"];
    const bh = horizon / bands.length;
    bands.forEach((c, i) => {
      px(0, i * bh, W, Math.ceil(bh) + 1, c);
      if (i) for (let x = i % 2; x < W; x += 2) px(x, i * bh, 1, 1, bands[i - 1]);
    });
    const r = Math.round(horizon * 0.28);
    for (let y = -r; y <= 0; y++) {
      const half = Math.round(Math.sqrt(r * r - y * y));
      px(W / 2 - half - 2, horizon + y, half * 2 + 4, 1, "#ffe79a");
      px(W / 2 - half, horizon + y, half * 2, 1, "#fff6c4");
    }

    // distant mesas and the street
    const mesa = (x, w, h) => { px(x + 3, horizon - h, w - 6, h, "#b8452a"); px(x, horizon - h + 3, w, h - 3, "#b8452a"); };
    mesa(10, 34, 9); mesa(W - 58, 46, 12); mesa(W * 0.42, 22, 5);
    px(0, horizon, W, H - horizon, "#8a5a35");
    for (let y = horizon + 2; y < H; y += 3) for (let x = y % 6; x < W; x += 9) px(x, y, 2, 1, "#9d6a40");
    px(0, horizon, W, 1, "#6b4228");

    // water tower behind the sheriff's office
    const bhgt = Math.max(26, Math.round(horizon * 0.44));
    const tx = W - 32, ty = horizon - bhgt - 14;
    px(tx, ty + 9, 1, bhgt + 6, "#3a1d12"); px(tx + 11, ty + 9, 1, bhgt + 6, "#3a1d12"); px(tx, ty + 16, 12, 1, "#3a1d12");
    px(tx - 2, ty + 1, 16, 8, "#5a2f1c"); px(tx - 2, ty + 3, 16, 1, "#3a1d12"); px(tx - 2, ty + 6, 16, 1, "#3a1d12");
    px(tx - 3, ty - 1, 18, 2, "#2a140c"); px(tx + 1, ty - 3, 10, 2, "#2a140c");

    const text = (word, x, y, c) => {
      [...word].forEach((ch, n) => FONT[ch].forEach((row, ry) => [...row].forEach((on, rx) => {
        if (on === "1") px(x + n * 4 + rx, y + ry, 1, 1, c);
      })));
    };
    const building = (x, w, h, word, saloon) => {
      const top = horizon - h;
      const wall = "#6b3a22", plank = "#5a2f1c", trim = "#8a5030", dark = "#2a140c";
      px(x, top + 7, w, h - 7, wall); // body
      px(x + 2, top, w - 4, 8, wall); // false front
      px(x + 2, top, w - 4, 1, trim); px(x, top + 7, w, 1, trim); // caps
      for (let y = top + 10; y < horizon - 2; y += 3) px(x, y, w, 1, plank); // planks
      // sign with real lettering
      const tw = word.length * 4 - 1;
      const sx = Math.round(x + (w - tw) / 2);
      px(sx - 2, top + 1, tw + 4, 7, "#d8b070"); px(sx - 1, top + 2, tw + 2, 5, "#f0d49a");
      text(word, sx, top + 2, "#3a1d12");
      // upstairs windows: frame, warm light, cross bar
      const winY = top + 10;
      [x + 5, x + w - 12].forEach((wx) => {
        px(wx - 1, winY - 1, 9, 6, dark); px(wx, winY, 7, 4, "#ffcf6a"); px(wx + 3, winY, 1, 4, dark); px(wx, winY + 2, 7, 1, dark);
      });
      // porch roof on posts over the boardwalk
      const porch = horizon - 11;
      px(x - 2, porch, w + 4, 2, "#4a2416"); px(x - 2, porch + 2, w + 4, 1, dark);
      px(x, porch + 3, 1, 8, "#3a1d12"); px(x + w - 1, porch + 3, 1, 8, "#3a1d12");
      // door
      const dx = x + Math.round(w / 2) - 4;
      if (saloon) { // batwing doors with a gap, dark room behind
        px(dx, horizon - 9, 8, 7, dark);
        px(dx, horizon - 8, 3, 4, "#c9894a"); px(dx + 5, horizon - 8, 3, 4, "#c9894a");
        px(dx, horizon - 8, 3, 1, "#e0a868"); px(dx + 5, horizon - 8, 3, 1, "#e0a868");
      } else { // solid door with a small window, and a lantern by it
        px(dx, horizon - 9, 8, 7, "#4a2416"); px(dx + 2, horizon - 8, 4, 2, "#ffcf6a"); px(dx + 6, horizon - 5, 1, 1, "#e0b040");
        px(dx + 10, porch + 3, 2, 3, "#ffcf6a");
      }
      px(x - 3, horizon - 2, w + 6, 2, "#8a5a35"); px(x - 3, horizon - 2, w + 6, 1, "#a06a40"); // boardwalk
    };
    building(3, 46, bhgt, "SALOON", true);
    building(W - 49, 44, bhgt - 4, "SHERIFF", false);

    // the two cowboys, standing back up the street (feet about two-thirds of the way down from the horizon)
    const ground = Math.round(horizon + (H - horizon) * 0.66);
    for (let i = 0; i < 2; i++) {
      const pose = st.poses[i];
      const flip = i === 1;
      const colors = Object.assign({}, COLORS, { B: st.bandanas[i], b: shade(st.bandanas[i], 0.6) });
      const baseX = Math.round(W * (i === 0 ? 0.3 : 0.7));
      const left = baseX - (SPRITE_W / 2) * scale; // sprite's left edge when facing right
      // a sprite column → screen x (mirrored for the cowboy on the right)
      const colX = (cx) => (flip ? baseX + (SPRITE_W / 2 - 1 - cx) * scale : left + cx * scale);
      if (pose === "down") { // lying on the ground, head away from the other cowboy, gun dropped
        for (let y = 0; y < SPRITE_H; y++)
          for (let x = 0; x < SPRITE_W; x++) {
            const c = IDLE[y][x];
            if (c === "." || c === "g" || c === "G") continue;
            const lx = flip ? SPRITE_H - 1 - y : y;
            px(baseX - (SPRITE_H / 2) * scale + lx * scale, ground - (SPRITE_W - 3) * scale + x * scale, scale, scale, colors[c]);
          }
        continue;
      }
      px(left, ground, SPRITE_W * scale, scale, "rgba(70, 30, 12, 0.45)"); // shadow
      const rows = pose === "draw" ? DRAW : IDLE;
      const top = ground - SPRITE_H * scale;
      for (let y = 0; y < rows.length; y++)
        for (let x = 0; x < rows[y].length; x++) {
          const c = rows[y][x];
          if (c !== ".") px(colX(x), top + y * scale, scale, scale, colors[c]);
        }
      if (Math.floor(t / 450) % 2) px(colX(5), top + 7 * scale, scale, scale, colors.B); // neckerchief flutters behind the neck
      const since = t - st.shotAt[i];
      if (pose === "draw" && since < 700) { // muzzle flash, then a puff of smoke, at the end of the barrel
        const mx = colX(DRAW[GUN_ROW].length), my = top + GUN_ROW * scale;
        if (since < 120) {
          px(mx + (flip ? -2 * scale : 0), my - scale, 3 * scale, 3 * scale, "#fff3a0");
          px(mx + (flip ? -scale : scale), my, scale, scale, "#ffffff");
        } else {
          const rr = Math.round((since / 700) * 4) * scale;
          px(mx + (flip ? -rr - 2 * scale : 2 * scale), my - rr, rr + scale, rr + scale, "rgba(230,220,210,0.55)");
        }
      }
    }
  }

  function QDScene(canvas) {
    const g = canvas.getContext("2d");
    const st = newState();
    let H = 100;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      H = Math.max(70, Math.min(260, Math.round((W * rect.height) / rect.width)));
      canvas.width = W;
      canvas.height = H;
    }
    const loop = FP.loop(() => {}, (t) => paint(g, H, t, st));
    new ResizeObserver(resize).observe(canvas);
    resize();
    return {
      start: () => loop.start(),
      stop: () => loop.stop(),
      pose(i, p) { st.poses[i] = p; },
      shoot(i) { st.poses[i] = "draw"; st.shotAt[i] = performance.now(); },
      reset() { st.poses = ["idle", "idle"]; st.shotAt = [-1e9, -1e9]; },
      setBandanas(c) { st.bandanas = c.slice(); },
    };
  }

  QDScene.W = W;
  QDScene.paint = paint;
  QDScene.newState = newState;
  window.QDScene = QDScene;
})();
