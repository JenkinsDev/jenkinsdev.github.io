/*
 * FREE PLAY music: original chiptune tunes, one for the hub and one per game.
 * Format and player: shared/music.js. Every channel in a part must add up to the same number of
 * 16th-note steps (16 per bar); tests/free-play/music.test.mjs checks this.
 */
(function () {
  "use strict";

  const T = window.FunMusic.TRACKS;
  const rep = (s, n = 4) => Array(n).fill(s).join(" ");
  const pump = (a, b) => rep(`${a}:2 ${b}:2`, 4); // root/fifth eighth notes, one bar
  const gallop = (r, f) => `${r}:3 ${r}:1 ${f}:2 ${r}:3 ${r}:1 ${f}:2 ${r}:2 ${f}:2`; // western horse rhythm, one bar

  // Hub: bright and easygoing, C major.
  T.hub = {
    bpm: 118,
    parts: {
      A: {
        lead: "C5:2 E5:2 G5:2 E5:2 A5:4 G5:4  F5:2 E5:2 D5:2 C5:2 D5:8  C5:2 E5:2 G5:2 C6:2 B5:4 A5:4  G5:2 A5:2 G5:2 E5:2 C5:8",
        bass: [pump("C3", "G3"), pump("F2", "C3"), pump("A2", "E3"), pump("G2", "D3")].join(" "),
        drums: rep("k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2"),
      },
      B: {
        lead: "A4:4 C5:4 E5:4 D5:4  F5:4 E5:4 D5:8  E5:4 G5:4 A5:2 G5:2 E5:4  D5:2 E5:2 C5:4 R:8",
        bass: [pump("A2", "E3"), pump("F2", "C3"), pump("C3", "G3"), pump("G2", "D3")].join(" "),
        drums: rep("k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2"),
      },
    },
    order: ["A", "A", "B", "A"],
  };

  // Higher or Lower: a bouncy quiz-show tune, F major.
  T["higher-or-lower"] = {
    bpm: 140,
    parts: {
      A: {
        lead: "F5:1 R:1 A5:1 R:1 C6:2 A5:2 F5:2 G5:2 A5:4  G5:1 R:1 E5:1 R:1 C5:2 E5:2 G5:4 R:4  F5:1 R:1 A5:1 R:1 C6:2 D6:2 C6:2 A5:2 F5:4  G5:2 A5:2 G5:2 E5:2 F5:8",
        bass: [pump("F2", "C3"), pump("C3", "G2"), pump("F2", "C3"), pump("C3", "G2")].join(" "),
        drums: rep("k:2 h:1 h:1 s:2 h:2 k:2 h:1 h:1 s:2 h:2"),
      },
      B: {
        lead: "D5:2 F5:2 A5:4 G5:2 F5:2 E5:4  C5:2 E5:2 G5:4 F5:2 E5:2 D5:4  D5:2 F5:2 A5:4 Bb5:2 A5:2 G5:4  C6:4 A5:4 F5:8",
        bass: [pump("D3", "A2"), pump("C3", "G2"), pump("Bb2", "F3"), pump("C3", "G2")].join(" "),
        drums: rep("k:2 h:1 h:1 s:2 h:2 k:2 h:1 h:1 s:2 h:2"),
      },
    },
    order: ["A", "A", "B", "A"],
  };

  // Quick Draw: a dusty western gallop, A minor.
  T["quick-draw"] = {
    bpm: 108,
    parts: {
      A: {
        lead: "A4:4 C5:2 D5:2 E5:8  G5:4 E5:2 D5:2 E5:8  A4:4 C5:2 D5:2 E5:4 D5:2 C5:2  B4:4 G4:4 A4:8",
        bass: [gallop("A2", "E3"), gallop("E2", "B2"), gallop("A2", "E3"), gallop("E2", "B2")].join(" "),
        drums: rep("k:3 h:1 h:2 s:2 k:3 h:1 h:2 s:2"),
      },
      B: {
        lead: "E5:4 E5:2 G5:2 A5:8  G5:2 E5:2 D5:4 C5:8  D5:4 D5:2 E5:2 F5:4 E5:2 D5:2  E5:4 G#4:4 A4:8",
        bass: [gallop("A2", "E3"), gallop("C3", "G2"), gallop("D3", "A2"), gallop("E2", "B2")].join(" "),
        drums: rep("k:3 h:1 h:2 s:2 k:3 h:1 h:2 s:2"),
      },
    },
    order: ["A", "A", "B", "A"],
  };

  // Air Puck: fast and driving, E minor.
  T["air-puck"] = {
    bpm: 150,
    parts: {
      A: {
        lead: "E5:2 G5:2 B5:2 G5:2 E5:2 G5:2 B5:4  C6:2 B5:2 G5:2 E5:2 G5:8  D5:2 F#5:2 A5:2 F#5:2 D5:2 F#5:2 A5:4  B5:4 A5:2 G5:2 F#5:8",
        bass: [pump("E2", "E3"), pump("C2", "C3"), pump("D2", "D3"), pump("B1", "B2")].join(" "),
        drums: rep("k:2 h:2 s:2 h:2 k:1 k:1 h:2 s:2 h:2"),
      },
      B: {
        lead: "E6:2 D6:2 B5:2 G5:2 A5:4 B5:4  C6:2 B5:2 A5:2 G5:2 E5:8  D6:2 C6:2 A5:2 F#5:2 G5:4 A5:4  B5:2 G5:2 F#5:2 D#5:2 E5:8",
        bass: [pump("E2", "E3"), pump("A1", "A2"), pump("D2", "D3"), pump("B1", "B2")].join(" "),
        drums: rep("k:2 h:2 s:2 h:2 k:1 k:1 h:2 s:2 h:2"),
      },
    },
    order: ["A", "A", "B", "A"],
  };

  // Stack It: a bouncy, careful little tune, G major.
  T["stack-it"] = {
    bpm: 128,
    parts: {
      A: {
        lead: "G4:2 B4:2 D5:2 G5:2 F#5:2 D5:2 B4:4  C5:2 E5:2 G5:2 E5:2 D5:4 R:4  G4:2 B4:2 D5:2 G5:2 A5:2 G5:2 E5:4  D5:2 C5:2 B4:2 A4:2 G4:8",
        bass: [pump("G2", "D3"), pump("C3", "G2"), pump("E2", "B2"), pump("D3", "A2")].join(" "),
        drums: rep("k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2"),
      },
      B: {
        lead: "E5:4 D5:2 C5:2 B4:4 G4:4  A4:2 B4:2 C5:2 D5:2 E5:8  F#5:4 E5:2 D5:2 C5:4 A4:4  B4:2 D5:2 F#5:2 A5:2 G5:8",
        bass: [pump("C3", "G2"), pump("A2", "E3"), pump("D3", "A2"), pump("G2", "D3")].join(" "),
        drums: rep("k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2"),
      },
    },
    order: ["A", "A", "B", "A"],
  };

  // Window Post: a breezy street tune, D major.
  T["window-post"] = {
    bpm: 112,
    parts: {
      A: {
        lead: "D5:3 F#5:1 A5:2 R:2 B5:2 A5:2 F#5:4 E5:2 F#5:2 G5:4 A5:2 F#5:2 E5:4 D5:2 A4:2 D5:2 F#5:2 E5:4 B4:4 C#5:2 E5:2 A5:4 G5:2 E5:2 D5:4",
        bass: "D3:4 A2:4 D3:4 A2:4 G2:4 D3:4 G2:4 A2:4 B2:4 F#3:4 B2:4 G2:4 A2:4 E3:4 A2:4 D3:4",
        drums: "k:2 h:2 R:2 h:2 s:2 h:2 R:2 h:2 k:2 h:2 R:2 h:2 s:2 h:2 k:2 h:2 k:2 h:2 R:2 h:2 s:2 h:2 R:2 h:2 k:2 h:2 k:2 h:2 s:2 h:2 R:2 h:2"
      },
      B: {
        lead: "B5:2 A5:2 F#5:4 D5:3 E5:1 F#5:4 G5:2 B5:2 A5:2 G5:2 F#5:4 E5:4 F#5:2 A5:2 D6:4 C#6:2 A5:2 F#5:4 E5:2 G5:2 F#5:2 E5:2 D5:6 R:2",
        bass: "B2:4 F#3:4 B2:4 F#3:4 G2:4 D3:4 A2:4 E3:4 D3:4 A2:4 B2:4 F#3:4 G2:4 A2:4 D3:6 R:2",
        drums: "k:2 h:2 R:2 h:2 s:2 h:2 k:2 h:2 k:2 h:2 R:2 h:2 s:2 h:2 R:2 h:2 k:2 h:2 R:2 h:2 s:2 h:2 k:2 h:2 k:2 h:2 R:2 h:2 s:2 h:2 R:4"
      }
    },
    order: ["A", "B", "A", "B"]
  };


  // Tug of War: a stomping tug, C major.
  T["tug-of-war"] = {
    bpm: 120,
    parts: {
      A: {
        lead: "C5:2 E5:2 G5:2 C6:2 B5:2 G5:2 E5:4  F5:2 A5:2 C6:2 A5:2 G5:4 E5:4  C5:2 E5:2 G5:2 E5:2 A5:2 G5:2 F5:4  E5:2 D5:2 E5:2 G5:2 C5:8",
        bass: "C3:4 G2:4 C3:4 G2:4 F2:4 C3:4 F2:4 G2:4 A2:4 E3:4 A2:4 F2:4 G2:4 D3:4 G2:4 C3:4",
        drums: "k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2"
      },
      B: {
        lead: "A5:2 G5:2 E5:4 C5:2 D5:2 E5:4  F5:4 A5:4 G5:2 F5:2 E5:4  D5:2 F5:2 A5:4 G5:4 E5:4  D5:2 E5:2 C5:4 R:8",
        bass: "A2:4 E3:4 A2:4 E3:4 F2:4 C3:4 G2:4 D3:4 C3:4 G2:4 A2:4 E3:4 F2:4 G2:4 C3:8",
        drums: "k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 R:4 k:2 h:2"
      }
    },
    order: ["A", "B", "A", "B"]
  };



  // Rocket Lander: a spare floating tune in C major.
  T["rocket-lander"] = {
    bpm: 98,
    parts: {
      A: {
        lead: "C5:4 E5:4 G5:8  A5:4 G5:4 E5:8  F5:4 A5:4 G5:4 E5:4  D5:8 C5:8",
        bass: "C3:8 G2:8  A2:8 E2:8  F2:8 C3:8  G2:8 C3:8",
        drums: "k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4"
      },
      B: {
        lead: "E5:4 G5:4 B5:8  A5:4 F5:4 D5:8  E5:4 C5:4 D5:4 E5:4  G5:8 R:8",
        bass: "E2:8 B2:8  F2:8 C3:8  C3:8 G2:8  G2:8 C3:8",
        drums: "k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 h:4 s:4 h:4 k:4 R:4 s:4 h:4"
      }
    },
    order: ["A", "B", "A", "B"]
  };

})();
