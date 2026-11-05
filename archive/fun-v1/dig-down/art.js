/*
 * Dig to the Middle of the Earth: hand-drawn SVG art (crayon on paper).
 * Every symbol is wrapped in <g filter="url(#crayon)"> (filters come from ../shared/paper.js).
 * Use: <svg><use href="#rock1"/></svg>, sized with CSS.
 */
(function () {
  "use strict";
  const INK = "#2a2522";
  const A = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const sym = (id, vb, body) =>
    `<symbol id="${id}" viewBox="${vb}" ${A}><g filter="url(#crayon)">${body}</g></symbol>`;
  const line = (d, c, w) =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const P = { sun: "#f7c531", red: "#e8432e", blue: "#2f7fd6", green: "#3aa356", pink: "#f27ba6", org: "#f2892b", paper: "#fffdf7", rock: "#a39a8e", rock2: "#857c72", brown: "#a8703a", skin: "#f3c9a0" };
  const V = "0 0 100 100";
  const rootsD = "M50 4 L49 40 M49 40 Q30 54 12 52 M49 40 Q68 60 90 90 M49 40 Q52 70 40 96 M28 51 Q18 70 22 86";
  const wormD = "M12 72 Q26 30 44 62 T78 58 Q92 52 88 38";
  const flower = (x, y, c) => `<g transform="translate(${x} ${y})" fill="${c}"><circle cx="0" cy="-12" r="9"/><circle cx="12" cy="-3" r="9"/><circle cx="7" cy="11" r="9"/><circle cx="-8" cy="10" r="9"/><circle cx="-12" cy="-3" r="9"/><circle r="7" fill="${P.sun}"/></g>`;

  const symbols = [
    sym("rock1", V, `<path d="M12 80 Q6 52 28 38 Q44 18 68 30 Q92 40 90 66 Q92 84 70 86 Z" fill="${P.rock}"/><path d="M34 46 Q44 38 54 42" fill="none" stroke="#fff" stroke-opacity=".7"/>`),
    sym("rock2", V, `<path d="M10 84 L20 48 L46 30 L78 40 L92 84 Z" fill="${P.rock2}"/><path d="M46 30 L50 62 L20 48 M50 62 L78 40 M50 62 L58 84" fill="none" stroke-width="3" stroke-opacity=".5"/>`),
    sym("pebbles", V, `<ellipse cx="30" cy="66" rx="18" ry="13" fill="#d8c3a0"/><ellipse cx="64" cy="72" rx="22" ry="15" fill="${P.rock}"/><ellipse cx="52" cy="42" rx="14" ry="10" fill="#e6dcc8"/>`),
    sym("worm", V, `${line(wormD, P.pink, 14)}<circle cx="84" cy="32" r="3" fill="${INK}" stroke="none"/><circle cx="92" cy="33" r="3" fill="${INK}" stroke="none"/>`),
    sym("roots", V, line(rootsD, "#c68b4a", 7)),
    sym("bone", V, `<g transform="rotate(-25 50 50)" fill="${P.paper}"><circle cx="24" cy="40" r="10"/><circle cx="24" cy="60" r="10"/><circle cx="76" cy="40" r="10"/><circle cx="76" cy="60" r="10"/><rect x="26" y="40" width="48" height="20" rx="6"/><rect x="22" y="43" width="8" height="14" stroke="none"/><rect x="70" y="43" width="8" height="14" stroke="none"/></g>`),
    sym("gem", V, `<path d="M50 14 L82 38 L50 88 L18 38 Z" fill="${P.blue}"/><path d="M18 38 H82 M50 14 L38 38 L50 88 L62 38 Z" fill="none" stroke-width="3"/>`),
    sym("coin", V, `<circle cx="50" cy="50" r="34" fill="${P.sun}"/><circle cx="50" cy="50" r="22" fill="none" stroke-width="3"/><path d="M50 36 V64 M42 44 H58 M42 56 H58" stroke-width="3" fill="none"/>`),
    sym("sock", V, `<path d="M34 10 H62 V50 L82 66 Q92 80 80 90 Q66 98 54 84 L34 62 Z" fill="${P.paper}"/><path d="M34 10 H62 V26 H34 Z" fill="${P.red}"/><path d="M36 38 H62 M40 50 H62" stroke="${P.blue}" stroke-width="5" fill="none"/>`),
    sym("mole", V, `<ellipse cx="50" cy="62" rx="36" ry="28" fill="#8a7a6c"/><ellipse cx="50" cy="58" rx="9" ry="7" fill="${P.pink}"/><path d="M30 46 Q36 52 42 46 M58 46 Q64 52 70 46" fill="none" stroke-width="3"/><ellipse cx="28" cy="84" rx="9" ry="6" fill="${P.pink}"/><ellipse cx="72" cy="84" rx="9" ry="6" fill="${P.pink}"/><text x="68" y="26" font-size="20" font-weight="700" fill="${INK}" stroke="none" font-family="Patrick Hand,cursive">z</text><text x="80" y="14" font-size="14" font-weight="700" fill="${INK}" stroke="none" font-family="Patrick Hand,cursive">z</text>`),
    sym("duck", V, `<path d="M12 60 Q14 86 50 88 Q86 86 84 56 Q74 66 62 58 Q66 34 46 26 Q26 26 28 48 Q16 48 12 60 Z" fill="${P.sun}"/><path d="M30 40 L14 44 L30 50 Z" fill="${P.org}"/><circle cx="42" cy="38" r="3" fill="${INK}" stroke="none"/><path d="M52 66 Q66 62 72 72" fill="none" stroke-width="3"/>`),
    sym("dino", V, `<path d="M18 66 L2 80 L24 82 Z" fill="${P.green}"/><ellipse cx="46" cy="68" rx="30" ry="20" fill="${P.green}"/><rect x="30" y="80" width="10" height="14" rx="4" fill="${P.green}"/><rect x="54" y="80" width="10" height="14" rx="4" fill="${P.green}"/><circle cx="66" cy="40" r="18" fill="${P.green}"/><path d="M36 52 L42 40 L48 50 L54 40 L58 52" fill="${P.sun}"/><circle cx="70" cy="36" r="7" fill="#fff"/><circle cx="72" cy="35" r="3" fill="${INK}" stroke="none"/><path d="M62 50 Q72 54 80 48" fill="none" stroke-width="3"/><text x="78" y="22" font-size="26" font-weight="700" fill="${INK}" stroke="none" font-family="Lilita One,sans-serif">?</text>`),
    sym("garden", V, `<path d="M8 94 L14 70 L22 94 L30 62 L38 94 L50 74 L58 94 L68 66 L76 94 L84 76 L92 94 Z" fill="${P.green}"/><path d="M30 60 V36 M70 62 V44" stroke="#2a8a40" stroke-width="5" fill="none"/>${flower(30, 28, P.pink)}${flower(70, 36, P.org)}`),
    sym("chest", V, `<rect x="12" y="42" width="76" height="44" rx="4" fill="${P.brown}"/><path d="M12 48 Q12 18 50 18 Q88 18 88 48 Z" fill="#c98a4a"/><rect x="26" y="18" width="10" height="68" fill="${P.sun}"/><rect x="64" y="18" width="10" height="68" fill="${P.sun}"/><rect x="42" y="46" width="16" height="16" rx="3" fill="${P.sun}"/><circle cx="50" cy="54" r="2.5" fill="${INK}" stroke="none"/>`),
    sym("ants", V, `<g fill="${P.red}"><circle cx="26" cy="58" r="10"/><circle cx="46" cy="58" r="8"/><circle cx="68" cy="56" r="14"/></g><path d="M40 62 L34 80 M46 64 L46 82 M52 62 L58 80 M72 44 Q78 30 88 30 M66 44 Q66 28 56 24" fill="none"/><circle cx="72" cy="52" r="3" fill="#fff" stroke-width="2"/>`),
    sym("pipes", V, `${line("M0 36 H70 Q86 36 86 52 V100", "#7fb2d9", 18)}<rect x="34" y="20" width="10" height="32" rx="3" fill="#cfd8e6"/><path d="M20 58 Q26 68 20 72 Q14 68 20 58Z" fill="${P.blue}"/>`),
    sym("subway", "0 0 120 100", `<path d="M30 76 L22 90 M90 76 L98 90" fill="none"/><rect x="20" y="14" width="80" height="62" rx="14" fill="${P.blue}"/><rect x="30" y="24" width="60" height="26" rx="6" fill="${P.paper}"/><circle cx="36" cy="62" r="6" fill="${P.sun}"/><circle cx="84" cy="62" r="6" fill="${P.sun}"/><path d="M8 90 H112" stroke-width="6"/>`),
    sym("fossil", V, `<rect x="8" y="12" width="84" height="76" rx="8" fill="${P.rock}"/>${line("M20 60 Q50 44 78 56", P.paper, 5)}${line("M36 52 Q32 70 40 76 M50 50 Q48 70 54 78 M64 52 Q64 68 70 72", P.paper, 3)}<path d="M70 44 Q92 38 90 56 Q84 66 70 62 Z" fill="${P.paper}"/><circle cx="80" cy="50" r="3.5" fill="${INK}" stroke="none"/>`),
    sym("cave", "0 0 160 100", `<path d="M0 0 H160 V16 Q140 22 130 16 L122 46 L114 16 Q96 22 80 14 L72 58 L62 14 Q40 24 28 14 L20 40 L12 16 Q4 18 0 14Z" fill="${P.rock2}"/><path d="M0 100 V84 L18 70 L30 84 L56 84 L70 62 L84 84 L120 84 L136 68 L148 84 L160 80 V100Z" fill="${P.rock2}"/><path d="M80 50 L68 38 L72 54 Q58 42 42 56 Q54 52 58 62 Q66 54 74 64 L80 56 L86 64 Q94 54 102 62 Q106 52 118 56 Q102 42 88 54 L92 38Z" fill="#4a3f50"/><circle cx="76" cy="56" r="2" fill="#fff" stroke="none"/><circle cx="84" cy="56" r="2" fill="#fff" stroke="none"/>`),
    sym("water", V, `<path d="M50 8 Q84 46 80 66 Q78 90 50 90 Q22 90 20 66 Q16 46 50 8Z" fill="${P.blue}"/><path d="M34 62 Q36 76 46 78" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="4"/>`),
    sym("mine", V, `<g fill="${P.sun}"><circle cx="34" cy="34" r="10"/><circle cx="52" cy="28" r="12"/><circle cx="70" cy="35" r="9"/></g><path d="M10 40 H90 L80 78 H20 Z" fill="${P.rock2}"/><circle cx="30" cy="86" r="9" fill="${P.sun}"/><circle cx="70" cy="86" r="9" fill="${P.sun}"/>`),
    sym("derrick", V, `<path d="M50 6 L82 92 H18 Z" fill="${P.sun}"/><path d="M33 50 H67 M26 70 H74 M42 28 H58" fill="none" stroke-width="3"/><ellipse cx="50" cy="94" rx="9" ry="4" fill="${INK}"/>`),
    sym("crust", V, `<path d="M8 20 Q30 8 50 16 T92 14 V86 H8Z" fill="${P.brown}"/><path d="M8 40 Q30 30 50 38 T92 34 M8 58 Q30 50 50 56 T92 54" fill="none" stroke-width="3" stroke-opacity=".6"/><path d="M8 74 Q30 66 50 72 T92 70 V86 H8Z" fill="${P.org}"/><path d="M8 20 Q30 8 50 16 T92 14" fill="none" stroke="${P.green}" stroke-width="8"/>`),
    sym("goo", V, `<rect x="8" y="14" width="84" height="72" rx="8" fill="${P.org}"/><g fill="${P.sun}"><circle cx="30" cy="40" r="10"/><circle cx="64" cy="58" r="14"/><circle cx="40" cy="70" r="6"/><circle cx="72" cy="30" r="6"/></g>`),
    sym("outer", V, `<circle cx="50" cy="50" r="40" fill="${P.org}"/><path d="M20 44 Q36 30 50 44 T80 44 M22 62 Q38 48 52 62 T80 60" fill="none" stroke="${P.paper}" stroke-width="5"/>`),
    sym("inner", V, `<circle cx="50" cy="50" r="40" fill="${P.org}"/><circle cx="50" cy="50" r="22" fill="${P.sun}"/><path d="M50 36 V64 M36 50 H64" stroke-width="3" fill="none"/>`),
    sym("sparkle", V, `<path d="M50 4 L58 42 L96 50 L58 58 L50 96 L42 58 L4 50 L42 42Z" fill="${P.sun}"/>`),
    sym("star", V, `<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="${P.sun}"/>`),
    sym("blob", V, `<path d="M14 70 Q8 40 36 34 Q50 12 70 32 Q96 40 86 68 Q74 90 40 86 Q20 86 14 70Z" fill="${P.org}"/><circle cx="40" cy="50" r="6" fill="${P.sun}" stroke="none"/>`),
    sym("bus", "0 0 160 80", `<rect x="6" y="12" width="148" height="46" rx="10" fill="${P.sun}"/><g fill="${P.paper}"><rect x="16" y="22" width="22" height="16" rx="2"/><rect x="44" y="22" width="22" height="16" rx="2"/><rect x="72" y="22" width="22" height="16" rx="2"/><rect x="100" y="22" width="22" height="16" rx="2"/><rect x="130" y="22" width="16" height="30" rx="2"/></g><path d="M6 44 H126" stroke-width="3"/><circle cx="36" cy="60" r="10" fill="${INK}"/><circle cx="116" cy="60" r="10" fill="${INK}"/>`),
    sym("whale", "0 0 160 100", `<path d="M50 38 V14 M50 14 Q40 6 34 12 M50 14 Q60 6 66 12" fill="none" stroke="${P.blue}" stroke-width="5"/><path d="M10 70 Q10 40 56 38 Q110 36 134 58 Q148 42 156 30 Q156 54 146 70 Q154 84 140 92 Q130 80 124 80 Q80 98 30 90 Q10 86 10 70Z" fill="${P.blue}"/><circle cx="38" cy="62" r="3.5" fill="${INK}" stroke="none"/><path d="M26 74 Q46 82 62 72" fill="none" stroke-width="3"/>`),
    sym("sun", V, `<circle cx="50" cy="50" r="22" fill="${P.sun}"/><path d="M50 8 V20 M50 80 V92 M8 50 H20 M80 50 H92 M20 20 L29 29 M71 71 L80 80 M80 20 L71 29 M29 71 L20 80" fill="none" stroke="${P.org}" stroke-width="5"/>`),
    sym("cloud", "0 0 120 60", `<path d="M20 50 Q4 50 8 36 Q10 24 26 28 Q30 8 52 12 Q66 2 80 16 Q100 12 102 30 Q118 34 110 48 Q106 52 96 50Z" fill="#fff"/>`),
  ];

  const digger = `<svg viewBox="0 0 120 140" aria-hidden="true" ${A}><g filter="url(#wobble)">
<path d="M100 66 L90 112" stroke-width="11"/><path d="M100 66 L90 112" stroke="#d9a15c" stroke-width="5"/>
<path d="M80 110 Q90 106 100 112 Q100 130 90 134 Q80 130 80 110Z" fill="#c9c3d6"/><path d="M92 66 H108" stroke-width="5"/>
<ellipse cx="46" cy="132" rx="14" ry="7" fill="#7a4a22"/><ellipse cx="74" cy="132" rx="14" ry="7" fill="#7a4a22"/>
<path d="M36 84 Q34 128 44 128 H76 Q86 128 84 84 Z" fill="${P.blue}"/>
<path d="M34 88 Q60 74 86 88 L84 96 H36Z" fill="${P.red}"/><rect x="52" y="104" width="16" height="12" rx="2" fill="#1f62ad" stroke-width="3"/>
<path d="M38 92 Q22 100 28 112" fill="none" stroke="${INK}" stroke-width="12"/><path d="M38 92 Q22 100 28 112" fill="none" stroke="${P.skin}" stroke-width="6"/>
<path d="M82 92 Q92 92 95 84" fill="none" stroke="${INK}" stroke-width="12"/><path d="M82 92 Q92 92 95 84" fill="none" stroke="${P.skin}" stroke-width="6"/>
<path d="M32 58 Q30 86 60 86 Q90 86 88 58 Q86 34 60 32 Q34 34 32 58Z" fill="${P.skin}"/>
<circle cx="46" cy="70" r="5" fill="${P.pink}" stroke="none" opacity=".8"/><circle cx="74" cy="70" r="5" fill="${P.pink}" stroke="none" opacity=".8"/>
<circle cx="50" cy="63" r="3.2" fill="${INK}" stroke="none"/><circle cx="70" cy="63" r="3.2" fill="${INK}" stroke="none"/>
<path d="M50 74 Q60 82 70 74" fill="none" stroke-width="3.5"/>
<path d="M29 52 Q28 24 62 22 Q92 26 91 52 Z" fill="${P.sun}"/><rect x="23" y="50" width="74" height="9" rx="4" fill="${P.sun}"/>
<rect x="55" y="17" width="12" height="30" rx="4" fill="${P.org}" stroke-width="3"/><circle cx="61" cy="38" r="7" fill="#fffbe0"/>
</g></svg>`;

  const sprite = `<svg id="sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${symbols.join("")}</defs></svg>`;
  window.DIG_ART = { sprite, digger };
})();
