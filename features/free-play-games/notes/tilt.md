# TILT!

**Removed on 2026-11-06.** The owner dropped this game after playing it. The code is in git history (commit 47d7c6ef).

Built in `static/fun/tilt/`. No shared files or registry files changed.

## Rules as built

Roll your marble into your cup. Two marbles share a 6×6 wooden tray. Red is Player 1; blue is Player 2 or the computer. Marbles and cups also carry one or two white marks.

Players alternate selecting a direction and pressing ROLL. Outlined squares preview both final cells. Both marbles advance one cell per tick until neither can move. Walls, edges and occupied cells block movement. An occupied cell blocks for that tick even when its occupant moves away; movement resumes next tick if space opens. A contested destination blocks both. A cup scores only when its matching marble ends there; passing over it does not score. A delivery credits the marble owner, regardless of whose turn it is. Both marbles return to their starts after any delivery. Both can score on one roll.

Twelve total turns; most points wins. Ties stand. No turn timer, to leave time for children to explore the previews. There is no fixed wall-clock match limit. Directions that leave both marbles still are disabled. Repeated positions remain legal; the finite turn budget prevents an endless game. Defensive scoreless draws are possible, particularly between strong computers. No sudden-death or forced scoring rule was added.

The first player alternates on every game/rematch, including across reloads. Setup choices and next starter use `FP.store("tilt")` after `FP.ready`.

## Trays

Cells use `row * 6 + column`, starting at zero at the upper left. All walls, starts and cups have 180-degree symmetry.

| Tray | Walls | Starts (red, blue) | Cups (red, blue) |
| --- | --- | --- | --- |
| Crossgrain | 8, 9, 13, 22, 26, 27 | 30, 5 | 11, 24 |
| Side pockets | 7, 10, 14, 21, 25, 28 | 24, 11 | 4, 31 |
| Switchback | 2, 8, 16, 19, 27, 33 | 30, 5 | 11, 24 |

Tests traverse the reachable two-marble state graph for each tray, check both cups can be delivered to, and require multiple states with at least three distinct choices. Every roll finishes in at most six ticks.

## Computer

All levels use the same legal moves and public information. Search values score difference first, then total deliveries and route distance. Route distances use the real two-marble graph, including marble blocking. Revisited stops get a small preference penalty when alternatives have similar values. Search depth is capped by remaining turns and caches repeated search nodes.

- Easy: one-ply route evaluation; 65% of decisions choose a random legal direction.
- Medium: evaluates all four immediate results; 22% exploration among legal directions.
- Hard: three plies (move, reply, move); 6% exploration.
- Impossible: six plies, no exploration. No extra moves or hidden information.

The exploration rates are an implementation adjustment from the proposal. They give the shallow levels room to make mistakes while preserving the same rules. Impossible means the strongest offered opponent, not unbeatable.

## Controls and presentation

Touch or mouse: choose one of four direction buttons, inspect both outlined stops, then ROLL. One full-width control set changes ownership each turn. A coloured banner names the active player; the score and control panel highlight that player.

1P keyboard: arrows or WASD select; Enter or Space rolls. 2P: Player 1 uses WASD and Space; Player 2 uses arrows and Enter. Inactive players' keys cannot act. Controls cards show the keys on larger screens; phones hide key caps. All action targets are at least 44px.

Low-resolution canvas art includes wood grain, raised wall blocks, recessed numbered cups, glossy marked marbles, shadows and brass delivery pegs. Rolls interpolate the actual lockstep frames and tip the tray. One clack sounds per roll; a delivery adds the shared score sound. Reduced motion removes tipping and shortens the animation without removing the preview.

## Verification

`node --test tests/free-play/`: 72 tests passed, zero failures (including the other games).

Nine TILT tests cover layout symmetry, reachable cups and useful choices, blocking, delivery/reset ownership, finite legal matches, difficulty ordering first-player balance and deterministic preview delivery. All production files are under 300 lines.

