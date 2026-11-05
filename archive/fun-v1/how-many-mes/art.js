/* Hand-authored crayon-style art. Every piece lives in its own viewBox (w x h).
 * `top` = y where the measured size starts (default 0). Strokes are non-scaling. */
(function () {
  "use strict";
  const H = (window.HMM = window.HMM || {});
  const K = { ink: "#2a2522", sun: "#f7c531", red: "#e8432e", sky: "#2f7fd6", grn: "#3aa356", pink: "#f27ba6",
    org: "#f2892b", cream: "#fbf1d8", brn: "#9a6a3f", tan: "#e3b36e", gry: "#bdb5aa", wht: "#fffdf7", dk: "#4b4540", lt: "#a9d2f2" };
  H.K = K;
  const P = (d, f) => `<path d="${d}" fill="${f || "none"}"/>`;
  const C = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || "none"}"/>`;
  const E = (x, y, rx, ry, f) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f || "none"}"/>`;
  const R = (x, y, w, h, f, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" fill="${f || "none"}"/>`;
  const L = (d) => P(d);
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r || 2}" fill="${K.ink}" stroke="none"/>`;
  H.P = P; H.C = C; H.E = E; H.R = R; H.L = L; H.dot = dot;

  const HAIR = "#4a3022";
  function hatSVG(hat, skin) {
    switch (hat) {
      case "cap": return P("M14 15 Q15 -2 31 0 Q46 2 46 15Z", K.sky) + P("M40 13 Q54 11 56 16 L44 17", K.sky);
      case "party": return P("M30 -22 L19 6 L42 6Z", K.pink) + C(30, -23, 3.5, K.sun) + L("M24 -6 L36 -6 M21 1 L40 1");
      case "crown": return P("M16 7 L14 -9 L23 -1 L30 -12 L37 -1 L46 -9 L44 7Z", K.sun) + C(30, -12, 2, K.red);
      case "beanie": return P("M14 9 Q14 -8 30 -8 Q46 -8 46 9Z", K.red) + R(12, 6, 36, 7, K.cream, 3) + C(30, -11, 4.5, K.cream);
      case "ears": return P("M15 9 L15 -9 L27 3Z", K.org) + P("M45 9 L45 -9 L33 3Z", K.org) + P("M16 6 Q22 -2 22 3Z", K.pink, 0) + hair(skin, 1);
      default: return hair(skin);
    }
  }
  function hair(skin, short) {
    return P(`M15 16 Q13 1 30 2 Q47 1 45 16 Q38 8 30 9 Q22 8 15 16Z`, HAIR);
  }
  H.headMarkup = (hat, skin) => P("M14 18 Q14 3 30 3 Q46 3 46 18 Q46 33 30 33 Q14 33 14 18Z", skin) + hatSVG(hat, skin) +
    dot(24, 19, 2.4) + dot(36, 19, 2.4) + P("M23 25 Q30 31 37 25") + `<circle cx="19" cy="25" r="3" fill="${K.pink}" stroke="none" opacity=".7"/><circle cx="41" cy="25" r="3" fill="${K.pink}" stroke="none" opacity=".7"/>`;
  /* a kid-drawing "me": 60 x 120 box, head top at y 3, shoes at y 117 */
  H.meMarkup = function (color, skin, hat, adult) {
    const shirt = adult ? K.grn : color;
    const gl = adult ? C(24, 19, 5.5) + C(36, 19, 5.5) + L("M29.5 19 H30.5") : "";
    return L("M17 44 L7 74") + L("M43 44 L53 74") + P("M16 34 Q30 31 44 34 L45 82 Q30 85 15 82Z", shirt) +
      R(19, 82, 9, 28, adult ? K.dk : K.sky, 3) + R(32, 82, 9, 28, adult ? K.dk : K.sky, 3) +
      P("M14 112 Q14 106 27 108 L28 116 L13 116Z", K.ink) + P("M46 112 Q46 106 33 108 L32 116 L47 116Z", K.ink) +
      C(7, 76, 4.5, skin) + C(53, 76, 4.5, skin) + H.headMarkup(adult ? "none" : hat, skin) + gl;
  };

  H.ART = {
    ladybug: { w: 80, h: 100, b: L("M28 28 L16 14 M52 28 L64 14") + L("M12 50 L30 52 M68 50 L50 52 M14 78 L32 70 M66 78 L48 70") +
      P("M40 22 Q74 24 72 62 Q68 98 40 98 Q12 98 8 62 Q6 24 40 22Z", K.red) + P("M40 8 Q58 8 56 26 L24 26 Q22 8 40 8Z", K.ink) + L("M40 26 V96") +
      C(24, 52, 6, K.ink) + C(56, 52, 6, K.ink) + C(26, 76, 5, K.ink) + C(54, 76, 5, K.ink) },
    banana: { w: 70, h: 100, b: P("M26 6 Q20 6 20 12 Q16 56 40 86 Q48 98 60 92 Q58 86 50 76 Q40 56 40 16 Q40 6 32 6Z", K.sun) + P("M26 6 L26 0 L33 0 L32 6Z", K.brn) + L("M31 16 Q31 50 50 82") },
    cat: { w: 80, h: 100, b: P("M60 94 Q78 88 72 66 Q70 60 76 56", K.org) + P("M52 94 Q52 52 40 52 Q26 52 24 94Z", K.org) +
      P("M22 22 L24 4 L36 14 Q40 13 44 14 L56 4 L58 22 Q62 36 40 44 Q18 36 22 22Z", K.org) + P("M24 40 Q22 94 30 96 L50 96 Q58 94 56 40", K.org).replace(/fill="[^"]*"/, 'fill="#f2892b" stroke="none"') +
      dot(33, 26, 2.5) + dot(47, 26, 2.5) + P("M37 33 L43 33 L40 37Z", K.pink) + L("M16 32 L28 34 M64 32 L52 34 M16 40 L28 38 M64 40 L52 38") + L("M32 62 Q40 70 48 62") + L("M30 84 H34 M46 84 H50") },
    dog: { w: 170, h: 100, b: P("M26 36 Q8 24 6 6 Q18 8 30 28", K.tan) + R(28, 24, 100, 48, K.tan, 20) + R(34, 66, 14, 32, K.tan, 6) + R(54, 66, 14, 32, K.tan, 6) + R(94, 66, 14, 32, K.tan, 6) + R(112, 66, 14, 32, K.tan, 6) +
      P("M116 30 Q114 4 142 6 Q162 8 164 26 Q166 40 148 44 Q124 48 116 30Z", K.tan) + P("M124 8 Q110 10 112 38 Q122 36 128 22Z", K.brn) +
      dot(143, 20, 2.8) + E(162, 24, 5, 4, K.ink) + P("M144 38 Q150 52 156 40Z", K.pink) + L("M140 33 Q150 38 158 33") },
    adult: { w: 60, h: 120, top: 3, b: "" },
    bear: { w: 90, h: 120, b: E(18, 72, 9, 22, K.wht) + E(72, 72, 9, 22, K.wht) + P("M30 54 Q8 70 18 110 L38 114 L45 88 L52 114 L72 110 Q82 70 60 54 Q45 46 30 54Z", K.wht) + E(45, 30, 20, 19, K.wht) + C(30, 14, 6, K.wht) + C(60, 14, 6, K.wht) +
      E(45, 38, 10, 7, K.cream) + P("M41 35 L49 35 L45 40Z", K.ink) + dot(37, 27, 2.6) + dot(53, 27, 2.6) + L("M45 40 V44 M40 46 Q45 48 50 46") + E(24, 114, 10, 5, K.wht) + E(66, 114, 10, 5, K.wht) },
    hoop: { w: 100, h: 100, top: 26, b: R(46, 26, 8, 74, K.gry, 2) + R(34, 94, 32, 6, K.dk, 2) + R(14, 0, 72, 40, K.wht, 3) + R(34, 16, 32, 22, "none", 1) +
      P("M26 46 L36 80 L64 80 L74 46Z", "none") + L("M32 56 H68 M35 66 H65 M42 46 L46 80 M58 46 L54 80 M30 46 L40 80 M70 46 L60 80") + E(50, 44, 28, 5, "none").replace('fill="none"', 'fill="none" stroke="#e8432e" stroke-width="5"') },
    trex: { w: 170, h: 120, top: 40, b: P("M52 44 Q20 44 2 62 Q26 54 50 60Z", K.grn) + P("M110 70 L112 114 L134 118 L134 108 L124 104 L122 70Z", K.grn) + P("M70 70 L68 114 L92 118 L92 108 L82 104 L88 70Z", K.grn) +
      P("M40 54 Q56 24 96 28 Q116 18 122 14 Q130 4 150 6 Q168 8 166 26 Q164 36 150 38 L128 38 Q118 52 110 64 Q76 84 40 54Z", K.grn) + dot(142, 16, 3) +
      P("M130 28 L134 34 L138 28 L142 34 L146 28 L150 34 L154 28", "none") + P("M110 46 L122 54 L118 58", "none") + L("M60 40 Q80 34 98 38") },
    giraffe: { w: 110, h: 120, b: L("M92 6 L94 -2 M100 8 L104 -1") + P("M24 52 Q20 46 24 40 L90 50 L84 78 Q50 84 28 76Z", K.sun) + R(28, 74, 9, 44, K.sun, 3) + R(42, 76, 9, 42, K.sun, 3) + R(68, 76, 9, 42, K.sun, 3) + R(80, 74, 9, 44, K.sun, 3) +
      P("M70 52 L82 18 L96 22 L90 54Z", K.sun) + P("M80 14 Q82 2 100 6 Q110 8 106 18 Q102 26 88 24Z", K.sun) + dot(94, 11, 2.4) +
      C(42, 58, 5, K.brn) + C(60, 64, 5, K.brn) + C(78, 54, 4, K.brn) + C(86, 36, 4, K.brn) + C(33, 70, 3, K.brn) + P("M24 46 Q12 50 12 66", "none") },
    pole: { w: 70, h: 100, b: R(32, 0, 7, 100, K.brn, 1) + R(8, 8, 54, 5, K.brn, 1) + R(16, 24, 38, 5, K.brn, 1) + L("M10 8 Q-2 40 8 48 M60 8 Q74 40 66 48 M18 24 Q8 50 12 58 M52 24 Q62 50 58 58") +
      C(12, 6, 2.5, K.lt) + C(58, 6, 2.5, K.lt) + C(20, 22, 2.5, K.lt) + C(50, 22, 2.5, K.lt) + P("M42 8 Q42 -4 52 -2 L58 0 L54 4 Q50 8 46 8Z", K.sky) + dot(49, 1, 1.5) },
  };
  H.ART.adult.b = ""; // drawn at layout time by meMarkup (see stage.js)
})();
