/*
 * WEIGHT (kg) and HEIGHT OR LENGTH (m).
 *
 * SOURCES / NOTES: typical adult values as published by National Geographic, Smithsonian,
 * Encyclopaedia Britannica, the CDC growth charts (children), NPS (Statue of Liberty, Brooklyn
 * Bridge span), Encyclopedia Titanica (Titanic length 269 m),
 * Boeing (747-400) and USA Basketball/FIBA (ball). Animal weights vary a lot; we use a
 * typical adult (usually male where it's the commonly quoted figure) and mark everything
 * "about". Dinosaur figures are museum estimates.
 *
 * Spot-check before go-live: Argentinosaurus (estimates range 65–80 t), saltwater crocodile.
 *
 * Added later (same kinds of sources): NPS / USGS (St. Helens, Sherman), World Surf League / Guinness (Nazaré wave), FINA (pool), SpaceX, Royal Caribbean, Empire State Realty, JR Central (N700 train length).
 */
HOL.add("size", [
  ["🐁", "a mouse (no tail)", 0.08, "A mouse can squeeze through a gap the width of a pencil.", { d: "long" }],
  ["🐈", "a house cat (no tail)", 0.46, "Cats use their whiskers to judge whether they'll fit through a gap.", { d: "long" }],
  ["🐧", "an emperor penguin", 1.15, "Emperor penguins can dive deeper than 500 metres.", { d: "tall" }],
  ["🧒", "an 8-year-old", 1.28, "You're about 1 cm taller in the morning than at bedtime.", { d: "tall" }],
  ["🧑", "an adult person", 1.7, "Your arm span is about the same as your height.", { d: "tall" }],
  ["🏀", "a basketball hoop", 3.05, "The hoop has been 10 feet high since the game was invented.", { d: "tall", exact: true }],
  ["🐘", "an African elephant (at the shoulder)", 3.3, "Elephants use their trunks to drink, smell, grab and even snorkel.", { d: "tall" }],
  ["🦈", "a great white shark", 4.5, "Sharks have no bones. Their skeleton is cartilage, like your ears.", { d: "long" }],
  ["🐊", "a saltwater crocodile", 5, "Saltwater crocodiles are the biggest reptiles alive today.", { d: "long" }],
  ["🦒", "a giraffe", 5.5, "A giraffe's neck has seven bones, the same number as yours.", { d: "tall" }],
  ["🐍", "a reticulated python", 6, "Reticulated pythons are the longest snakes in the world.", { d: "long" }],
  ["🦖", "a T. rex", 12.3, "T. rex's arms were only about as long as a grown-up's.", { d: "long" }],
  ["🐋", "a blue whale", 25, "A baby blue whale can put on about 90 kg a day.", { d: "long" }],
  ["🦕", "an Argentinosaurus", 35, "It lived in what is now Argentina, about 95 million years ago.", { d: "long" }],
  ["✈️", "a Boeing 747", 71, "Its wingspan is longer than the Wright brothers' entire first flight.", { d: "long" }],
  ["🗽", "the Statue of Liberty (with pedestal)", 93, "Her index finger is about 2.4 metres long.", { d: "tall" }],
  ["🏈", "an American football field (with end zones)", 110, "Without the end zones it's exactly 100 yards.", { d: "long" }],
  ["🚀", "a Saturn V rocket", 111, "Saturn V sent astronauts to the Moon.", { d: "tall" }],
  ["🌲", "the tallest known tree (a coast redwood)", 116, "Its exact location is kept secret to protect it.", { d: "tall" }],
  ["🎡", "the London Eye", 135, "One full turn takes about 30 minutes.", { d: "tall" }],
  ["🗼", "Tokyo Tower", 333, "It's painted orange and white so pilots can see it.", { d: "tall" }],
  ["🚢", "the Titanic", 269, "The Titanic sank on its first voyage, in 1912.", { d: "long" }],
  ["🌉", "the Brooklyn Bridge's main span", 486, "When it opened in 1883 it was the longest suspension bridge in the world.", { d: "long" }],
  ["🌉", "the Golden Gate Bridge's main span", 1280, "It was the longest suspension bridge in the world when it opened in 1937.", { d: "long" }],
  ["🗻", "Mount Fuji", 3776, "Mount Fuji is a volcano. It last erupted in 1707.", { d: "tall" }],
  ["🏔️", "Mount Everest", 8849, "Everest gets a few millimetres taller every year.", { d: "tall" }],
  ["🛹", "a skateboard", 0.8, "Skateboarding became an Olympic sport at the Tokyo Games, held in 2021.", { d: "long" }],
  ["🎸", "a guitar", 1, "Most guitars have six strings.", { d: "long" }],
  ["🦩", "a flamingo", 1.4, "Flamingos are pink because of the food they eat.", { d: "tall" }],
  ["🦘", "a red kangaroo", 1.6, "A red kangaroo can cover about 8 metres in one jump.", { d: "tall" }],
  ["🐎", "a horse (at the shoulder)", 1.6, "Horses are measured in 'hands'. One hand is 4 inches.", { d: "tall" }],
  ["🦒", "a giraffe's neck", 1.8, "A giraffe has to spread its front legs wide to drink.", { d: "long" }],
  ["🐘", "an elephant's trunk", 2, "An elephant's trunk can hold about 8 litres of water.", { d: "long" }],
  ["🐻", "a grizzly bear (standing up)", 2.4, "Grizzlies stand up to see and smell better.", { d: "tall" }],
  ["🐙", "a giant Pacific octopus (arm span)", 4, "An octopus can taste things with its suckers.", { d: "long" }],
  ["🐍", "a king cobra", 4, "King cobras are the longest venomous snakes in the world.", { d: "long" }],
  ["🗿", "an Easter Island statue", 4, "There are nearly 1,000 of these statues on Easter Island.", { d: "tall" }],
  ["🏠", "a two-story house", 8, "A two-story house is about as tall as one and a half giraffes.", { d: "tall" }],
  ["🚌", "a school bus", 12, "School buses have extra-strong frames to protect the kids inside.", { d: "long" }],
  ["🦈", "a whale shark", 12, "Whale sharks are the biggest fish in the sea.", { d: "long" }],
  ["🦑", "a giant squid", 12, "A giant squid's eyes are as big as dinner plates.", { d: "long" }],
  ["🦕", "a Brachiosaurus", 13, "Brachiosaurus could reach treetops about twice as high as a giraffe can.", { d: "tall" }],
  ["🌴", "a coconut palm", 20, "A coconut can float across the ocean and grow on a new island.", { d: "tall" }],
  ["🌊", "the biggest wave ever surfed", 26, "It was surfed in Nazaré, Portugal, in 2020.", { d: "tall" }],
  ["🏊", "an Olympic swimming pool", 50, "An Olympic pool holds about 2.5 million litres of water.", { d: "long", exact: true }],
  ["🏰", "Cinderella Castle at Walt Disney World", 57, "Its towers get smaller toward the top so the castle looks taller than it is.", { d: "tall" }],
  ["🌳", "General Sherman, the biggest tree", 84, "General Sherman is a giant sequoia and the largest tree on Earth by volume.", { d: "tall" }],
  ["⚽", "a soccer field", 105, "Soccer fields don't all have to be the same size.", { d: "long" }],
  ["🚀", "SpaceX Starship (with its booster)", 121, "Starship is the biggest rocket ever built.", { d: "tall" }],
  ["🛳️", "Icon of the Seas, a giant cruise ship", 365, "It's one of the biggest cruise ships ever built.", { d: "long" }],
  ["🏙️", "the Empire State Building (to the roof)", 381, "It was built in just over a year, from 1930 to 1931.", { d: "tall" }],
  ["🚄", "a 16-car bullet train", 400, "A 16-car bullet train can carry over 1,300 passengers.", { d: "long" }],
  ["🌋", "Mount St. Helens", 2549, "It lost about 400 metres of height when it erupted in 1980.", { d: "tall" }],
  ["⛰️", "Mount Kilimanjaro", 5895, "Kilimanjaro is the tallest mountain in Africa.", { d: "tall" }],
]);
