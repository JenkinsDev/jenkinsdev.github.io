/* Monster Maker parts, part 1: bodies, colours, eyes, mouths. All hand-drawn SVG strings. */
(function () {
  "use strict";
  const P = (window.MonsterParts = window.MonsterParts || {});
  const INK = "#2a2522";
  P.INK = INK;
  P.GROUND = 416;

  /* Anchors: top/bottom of the body, hw = half width, eyeY/mouthY face centres, armY arm height,
     legX leg offset from centre, es/ms = eye/mouth scale, size = how big (for the voice). */
  P.bodies = [
    { n: "Blobby", size: 3, top: 95, bottom: 352, hw: 120, eyeY: 195, mouthY: 262, armY: 245, legX: 55, es: 1, ms: 1,
      d: "M200 95C280 90 325 160 320 245C318 310 270 352 200 352C130 352 82 310 80 245C75 160 120 100 200 95Z" },
    { n: "Tall", size: 5, top: 48, bottom: 352, hw: 78, eyeY: 135, mouthY: 207, armY: 225, legX: 36, es: 0.72, ms: 0.78,
      d: "M200 48C262 48 280 120 278 210C276 300 262 352 200 352C138 352 124 300 122 210C120 120 138 48 200 48Z" },
    { n: "Squat", size: 2, top: 148, bottom: 352, hw: 130, eyeY: 225, mouthY: 288, armY: 285, legX: 62, es: 1.05, ms: 1.05,
      d: "M200 148C290 143 335 205 330 270C326 322 270 352 200 352C130 352 74 322 70 270C65 205 110 143 200 148Z" },
    { n: "Jelly cube", size: 4, top: 100, bottom: 352, hw: 108, eyeY: 185, mouthY: 260, armY: 240, legX: 52, es: 0.95, ms: 1,
      d: "M110 105C160 98 240 98 290 105C310 150 312 250 305 320C300 350 280 352 200 352C120 352 100 350 95 320C88 250 90 150 110 105Z" },
    { n: "Pear", size: 3, top: 70, bottom: 352, hw: 128, eyeY: 140, mouthY: 212, armY: 275, legX: 58, es: 0.7, ms: 0.8,
      d: "M200 70C245 70 258 125 262 170C270 215 335 255 332 305C330 340 290 352 200 352C110 352 70 340 68 305C65 255 130 215 138 170C142 125 155 70 200 70Z" },
    { n: "Tiny", size: 1, top: 195, bottom: 352, hw: 66, eyeY: 255, mouthY: 306, armY: 295, legX: 30, es: 0.7, ms: 0.65,
      d: "M200 195C250 190 268 230 266 285C265 330 240 352 200 352C160 352 135 330 134 285C132 230 150 190 200 195Z" },
  ];

  P.colors = [
    { n: "Red", fill: "#e8432e" }, { n: "Yellow", fill: "#f7c531" }, { n: "Green", fill: "#3aa356" },
    { n: "Blue", fill: "#2f7fd6" }, { n: "Pink", fill: "#f27ba6" }, { n: "Purple", fill: "#8a4fbf" },
  ];

  /* Eyes: [x, y, radius] relative to the face centre. */
  P.eyes = [
    { n: "One eye", l: [[0, 0, 40]] },
    { n: "Two eyes", l: [[-42, 0, 28], [42, 0, 28]] },
    { n: "Three eyes", l: [[-54, 10, 22], [0, -14, 26], [54, 10, 22]] },
    { n: "Wonky eyes", l: [[-46, 8, 34], [42, -10, 20]] },
    { n: "Four eyes", l: [[-40, -24, 20], [40, -24, 20], [-40, 24, 20], [40, 24, 20]] },
    { n: "Lots of eyes", l: [[-48, -14, 17], [0, -28, 19], [48, -14, 17], [-24, 22, 16], [24, 22, 16]] },
  ];

  P.drawEyes = function (a, i) {
    const s = a.es;
    return P.eyes[i].l.map(([x, y, r]) =>
      `<g transform="translate(${200 + x * s} ${a.eyeY + y * s}) scale(${s})"><g class="ball">` +
      `<circle r="${r}" fill="#fff" stroke="${INK}" stroke-width="${5 / s}"/>` +
      `<g class="pupil" data-m="${r * 0.36}"><circle r="${r * 0.5}" fill="${INK}"/>` +
      `<circle cx="${-r * 0.17}" cy="${-r * 0.2}" r="${r * 0.16}" fill="#fff"/></g></g></g>`).join("");
  };

  const L = `stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
  const L3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  const DARK = "#7a1f3d";
  const SMILE = `<path d="M-34 -4Q0 34 34 -4" fill="none" ${L}/>`;

  /* Mouths: s = svg centred on (0,0); w/p = voice wave and pitch pattern for FunSound. */
  P.mouths = [
    { n: "Smile", w: "triangle", p: [1, 1.4, 1.2, 1.6], s: SMILE },
    { n: "Big open mouth", w: "sawtooth", p: [1.3, 0.7],
      s: `<path d="M-38 -8Q0 0 38 -8Q36 42 0 44Q-36 42 -38 -8Z" fill="${DARK}" ${L}/><ellipse cx="0" cy="34" rx="17" ry="9" fill="#f27ba6"/>` },
    { n: "Tongue out", w: "square", p: [1, 1.7, 0.6, 1.3],
      s: `<path d="M4 6L4 30A12 12 0 0 0 28 30L28 4Z" fill="#f27ba6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>${SMILE}` },
    { n: "Toothy grin", w: "sawtooth", p: [0.8, 1.3, 0.8, 1.2],
      s: `<path d="M-40 -6Q0 6 40 -6Q34 38 0 38Q-34 38 -40 -6Z" fill="${DARK}" ${L}/>` +
         `<path d="M-37 -4L-25 10L-12 0L0 12L12 0L25 10L37 -4Q0 6 -37 -4Z" fill="#fff" ${L3}/>` },
    { n: "Little o", w: "sine", p: [1, 1.9],
      s: `<ellipse cx="0" cy="14" rx="15" ry="19" fill="${DARK}" ${L}/>` },
    { n: "Fangs", w: "square", p: [1.1, 0.6, 0.9],
      s: `<path d="M-26 4L-19 28L-11 8Z" fill="#fff" ${L3}/><path d="M26 4L19 28L11 8Z" fill="#fff" ${L3}/>` +
         `<path d="M-36 -4Q0 26 36 -4" fill="none" ${L}/>` },
  ];

  P.drawMouth = (a, i) =>
    `<g transform="translate(200 ${a.mouthY}) scale(${a.ms})"><g class="mw">${P.mouths[i].s}</g></g>`;
})();
