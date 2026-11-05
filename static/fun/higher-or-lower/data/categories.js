/*
 * Higher or Lower: categories and the shared item list.
 * Data files call HOL.add(category, rows). Each row is:
 *   [emoji, name, value, fact, options?]   (a "(bracketed)" end of the name becomes a small note)
 * Values are in base units: kg, m, km/h, years, count, °C, dB.
 * options: { exact: true } shows no "about"; { d: "tall" | "long" } for sizes;
 *          { year: 2007 } for "how long ago" items (value is computed from the current year).
 */
(function () {
  "use strict";

  const CATEGORIES = {
    weight: { label: "Weight", unit: "mass", kind: "ratio", more: "heavier", less: "lighter" },
    size: { label: "Height or length", unit: "length", kind: "ratio", more: "bigger", less: "smaller" },
    speed: { label: "Speed", unit: "speed", kind: "ratio", more: "faster", less: "slower" },
    ago: { label: "How long ago", unit: "yearsAgo", kind: "ratio", more: "longer ago", less: "more recent" },
    life: { label: "Lifespan", unit: "years", kind: "ratio", more: "longer-lived", less: "shorter-lived" },
  };

  const THIS_YEAR = new Date().getFullYear();
  const items = [];

  function add(category, rows) {
    if (!CATEGORIES[category]) throw new Error("Unknown category " + category);
    rows.forEach(([e, label, v, f, opts = {}]) => {
      const value = opts.year !== undefined ? THIS_YEAR - opts.year : v;
      // "the tallest known tree (a coast redwood)" → name "the tallest known tree", note "a coast redwood".
      // The note shows small on the card; questions use the plain name.
      const m = /^(.*?) \((.*)\)$/.exec(label);
      const n = m ? m[1] : label;
      items.push({
        id: category + ":" + n,
        category,
        e,
        n,
        v: value,
        f,
        note: m ? m[2] : null,
        d: opts.d || null,
        about: opts.exact || opts.year !== undefined ? false : !CATEGORIES[category].exact, // calendar years are exact
      });
    });
  }

  window.HOL = { CATEGORIES, items, add, THIS_YEAR };
})();
