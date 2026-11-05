# Window Post

Window Post is built in `static/fun/window-post/`. It uses the shared shell, layout, control cards, storage, sound and CRT stylesheet. It has no dependencies or build step.

## Rules and presentation

Two couriers alternate eight total throws, four each. P1 wears red (`#ff3d3d`); P2 wears blue (`#2c7bff`). They throw from the same pavement spot. A parcel entering an open window earns its printed points and closes its shutters for both players. Highest score wins; equal scores draw. Rematches alternate the starting courier. There is no aiming timer.

The original brick apartment building has eight windows, cream sills, green shutters, balcony rails, a striped awning, planters and a cat. Upper windows are worth 2 or 3 points; lower windows are worth 1 or 2. Three-point mouths are 17×18 logical pixels, two-point mouths 21×23, one-point mouths 26×23. Swept intersections include two pixels of forgiveness on every side. The four values in each row rotate between matches; the facade shifts horizontally and individual window heights vary. There are always two windows at each of 1 and 3 points and four at 2 points.

Wind is a fixed horizontal acceleration, selected from all integers −18 through 18. A windsock and a direction/strength label show it throughout the match. Flight uses a launch at (28,153), speed = power×3 and gravity 240. Angle is an integer 20–80 degrees; power is an integer 30–100. Flight lasts at most two seconds. A short five-dot guide shows only the start. Parcels tumble; misses bounce away; scored shutters close over 180 ms. Reduced motion hides animated flight, stops tumbling and makes shutter closure effectively immediate.

The active courier stands at the throwing spot, with a colour mark under their feet. A named turn banner, highlighted score and coloured aiming panel identify the player. The full-width THROW button belongs to the active human. Computer turns disable the same panel and show their selected angle/power when they throw.

## Controls and setup

1P plays the computer; 2P shares the screen and takes turns using the same two sliders and THROW button. Setup saves mode and computer level through `FP.store("window-post")` after `FP.ready`. Eight throws is fixed, so there is no match-length selector.

- 1P: Left/Right change angle; Up/Down change power; Enter throws. A/D, W/S and Space also work.
- 2P P1: A/D angle, W/S power, Space throws.
- 2P P2: Left/Right angle, Up/Down power, Enter throws.
- Left/A raises the arc; Right/D lowers it. Keyboard changes use two-unit steps. Native focused sliders also accept arrow keys.
- Touch and mouse: angle/power sliders, then THROW. Sliders are 44 px tall. The panel sits below the building in portrait and alongside it in landscape.

## Computer

All levels use the public board and exactly the human settings, flight and scoring. Each searches legal integer settings, evaluates swept hits and selects an available opening.

| Level | Search spacing | Aim error | Choice |
|---|---:|---:|---|
| Easy | 10 | up to ±12 per setting | Prefers broad, lower-value openings |
| Medium | 6 | up to ±5 | Points and mouth margin |
| Hard | 2 | up to ±1 | Points and mouth margin |
| Impossible | 1 | none | Full allowed grid, best points, remaining best opponent reply, mouth margin |

Error is clamped and rounded to the legal range. No level sees future input, moves windows or changes wind.

## Simulation

`node --test tests/free-play/window-post.test.mjs` contains five tests, including:

- Reachability: 12 varied layouts × every one of the 37 allowed winds × eight windows = **3,552 successful checks**. Every solution is replayed through the real flight function with all windows initially open.
- Computer tournament: every pair of levels, 12 layouts, both starting positions = **144 matches**. Match points (win=1, draw=½) were Easy **0.0%**, Medium **51.4%**, Hard **68.8%**, Impossible **79.9%**. Aggregate scored points were 307 / 557 / 609 / 642.
- Starting courier won **59 of 109 decisive matches (54.1%)**. The remaining 35 matches drew. Starts alternate in play and in the tournament. These are finite seeded samples, not a guarantee for every board.
- No universal best throw: exhaustively considers all 4,331 legal angle/power pairs. Every throw earning three points on the first board fails to earn three on at least one of seven other boards.
- Scoring, shared closure, eight-throw termination, legal computer settings and two-second flight cap are checked separately.

