/*
 * Dig to the Middle of the Earth: data.
 *
 * SOURCES / NOTES (depths are real, rounded, conservative; "y" is page pixels, NOT real distance)
 *  - Earth's radius / centre: 6,371 km (mean radius; NASA / USGS).
 *  - Garden, worms, roots: earthworms and most tree roots live in the top metre or so of soil
 *    (soil science basics). Shown as 0 m, 0.3 m, 1 m.
 *  - Ant nests: many species dig 1-5 m; big nests (e.g. leafcutters) can reach several metres. Shown at 2 m.
 *  - Buried treasure: pirates burying chests is mostly from stories (Treasure Island), real ones rarely did. 3 m is a joke depth.
 *  - Pipes: sewer and water mains typically sit 1-6 m down. Shown at 5 m.
 *  - Subway tunnels: many city tunnels are roughly 10-30 m down (varies a lot, some are shallower). Shown at 15 m.
 *  - Fossils: dinosaurs lived about 230 to 66 million years ago. Fossil depth varies hugely (most are found
 *    where erosion exposes them), so 40 m is just a "typical rock layer" spot.
 *  - Caves: many caves are within tens to hundreds of metres of the surface; the deepest known caves pass 2,000 m.
 *    Shown at 90 m. Stalactites grow very slowly (centimetres per century or less).
 *  - Groundwater: water tables and wells range from a few metres to a few hundred metres. Shown at 150 m.
 *  - Deepest mine: Mponeng gold mine, South Africa, about 4 km (about 3.9 km); rock temperature around 60 C.
 *  - Kola Superdeep Borehole, Russia: 12,262 m (about 12.2 km), drilled 1970-1989, stopped because the rock was
 *    about 180 C, far hotter than expected. Hole is about 23 cm wide. 12.2 / 6,371 = about 0.2 percent of the way.
 *  - Crust: about 35 km thick on average under continents (roughly 30-50 km), only 5-10 km under oceans (Moho).
 *  - Mantle: from the crust down to about 2,890 km depth (about 2,900 km thick); solid rock that slowly flows.
 *  - Outer core: liquid iron and nickel from about 2,890 km to 5,150 km depth (about 2,260 km thick);
 *    its motion makes Earth's magnetic field.
 *  - Inner core: solid iron and nickel ball, radius about 1,220 km (5,150 km depth to the centre),
 *    about 5,200-5,400 C, roughly as hot as the Sun's surface (about 5,500 C).
 *  - Comparisons for 6,371 km: school bus about 12 m (about 530,000 buses), Mount Everest 8,849 m (about 720),
 *    jet at about 900 km/h (about 7 hours), walking at 5 km/h non-stop (about 53 days).
 *  - Antipodes: about 71 percent of Earth's surface is ocean; the point opposite most of the contiguous US is in the
 *    southern Indian Ocean; Spain's is near New Zealand.
 *  - Feet = metres x 3.28084.
 */
