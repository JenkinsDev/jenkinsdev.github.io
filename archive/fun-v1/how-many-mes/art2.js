/* More crayon art: the big stuff (bus and whale lie on their side; w = length). */
(function () {
  "use strict";
  const H = window.HMM, K = H.K, P = H.P, C = H.C, E = H.E, R = H.R, L = H.L, dot = H.dot;
  const win = (n) => { let s = ""; for (let i = 0; i < n; i++) s += R(34 + i * 24, 12, 18, 16, K.lt, 2) + C(43 + i * 24, 22, 4.5, i % 2 ? K.pink : K.tan); return s; };
  const stars = (n, w, h, seed) => { let s = "", x = seed; for (let i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; const a = x / 233280; x = (x * 9301 + 49297) % 233280; s += `<circle cx="${(a * w).toFixed(1)}" cy="${((x / 233280) * h).toFixed(1)}" r="1.6" fill="#fffdf7" stroke="none"/>`; } return s; };
  const cloud = (x, y) => P(`M${x} ${y} Q${x - 4} ${y - 12} ${x + 10} ${y - 10} Q${x + 16} ${y - 20} ${x + 28} ${y - 10} Q${x + 42} ${y - 8} ${x + 38} ${y}Z`, K.wht);
  const shaft = (x, top, bot) => `<path d="M${x} ${bot} V${top}" stroke-dasharray="6 6" fill="none"/>`;
  Object.assign(H.ART, {
    bus: { w: 250, h: 70, b: R(2, 4, 246, 46, K.sun, 10) + R(224, 24, 24, 26, K.sun, 6) + win(8) + R(2, 34, 246, 5, K.ink, 0).replace(/fill="[^"]*"/, 'fill="#2a2522" stroke="none"') +
      R(206, 12, 14, 16, K.lt, 2) + C(46, 54, 11, K.dk) + C(46, 54, 4, K.gry) + C(196, 54, 11, K.dk) + C(196, 54, 4, K.gry) + R(238, 20, 8, 5, K.red, 2) + L("M2 50 H0") },
    whale: { w: 320, h: 100, b: L("M150 24 Q146 6 134 2 M150 24 Q156 4 168 4 M150 24 V10") + P("M310 54 Q250 14 170 22 Q100 28 62 56 Q48 52 14 24 Q18 50 30 62 Q18 72 8 92 Q44 84 64 68 Q110 94 190 86 Q260 80 310 54Z", "#5d93c9") +
      P("M80 66 Q150 92 240 76 Q280 66 306 56 Q250 84 180 86 Q110 90 80 66Z", K.cream) + L("M120 78 Q190 70 250 70 M130 84 Q200 78 270 66") + dot(284, 52, 3) + L("M296 62 Q282 66 270 60") + P("M150 40 Q166 62 190 56 Q172 50 150 40Z", "#5d93c9") },
    sequoia: { w: 50, h: 130, b: P("M18 126 Q22 90 22 40 L30 40 Q30 90 36 126Z", K.brn).replace("M18", "M14") + L("M25 50 V120 M29 60 V118") +
      P("M25 0 Q4 12 6 40 Q2 52 16 52 L34 52 Q50 50 44 38 Q46 12 25 0Z", K.grn) + L("M16 20 Q22 28 20 40 M32 14 Q36 28 32 42") },
    liberty: { w: 70, h: 130, b: P("M14 130 L18 66 L52 66 L56 130Z", K.gry) + R(12, 62, 46, 8, K.tan, 1) + L("M20 90 H50 M22 108 H48") +
      P("M22 62 Q18 42 28 32 L44 32 Q54 44 48 62Z", "#7cc8a8") + P("M50 40 L58 32 L56 14 L62 12 L64 36 L54 46Z", "#7cc8a8") + P("M60 12 Q56 2 62 -4 Q68 2 64 12Z", K.sun) +
      C(34, 22, 8, "#7cc8a8") + L("M26 14 L22 8 M30 12 L30 4 M36 12 L40 4 M42 14 L48 8") + R(16, 42, 12, 16, K.wht, 2) },
    eiffel: { w: 60, h: 140, b: L("M30 0 V16") + P("M30 16 L24 56 L16 96 L4 138 L16 138 Q30 110 44 138 L56 138 L44 96 L36 56Z", K.brn) + R(18, 56, 24, 5, K.brn, 1) + R(10, 96, 40, 5, K.brn, 1) +
      L("M24 56 L36 96 M36 56 L24 96 M16 96 L44 138 M44 96 L16 138") + P("M18 138 Q30 106 42 138", "#fbf7ee") },
    burj: { w: 44, h: 170, b: L("M22 0 V30") + P("M20 30 L18 50 L12 50 L12 70 L8 70 L8 100 L4 100 L4 166 L40 166 L40 100 L36 100 L36 70 L32 70 L32 50 L26 50 L24 30Z", K.lt) +
      L("M22 50 V166 M14 80 V166 M30 80 V166 M10 120 H34 M10 142 H34") },
    everest: { w: 170, h: 100, b: P("M0 100 L40 56 L58 70 L96 0 L132 52 L150 44 L170 100Z", K.gry) + P("M96 0 L78 30 L88 26 L96 38 L106 26 L116 32Z", K.wht) + P("M40 56 L30 70 L42 66 L50 72Z", K.wht) + L("M96 0 L96 -8 L108 -4 L96 0") },
    plane: { w: 120, h: 170, top: 14, b: shaft(60, 30, 160) + R(0, 160, 120, 10, K.grn, 2) + cloud(12, 110) + cloud(70, 76) + P("M30 12 Q36 2 70 6 L96 8 Q106 10 100 16 Q96 20 70 20 L36 20Q28 18 30 12Z", K.wht) + P("M44 12 L36 -2 L52 8Z", K.sky) + P("M56 18 L74 34 L78 18Z", K.sky) + L("M82 11 H92") },
    space: { w: 120, h: 190, top: 52, b: R(0, 0, 120, 52, K.ink, 0) + stars(14, 120, 46, 5) + L("M0 52 H120") + shaft(60, 60, 180) + R(0, 180, 120, 10, K.grn, 2) + cloud(10, 140) + cloud(66, 104) + P("M60 6 L64 16 L74 16 L66 22 L70 32 L60 26 L50 32 L54 22 L46 16 L56 16Z", K.sun) },
    iss: { w: 120, h: 190, top: 40, b: R(0, 0, 120, 100, K.ink, 0) + stars(20, 120, 90, 9) + R(8, 12, 30, 14, K.sky, 1) + R(82, 12, 30, 14, K.sky, 1) + R(38, 14, 44, 10, K.gry, 2) + R(52, 6, 16, 26, K.wht, 3) + L("M22 12 V26 M98 12 V26") + shaft(60, 100, 176) +
      P("M0 190 L0 150 Q60 126 120 150 L120 190Z", K.sky) + P("M18 168 Q30 152 46 160 Q40 176 18 168Z", K.grn) + P("M70 176 Q90 160 104 170 Q96 186 70 176Z", K.grn) },
    moon: { w: 100, h: 100, b: E(50, 50, 48, 48, "#e8e2d2") + C(30, 34, 9, "#cfc8b4") + C(66, 28, 6, "#cfc8b4") + C(62, 62, 13, "#cfc8b4") + C(28, 68, 5, "#cfc8b4") + C(80, 52, 4, "#cfc8b4") },
  });
})();
