/*
 * Crayon drawings for the hub's toy tiles. Each is a viewBox 0 0 200 160 SVG.
 * Fills use crayon-hatch patterns (h-<name>) so they look coloured in by a kid;
 * the whole drawing gets the shared #crayon filter from shared/paper.js.
 */
(function () {
  "use strict";

  const HATCH = {
    yellow: "#f2bd2a", green: "#3aa356", pink: "#f27ba6", brown: "#9a5f2c",
    grey: "#8d8a86", red: "#e8432e", orange: "#f2892b", blue: "#2f7fd6", sky: "#7fb6ea",
  };

  function patterns() {
    return Object.entries(HATCH).map(([name, c], i) =>
      `<pattern id="h-${name}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(${28 + (i % 3) * 14})">
         <rect width="7" height="7" fill="${c}" opacity="0.38"/>
         <line x1="0" y1="3.5" x2="7" y2="3.5" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
       </pattern>`).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("afterbegin",
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${patterns()}</defs></svg>`);
  });

  const S = 'stroke="#2a2522" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"';

  window.FUN_ART = {
    "how-many-mes": `
      <path d="M8 150 q12 -6 22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t20 0" fill="none" stroke="#3aa356" stroke-width="4" stroke-linecap="round"/>
      <path d="M150 30 C152 20 170 16 180 24 C186 30 181 38 168 38 C160 40 152 38 150 30 Z" fill="url(#h-yellow)" ${S}/>
      <path d="M138 96 C142 70 150 50 154 34 L166 37 C160 56 155 78 151 100 Z" fill="url(#h-yellow)" ${S}/>
      <path d="M86 99 C92 85 141 83 151 96 C157 107 150 121 131 122 C111 124 89 120 86 108 Z" fill="url(#h-yellow)" ${S}/>
      <path d="M97 118 L95 150 M109 121 L108 150 M131 121 L134 150 M143 117 L148 150 M87 101 L78 119" fill="none" ${S}/>
      <path d="M158 20 L156 10 M166 18 L167 8" fill="none" ${S}/>
      <circle cx="156" cy="9" r="3" fill="#9a5f2c"/><circle cx="167" cy="7" r="3" fill="#9a5f2c"/>
      <g fill="#9a5f2c"><ellipse cx="104" cy="100" rx="6" ry="5"/><ellipse cx="122" cy="94" rx="5" ry="4"/><ellipse cx="135" cy="108" rx="6" ry="4"/><ellipse cx="151" cy="70" rx="3" ry="4"/><ellipse cx="146" cy="88" rx="3" ry="3"/></g>
      <circle cx="167" cy="26" r="2.4" fill="#2a2522"/>
      <circle cx="40" cy="112" r="9" fill="url(#h-pink)" ${S}/>
      <path d="M40 121 L40 137 L32 150 M40 137 L49 150 M40 126 L28 114 M40 126 L53 113" fill="none" ${S}/>
      <path d="M36 114 q4 4 8 0" fill="none" stroke="#2a2522" stroke-width="2" stroke-linecap="round"/>
      <path d="M62 60 q6 -14 16 -6 q6 6 -6 12 l-1 8" fill="none" stroke="#e8432e" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="71" cy="83" r="2.2" fill="#e8432e"/>`,

    "dig-down": `
      <rect x="4" y="0" width="192" height="34" fill="url(#h-sky)"/>
      <circle cx="176" cy="12" r="11" fill="url(#h-yellow)" ${S}/>
      <path d="M4 34 L196 34 L196 44 L4 44 Z" fill="url(#h-green)"/>
      <path d="M4 44 L196 44 L196 84 Q150 90 100 82 T4 86 Z" fill="url(#h-brown)"/>
      <path d="M4 86 Q50 80 100 82 T196 84 L196 118 Q140 124 90 116 T4 120 Z" fill="url(#h-grey)"/>
      <path d="M4 120 Q40 114 90 116 T196 118 L196 160 L4 160 Z" fill="url(#h-orange)"/>
      <path d="M58 160 A42 34 0 0 1 142 160 Z" fill="url(#h-red)" ${S}/>
      <path d="M4 44 L196 44 M4 86 Q50 80 100 82 T196 84 M4 120 Q40 114 90 116 T196 118" fill="none" ${S}/>
      <path d="M94 40 L96 104 L108 104 L106 40 Z" fill="#2a2522" opacity="0.85"/>
      <path d="M30 60 q6 -6 10 0 t10 0" fill="none" stroke="#f27ba6" stroke-width="4" stroke-linecap="round"/>
      <path d="M140 62 l14 4 m-16 -8 a3 3 0 1 0 2 5 m14 -1 a3 3 0 1 1 2 5 M138 59 l3 6 M154 64 l3 6" fill="none" stroke="#fffdf7" stroke-width="3" stroke-linecap="round"/>
      <circle cx="101" cy="94" r="5" fill="url(#h-pink)" ${S}/>
      <path d="M95 91 Q101 83 107 91 Z" fill="#f2bd2a" ${S}/>
      <circle cx="60" cy="16" r="6" fill="url(#h-pink)" ${S}/>
      <path d="M60 22 L60 32 M60 26 L72 20 M72 12 L76 38 M72 38 l8 0" fill="none" ${S}/>
      <path d="M150 140 q6 -8 10 0 M40 140 q6 -8 10 0" fill="none" stroke="#f2bd2a" stroke-width="3" stroke-linecap="round"/>`,

    "monster-maker": `
      <path d="M8 150 L192 150" fill="none" stroke="#2a2522" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
      <path d="M56 140 C40 120 44 70 70 56 C96 42 128 46 144 66 C162 90 160 128 146 142 C124 152 76 154 56 140 Z" fill="url(#h-green)" ${S}/>
      <path d="M78 54 L70 26 L90 48 M122 50 L134 22 L138 56" fill="url(#h-orange)" ${S}/>
      <path d="M80 70 L76 46 M100 64 L100 36 M120 70 L126 46" fill="none" ${S}/>
      <circle cx="76" cy="40" r="10" fill="#fffdf7" ${S}/><circle cx="100" cy="30" r="12" fill="#fffdf7" ${S}/><circle cx="127" cy="40" r="9" fill="#fffdf7" ${S}/>
      <circle cx="78" cy="42" r="4" fill="#2a2522"/><circle cx="102" cy="32" r="5" fill="#2a2522"/><circle cx="125" cy="42" r="4" fill="#2a2522"/>
      <path d="M74 100 Q102 128 130 98 Q102 110 74 100 Z" fill="#2a2522" ${S}/>
      <path d="M84 104 l4 8 l4 -6 M114 104 l-3 8 l-4 -6" fill="#fffdf7" stroke="#2a2522" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 104 Q30 92 26 72 M150 104 Q172 96 178 76" fill="none" ${S}/>
      <path d="M22 70 l4 2 l2 -6 M174 74 l4 2 l4 -5" fill="none" ${S}/>
      <path d="M72 146 l-4 6 l12 0 M128 146 l4 6 l-12 0" fill="none" ${S}/>
      <g fill="url(#h-yellow)"><circle cx="70" cy="122" r="5"/><circle cx="132" cy="80" r="4"/><circle cx="138" cy="124" r="6"/></g>`,

    soon: `
      <rect x="40" y="30" width="120" height="100" fill="none" stroke="#6e625a" stroke-width="2.5" stroke-dasharray="6 7" stroke-linecap="round"/>
      <path d="M92 70 q8 -14 16 -4 q4 8 -8 12 l0 8" fill="none" stroke="#6e625a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="100" cy="96" r="2" fill="#6e625a"/>`,
  };
})();
