/* Monster Maker parts, part 2: horns/ears, arms+legs, extras, tab icons. */
(function () {
  "use strict";
  const P = window.MonsterParts;
  const INK = P.INK;
  const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const PINK = "#f27ba6";
  const mirror = (x) => `${x}<g transform="scale(-1 1)">${x}</g>`;
  const at = (a, inner) => `<g transform="translate(200 ${a.top}) scale(${a.es})">${inner}</g>`;

  P.horns = [
    { n: "No horns", draw: () => "" },
    { n: "Horns", draw: (a) => at(a, mirror(`<path d="M-48 44Q-64 -20 -30 -50Q-34 -4 -14 44Z" fill="#fbeab0" ${S}/>`)) },
    { n: "Unicorn horn", draw: (a) => at(a, `<path d="M-15 40L2 -78L17 40Z" fill="#f7d96a" ${S}/>` +
        `<path d="M-9 14L11 6M-5 -14L7 -20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`) },
    { n: "Bunny ears", draw: (a, c) => at(a, mirror(`<g transform="rotate(-14)"><ellipse cx="-34" cy="-30" rx="17" ry="52" fill="${c}" ${S}/>` +
        `<ellipse cx="-34" cy="-26" rx="8" ry="34" fill="${PINK}"/></g>`)) },
    { n: "Cat ears", draw: (a, c) => at(a, mirror(
        `<path d="M-62 46L-56 -30L-10 22Z" fill="${c}" ${S}/><path d="M-52 24L-50 -12L-26 14Z" fill="${PINK}"/>`)) },
    { n: "Antennae", draw: (a) => at(a, mirror(
        `<path d="M-24 40Q-42 -20 -40 -52" fill="none" ${S}/><circle cx="-40" cy="-58" r="13" fill="#f7c531" ${S}/>`)) },
  ];

  /* Limbs: draw(a, colour) -> { svg, drop } (drop = how far they reach below the body). */
  const side = (x, y, inner, k, rot) => {
    const r = rot ? ` rotate(${rot})` : "";
    return `<g transform="translate(${200 + x} ${y}) scale(${k})${r}">${inner}</g>` +
           `<g transform="translate(${200 - x} ${y}) scale(${-k} ${k})${r}">${inner}</g>`;
  };
  const tube = (d, c, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const stubArm = (c) => `<path d="M-10 -14Q26 -30 46 -8Q50 20 22 22Q0 24 -10 12Z" fill="${c}" ${S}/>`;
  const foot = (c) => `<ellipse cx="8" cy="6" rx="28" ry="16" fill="${c}" ${S}/>`;
  const k = (a) => Math.max(0.7, a.es);

  P.limbs = [
    { n: "No arms or legs", draw: () => ({ svg: "", drop: 0 }) },
    { n: "Stubby arms and feet", draw: (a, c) => ({ drop: 22 * k(a),
        svg: side(a.hw - 6, a.armY, stubArm(c), k(a)) + side(a.legX, a.bottom - 2, foot(c), k(a)) }) },
    { n: "Noodle arms and legs", draw: (a, c) => ({ drop: 46,
        svg: side(a.hw - 8, a.armY, tube("M0 0Q36 -6 54 -44", c, 12) + `<circle cx="54" cy="-46" r="14" fill="${c}" ${S}/>`, k(a)) +
             side(a.legX, a.bottom - 6, tube("M0 -10Q6 16 -2 34", c, 12) + `<ellipse cx="8" cy="38" rx="22" ry="10" fill="${c}" ${S}/>`, 1) }) },
    { n: "Tentacles", draw: (a, c) => ({ drop: 48,
        svg: side(a.hw - 8, a.armY, tube("M0 0C26 -2 34 -32 58 -28C70 -26 70 -10 62 -10", c, 14), k(a)) +
             [-0.5, 0, 0.5].map((f) => `<g transform="translate(${200 + f * a.hw} ${a.bottom - 6}) scale(${Math.max(0.75, a.es)})">` +
               tube("M0 -10C-14 8 14 18 0 34C-10 44 6 50 -2 54", c, 16) + "</g>").join("") }) },
    { n: "Four arms", draw: (a, c) => ({ drop: 22 * k(a),
        svg: side(a.hw - 6, a.armY, stubArm(c), k(a)) + side(a.hw - 10, a.armY - 52, stubArm(c), k(a), -28) +
             side(a.legX, a.bottom - 2, foot(c), k(a)) }) },
    { n: "Wings", draw: (a) => ({ drop: 34,
        svg: side(a.hw - 6, a.armY - 28, `<path d="M0 8C28 -20 64 -50 96 -44C94 -14 78 14 40 28C22 34 8 24 0 8Z" fill="#fff" ${S}/>` +
               `<path d="M30 6L62 -14M24 18L58 4" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>`, k(a)) +
             side(a.legX, a.bottom - 6, `<path d="M0 -8L0 26M-14 34L0 26L14 34" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`, 1) }) },
  ];

  /* Extras toggle on and off. hat + crown share a slot. */
  const bow = (a) => `<g transform="translate(${200 + a.hw * 0.45} ${a.top + 16}) rotate(14) scale(${Math.max(0.7, a.es)})">` +
    `<path d="M0 0L-32 -22L-32 22ZM0 0L32 -22L32 22Z" fill="#e8432e" ${S}/><circle r="9" fill="#f7c531" ${S}/></g>`;
  const hat = (a) => `<g transform="translate(200 ${a.top + 14}) rotate(-8) scale(${a.es})">` +
    `<path d="M-32 18L2 -70L36 18Z" fill="#2f7fd6" ${S}/><path d="M-20 -8L24 -10M-12 -32L14 -34" stroke="#e8432e" stroke-width="8" stroke-linecap="round"/>` +
    `<circle cx="2" cy="-72" r="11" fill="#f7c531" ${S}/></g>`;
  const crown = (a) => `<g transform="translate(200 ${a.top + 14}) scale(${a.es})">` +
    `<path d="M-38 16L-42 -26L-20 -4L0 -36L20 -4L42 -26L38 16Z" fill="#f7c531" ${S}/>` +
    `<circle cx="0" cy="0" r="6" fill="#e8432e" ${S}/><circle cx="-24" cy="4" r="4.5" fill="#2f7fd6"/><circle cx="24" cy="4" r="4.5" fill="#3aa356"/></g>`;
  const spots = (a) => [[-0.62, 0.45, 18], [0.62, 0.5, 22], [-0.35, 0.9, 24], [0.45, 0.92, 17], [0.05, 0.05, 16], [-0.7, 0.75, 14]]
    .map(([x, y, r]) => `<circle cx="${200 + x * a.hw}" cy="${a.top + y * (a.bottom - a.top)}" r="${r * a.es}" fill="${INK}" opacity=".16"/>`).join("");
  const stripes = (a) => [0.8, 0.93].map((f) =>
    `<rect x="0" y="${a.top + f * (a.bottom - a.top) - 9 * a.es}" width="400" height="${18 * a.es}" fill="${INK}" opacity=".16"/>`).join("");
  const cheeks = (a) => [-1, 1].map((d) =>
    `<ellipse cx="${200 + d * a.hw * 0.62}" cy="${(a.eyeY + a.mouthY) / 2 + 8}" rx="${16 * a.ms}" ry="${11 * a.ms}" fill="#f27ba6" opacity=".9"/>`).join("");

  P.extras = [
    { id: "spots", n: "Spots", pat: spots },
    { id: "stripes", n: "Stripes", pat: stripes },
    { id: "cheeks", n: "Rosy cheeks", cheek: cheeks },
    { id: "bow", n: "Bow", top: bow },
    { id: "hat", n: "Party hat", top: hat, slot: "head" },
    { id: "crown", n: "Crown", top: crown, slot: "head" },
  ];

  P.drawExtras = function (a, c, ids, uid) {
    const on = P.extras.filter((e) => ids.includes(e.id));
    const pat = on.filter((e) => e.pat).map((e) => e.pat(a)).join("");
    return {
      below: (pat ? `<clipPath id="c${uid}"><path d="${a.d}"/></clipPath><g clip-path="url(#c${uid})">${pat}</g>` : "") +
             on.filter((e) => e.cheek).map((e) => e.cheek(a)).join(""),
      above: on.filter((e) => e.top).map((e) => e.top(a)).join(""),
    };
  };

  const I = (inner) => `<svg viewBox="0 0 40 40" aria-hidden="true" filter="url(#wobble)" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  P.tabIcons = [
    { n: "Body shape", c: "var(--mint)", svg: I(`<path d="M20 5C32 4 37 16 35 26C33 35 26 37 20 37C14 37 7 35 5 26C3 16 8 6 20 5Z" fill="#fff"/><circle cx="14" cy="20" r="2.5" fill="${INK}"/><circle cx="26" cy="20" r="2.5" fill="${INK}"/>`) },
    { n: "Colour", c: "#f27ba6", svg: I(`<path d="M20 5C31 5 37 13 36 21C35 28 29 25 27 28C25 33 29 36 22 36C11 36 4 29 4 20C4 11 11 5 20 5Z" fill="#fff"/><circle cx="14" cy="15" r="3.5" fill="#e8432e"/><circle cx="24" cy="13" r="3.5" fill="#2f7fd6"/><circle cx="11" cy="25" r="3.5" fill="#f7c531"/>`) },
    { n: "Eyes", c: "#2f7fd6", svg: I(`<circle cx="12" cy="20" r="8" fill="#fff"/><circle cx="29" cy="20" r="8" fill="#fff"/><circle cx="14" cy="21" r="3.5" fill="${INK}"/><circle cx="31" cy="21" r="3.5" fill="${INK}"/>`) },
    { n: "Mouth", c: "#f7c531", svg: I(`<path d="M6 16Q20 36 34 16Z" fill="#7a1f3d"/><path d="M12 19L16 24L20 19L24 24L28 19" stroke="#fff" stroke-width="2.5"/>`) },
    { n: "Horns and ears", c: "#e8432e", svg: I(`<path d="M8 34Q4 14 14 6Q14 22 20 34ZM32 34Q36 14 26 6Q26 22 20 34Z" fill="#fbeab0"/>`) },
    { n: "Arms and legs", c: "#8a4fbf", svg: I(`<path d="M20 10V26M20 16L8 8M20 16L32 8M20 26L11 36M20 26L29 36"/><circle cx="20" cy="9" r="5" fill="#fff"/>`) },
    { n: "Extras", c: "#3aa356", svg: I(`<path d="M10 34L20 4L30 34Z" fill="#2f7fd6"/><path d="M14 24L26 24" stroke="#e8432e"/><circle cx="20" cy="4" r="3.5" fill="#f7c531"/>`) },
  ];
})();