(function () {
  "use strict";

  const EARTH_M = 6371000;

  // y = pixels below the ground line. Depth between two stations is linear in y.
  const stations = [
    { id: "garden", d: 0, y: 0, sym: "garden", title: "The Garden",
      fact: "Grass and flowers live here. Their roots hold the dirt together.",
      joke: "Grown-ups: \"Don't dig up the garden!\" Us: \"Too late!\"" },
    { id: "worms", d: 0.3, y: 800, sym: "worm", title: "Wiggly Worms",
      fact: "Worms munch old leaves and make soil healthy. They have no ears and no eyes!",
      joke: "Great at hide-and-seek. Terrible at high-fives." },
    { id: "roots", d: 1, y: 1700, sym: "roots", title: "Tree Roots",
      fact: "Most tree roots stay in the top metre or so, but they spread out super wide.",
      joke: "Underground tree hugs!" },
    { id: "ants", d: 2, y: 2600, sym: "ants", title: "Ant Tunnels",
      fact: "Ants dig hallways and rooms. Some big nests go several metres down.",
      joke: "\"Excuse me, you're in my hallway.\"" },
    { id: "treasure", d: 3, y: 3500, sym: "chest", title: "Buried Treasure?",
      fact: "In stories, pirates bury treasure. In real life, hardly any did!",
      joke: "Open it... it's a lunchbox from 1987." },
    { id: "pipes", d: 5, y: 4500, sym: "pipes", title: "Pipes!",
      fact: "Water and sewer pipes run under streets, often a few metres down.",
      joke: "Hear that gurgle? Somebody flushed." },
    { id: "subway", d: 15, y: 5600, sym: "subway", title: "Subway Tunnel",
      fact: "Many city subways zoom along tunnels 10 to 30 metres underground.",
      joke: "Mind the gap! And the kid with the shovel." },
    { id: "fossils", d: 40, y: 6700, sym: "fossil", title: "Dinosaur Fossils",
      fact: "Dinosaur bones slowly turn to stone. These dinos lived over 66 million years ago!",
      joke: "T. rex: \"Who dug up my bedroom?\"" },
    { id: "cave", d: 90, y: 7900, sym: "cave", title: "A Big Cave",
      fact: "Stalactites hang from the ceiling. They take hundreds of years to grow a little bit.",
      joke: "Bat: \"Shhh! It's daytime. I'm sleeping.\"" },
    { id: "water", d: 150, y: 9100, sym: "water", title: "Groundwater",
      fact: "It's not a lake. The water hides in tiny gaps in the rock, like a wet sponge.",
      joke: "No, it is not underground lemonade. We checked." },
    { id: "mine", d: 4000, y: 11500, sym: "mine", title: "The Deepest Mine",
      fact: "Mponeng gold mine in South Africa goes about 4 km down. The rock is hot, so they pump in cold air.",
      joke: "Miners pack a LOT of snacks." },
    { id: "kola", d: 12200, y: 14000, sym: "derrick", title: "The Deepest Hole Ever!",
      fact: "In Russia, scientists drilled 12.2 km down. It's only as wide as a dinner plate. The rock got too hot (180 degrees C).",
      joke: "And then we gave up! (That's only 0.2% of the way.)" },
    { id: "crust", d: 35000, y: 16500, sym: "crust", title: "The Crust Ends",
      fact: "Earth's crust is a thin, hard skin, about 35 km thick under continents.",
      joke: "If Earth were an apple, the crust is the peel." },
    { id: "mantle", d: 100000, y: 17500, sym: "goo", title: "The Mantle",
      fact: "Hot, goopy rock, 2,900 km thick. It's really solid, but it flows super slowly, like play-dough.",
      joke: "Most of Earth is this stuff. Squish!" },
    { id: "outer", d: 2890000, y: 20000, sym: "outer", title: "The Outer Core",
      fact: "A sea of liquid metal. Its swirling makes Earth's magnetic field, so compasses point north.",
      joke: "Metal soup. Please do not slurp." },
    { id: "inner", d: 5150000, y: 23000, sym: "inner", title: "The Inner Core",
      fact: "A solid ball of iron, almost as big as the Moon. It's about as hot as the surface of the Sun!",
      joke: "Hot hot hot! Squeezed solid by the weight above." },
    { id: "centre", d: EARTH_M, y: 25500, end: true },
  ];

  // Little surprises between the big discoveries. "em" = tiny emoji decoration, "sym" = SVG sprite.
  const finds = [
    { y: 560, side: "l", sym: "sock", t: "A lost sock! Mystery solved." },
    { y: 3160, side: "r", sym: "mole", t: "Shhh! A sleeping mole. Zzz..." },
    { y: 5060, side: "l", sym: "duck", t: "A rubber duck?! Quack?" },
    { y: 6160, side: "r", em: "🍕", t: "Very old pizza. Do NOT eat." },
    { y: 7260, side: "l", sym: "dino", t: "A very confused dinosaur. \"Wrong century?\"" },
    { y: 9660, side: "r", em: "🐟", t: "A fish! \"Is this the ocean?\" (Nope!)" },
    { y: 10900, side: "l", em: "🧸", t: "A teddy bear, way down here?" },
    { y: 12060, side: "r", em: "🎈", t: "A balloon! ...Pop. Too hot." },
    { y: 14560, side: "l", em: "🚪", t: "A tiny door. Who lives here?" },
    { y: 18060, side: "r", em: "🍲", t: "Rock soup. Needs more salt." },
    { y: 20560, side: "l", em: "🥄", t: "A giant spoon for the metal soup!" },
    { y: 23560, side: "r", sym: "sparkle", t: "So sparkly! (And so hot.)" },
    { y: 24900, side: "l", em: "🪧", t: "Nearly there! Keep digging!" },
  ];

  // Honest gaps: a lot of real distance squashed into a short scroll.
  const ffs = [
    { y: 10300, t: "3,850 m of plain old rock" },
    { y: 12750, t: "8 km of rock" },
    { y: 15250, t: "23 km of more rock" },
    { y: 18750, t: "2,800 km of goopy mantle" },
    { y: 21500, t: "2,260 km of liquid metal" },
    { y: 24250, t: "1,220 km of solid iron ball" },
  ];

  // Background colour at a given y (soil browns, grey rock, red mantle, glowing core, then ocean).
  const colors = [
    [0, "#8b5a2b"], [4500, "#7a4f2a"], [5600, "#6f5a48"], [6700, "#76685b"], [7900, "#6b6560"],
    [9100, "#5c6670"], [11500, "#5a5560"], [14000, "#4d4856"], [16500, "#523d4a"], [17500, "#7a3a35"],
    [18800, "#b2432b"], [20000, "#d9561f"], [21500, "#f08a1c"], [23000, "#ffc93c"], [25500, "#fff0a8"],
    [27000, "#ffe08a"], [28500, "#4fb6e8"], [30000, "#1f7fc4"],
  ];

  // Which little decorations appear at which real depth (metres).
  const zones = [
    { max: 5, syms: ["pebbles", "rock1", "worm", "roots", "rock2", "coin"] },
    { max: 150, syms: ["rock1", "rock2", "bone", "pebbles", "gem", "coin"] },
    { max: 35000, syms: ["rock1", "rock2", "gem", "pebbles", "gem"] },
    { max: 2890000, syms: ["blob", "blob", "sparkle", "rock2"] },
    { max: 5150000, syms: ["blob", "outer", "sparkle"] },
    { max: Infinity, syms: ["sparkle", "sparkle", "inner"] },
  ];

  window.DIG = { EARTH_M, stations, finds, ffs, colors, zones, state: { otherOpen: false } };
})();
