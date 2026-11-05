# Borrowed Blocks

Built 2026-11-05. Standalone page: `/fun/borrowed-blocks/`.

## Rules and controls

Fit more squares on your board. 1P against the computer or 2P on one screen. Each player has a 4×4 board with two blocked cells and fourteen scoring cells. P1 is red `#ff3d3d`; P2 is blue `#2c7bff`. P1 blocks row 1 column 2 and row 4 column 3; P2's board mirrors it horizontally. The active board grows; the other board stays visible with its score. The turn banner names the player, and the active board and controls use that player's colour.

Three pieces are available in the shared rack. A visible queue shows the next three refills. Pick any rack piece, rotate it clockwise, choose its top-left bounding-box position on your board, and press PLACE. A translucent footprint confirms a valid fit. Pieces cannot overlap occupied or blocked cells. Each covered cell scores one; nothing clears. CANCEL releases the piece without spending a turn. PASS is available only when no rack piece fits in any rotation. A pass spends a turn. After six turns per player, the higher covered count wins; ties stand. Rematches alternate the starting player. There is no timer.

The seven shapes are a domino, straight triomino, corner triomino, square tetromino, hook tetromino, tee tetromino and step tetromino. Rotations only; no reflection button. Piece IDs are generated in consecutive pairs, from a seeded uniform choice among the seven shapes. The rack plus queue initially exposes three complete pairs. This reduces the opening advantage of an isolated large piece without adding points or changing either player's rules. The finite supply contains eighteen pieces, enough for the initial six public pieces and all twelve possible placements.

Touch and mouse: pick a rack button, tap a board square or drag across the board to move the ghost, tap ROTATE, then PLACE. Drag release does not commit. A bounding-box anchor may itself be a blocked cell if the shape has no square there. All active cells are at least 44px at the checked sizes; the opponent's smaller cells are disabled.

Keyboard: left/right moves focus across the rack, Enter picks; 1/2/3 also pick directly. After picking, arrows move the footprint, R rotates, Enter places a valid footprint, Esc cancels, P passes when nothing fits. Both people use the same keys in 2P. Setup uses FP.controlCards, with key caps hidden on phones. Mode and computer level save with FP.store after FP.ready. Results offer REMATCH and SETUP.

## Computer

All levels use legal placements and public information only. Easy selects a legal move uniformly at random. Medium scores covered area and penalizes isolated empty cells and narrow dead ends. Hard searches three plies, including an opponent reply and its own next placement, using the rack and visible queue. Impossible searches four plies with a wider beam. Search states discard the unrevealed supply before expansion. Passes are searched too.

Hard considers eight root placements and four replies per node, with a 500-node budget. Impossible considers twelve root placements and six replies per node, with a 1,500-node budget. Both use deterministic area/empty-space evaluation and prefer the immediate packing score on equal search values. These are bounded beam searches, not exhaustive solvers. Impossible means the strongest offered level, not an unbeatable opponent. A 100-opening local benchmark measured a maximum of 6.3ms for Impossible. Real-device CPU speed can differ.

## Simulation

Node VM loads the DOM-free `rules.js`. Seeds 0–599, alternating starts, reproducible Easy RNG seeded with seed + 99. Six hundred matches per pairing; all twelve turns must be legal and final area must agree with score. Table entries are match counts, with ties kept separately.

| Pairing | Weaker wins | Stronger wins | Ties | Stronger win rate |
|---|---:|---:|---:|---:|
| Easy / Medium | 113 | 359 | 128 | 59.8% |
| Easy / Hard | 48 | 457 | 95 | 76.2% |
| Easy / Impossible | 32 | 471 | 97 | 78.5% |
| Medium / Hard | 62 | 230 | 308 | 38.3% |
| Medium / Impossible | 61 | 254 | 285 | 42.3% |
| Hard / Impossible | 110 | 138 | 352 | 23.0% |

Every stronger level wins more than its weaker opponent. Small boards produce many ties, especially between planning levels.

| Equal level | First wins | Second wins | Ties | First match points, ties worth ½ |
|---|---:|---:|---:|---:|
| Easy | 221 | 173 | 206 | 54.0% |
| Medium | 118 | 76 | 406 | 53.5% |
| Hard | 113 | 120 | 367 | 49.4% |
| Impossible | 116 | 110 | 374 | 50.5% |

Across these 2,400 equal-level matches, first-player match points are 51.9%. No compensating score rule was added. Pair dealing replaced independent draws after the initial simulation found a larger opening gap. Mirrored boards, equal turns, paired pieces and alternating rematches provide the fairness controls. Finite sampling does not prove perfect balance for every seed; both starting roles win within every equal-level sample. Tests also verify that replacing every unrevealed piece leaves computer choices unchanged.

## Polish pass (2026-11-05)

The active board now comes first visually on every turn, directly under the turn bar. The opponent remains alongside as a thumbnail. Portrait keeps the rack and controls below; desktop and phone landscape put controls beside the boards. Active board widths at the checked sizes are 259px (390×844), 235px (360×740), 228px (844×390), 540px (820×1180), and 580px (1280×800). Active cell targets range from 57px to 145px; action and rack buttons remain at least 44px. Setup still fits in both modes.

