/*
 * SPEED (km/h) and HOW LONG AGO (years before now).
 *
 * SOURCES / NOTES: animal speeds from National Geographic / Smithsonian / Britannica
 * (top or burst speeds as commonly measured); Usain Bolt's peak from the 2009 Berlin
 * World Championships split analysis (~44.7 km/h); speed of sound
 * at 20 °C. Dates from Britannica: deep-time dates are
 * scientific estimates and rounded. "How long ago" items with a calendar year are
 * computed from the current year, so they stay right over time.
 *
 * Spot-check before go-live: dog domestication (estimates range 15,000–30,000+ years).
 *
 * Added later (same kinds of sources): Britannica and Smithsonian dates; the last dodo is the last widely accepted record (1681).
 */
HOL.add("ago", [
  ["📱", "the first iPhone", 0, "The first iPhone had no app store.", { year: 2007 }],
  ["🌐", "the first website", 0, "The first website explained what the World Wide Web was.", { year: 1991 }],
  ["🎮", "the first home video game console", 0, "The first home console had no sound at all.", { year: 1972 }],
  ["👨‍🚀", "the first Moon landing", 0, "Twelve people have walked on the Moon.", { year: 1969 }],
  ["🧱", "the LEGO brick (as we know it)", 0, "Bricks from then still click into bricks made today.", { year: 1958 }],
  ["📺", "the first TV demonstration", 0, "The first TV pictures were blurry, flickering shapes.", { year: 1926 }],
  ["✈️", "the first airplane flight", 0, "The Wright brothers' first flight lasted 12 seconds.", { year: 1903 }],
  ["🧸", "the first teddy bear", 0, "Teddy bears are named after US President Theodore 'Teddy' Roosevelt.", { year: 1902 }],
  ["🍕", "pizza Margherita", 0, "Its colours match the Italian flag: tomato, mozzarella and basil.", { year: 1889 }],
  ["🚗", "the first car", 0, "The first car had three wheels.", { year: 1886 }],
  ["💡", "Edison's light bulb", 0, "Edison's team tested thousands of materials before finding one that lasted.", { year: 1879 }],
  ["🏛️", "the Colosseum in Rome", 0, "The Colosseum could hold around 50,000 people.", { year: 80 }],
  ["🛞", "the wheel", 5500, "The wheel was used for pottery before it was used on carts."],
  ["🦣", "the last woolly mammoths", 4000, "Some mammoths were still alive when the Egyptian pyramids were built."],
  ["🐕", "the first pet dogs", 15000, "All pet dogs are descended from ancient wolves."],
  ["🎨", "the oldest known cave painting", 45500, "It shows a wild pig and was found on an island in Indonesia."],
  ["🧑", "the first modern humans", 300000, "Every person alive today is related to those first humans."],
  ["🦖", "T. rex", 67000000, "T. rex lived closer in time to you than to the first dinosaurs."],
  ["🦕", "the first dinosaurs", 230000000, "The first dinosaurs were about the size of a dog."],
  ["🌳", "the first trees", 385000000, "Sharks are older than trees."],
  ["🦈", "the first sharks", 450000000, "Sharks have survived five mass extinctions."],
  ["🎈", "the first hot-air balloon flight", 0, "The first passengers were a sheep, a duck and a rooster.", { year: 1783 }],
  ["🚂", "the first steam locomotive", 0, "It pulled 10 tons of iron along a track in Wales.", { year: 1804 }],
  ["🚲", "the first bicycle", 0, "The first bicycles had no pedals. You pushed with your feet.", { year: 1817 }],
  ["📷", "the first photograph", 0, "It took many hours of light to make.", { year: 1826 }],
  ["📞", "the first telephone call", 0, "The first words were \"Mr. Watson, come here.\"", { year: 1876 }],
  ["🗽", "the Statue of Liberty", 0, "It was a gift from France to the USA.", { year: 1886 }],
  ["🏀", "the first basketball game", 0, "The first game ended 1–0.", { year: 1891 }],
  ["🎡", "the first Ferris wheel", 0, "It was built for a world's fair in Chicago.", { year: 1893 }],
  ["🛰️", "the first satellite", 0, "It was about the size of a beach ball.", { year: 1957 }],
  ["📧", "the first email", 0, "The person who sent it doesn't remember what it said.", { year: 1971 }],
  ["💻", "the first Apple computer", 0, "It was sold without a case, keyboard or screen.", { year: 1976 }],
  ["💿", "the first CD for sale", 0, "The first CD made for sale was an ABBA album.", { year: 1982 }],
  ["📹", "the first YouTube video", 0, "It's 19 seconds long and was filmed at a zoo.", { year: 2005 }],
  ["🦤", "the last dodo", 0, "Dodos couldn't fly.", { year: 1681 }],
  ["✍️", "the first writing", 5200, "The first writing kept track of things like grain and sheep."],
  ["🌾", "the first farms", 12000, "Wheat was one of the first crops people grew."],
  ["🧊", "the coldest part of the last ice age", 20000, "Sea levels were about 120 metres lower than today."],
  ["🌸", "the first flowers", 130000000, "Some dinosaurs lived before there were any flowers."],
  ["🐦", "the first birds", 150000000, "The first birds had teeth."],
]);
