/*
 * The toy registry — the hub renders one tile per entry.
 * To add a toy: create static/fun/<slug>/index.html and add an entry here.
 *   added: ISO date; tiles get a "NEW!" badge for 14 days after it.
 */
window.FUN_TOYS = [
  {
    slug: "how-many-mes",
    name: "How Many Me's?",
    blurb: "How many of YOU is a whale?",
    icon: "🦒",
    color: "var(--sun)",
    added: "2026-11-05",
  },
  {
    slug: "dig-down",
    name: "Dig to the Middle of the Earth",
    blurb: "Keep digging… what's down there?",
    icon: "⛏️",
    color: "var(--tomato)",
    added: "2026-11-05",
  },
  {
    slug: "monster-maker",
    name: "Monster Maker",
    blurb: "Build a silly monster",
    icon: "👾",
    color: "var(--mint)",
    added: "2026-11-05",
  },
];
