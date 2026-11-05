/*
 * Higher or Lower: number and unit formatting (US default, metric optional),
 * plus the comparison sentence shown after each reveal.
 */
(function () {
  "use strict";

  const HOL = window.HOL;

  /** Human-friendly number: commas, a few significant figures, "million"/"billion" for big ones. */
  function nice(n) {
    const sign = n < 0 ? "-" : "";
    const a = Math.abs(n);
    const trim = (x, d) => x.toFixed(d).replace(/\.0+$/, "");
    if (a >= 1e9) return sign + trim(a / 1e9, a / 1e9 < 100 ? 1 : 0) + " billion";
    if (a >= 1e6) return sign + trim(a / 1e6, a / 1e6 < 100 ? 1 : 0) + " million";
    if (a >= 1000) {
      const mag = Math.pow(10, Math.floor(Math.log10(a)) - 2); // 3 significant figures
      return sign + (Math.round(a / mag) * mag).toLocaleString("en-US");
    }
    if (a >= 10) return sign + Math.round(a);
    if (a >= 1) return sign + trim(a, 1);
    if (a === 0) return "0";
    return sign + Number(a.toPrecision(2)).toString();
  }

  const KG_LB = 2.20462;
  const M_FT = 3.28084;
  const KMH_MPH = 0.621371;

  const UNITS = {
    // `ref` picks the unit (so both cards in a round match); `kg`/`m` is the value shown.
    mass(kg, sys, ref) {
      if (sys === "metric") {
        if (ref < 0.001) return nice(kg * 1e6) + " mg";
        if (ref < 1) return nice(kg * 1000) + " g";
        if (ref >= 1000) return nice(kg / 1000) + (kg / 1000 === 1 ? " tonne" : " tonnes");
        return nice(kg) + " kg";
      }
      const refLb = ref * KG_LB;
      if (refLb < 1) return nice(kg * KG_LB * 16) + " oz";
      if (refLb >= 10000) return nice((kg * KG_LB) / 2000) + " tons";
      return nice(kg * KG_LB) + " lb";
    },
    length(m, sys, ref) {
      if (sys === "metric") {
        if (ref < 0.01) return nice(m * 1000) + " mm";
        if (ref < 1) return nice(m * 100) + " cm";
        if (ref >= 1000) return nice(m / 1000) + " km";
        return nice(m) + " m";
      }
      const refFt = ref * M_FT;
      if (refFt < 1) return nice(m * M_FT * 12) + " in";
      if (refFt >= 52800) return nice((m * M_FT) / 5280) + " miles";
      return nice(m * M_FT) + " ft";
    },
    speed: (kmh, sys) => (sys === "metric" ? nice(kmh) + " km/h" : nice(kmh * KMH_MPH) + " mph"),
    temp: (c, sys) => (Math.round(sys === "metric" ? c : (c * 9) / 5 + 32) + 0).toLocaleString("en-US") + (sys === "metric" ? " °C" : " °F"),
    db: (v) => nice(v) + " dB",
    count: (v) => nice(v),
    years(y) {
      if (y < 0.25) { const w = Math.round(y * 52); return w + (w === 1 ? " week" : " weeks"); }
      if (y < 1) { const mo = Math.round(y * 12); return mo + (mo === 1 ? " month" : " months"); }
      return nice(y) + (y === 1 ? " year" : " years");
    },
    yearsAgo: (y) => UNITS.years(y) + " ago",
  };

  /** format("mass", 70, "us") → "154 lb". Pass `ref` (the round's smaller value) so both cards share a unit. */
  function format(unit, value, sys, ref = value) {
    return UNITS[unit](value, sys, ref);
  }

  function ratioText(r) {
    if (r < 2) return r.toFixed(1).replace(/\.0$/, "");
    if (r < 1000) return String(Math.round(r));
    return nice(r);
  }

  /** The sentence under the revealed card, e.g. "About 12× heavier than an ant." */
  function describe(cat, mystery, known, sys) {
    const up = mystery.v > known.v;
    if (cat.kind === "temp") {
      const diffC = Math.abs(mystery.v - known.v);
      const diff = sys === "metric" ? Math.round(diffC) + " °C" : Math.round((diffC * 9) / 5) + " °F";
      return `About ${diff} ${up ? cat.more : cat.less} than ${known.n}.`;
    }
    if (cat.kind === "db") {
      const diff = Math.round(Math.abs(mystery.v - known.v));
      const feel = ratioText(Math.pow(2, diff / 10));
      return `${diff} dB ${up ? cat.more : cat.less} than ${known.n}, so it sounds about ${feel}× ${up ? "as loud" : "quieter"}.`;
    }
    let word = up ? cat.more : cat.less;
    if (cat.unit === "length" && mystery.d && mystery.d === known.d) {
      word = mystery.d === "tall" ? (up ? "taller" : "shorter") : up ? "longer" : "shorter";
    }
    const r = Math.max(mystery.v, known.v) / Math.min(mystery.v, known.v);
    return `About ${ratioText(r)}× ${word} than ${known.n}.`;
  }

  /** The round's question, e.g. "Which is heavier?" Both numbers stay hidden until the player picks. */
  function prompt(cat, a, b) {
    if (cat.unit === "length" && a.d && a.d === b.d) return a.d === "tall" ? "Which is taller?" : "Which is longer?";
    if (cat.unit === "yearsAgo") return "Which came first?";
    if (cat.unit === "years") return "Which lives longer?";
    return `Which is ${cat.more}?`;
  }

  Object.assign(HOL, { nice, format, describe, prompt });
})();
