# Quick Draw (1P vs computer / 2P): as built

**Status:** LIVE (2026-11-05).

## The game
Two cowboys face off in a pixel-art western town at sunset. Each round: "Get ready…", then "Wait for it…" for a random 1.5–4.5 s, then a red **!** and a bang. The first DRAW after the **!** wins the round, and the winner's reaction time (ms) is shown. Drawing before the **!** is a foul, and the other player gets the point. The winner draws with a muzzle flash; the loser falls.

## Options (setup screen)
- **Players:** 1P (vs the computer) or 2P (same screen).
- **Computer** (1P only):

  | Level | Reacts in | Draws early |
  |---|---|---|
  | Easy | 550–800 ms | 10% |
  | Medium | 360–480 ms | 4% |
  | Hard | 240–300 ms | never |
  | Impossible | 105–135 ms | never |

- **Rounds:** Best of 3 / 5 / 7 (first to 2 / 3 / 4). The default is 5.
- Mode, level and rounds are saved. The fastest human draw on the device is saved too.

## Controls
- 2P: a big **DRAW** button per player under the scene, P1 red on the left, P2 blue on the right.
- 1P: one full-width red DRAW button. The computer's pad (`#pad-1`) is hidden and `.controls` gets the `solo` class (set in `startMatch()`); the round result shows in the status text and score.
- **Keys:** 2P uses A (P1) and L (P2); 1P uses Space, Enter or A.
- Buttons react on `pointerdown`, not click.
- A press's timestamp is when the finger landed. If that's before the signal, it's a foul even if the event is handled just after (`judge()` in duel.js).
- Switching tabs mid-round pauses, and the round restarts on return.

## Files
- `duel.js`: rules (levels, rounds, signal delay, computer plan, judge, match). Tested in `tests/free-play/quick-draw.test.mjs`.
- `scene.js`: the town painter.
  - `QDScene(canvas)` for the game.
  - `QDScene.paint(ctx, H, t, state)` is shared with the hub preview.
  - Logical width 192; the height follows the canvas shape.
- `game.js`: screens, timing, input, saving. `game.css`: setup, duel and game-over layouts.

## Art notes
- **Cowboys:** 14×21 sprites with a hat band, eye, neckerchief (band plus shaded triangle in the player's colour), vest over a cream shirt, belt with buckle, holster, and a revolver (hammer, cylinder, barrel, grip).
- **Feet stay planted:** a shadow under each cowboy, and only the neckerchief tail moves while waiting.
- **Town:** a saloon and a sheriff's office with plank walls, stepped false fronts, readable SALOON / SHERIFF signs (3×5 pixel font), framed lit windows, porches on posts, batwing doors, a lantern, and a water tower.
- **Rejected along the way:**
  - a tumbleweed ("really bad")
  - cowboys bobbing up and down ("bouncing on nothing")
  - emoji avatars
  - tap-anywhere pads; the user wanted real DRAW buttons
