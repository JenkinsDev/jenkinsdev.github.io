/*
 * Stack It: the things you stack. Each has a physics outline (parts, in metres, y up, around the body's
 * centre) and pixel art painted with the same coordinates, so what you see is what collides.
 *
 *   parts:   { box: [w, h, cx, cy] } | { circle: [r, cx, cy] } | { poly: [[x, y], …] } (convex)
 *   mass     relative weight, kept within about 3:1 (a fridge outweighs a toaster, but the physics engine
 *            squashes very light things under very heavy ones, so a bigger spread makes fair stacks topple)
 *   hard     tall, round or uneven: never dealt twice in a row
 *   art(p)   p.rect(x, y, w, h, colour) bottom-left corner · p.oval(cx, cy, rx, ry, colour) · p.poly(points, colour)
 */
(function () {
  "use strict";

  const OBJECTS = {
    fridge: {
      name: "Fridge", mass: 1.8, friction: 0.7, parts: [{ box: [0.8, 1.7, 0, 0] }],
      art(p) {
        p.rect(-0.4, -0.85, 0.8, 1.7, "#e6ebef"); p.rect(0.3, -0.85, 0.1, 1.7, "#bfc8d2");
        p.rect(-0.4, 0.3, 0.8, 0.04, "#8d97a5"); p.rect(-0.3, 0.42, 0.05, 0.3, "#5d6678"); p.rect(-0.3, -0.2, 0.05, 0.4, "#5d6678");
        p.rect(0.02, 0.5, 0.1, 0.1, "#ff3da0"); p.rect(0.15, 0.62, 0.08, 0.08, "#ffd23f"); p.rect(0.05, -0.1, 0.16, 0.12, "#00e5ff");
      },
    },
    washer: {
      name: "Washing machine", mass: 1.7, friction: 0.7, parts: [{ box: [0.7, 0.85, 0, 0] }],
      art(p) {
        p.rect(-0.35, -0.425, 0.7, 0.85, "#eef1f4"); p.rect(-0.35, 0.25, 0.7, 0.175, "#c9d1da");
        p.oval(0.22, 0.34, 0.05, 0.05, "#5d6678"); p.rect(-0.28, 0.32, 0.2, 0.05, "#2a3352");
        p.oval(0, -0.1, 0.24, 0.24, "#8d97a5"); p.oval(0, -0.1, 0.18, 0.18, "#2c7bff"); p.oval(-0.06, -0.04, 0.05, 0.05, "#9fd0ff");
      },
    },
    piano: {
      name: "Piano", mass: 1.8, friction: 0.7, parts: [{ box: [1.4, 1.2, 0, 0] }],
      art(p) {
        p.rect(-0.7, -0.6, 1.4, 1.2, "#5a2e1a"); p.rect(-0.7, 0.45, 1.4, 0.15, "#6e3a22");
        p.rect(-0.62, -0.02, 1.24, 0.16, "#f4efe6"); for (let i = 0; i < 9; i++) p.rect(-0.56 + i * 0.135, 0.06, 0.06, 0.08, "#111");
        p.rect(-0.7, -0.06, 1.4, 0.05, "#3a1c0f"); p.rect(-0.6, -0.6, 0.1, 0.5, "#3a1c0f"); p.rect(0.5, -0.6, 0.1, 0.5, "#3a1c0f");
        p.rect(-0.3, 0.22, 0.6, 0.16, "#7c4630");
      },
    },
    armchair: {
      name: "Armchair", mass: 1.1, friction: 0.8, hard: true,
      parts: [{ box: [0.2, 0.6, -0.4, -0.2] }, { box: [0.2, 0.6, 0.4, -0.2] }, { box: [0.6, 1.0, 0, 0] }],
      art(p) {
        p.rect(-0.3, -0.5, 0.6, 1.0, "#b8243a"); p.rect(-0.3, -0.12, 0.6, 0.14, "#d6455a");
        p.rect(-0.5, -0.5, 0.2, 0.6, "#9a1c30"); p.rect(0.3, -0.5, 0.2, 0.6, "#9a1c30");
        p.rect(-0.5, 0.04, 0.2, 0.06, "#d6455a"); p.rect(0.3, 0.04, 0.2, 0.06, "#d6455a"); p.rect(-0.2, 0.15, 0.4, 0.25, "#a52034");
      },
    },
    suitcase: {
      name: "Suitcase", mass: 0.9, friction: 0.7, parts: [{ box: [0.8, 0.5, 0, 0] }],
      art(p) {
        p.rect(-0.4, -0.25, 0.8, 0.5, "#1fa39a"); p.rect(-0.4, -0.25, 0.8, 0.06, "#137168"); p.rect(-0.3, -0.25, 0.06, 0.5, "#137168"); p.rect(0.24, -0.25, 0.06, 0.5, "#137168");
        p.rect(-0.12, -0.05, 0.2, 0.14, "#ffd23f"); p.rect(0.02, -0.18, 0.16, 0.1, "#ff3da0");
      },
    },
    tyre: {
      name: "Tyre", mass: 1.0, friction: 0.95, // lying flat: you see its side as a fat, rounded slab
      parts: [{ poly: [[-0.36, -0.08], [-0.32, -0.12], [0.32, -0.12], [0.36, -0.08], [0.36, 0.08], [0.32, 0.12], [-0.32, 0.12], [-0.36, 0.08]] }],
      art(p) {
        p.poly([[-0.36, -0.08], [-0.32, -0.12], [0.32, -0.12], [0.36, -0.08], [0.36, 0.08], [0.32, 0.12], [-0.32, 0.12], [-0.36, 0.08]], "#1b1d24");
        for (let x = -0.3; x < 0.3; x += 0.1) { p.rect(x, 0.05, 0.05, 0.06, "#2f333e"); p.rect(x + 0.05, -0.11, 0.05, 0.06, "#2f333e"); }
        p.rect(-0.36, -0.015, 0.72, 0.03, "#5d6678");
      },
    },
    cone: {
      name: "Traffic cone", mass: 0.6, friction: 0.8, hard: true,
      parts: [{ box: [0.56, 0.08, 0, -0.33] }, { poly: [[-0.24, -0.29], [0.24, -0.29], [0.1, 0.37], [-0.1, 0.37]] }],
      art(p) {
        p.rect(-0.28, -0.37, 0.56, 0.08, "#c44f0c"); p.poly([[-0.24, -0.29], [0.24, -0.29], [0.1, 0.37], [-0.1, 0.37]], "#ff7a1a");
        p.poly([[-0.19, -0.12], [0.19, -0.12], [0.16, -0.02], [-0.16, -0.02]], "#f4f4f4"); p.poly([[-0.12, 0.1], [0.12, 0.1], [0.1, 0.18], [-0.1, 0.18]], "#f4f4f4");
      },
    },
    watermelon: {
      name: "Watermelon", mass: 0.9, friction: 0.6, hard: true, parts: [{ poly: [[-0.26, -0.2], [0.26, -0.2], [0.36, -0.07], [0.34, 0.08], [0.2, 0.2], [-0.2, 0.2], [-0.34, 0.08], [-0.36, -0.07]] }], // sits on its flat side
      art(p) {
        p.poly([[-0.26, -0.2], [0.26, -0.2], [0.36, -0.07], [0.34, 0.08], [0.2, 0.2], [-0.2, 0.2], [-0.34, 0.08], [-0.36, -0.07]], "#1f7a34");
        for (const x of [-0.24, -0.08, 0.08, 0.24]) p.poly([[x - 0.035, -0.19], [x + 0.035, -0.19], [x + 0.03, 0.18 - Math.abs(x) * 0.3], [x - 0.03, 0.18 - Math.abs(x) * 0.3]], "#8fd14f");
        p.rect(-0.18, 0.12, 0.14, 0.04, "#4caf50");
      },
    },
    tv: {
      name: "Old TV", mass: 1.2, friction: 0.7, parts: [{ box: [0.7, 0.56, 0, 0] }],
      art(p) {
        p.rect(-0.35, -0.28, 0.7, 0.56, "#7a7f8c"); p.rect(-0.29, -0.2, 0.44, 0.4, "#11162a");
        p.rect(-0.26, -0.16, 0.38, 0.32, "#2c7bff"); p.rect(-0.26, 0.06, 0.38, 0.1, "#00e5ff"); p.rect(-0.1, -0.08, 0.12, 0.1, "#ffd23f");
        p.oval(0.24, 0.1, 0.04, 0.04, "#333"); p.oval(0.24, -0.06, 0.04, 0.04, "#333");
      },
    },
    tank: {
      name: "Fish tank", mass: 1.4, friction: 0.6, parts: [{ box: [0.9, 0.5, 0, 0] }],
      art(p) {
        p.rect(-0.45, -0.25, 0.9, 0.5, "#9fd0ff"); p.rect(-0.41, -0.21, 0.82, 0.36, "#2c8cd6"); p.rect(-0.41, -0.21, 0.82, 0.08, "#d9c27a");
        p.rect(-0.45, 0.19, 0.9, 0.06, "#5d6678"); p.oval(-0.1, 0.0, 0.08, 0.05, "#ff7a1a"); p.poly([[0.0, 0.0], [0.07, 0.05], [0.07, -0.05]], "#ff7a1a");
        p.rect(0.2, -0.13, 0.03, 0.18, "#2faa4a"); p.rect(0.26, -0.13, 0.03, 0.12, "#2faa4a");
      },
    },
    cat: {
      name: "Cat", mass: 0.7, friction: 0.9, parts: [{ poly: [[-0.32, -0.15], [0.32, -0.15], [0.32, 0.05], [0.22, 0.15], [-0.22, 0.15], [-0.32, 0.05]] }],
      art(p) {
        p.poly([[-0.32, -0.15], [0.32, -0.15], [0.32, 0.05], [0.22, 0.15], [-0.22, 0.15], [-0.32, 0.05]], "#f08a24");
        p.poly([[0.12, 0.13], [0.18, 0.24], [0.22, 0.13]], "#f08a24"); p.poly([[0.24, 0.12], [0.3, 0.22], [0.32, 0.08]], "#f08a24");
        for (const x of [-0.2, -0.06, 0.08]) p.rect(x, -0.05, 0.05, 0.18, "#c56510");
        p.rect(0.16, 0.0, 0.04, 0.04, "#111"); p.rect(0.25, 0.0, 0.04, 0.04, "#111"); p.rect(-0.36, -0.15, 0.06, 0.12, "#c56510");
      },
    },
    toaster: {
      name: "Toaster", mass: 0.6, friction: 0.6, parts: [{ box: [0.42, 0.3, 0, 0] }],
      art(p) {
        p.rect(-0.12, 0.12, 0.08, 0.08, "#d9a45a"); p.rect(0.04, 0.12, 0.08, 0.08, "#d9a45a");
        p.rect(-0.21, -0.15, 0.42, 0.3, "#c9d1da"); p.rect(-0.21, -0.15, 0.42, 0.05, "#8d97a5"); p.rect(0.14, -0.04, 0.07, 0.05, "#2a2d36");
      },
    },
    snowman: {
      name: "Snowman", mass: 0.9, friction: 0.6, hard: true, // packed flat underneath, and a hat to stack on
      parts: [{ poly: [[-0.2, -0.46], [0.2, -0.46], [0.28, -0.32], [0.28, -0.1], [0.18, 0.04], [-0.18, 0.04], [-0.28, -0.1], [-0.28, -0.32]] }, { circle: [0.18, 0, 0.18] }, { box: [0.3, 0.06, 0, 0.36] }, { box: [0.2, 0.2, 0, 0.49] }],
      art(p) {
        p.poly([[-0.2, -0.46], [0.2, -0.46], [0.28, -0.32], [0.28, -0.1], [0.18, 0.04], [-0.18, 0.04], [-0.28, -0.1], [-0.28, -0.32]], "#f4f8ff"); p.oval(0.08, -0.22, 0.16, 0.18, "#dde6f4"); p.oval(0, 0.18, 0.18, 0.18, "#f4f8ff");
        p.rect(-0.15, 0.33, 0.3, 0.06, "#1b1d24"); p.rect(-0.1, 0.39, 0.2, 0.2, "#1b1d24"); p.rect(-0.1, 0.41, 0.2, 0.04, "#e8243a");
        p.rect(-0.09, 0.2, 0.04, 0.04, "#111"); p.rect(0.05, 0.2, 0.04, 0.04, "#111"); p.poly([[0, 0.15], [0.14, 0.13], [0, 0.11]], "#ff7a1a");
        p.rect(-0.18, -0.02, 0.36, 0.06, "#e8243a"); p.rect(-0.02, -0.16, 0.04, 0.04, "#111"); p.rect(-0.02, -0.3, 0.04, 0.04, "#111");
      },
    },
    barrel: {
      name: "Barrel", mass: 1.3, friction: 0.7, parts: [{ box: [0.6, 0.82, 0, 0] }],
      art(p) {
        p.rect(-0.3, -0.41, 0.6, 0.82, "#8a4b22"); for (const x of [-0.18, -0.04, 0.1]) p.rect(x, -0.41, 0.03, 0.82, "#6b3816");
        p.rect(-0.3, 0.22, 0.6, 0.06, "#5d6678"); p.rect(-0.3, -0.28, 0.6, 0.06, "#5d6678");
      },
    },
    lamp: {
      name: "Lamp", mass: 0.7, friction: 0.7, hard: true,
      parts: [{ box: [0.44, 0.08, 0, -0.56] }, { box: [0.06, 0.8, 0, -0.12] }, { poly: [[-0.28, 0.28], [0.28, 0.28], [0.17, 0.6], [-0.17, 0.6]] }],
      art(p) {
        p.rect(-0.22, -0.6, 0.44, 0.08, "#2a2d36"); p.rect(-0.03, -0.52, 0.06, 0.8, "#c9a24a");
        p.poly([[-0.28, 0.28], [0.28, 0.28], [0.17, 0.6], [-0.17, 0.6]], "#ffe28a"); p.rect(-0.28, 0.28, 0.56, 0.05, "#e0b84a");
      },
    },
    pumpkin: {
      name: "Pumpkin", mass: 0.8, friction: 0.7, parts: [{ poly: [[-0.22, -0.2], [0.22, -0.2], [0.3, -0.07], [0.28, 0.1], [0.18, 0.18], [-0.18, 0.18], [-0.28, 0.1], [-0.3, -0.07]] }],
      art(p) {
        p.poly([[-0.22, -0.2], [0.22, -0.2], [0.3, -0.07], [0.28, 0.1], [0.18, 0.18], [-0.18, 0.18], [-0.28, 0.1], [-0.3, -0.07]], "#ff7a1a");
        for (const x of [-0.15, 0, 0.15]) p.poly([[x - 0.03, -0.19], [x + 0.03, -0.19], [x + 0.03, 0.17], [x - 0.03, 0.17]], "#e35f0a");
        p.rect(-0.03, 0.17, 0.06, 0.08, "#2f7a2a");
      },
    },
    microwave: {
      name: "Microwave", mass: 0.9, friction: 0.7, parts: [{ box: [0.66, 0.4, 0, 0] }],
      art(p) {
        p.rect(-0.33, -0.2, 0.66, 0.4, "#2a2d36"); p.rect(-0.28, -0.14, 0.4, 0.28, "#11162a"); p.rect(-0.24, -0.1, 0.32, 0.2, "#3a4468");
        p.rect(0.16, 0.06, 0.12, 0.06, "#00e5ff"); p.rect(0.16, -0.06, 0.12, 0.06, "#5d6678");
      },
    },
    cake: {
      name: "Birthday cake", mass: 0.7, friction: 0.6, hard: true, parts: [{ box: [0.7, 0.3, 0, -0.17] }, { box: [0.44, 0.24, 0, 0.1] }],
      art(p) {
        p.rect(-0.35, -0.32, 0.7, 0.3, "#ff8fc7"); p.rect(-0.22, -0.02, 0.44, 0.24, "#fff1f7"); p.rect(-0.35, -0.08, 0.7, 0.06, "#fff1f7");
        p.rect(-0.22, 0.16, 0.44, 0.06, "#ff8fc7"); p.rect(-0.02, 0.22, 0.04, 0.1, "#2c7bff"); p.rect(-0.02, 0.32, 0.04, 0.05, "#ffd23f");
        for (const x of [-0.26, -0.1, 0.06, 0.22]) p.rect(x, -0.22, 0.05, 0.05, "#e8243a");
      },
    },
  };

  /** The object's bounding box from its physics parts: { minX, maxX, minY, maxY }. */
  function bounds(obj) {
    const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const add = (x, y) => { b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y); };
    for (const part of obj.parts) {
      if (part.box) { const [w, h, cx, cy] = part.box; add(cx - w / 2, cy - h / 2); add(cx + w / 2, cy + h / 2); }
      else if (part.circle) { const [r, cx, cy] = part.circle; add(cx - r, cy - r); add(cx + r, cy + r); }
      else part.poly.forEach(([x, y]) => add(x, y));
    }
    return b;
  }

  /** Area of the outline (m²), so physics can turn mass into density. */
  function area(obj) {
    return obj.parts.reduce((sum, part) => {
      if (part.box) return sum + part.box[0] * part.box[1];
      if (part.circle) return sum + Math.PI * part.circle[0] ** 2;
      const pts = part.poly;
      return sum + Math.abs(pts.reduce((a, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return a + x * y2 - x2 * y; }, 0)) / 2;
    }, 0);
  }

  /**
   * The next object to drop. Random, but fair: a hard one never follows a hard one, the same thing never
   * comes twice running, and the very first drop is an easy, flat-topped one.
   */
  function deal(prev, random = Math.random) {
    const keys = Object.keys(OBJECTS);
    const ok = keys.filter((k) => k !== prev && !(OBJECTS[k].hard && (!prev || OBJECTS[prev].hard)));
    return ok[Math.floor(random() * ok.length)];
  }

  window.SKObjects = { OBJECTS, bounds, area, deal };
})();
