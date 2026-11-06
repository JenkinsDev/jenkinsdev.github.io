/*
 * FREE PLAY game registry. The hub shows one portrait per entry, in order.
 *
 *   slug     folder under /fun/ (the game lives at /fun/<slug>/)
 *   live     false → the card shows "COMING SOON" instead of PRESS START
 *   players  1, 2, or [1, 2] (2 = two people sharing one screen; [1, 2] = solo vs the computer or two players)
 *   teaser   true → shown as a locked "?" slot
 *   scene    the pixel attract loop to play (see scenes.js)
 *   stats    [brains, speed, skill, luck, silly], each 0–5
 */
window.FP_GAMES = [
  {
    slug: "higher-or-lower", name: "Higher or Lower", live: true, players: 1,
    scene: "hol", color: "#ffd23f", stats: [5, 1, 1, 2, 2],
    hook: "Two real things. Pick the one that's heavier, faster, taller or older.",
  },
  {
    slug: "quick-draw", name: "Quick Draw", live: true, players: [1, 2],
    scene: "draw", color: "#ff7a1a", stats: [1, 5, 3, 2, 3],
    hook: "Wait for the signal, then draw first. Draw early and you lose the round.",
  },
  {
    slug: "air-puck", name: "Air Puck", live: true, players: [1, 2],
    scene: "puck", color: "#00e5ff", stats: [1, 5, 4, 1, 2],
    hook: "Air hockey on one screen.",
  },
  {
    slug: "stack-it", name: "Stack It", live: true, players: [1, 2],
    scene: "stack", color: "#ff3da0", stats: [2, 2, 4, 3, 5],
    hook: "Drop things from a crane and stack them as high as you can.",
  },
  {
    slug: "window-post", name: "Window Post", live: true, players: [1, 2],
    scene: "window-post", color: "#4fd18b", stats: [3, 1, 4, 1, 3],
    hook: "Throw parcels into every open window. A window you hit closes.",
  },
  {
    slug: "tug-of-war", name: "Tug of War", live: true, players: [1, 2],
    scene: "tug", color: "#ff8c42", stats: [1, 5, 2, 3, 4],
    hook: "Mash your side of the rope. First to pull the flag over the line wins the round.",
  },
  {
    slug: "rocket-lander", name: "Rocket Lander", live: true, players: [1, 2],
    scene: "lander", color: "#7eb8ff", stats: [3, 2, 5, 1, 2],
    hook: "Fire the thrusters and set down gently. Gravity changes on every world.",
  },
];