Seeded round-robin simulation: 180 complete matches per pair, rotating the three layouts and alternating starters, seed 1923. Match points count a win as 1 and a tie as 0.5.

| Pair | Higher level's match points | Ties / 180 |
| --- | --- | --- |
| Easy / Medium | 72.50% | 85 |
| Easy / Hard | 78.89% | 68 |
| Easy / Impossible | 76.39% | 85 |
| Medium / Hard | 64.72% | 101 |
| Medium / Impossible | 66.67% | 120 |
| Hard / Impossible | 55.00% | 162 |

Across equal numbers of matches against the other three levels: Easy 24.1%, Medium 47.0%, Hard 62.9%, Impossible 66.0% match points. A separate 240-match Hard/Hard run (seed 906) gave the starter exactly 50% match points: 20 starting-player wins, 20 second-player wins, 200 ties. These are finite seeded samples, not a guarantee about every matchup. The committed tournament tests use independent 120-match adjacent-level samples.

Browser verification uses separate headless Chromium contexts, not the shared browser. Checked 390×844, 844×390, 820×1180 and 1280×800. Setup fits in 1P and 2P, with no horizontal scroll. Complete 1P and 2P matches reach the over screen; touch and desktop keyboard controls work. Normal and reduced motion were exercised. Screenshots are under `/tmp/tilt-*.png`; the preview screenshot is `/tmp/tilt-hub-preview.png`.

## Integration

Suggested `games.js` entry:

```js
{ slug: "tilt", name: "TILT!", live: true, players: [1, 2], scene: "tilt",
  color: "#dfb57a", stats: [5, 1, 3, 0, 2],
  hook: "Roll your marble into its cup while both marbles move." }
```

Hub script order, after `scenes.js` and before `hub.js`:

1. `tilt/rules.js`
2. `tilt/render.js`
3. `tilt/preview.js`

The preview uses seeded Easy computer players and the real rules and painter. It animates stops, deliveries, resets and changing delivery pegs without a text HUD. It supports deterministic time sampling and reset; its canvas is 192×192.

README text:

> **TILT!:** Take turns tilting a shared wooden maze. Both marked marbles roll together; get yours into its matching cup without helping the other player. Preview both stops, then press ROLL. 1P against four computer levels or 2P on one screen, three symmetric trays, 12 turns and no timer. The first player alternates each game.

## Original music

Paste this entry inside `shared/tracks.js`, where `T`, `pump` and `rep` are defined. Each part has 64 steps per channel. Four parts at 112 BPM make a 34.29-second loop. The tune uses D major and a measured rolling rhythm.

```js
T["tilt"] = {
  bpm: 112,
  parts: {
    A: {
      lead: "D5:3 F#5:1 A5:2 F#5:2 E5:4 D5:4  B4:2 D5:2 F#5:4 E5:2 D5:2 A4:4  G4:3 B4:1 D5:2 G5:2 F#5:4 E5:4  A4:2 C#5:2 E5:2 G5:2 F#5:4 D5:4",
      bass: [pump("D3", "A2"), pump("B2", "F#3"), pump("G2", "D3"), pump("A2", "E3")].join(" "),
      drums: rep("k:4 h:2 h:2 s:4 h:2 R:2"),
    },
    B: {
      lead: "F#5:2 E5:2 D5:4 A4:3 B4:1 D5:4  G5:2 F#5:2 E5:4 C#5:4 A4:4  B4:2 D5:2 G5:3 F#5:1 E5:4 D5:4  C#5:2 E5:2 A5:4 F#5:2 E5:2 D5:4",
      bass: [pump("B2", "F#3"), pump("A2", "E3"), pump("G2", "D3"), pump("D3", "A2")].join(" "),
      drums: rep("k:4 h:2 R:2 s:4 h:2 h:2"),
    },
  },
  order: ["A", "B", "A", "B"],
};
```

The integrator must add this track to the shared file. Until then the shared music player falls back to the hub tune. No shared-file change is needed for controls or sound.