Rack canvases use a centered 3×3 frame with a shared cell size across all seven pieces and their rotations. They fill the available button instead of leaving a tiny piece inside a large canvas. Rack blocks use neutral sand `#c8b78a`; selected buttons use the active player's border. NEXT is larger, with a horizontal row in phone landscape. The shared painter now draws thick top/left bevels, dark bottom/right edges and small highlights. Placed blocks retain exact red/blue player colours. Blocked cells have a dark recessed slot and metal studs.

PLACE retains the existing FunSound noise/tone snap and adds a 180ms cell snap. The rack retains its 220ms refill slide through FP.animate. Placement animation is skipped under FP.reducedMotion, and the refill tween completes instantly. SVG rules remain scoped to `#rotate svg`, preserving FP.icon in the shell. Rules, paired dealing, scores, computer search and fairness controls are unchanged.

All six production files now have explanatory header comments and readable formatting. All are under 300 lines: CSS 106, controller 282, HTML 84, preview 36, renderer 133, rules 203. The renderer owns board/rack DOM construction as well as painting, keeping the controller focused on turns and input. Lines are at most about 170 characters. The existing test file was formatted too.

## Verification

`node --test tests/free-play/`: **72 tests passed, zero failures**, 42.1 seconds. Borrowed Blocks still has nine tests, including the seeded fairness and hidden-supply checks. No failures from other games in this run.

Own headless Chromium from Playwright, fresh context per size, existing Hugo server at localhost:1313; no server start/restart and no shared browser used. Full 1P and 2P matches reached results at **390×844, 360×740, 844×390, 820×1180 and 1280×800** (ten full matches on the final layout). Both setup modes and every play turn were checked for horizontal/vertical scrolling: none. Console errors and page errors: none. Keyboard pick, aim, rotation, cancel and Enter placement were checked. Separate normal/reduced-motion contexts confirmed placement feedback runs normally and skips its cell animations when reduced motion is enabled.

Screenshots were inspected for setup, play, filled boards, and the shared hub preview. Files: `/tmp/bb-polish-setup-{390,360,844,820,1280}.png`, `/tmp/bb-polish-setup2-{390,360,844,820,1280}.png`, `/tmp/bb-polish-play-{390,360,844,820,1280}.png`, `/tmp/bb-polish-filled-{390,360,844,820,1280}.png`, and `/tmp/bb-polish-preview.png`. Browser report: `/tmp/bb-polish-browser.log`; test report: `/tmp/bb-polish-tests.log`.

No git write commands were used. Only the six assigned game files, the Borrowed Blocks test file and this note were edited.

## Integration

Suggested `games.js` entry:

```js
{ slug: "borrowed-blocks", name: "Borrowed Blocks", live: true,
  players: [1, 2], scene: "borrowed-blocks", color: "#ffd23f",
  stats: [5, 0, 3, 2, 1], hook: "Pick from a shared rack and fit more squares on your board." }
```

Hub scripts, in this order, after the hub's existing `scenes.js`:

1. `/fun/borrowed-blocks/rules.js`
2. `/fun/borrowed-blocks/render.js`
3. `/fun/borrowed-blocks/preview.js`

The preview registers a 192×144 canvas and a still at 8400ms. It precomputes a real Hard-vs-Hard match with the same rules and painter. Each turn shows selection, a rotation, a footprint and placement; the rack slides on refill. There is no text overlay. It is deterministic at an arbitrary timestamp, including the reduced-motion still. It does not load the page controller or shared engine.

README section text:

> **Borrowed Blocks:** Pick a shape from a shared three-piece rack and fit it onto your board. Both 4×4 boards stay visible; each has two blocked cells. Rotate and preview before placing. Covered squares score one each, with six turns per player and no timer. 1P against Easy / Medium / Hard / Impossible, or 2P sharing the screen. Tap or drag to aim; arrows, R and Enter work on a keyboard. Pass only when nothing fits. Ties stand; rematches alternate starts.

Shared edits for the integrator: registry entry, hub script tags, README text and the music track below. No engine or shared control change is needed.

## Original music

D minor, 112 BPM, sixteen bars, approximately 34.3 seconds. Both parts have 64 steps in each channel; all channel lengths and the 34.3-second loop were checked. This code uses the existing tracks.js `pump` and `rep` helpers.

```js
T["borrowed-blocks"] = {
  bpm: 112,
  parts: {
    A: {
      lead: "D5:2 F5:2 A5:4 F5:2 E5:2 D5:4  C5:2 E5:2 G5:4 E5:4 R:4  Bb4:2 D5:2 F5:2 A5:2 G5:4 F5:4  E5:2 D5:2 C#5:4 D5:4 R:4",
      bass: [pump("D3", "A2"), pump("C3", "G2"), pump("Bb2", "F3"), pump("A2", "E3")].join(" "),
      drums: rep("k:2 h:2 s:2 R:2 k:2 h:2 s:2 h:2"),
    },
    B: {
      lead: "A5:2 F5:2 D5:4 E5:2 F5:2 A5:4  G5:2 E5:2 C5:4 D5:4 E5:4  F5:2 D5:2 Bb4:4 D5:2 F5:2 G5:4  E5:2 C#5:2 A4:4 D5:4 R:4",
      bass: [pump("D3", "A2"), pump("C3", "G2"), pump("Bb2", "F3"), pump("A2", "E3")].join(" "),
      drums: rep("k:2 h:2 s:2 h:2 k:2 R:2 s:2 h:2"),
    },
  },
  order: ["A", "B", "A", "B"],
};
```

The page's shared music loader will select this track once it is pasted into shared/tracks.js. Until integration, placement sounds work but this new music is not registered.
