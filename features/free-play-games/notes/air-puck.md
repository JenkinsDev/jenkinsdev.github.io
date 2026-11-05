# Spec: Air Puck (1P vs computer / 2P)

**Status:** LIVE (2026-11-05). The user was unsure how controls should work on touch vs desktop, so the controls below are a proposal to review in play.

## The game
Air hockey on one screen. Each player has a mallet in their own half of the rink and tries to knock the puck into the other player's goal. The puck glides, bounces off the walls, and speeds up when hit hard.

## Options (setup screen, same pattern as Quick Draw)
- **Players:** 1P (vs the computer) or 2P (same screen).
- **Computer:** Easy / Medium / Hard / Impossible (the arcade-wide levels).
- **Goals to win:** First to 3 / 5 / 7 (default 5).
- Saved per device.

## Controls (proposal)
- **Touch:** put a finger down on your side and drag. Your mallet chases your finger at a capped speed, so it feels physical, not teleporting. Multi-touch: each player drags on their own side at the same time.
- **Mouse:** the mallet follows the pointer with no click needed. In 2P, the pointer controls whichever side it's on.
- **Keyboard:** P1 uses WASD and P2 uses the arrow keys. In 1P, either set works.
- Mallets can't leave their own half.

## Layout
- **Portrait** (phones, iPad upright): the rink runs top to bottom. P1 is at the bottom and P2 or the computer at the top, so an iPad can lie flat between two players.
- **Landscape** (desktop, iPad sideways): the rink runs left to right, P1 on the left.
- Scores sit by each goal.
- The rink fills the screen under the top bar, with no scrolling.

## Rules
- A goal goes to the scorer. The puck is then placed, still, in the conceding player's half (they serve).
- First to N goals wins → game-over screen with REMATCH / SETUP.

## Computer opponent
It moves its mallet toward a target with a capped speed:
- **Defending:** it stays between the puck and its goal.
- **Attacking:** when the puck is on its side, it strikes through the puck toward the other goal.

| Level | Max speed | Reaction | Aim error |
|---|---|---|---|
| Easy | slow | delayed | sloppy |
| Medium | moderate | | |
| Hard | quick | small delay | accurate |
| Impossible | fast | no delay | reads the puck's path off the walls |

## Physics (table units)
- **Rink:** 1 wide × 1.6 long. **Goals:** 0.34 wide at each end.
- **Sizes:** puck radius 0.035, mallet radius 0.065.
- **Movement:** light friction and a max puck speed. Fixed sub-steps so a fast puck can't tunnel through a mallet or wall.
- **Bounces:** walls reflect the puck with a little energy loss, and so do the posts beside the goal mouth. Mallet hits push the puck out and add the mallet's motion (a mallet acts like an immovable object, with restitution of about 0.9).
- **Code:** all of this lives in `physics.js`, tested in `tests/free-play/air-puck.test.mjs`.

## Look
- **Rink:** a neon rink on the dark CRT background, matching the hub preview: dark ice, cyan boards, a pink centre line and circle, dark goal mouths.
- **Mallets:** red (P1) and blue (P2 / computer) with a highlight ring.
- **Puck:** white, with a short trail when it's moving fast.
- **Effects:** a goal flashes the scorer's side and plays a sound. Hits make a clack whose pitch rises with speed.

## Files
- `physics.js`: rink, puck, mallets, collisions, scoring and the computer's movement. No DOM.
- `render.js`: draws the rink and pieces to a canvas, with the portrait/landscape mapping.
- `game.js`: screens, input (touch, mouse, keys), the loop, saving and sounds.
- `index.html`, `game.css`.

## As built: notes
- **Rounded corners (radius 0.16).** Simulated computer-vs-computer matches first showed the puck pinned in a square back corner for about 110 s out of 120. Real tables round their corners for this reason. Now the longest stall is under half a second, and a test enforces it (no stall over 3 s in 90 s, at least 3 goals).
- **How the computer attacks:** it aims at the opponent's goal, gets behind the puck first, then strikes through it. If the puck is jammed against its own end wall, it knocks it out toward the middle instead.
- **Simulated results:** Hard beat Easy 9–0 over two minutes, and Impossible beat Medium 3–0.
- **One brain for both sides.** `cpuTargetFor(world, player, …)` mirrors the rink, so the hub preview runs a live computer-vs-computer match with the real physics and renderer.
- **Input details:**
  - `pointerdown` assigns each touch to the half it started in (2P), or always to player 1 (1P).
  - A mouse steers without clicking.
  - Held keys steer in screen directions, mapped to the rink for each orientation.
- **Tests:** 14 in `tests/free-play/air-puck.test.mjs`, covering walls, goals, posts, mallet hits, the speed cap, halves, serving, levels, the computer defending, attacking and clearing corners, and match end.
- **Sound:** at most one hit sound per frame (the hardest) with a 90 ms cooldown, and wall sounds with a 70 ms cooldown. Hard's mallet pressing on the puck used to stack dozens of beeps.
- **Keyboard sensitivity** (user request): a 1–10 slider in the Controls section, in 1P and 2P on non-phone screens. It scales the keyboard mallet speed: `malletSpeed × (0.4 + 0.12 × value)`. Saved as `air-puck:sense`.
- **Setup screen:** the description is separate from a Controls section with one card per player (drag or mouse, plus key caps), as the user asked.
