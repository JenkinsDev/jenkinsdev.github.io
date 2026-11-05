/*
 * Injects shared SVG filters so hand-authored SVG art looks drawn with a crayon.
 * Load in <head>: <script src="../shared/paper.js"></script>  (no defer needed)
 *   filter="url(#crayon)"  wobbly + grainy crayon strokes and fills
 *   filter="url(#wobble)"  wobble only
 *   filter="url(#marker)"  wobble with a slight ink bleed (for thick outlines)
 */
(function () {
  "use strict";
  const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="drawn"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="mask"/>
      <feComposite in="drawn" in2="mask" operator="in"/>
    </filter>
    <filter id="marker" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="0.35"/>
    </filter>
  </defs>
</svg>`;

  function inject() {
    if (document.getElementById("crayon")) return;
    document.body.insertAdjacentHTML("afterbegin", SVG);
  }
  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);
})();
