/*
 * One SVG cabinet per machine type. Each returns { w, h, svg } where w/h are the
 * viewBox size: the hub sizes machines by w so they all share one scale.
 * Marquee bulbs are added by hub.js into any <g class="bulbs" data-x/y/w/h>.
 * Animation classes (.flash .tilt .wobble .swing .bang .glow) live in hub.css.
 */
(function () {
  "use strict";

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const T = (x, y, size, fill, text, font = "Bungee", extra = "") =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-size="${size}" fill="${fill}" ${extra}>${esc(text)}</text>`;
  const freePlay = (cx, y) =>
    `<rect x="${cx - 26}" y="${y}" width="52" height="14" rx="2" fill="none" stroke="#ff7a1a" stroke-width="2"/>${T(cx, y + 11, 11, "#ffb36b", "FREE PLAY", "VT323")}`;

  const MACHINES = {
    podium: (g) => ({ w: 200, h: 340, svg: `
      <rect x="8" y="4" width="184" height="62" rx="12" fill="${g.color}"/>
      <g class="bulbs" data-x="8" data-y="4" data-w="184" data-h="62"></g>
      ${T(100, 33, 21, "#1a1026", g.marquee[0])}${g.marquee[1] ? T(100, 55, 14, "#1a1026", g.marquee[1]) : ""}
      <rect x="24" y="66" width="152" height="274" fill="#1d1a29" stroke="${g.color}" stroke-width="3"/>
      <rect x="38" y="80" width="124" height="94" rx="8" fill="#0b1d4d" stroke="#000" stroke-width="4"/>
      ${T(100, 99, 13, "#8ff3ff", "WHICH WEIGHS MORE?", "VT323")}
      <rect x="48" y="108" width="44" height="52" rx="4" fill="#ff7a1a"/>
      ${T(70, 131, 12, "#1a1026", "BLUE", "VT323")}${T(70, 143, 12, "#1a1026", "WHALE", "VT323")}
      <rect x="108" y="108" width="44" height="52" rx="4" fill="#2c4bff"/>
      ${T(130, 143, 28, "#fff", "?", "Bungee", 'class="flash"')}${T(100, 138, 13, "#fff", "vs", "VT323")}
      <path d="M24 184 H176 L190 224 H10 Z" fill="#2a2638"/>
      <circle cx="72" cy="204" r="15" fill="#37e27d" stroke="#0d5c2a" stroke-width="3"/><path d="M64 209 L72 197 L80 209 Z" fill="#fff"/>
      <circle cx="128" cy="204" r="15" fill="#ff3d3d" stroke="#6b0d16" stroke-width="3"/><path d="M120 199 L128 211 L136 199 Z" fill="#fff"/>
      <rect x="24" y="224" width="152" height="116" fill="#241f33" stroke="${g.color}" stroke-width="3"/>
      <path d="M100 246 l9 18 l20 3 l-15 14 l4 20 l-18 -10 l-18 10 l4 -20 l-15 -14 l20 -3z" fill="${g.color}" opacity=".9"/>
      ${freePlay(100, 314)}` }),

    tower: (g) => ({ w: 150, h: 420, svg: `
      <rect x="6" y="4" width="138" height="54" rx="10" fill="${g.color}"/>
      <g class="bulbs" data-x="6" data-y="4" data-w="138" data-h="54"></g>
      ${T(75, 32, 21, "#1a1026", g.marquee[0])}${g.marquee[1] ? T(75, 51, 14, "#1a1026", g.marquee[1]) : ""}
      <rect x="14" y="58" width="122" height="362" fill="#1d1a29" stroke="${g.color}" stroke-width="3"/>
      <rect x="26" y="70" width="98" height="250" fill="#120c22" stroke="#000" stroke-width="4"/>
      <g stroke="${g.color}" stroke-width="2" opacity=".6">${[100, 140, 180, 220, 260].map((y) => `<line x1="114" y1="${y}" x2="120" y2="${y}"/>`).join("")}</g>
      <g class="swing">
        <line x1="75" y1="70" x2="75" y2="120" stroke="#8a7fa8" stroke-width="2"/>
        <ellipse cx="75" cy="128" rx="12" ry="9" fill="#ffd23f"/><circle cx="82" cy="119" r="6" fill="#ffd23f"/>
        <path d="M87 119 l7 2 l-7 2z" fill="#ff7a1a"/><circle cx="84" cy="118" r="1.3" fill="#1a1026"/>
      </g>
      <g class="wobble">
        <rect x="40" y="300" width="70" height="8" fill="#8a7fa8"/>
        <rect x="46" y="274" width="58" height="26" rx="2" fill="#1a1a1a" stroke="#fff" stroke-width="1.5"/>
        <rect x="49" y="291" width="52" height="7" fill="#fff"/>
        <g fill="#1a1a1a">${[55, 63, 71, 83, 91].map((x) => `<rect x="${x}" y="291" width="3" height="4"/>`).join("")}</g>
        <rect x="56" y="254" width="38" height="20" rx="4" fill="#c0c6cf"/><rect x="62" y="250" width="8" height="5" fill="#8d8a86"/><rect x="78" y="250" width="8" height="5" fill="#8d8a86"/>
        <rect x="60" y="232" width="30" height="22" rx="2" fill="#ff8fc7"/><rect x="60" y="240" width="30" height="4" fill="#fff"/><rect x="74" y="224" width="2" height="8" fill="#ffd23f"/>
        <ellipse cx="75" cy="216" rx="14" ry="8" fill="#ff7a1a"/><path d="M64 212 l2 -9 l6 6z M80 209 l6 -6 l2 9z" fill="#ff7a1a"/>
        <circle cx="70" cy="214" r="1.5" fill="#1a1026"/><circle cx="80" cy="214" r="1.5" fill="#1a1026"/>
      </g>
      <circle cx="75" cy="356" r="20" fill="${g.color}" stroke="#6b0d3a" stroke-width="3"/>${T(75, 360, 10, "#fff", "DROP")}
      ${freePlay(75, 394)}` }),

    saloon: (g) => ({ w: 240, h: 340, svg: `
      <path d="M14 64 V28 H50 V10 H190 V28 H226 V64 Z" fill="#8a5a3b" stroke="${g.color}" stroke-width="3"/>
      <g stroke="#6b4a33" stroke-width="2"><line x1="16" y1="46" x2="224" y2="46"/><line x1="52" y1="22" x2="188" y2="22"/></g>
      ${T(120, 50, 22, "#ffd23f", g.marquee[0], "Bungee", 'stroke="#1a1026" stroke-width="1"')}
      <rect x="20" y="64" width="200" height="276" fill="#1d1a29" stroke="${g.color}" stroke-width="3"/>
      <rect x="38" y="78" width="164" height="96" rx="8" fill="#ff7a1a" stroke="#000" stroke-width="4"/>
      <rect x="40" y="80" width="160" height="30" fill="#ffb36b"/><rect x="40" y="110" width="160" height="22" fill="#ffd23f"/>
      <circle cx="120" cy="132" r="16" fill="#fff3a0"/><rect x="40" y="148" width="160" height="24" fill="#6b4a33"/>
      <g fill="#1a1026">
        <rect x="62" y="124" width="10" height="24"/><rect x="58" y="120" width="18" height="4"/><rect x="62" y="114" width="10" height="7"/><rect x="72" y="132" width="9" height="3"/>
        <rect x="168" y="124" width="10" height="24"/><rect x="164" y="120" width="18" height="4"/><rect x="168" y="114" width="10" height="7"/><rect x="159" y="132" width="9" height="3"/>
      </g>
      <g class="bang"><circle cx="120" cy="104" r="15" fill="#ff3d3d" stroke="#fff" stroke-width="2"/>${T(120, 114, 24, "#fff", "!")}</g>
      <path d="M20 186 H220 L234 228 H6 Z" fill="#2a2638"/>
      <circle cx="56" cy="206" r="16" fill="#ff3d3d" stroke="#6b0d16" stroke-width="3"/>${T(56, 210, 11, "#fff", "P1")}
      <circle cx="184" cy="206" r="16" fill="#2c7bff" stroke="#0d2a6b" stroke-width="3"/>${T(184, 210, 11, "#fff", "P2")}
      ${T(120, 210, 12, "#ffd23f", "TAP ON THE !", "VT323")}
      <rect x="20" y="228" width="200" height="112" fill="#241f33" stroke="${g.color}" stroke-width="3"/>
      <path d="M84 244 h34 v58 q-17 8 -34 0z M122 244 h34 v58 q-17 8 -34 0z" fill="#6b4a33" stroke="${g.color}" stroke-width="2"/>
      <g stroke="#8a5a3b" stroke-width="2">${[256, 268, 280].map((y) => `<line x1="90" y1="${y}" x2="112" y2="${y}"/><line x1="128" y1="${y}" x2="150" y2="${y}"/>`).join("")}</g>
      <g transform="rotate(-4 52 269)"><rect x="32" y="244" width="40" height="50" fill="#f3e3b5"/>${T(52, 260, 7, "#6b4a33", "WANTED")}</g>
      <g transform="rotate(5 188 269)"><rect x="168" y="244" width="40" height="50" fill="#f3e3b5"/>${T(188, 260, 7, "#6b4a33", "WANTED")}</g>
      ${freePlay(120, 314)}` }),

    table: (g) => ({ w: 260, h: 300, svg: `
      <line x1="92" y1="0" x2="92" y2="20" stroke="#8a7fa8" stroke-width="2"/><line x1="168" y1="0" x2="168" y2="20" stroke="#8a7fa8" stroke-width="2"/>
      <rect x="70" y="18" width="120" height="48" rx="6" fill="#111" stroke="${g.color}" stroke-width="3"/>
      ${T(130, 38, 15, g.color, g.marquee[0])}
      ${T(112, 59, 20, "#ff3d3d", "3", "VT323")}${T(130, 59, 20, "#fff", ":", "VT323", 'class="flash"')}${T(148, 59, 20, "#2c7bff", "2", "VT323")}
      <polygon points="56,150 204,150 246,232 14,232" fill="#0e2a3a" stroke="${g.color}" stroke-width="4"/>
      <line x1="35" y1="191" x2="225" y2="191" stroke="#ff3da0" stroke-width="2"/>
      <ellipse cx="130" cy="191" rx="28" ry="10" fill="none" stroke="#ff3da0" stroke-width="2"/>
      <rect x="108" y="228" width="44" height="6" fill="#000"/><rect x="117" y="147" width="26" height="4" fill="#000"/>
      <ellipse cx="96" cy="218" rx="14" ry="6" fill="#ff3d3d"/><ellipse cx="96" cy="215" rx="6" ry="3" fill="#ff8a8a"/>
      <ellipse cx="156" cy="162" rx="9" ry="4" fill="#2c7bff"/><ellipse cx="156" cy="160" rx="4" ry="2" fill="#8ab8ff"/>
      <ellipse rx="6" ry="3" fill="#fff" class="glow" style="color:#fff">
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M130 205 L178 168 L104 172 L120 214 L168 200 L130 205"/>
      </ellipse>
      <polygon points="14,232 246,232 240,254 20,254" fill="#1d1a29" stroke="${g.color}" stroke-width="2"/>
      <rect x="28" y="254" width="10" height="46" fill="#2a2638"/><rect x="222" y="254" width="10" height="46" fill="#2a2638"/>
      ${freePlay(130, 262)}` }),

    pinball: (g) => ({ w: 180, h: 330, svg: `
      <rect x="24" y="4" width="132" height="114" rx="8" fill="#1d1a29" stroke="${g.color}" stroke-width="3"/>
      <rect x="34" y="14" width="112" height="82" fill="#3a1858"/>
      ${T(90, 66, 36, "#ff3d3d", g.marquee[0], "Bungee", 'class="tilt"')}
      ${T(90, 88, 13, "#ffd23f", "NEW GAME SOON", "VT323")}
      <rect x="70" y="118" width="40" height="14" fill="#111"/>
      <polygon points="42,132 138,132 170,264 10,264" fill="#16233f" stroke="${g.color}" stroke-width="3"/>
      <circle cx="72" cy="166" r="10" fill="#ff3da0" class="glow" style="color:#ff3da0"/>
      <circle cx="110" cy="172" r="10" fill="#00e5ff" class="glow" style="color:#00e5ff"/>
      <circle cx="90" cy="200" r="10" fill="#ffd23f" class="glow" style="color:#ffd23f"/>
      <path d="M54 246 l26 8 M126 246 l-26 8" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <circle r="4" fill="#d9e2ec"><animateMotion dur="3s" repeatCount="indefinite" path="M90 240 L130 160 L72 150 L60 210 L110 196 L90 240"/></circle>
      <polygon points="10,264 170,264 166,288 14,288" fill="#241f33" stroke="${g.color}" stroke-width="2"/>
      <rect x="20" y="288" width="9" height="42" fill="#2a2638"/><rect x="151" y="288" width="9" height="42" fill="#2a2638"/>` }),
  };

  window.FP_MACHINES = MACHINES;
})();
