/*
 * How Many Me's? -- the lineup of things, ordered small to huge.
 *
 * SOURCES / NOTES (all figures deliberately conservative, rounded, "typical"):
 *  ladybug       0.007 m  Seven-spot ladybird body length is ~5-8 mm. Used 7 mm.
 *  banana        0.19 m   A typical peeled-or-not banana is 18-20 cm long. Used 19 cm.
 *  house cat     0.25 m   Shoulder/back height of a typical adult house cat, ~23-28 cm.
 *  golden retr.  0.58 m   Breed standard shoulder height 51-61 cm (females-males). Used 58 cm.
 *  grown-up      1.7 m    Average adult height worldwide is roughly 1.65-1.75 m.
 *  polar bear    2.7 m    Adult male standing on hind legs reaches ~2.5-3 m. Used 2.7 m.
 *  basketball    3.05 m   Regulation rim height: 10 feet = 3.05 m. (Measured to the rim.)
 *  T. rex        3.7 m    Hip height of large adults, ~3.5-3.9 m (Sue was ~3.7 m at the hips).
 *  giraffe       5.0 m    Adult males 4.6-5.5 m, to the top of the ossicones. Used 5.0 m.
 *  telephone pole 10 m    Typical utility pole is 12 m long, ~10 m above ground.
 *  school bus    12 m     Conventional full-size (Type C/D) buses are ~11-13 m long.
 *  blue whale    25 m     Typical adults 23-27 m (record ~30 m). Used 25 m.
 *  sequoia       84 m     General Sherman, the biggest giant sequoia by volume: 83.8 m.
 *  Statue of Liberty 93 m Ground to torch tip, including pedestal: 93 m (305 ft).
 *  Eiffel Tower  330 m    Height with antennas (since 2022): 330 m.
 *  Burj Khalifa  828 m    Architectural height 828 m (2,717 ft).
 *  Mount Everest 8,849 m  Official elevation above sea level (Nepal-China survey, 2020).
 *  airliner      10,700 m Typical cruising altitude ~35,000 ft = 10.7 km.
 *  edge of space 100,000 m The Karman line, the usual "start of space", is at 100 km.
 *  space station 400,000 m The ISS orbits at ~400-420 km. Used 400 km.
 *  the Moon      3,474,800 m Mean diameter 3,474.8 km.
 * Fun-fact figures: seven neck bones (giraffe, all mammals but sloths/manatees),
 * Eiffel Tower grows up to ~15 cm in summer heat, Burj Khalifa has 163 floors,
 * Everest rises ~4 mm/year, Statue of Liberty nose is ~1.37 m (4 ft 6 in),
 * ISS circles Earth every ~92 minutes (~16 sunrises a day), Earth is 12,742 km across.
 */
window.HMM = window.HMM || {};
HMM.ITEMS = [
  { id: "ladybug", name: "A ladybug", dim: "long", m: 0.007, o: "v", snd: "boing",
    fact: "Those red spots say “yuck, I taste bad!” to hungry birds. Clever." },
  { id: "banana", name: "A banana", dim: "long", m: 0.19, o: "v", snd: "boing",
    fact: "Bananas are berries. Strawberries are not. Science is silly." },
  { id: "cat", name: "A house cat", dim: "tall", m: 0.25, o: "v", snd: "boing",
    fact: "A cat can jump about five times its own height. Try that at home. (Don’t.)" },
  { id: "dog", name: "A golden retriever", dim: "tall", m: 0.58, o: "v", snd: "boing",
    fact: "Golden retrievers have webbed toes, so they are splashy little swimmers." },
  { id: "adult", name: "A grown-up", dim: "tall", m: 1.7, o: "v",
    fact: "Every grown-up started out smaller than you. Even the grumpy ones." },
  { id: "bear", name: "A polar bear standing up", dim: "tall", m: 2.7, o: "v",
    head: "A standing polar bear is as tall as {N} of you!",
    fact: "Polar bear fur looks white, but each hair is see-through. Their skin is black!" },
  { id: "hoop", name: "A basketball hoop", dim: "high", m: 3.05, o: "v",
    fact: "Every hoop is exactly 10 feet up. Even the ones in the big stadiums." },
  { id: "trex", name: "A T. rex", dim: "high", m: 3.7, o: "v",
    head: "A T. rex’s hips are as high as {N} of you!",
    fact: "Its arms were so short it probably could not even clap." },
  { id: "giraffe", name: "A giraffe", dim: "tall", m: 5.0, o: "v",
    fact: "A giraffe has seven neck bones. So do you! Yours are just smaller." },
  { id: "pole", name: "A telephone pole", dim: "tall", m: 10, o: "v",
    fact: "Poles are tall so the wires stay way above trucks, trees and basketball hoops." },
  { id: "bus", name: "A school bus", dim: "long", m: 12, o: "h",
    head: "A school bus is as long as {N} of you, lying down!",
    fact: "One big bus can carry up to 70 kids. That is a LOT of lunchboxes." },
  { id: "whale", name: "A blue whale", dim: "long", m: 25, o: "h",
    head: "A blue whale is as long as {N} of you, lying down!",
    fact: "It is the biggest animal that has ever lived. Ever. In the whole history of ever." },
  { id: "sequoia", name: "A giant sequoia tree", dim: "tall", m: 84, o: "v",
    fact: "Some giant sequoias are more than 2,000 years old. Hello, ancient tree!" },
  { id: "liberty", name: "The Statue of Liberty", dim: "tall", m: 93, o: "v",
    head: "The Statue of Liberty is as tall as {N} of you!",
    fact: "Her nose is about 1.4 metres long. Ah-ah-ah-CHOO!" },
  { id: "eiffel", name: "The Eiffel Tower", dim: "tall", m: 330, o: "v",
    fact: "On hot days the Eiffel Tower grows taller, by up to 15 centimetres, because metal stretches in the heat." },
  { id: "burj", name: "The Burj Khalifa", dim: "tall", m: 828, o: "v",
    fact: "It has 163 floors. That is a very long elevator ride." },
  { id: "everest", name: "Mount Everest", dim: "tall", m: 8849, o: "v",
    fact: "Everest is still growing, by a few millimetres every year." },
  { id: "plane", name: "An airliner", dim: "high", m: 10700, o: "v",
    head: "A jet plane flies as high as {N} of you, stacked up!",
    fact: "Up there it is about 50 degrees below zero. Brrr! Good thing the plane has heating." },
  { id: "space", name: "Space", dim: "high", m: 100000, o: "v",
    head: "Space starts {N} of you up!",
    fact: "A car on the highway would need about an hour to drive that far, if it could drive straight up." },
  { id: "iss", name: "The space station", dim: "high", m: 400000, o: "v",
    head: "The space station zooms {N} of you up!",
    fact: "It circles the whole Earth in about 90 minutes, so the astronauts see about 16 sunrises a day." },
  { id: "moon", name: "The Moon", dim: "wide", m: 3474800, o: "v",
    fact: "Almost four Moons would fit in a row across the Earth. You made it to the end!" },
];