## Hub integration

Load these scripts, in order, after `scenes.js`:

1. `/fun/window-post/rules.js`
2. `/fun/window-post/render.js`
3. `/fun/window-post/preview.js`

The preview calls the real computer, flight, scoring and painter. It shows a delivery, closing shutters and the other courier taking aim. It has no HUD. Size is `[240,180]`; reduced-motion still time is 1300 ms. Its reset and absolute-time replay also support a first call directly at the still time.

Suggested registry entry:

```js
{ slug: "window-post", name: "Window Post", live: true, players: [1, 2],
  scene: "window-post", color: "#eac68e", stats: [3, 1, 4, 1, 3],
  hook: "Throw paper parcels into open windows before they close." }
```

README text:

> **Window Post:** Take turns throwing parcels into eight apartment windows worth 1–3 points. Delivered windows close for both couriers. Set angle and power, account for the steady wind, then THROW. Eight total throws; highest score wins. 1P against Easy / Medium / Hard / Impossible, or 2P on one screen. Touch sliders and keyboard controls; rematches alternate who starts.

## Music

Original tune, 112 BPM. Each channel has 64 steps per part (four bars). A/B/A/B runs 256 steps, approximately 34.3 seconds. Paste into `shared/tracks.js` inside its existing wrapper. No shared files were edited; until integration the shared player uses its normal fallback tune.

```js
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
```

## Verification and files

Final full suite: `node --test tests/free-play/` — **71 passed, 0 failed**, including five Window Post tests. An earlier run caught an in-progress TILT assertion; it passed in the final run without changes to that game.

Used a separate headless Chrome process with Playwright, the existing Hugo server at `http://localhost:1313`, and fresh browser contexts. No shared browser or new server was used. At 390×844, 844×390, 820×1180 and 1280×800:

- Both 1P and 2P setup screens fit without vertical or horizontal scroll.
- Full 1P and 2P matches reached the result screen; rematch/setup actions worked.
- Keyboard throws and touch throws worked. Separate checks exercised angle/power keys and actual touchscreen taps on the power slider.
- Gameplay had no horizontal or vertical overflow and no page errors.
- Captured and inspected setup, gameplay and result screenshots. Landscape setup was tightened after its first screenshot showed overflow.
- A scratch page outside the repo loaded `scenes.js`, rules, renderer and preview. Inspected frames at 1300, 2300 and 3500 ms: parcel flight, delivery and the next courier aiming with the previous window shuttered.
- Reduced-motion input/layout was checked separately. The rules use the same scoring in reduced motion.

Screenshots remain in `/tmp/wp-final-1p-390.png`, `/tmp/wp-final-2p-390.png`, `/tmp/wp-final-1p-844.png`, `/tmp/wp-final-1p-820.png`, `/tmp/wp-final-1p-1280.png`, `/tmp/wp-final-play-390.png` (and the other three widths), `/tmp/wp-final-over-390.png` (final result layout), `/tmp/wp-over-390.png` (and the other three widths), and `/tmp/wp-preview-1300.png`, `/tmp/wp-preview-2300.png`, `/tmp/wp-preview-3500.png`.

Created files:

- `static/fun/window-post/index.html`: setup, play and result screens.
- `static/fun/window-post/game.css`: responsive layouts and aiming panel.
- `static/fun/window-post/game.js`: shared engine integration, input, turns and sound.
- `static/fun/window-post/rules.js`: DOM-free rules, swept flight and computer search.
- `static/fun/window-post/render.js`: low-resolution pixel painter.
- `static/fun/window-post/preview.js`: real-game hub preview.
- `tests/free-play/window-post.test.mjs`: rules and simulation tests.
- `features/free-play-games/notes/window-post.md`: this handoff, integration snippets and music.

No open implementation questions. The owner still needs to paste the registry entry, hub script list and music track into the shared files, and update the shared README if desired. No shared files or other game files were changed. No git write commands were run.
