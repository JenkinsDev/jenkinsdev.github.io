# Tug of War

Tug of War should be built in `static/fun/tug-of-war/`. It uses the shared shell, layout, control cards, storage, sound and CRT stylesheet (`FP.shell`, `FP.screens`, `FP.loop`, `FP.input`, `FP.controlCards`, `FP.store("tug-of-war")`, `FP.sfx`, `FunSound`). It has no new libraries and no build step. Do not use Planck.js: the rope is a one-dimensional tug, not a rigid-body pile.

This note is the production spec. Follow the same split as Window Post: `rules.js` (DOM-free), `render.js`, `game.js`, `preview.js`, plus `index.html` and `game.css`. Keep each production file under about 300 lines. Tests live in `tests/free-play/tug-of-war.test.mjs`.

Tug of War **replaces** the current `{ slug: "soon", teaser: true }` card in `static/fun/games.js`. After Rocket Lander and Animal Speedometer are also registered, **add a new `soon` teaser at the end** so the hub still has a locked mystery slot.

## Pitch

Mash your side of the rope. First to pull the flag over your line wins the round.

## Core loop

Two teams share one screen and pull a single rope. Each counted tap tugs the flag a fixed step toward that side. The first side to pull the flag past its win line takes the round. A match is best of three (first to two round wins). Rounds that expire with the flag exactly on centre, or that somehow cannot be decided, are draws; draws stand and there is no overtime. Three rounds plus short banners finish well under two minutes (20 s cap per round, about 1.2 s between rounds).

In 1P the computer pulls the other side at Easy / Medium / Hard / Impossible. In 2P both people mash at once, each on their own half of the device. A wholesome power-up sometimes drops onto the middle of the rope; the next counted tap from either side claims it.

On-screen instruction: “Tap your side faster than the other side.”

## Rules and presentation

Player 0 is “You” / “Player 1” and uses red (`#ff3d3d`), matching Quick Draw and Air Puck. Player 1 is “Computer” / “Player 2” and uses blue (`#2c7bff`). The hub accent for this game is warm tangerine `#ff8c42`.

The flag position `x` lives in `[-1, 1]`. `x < 0` favours player 0; `x > 0` favours player 1. A round is won when `x <= -WIN` (player 0) or `x >= WIN` (player 1). Use `WIN = 0.92` so the flag visibly crosses a painted line rather than clipping the frame. There is **no spring back to centre**: if both sides stop, the flag stays put, like a real rope.

Each *counted* tap applies `PULL = 0.038` toward that player (player 0 subtracts, player 1 adds). Clamp `x` to `[-1, 1]`. Do not scale the pull by how many fingers are down or how long a finger is held.

**Tap counting (anti-auto-clicker, multi-touch safe):**

- A tap is a `pointerdown` inside that player’s exclusive zone, or a matching `keydown` that is not a repeat (`e.repeat` must be ignored, same as `FP.input.keys`).
- `pointerdown` counts once. Held pointers do not repeat. A new count requires `pointerup`/`pointercancel` then another `pointerdown`.
- Each pointer is owned by the side it first touched (`pointers: Map` of `pointerId → player`, same idea as `air-puck/game.js`). Crossing the midline later does not steal it. `pointerup` / `pointercancel` release ownership.
- Keyboard keys never feed the other player’s side.
- **Rate cap:** each side may count at most `CAP = 8` taps per second, measured in rolling 1000 ms windows (or 1 tap per 125 ms). Extra taps in that window are ignored (no pull, no power-up claim). Eight taps per second is a plausible human mash ceiling; no computer level may exceed it.
- Two (or more) fingers on the same side can each produce taps, but they still share that side’s 8/s cap.

**Round timer:** 20 seconds of pulling after a 0.8 s “3-2-1 PULL!” banner. If nobody has crossed a win line when the timer hits 0:

- the side that has the flag (`x` sign) wins the round;
- if `abs(x) < 0.02` (visually centre), the round is a draw and neither score increases.

**Match:** `TW.newMatch()` starts `{ scores: [0, 0], winner: null, rounds: 3, winAt: 2 }`. `TW.addRound(match, winner | null)` awards a point only when `winner` is `0` or `1`. After any round, if a score has reached `winAt`, that player wins the match. After three rounds with neither at `winAt`, the higher score wins; equal scores are a match draw. No extra round.

**Power-ups** (all wholesome, no pain or meanness beyond a cartoon slip):

| id | Name | Effect |
|---|---|---|
| `banana` | Banana peel | The other side slips: their taps do not count for 0.9 s. |
| `sneakers` | Super sneakers | The claimer’s taps pull `2 × PULL` for 1.2 s. |
| `sparkle` | Party sparkle | Instant extra tug of `0.16` toward the claimer (about four taps). |

Spawn at most one power-up per round, at a random time between 5 s and 14 s, never in the last 3 s and never while another effect is active. It sits on the flag for 2.4 s. The next *counted* tap from either side claims it (that tap still also pulls). If nobody claims it, it vanishes. Show the name in a short banner (“Player 1 got a banana peel!”).

Pixel presentation: two chunky characters lean and plant their feet harder as they fall behind; dust puffs on each counted tap (skip puffs under `FP.reducedMotion`); a small pixel crowd along the top bobs and throws tiny flags when a round ends. The rope is a thick dashed line with a square flag at `x`. Win lines are painted posts. Reduced motion keeps the flag, timer, scores, power-up icon and win/draw banners; it drops dust, crowd bob and lean-cycle frames (characters use a still strain pose).

## Controls and setup

Screens use `data-screen="title" | "play" | "over"`, shown with `FP.screens.go`, matching Quick Draw / Air Puck / Window Post. `FP.shell({ title: "Tug of War" })` draws the back/mute bar. Setup saves `mode` (`"1p"` / `"2p"`) and `level` through `FP.store("tug-of-war")` after `FP.ready`. Best-of-three is fixed, so there is no match-length selector.

Setup chips:

- Players: 1P / 2P (`.chip`, `aria-pressed`, `FP.sfx.move` on change). Hide `#level-option` when `mode !== "1p"`, same as `quick-draw/game.js` `syncTitle`.
- Computer: Easy / Medium / Hard / Impossible, labels from `TW.LEVELS`.
- Controls via `FP.controlCards`.

**Touch (primary):**

- Landscape: the canvas rope runs left–right. Player 0 owns the left half of the stage; player 1 owns the right half. Each half has a full-height pad at least 44 px wide, labelled PULL, sitting under/over the scene as space allows but always ≥ `--tap` (48 px) tall if they are separate buttons. If the pads *are* the stage halves, each hit target is still far larger than 44 px.
- Portrait: the rope is drawn **vertical**. Player 0 (You / Player 1) owns the bottom half and pulls downward; player 1 owns the top half and pulls upward, so two kids can stand on opposite edges of a tablet. Same ownership rules.
- In 1P the computer’s pad is visible but `disabled` (and not a touch target), like Quick Draw’s computer DRAW button. The human gets the remaining half, full width.
- Mouse clicks use the same pads. Simultaneous 2P on a desktop should prefer the keyboard, or mouse for player 0 and keys for player 1 (house rule).

**Keyboard:**

- 1P: `A`, `Space` or `ArrowLeft` (landscape) / `ArrowDown` (portrait) all pull for the human. Ignore unused arrows rather than mapping them to the computer.
- 2P player 0: `A` (also `S` in portrait as a downward hint if you want one extra key; keep `A` required).
- 2P player 1: `L` (landscape) or `ArrowUp` (portrait). Also accept `L` in both orientations so two-player keyboard stays memorable, matching Quick Draw’s A / L split.
- `FP.layout.current.size === "phone"` hides key caps on the control cards via existing `crt.css` (`html[data-layout="phone"] .control-card .keys { display: none; }`). Show the letters on the pads only when the layout is not phone, same as Quick Draw’s `$("key-0")` pattern.

Pause pulling while `document.hidden` (the `FP.loop` already pauses the rAF clock). On return, do **not** restart the round (this is not a reaction-time game like Quick Draw); resume the remaining timer and flag position. Clear all `pointers` on hide so stuck fingers cannot fire on return.

## Computer

The computer uses the public flag position, timer, and visible power-up. It issues counted taps through the same `TW.tap(state, player, time)` path as a human. It never exceeds `CAP`, never pulls harder than `PULL`, never sees a power-up before it spawns, and never inspects the human’s queued input.

Tap timing: on each update, a level may request a tap if `1 / rate` has elapsed since its last *accepted* tap (rejected, capped taps do not reset its clock in a way that would let it exceed `CAP`). Add jitter so it does not sound robotic.

| Level | Target rate | Jitter | Power-up plan |
|---|---:|---|---|
| Easy | 2.8 taps/s | ±0.5 taps/s, occasional 0.3 s pause (8% per second) | 40% chance to contest a visible pickup, after 0.28–0.45 s |
| Medium | 4.4 taps/s | ±0.4 | 70% chance, after 0.16–0.24 s |
| Hard | 6.2 taps/s | ±0.3 | 90% chance, after 0.08–0.14 s |
| Impossible | 8.0 taps/s (the cap) | ±0.05 (tiny, still human-looking) | Always contests, after 0.04–0.08 s. Prefers `banana` when behind, `sneakers` always, `sparkle` always. If already inside `x > 0.7` and winning, it may skip a `banana` (no need to slip a lost human) but still takes `sneakers` / `sparkle`. |

Impossible’s advantage is steadier timing and better pickup decisions, not a ninth tap per second or a larger `PULL`.

## Why replay

Kids get an instant, noisy tug they can play on a sofa. Adults chase the power-up timing and try to burst just as a banana appears. Best-of-three plus a 20 s cap keeps “one more match” short. The computer ladder is the reason to come back after the sibling goes to bed.

## Simulation

`node --test tests/free-play/tug-of-war.test.mjs` should cover, without a browser:

- `TW.tap` increments only the owning side and clamps to the rate cap (9 taps in 1000 ms yield 8 pulls).
- Held-pointer semantics: a helper that models “down without up” produces a single tap.
- Crossing `±WIN` awards the round to the correct player; centre expiry (`abs(x) < 0.02` at t=20) is a draw.
- `TW.addRound` first-to-two, three-round draw, and refusal to score after `winner !== null`.
- Power-up claim applies the documented effect and duration; a slip window rejects the victim’s taps.
- Computer: 200 simulated seconds at each level never exceed 8 accepted taps/s; Impossible’s mean rate is higher than Hard’s, Hard higher than Medium, Medium higher than Easy (seeded).
- Impossible does not receive a spawn time before `powerup.t0`.

## Hub integration

Load these scripts, in order, after `scenes.js` on `static/fun/index.html`:

1. `/fun/tug-of-war/rules.js`
2. `/fun/tug-of-war/render.js`
3. `/fun/tug-of-war/preview.js`

`preview.js` assigns `FP_SCENES.tug`, `FP_SCENE_SIZES.tug = [240, 180]`, and `FP_SCENE_STILLS.tug = 1600`. It must call the real `TW` rules and `TWRender.paint` with two computer sides (Hard vs Medium is fine). Show a short pull, a banana claim, and a flag crossing a post. No HUD chrome. `scene.reset` discards the sim so replay and IntersectionObserver restarts work, matching `FP_SCENES.puck.reset` / `window-post/preview.js`.

A first call at the still time (reduced motion) must already show both characters, the rope and the flag off-centre — not a blank frame. Follow `window-post/preview.js`: advance the sim to `t` and paint.

Suggested registry entry (replaces the `soon` object):

```js
{
  slug: "tug-of-war", name: "Tug of War", live: true, players: [1, 2],
  scene: "tug", color: "#ff8c42", stats: [1, 5, 2, 3, 4],
  hook: "Mash your side of the rope. First to pull the flag over the line wins the round.",
},
```

README text:

> **Tug of War:** Two sides mash a shared rope. Each tap tugs a flag toward your post; first over the line wins the round, best of three. Occasional banana peels, super sneakers and party sparkles spice a round. 1P against Easy / Medium / Hard / Impossible, or 2P on one screen. Touch pads on each half; A and L (or the matching arrows) on a keyboard.

## File layout

```
static/fun/tug-of-war/
  index.html    title, play, over screens; load crt.css, sound.js, engine.js, controls.js, then rules, render, game
  game.css      pads, split stage, banners; respect data-layout / data-orient
  rules.js      window.TW — levels, match, tap, cap, power-ups, cpuShouldTap
  render.js     window.TWRender.paint(g, view, state, extras)
  game.js       FP wiring, pointer map, keys, loop, sound, store
  preview.js    hub attract using TW + TWRender
tests/free-play/tug-of-war.test.mjs
```

`index.html` mirrors Quick Draw: fonts, `theme-color #0b0a10`, `../shared/crt.css`, local `game.css`, defer scripts in that order. Version-query the assets the same way the other games do.

`game.js` should: call `FP.shell`, build chips, `FP.controlCards`, `FP.input.tap` on `#play` / `#again` / `#change`, `FP.loop(update, draw)` while `data-screen="play"`, `ResizeObserver` plus `FP.layout.on` to resize the canvas (`devicePixelRatio` capped at 2, same as Air Puck). Names: `["You", "Computer"]` or `["Player 1", "Player 2"]`. Over screen: “You win!” / “The computer wins” / “Player 2 wins!” / “It’s a draw”, scores as `2 – 1`, buttons REMATCH and SETUP.

## Sound

Original chiptune in `shared/tracks.js` as `T["tug-of-war"]` (see Music). SFX, all through `FunSound` / `FP.sfx`, no audio files:

- Counted tap: short low square blip, pitch slightly up as you gain ground (`FunSound.tone(180 + abs(x)*80, { duration: 0.03, type: "square", volume: 0.05 })`).
- Cap ignore: silence (do not buzz).
- Power-up appear: `FunSound.pop()`.
- Claim: `FunSound.ding()` for sneakers/sparkle, `FunSound.boing()` for banana.
- Round win: `FP.sfx.right` for a human win in 1P or any 2P win; `FP.sfx.wrong` when the computer takes the round.
- Match start: `FP.sfx.start`.
- Setup chip: `FP.sfx.move`.

Respect mute via the existing `FP.muteButton` / `arcade:muted` path. Do not start tones while `FunSound.muted`.

## Visual polish

Warm dirt-and-sun palette against `#0d1226`. Left/bottom ground in a reddish shade, right/top in a bluish shade, without relying on colour alone (P1/P2 labels stay on screen). Flag is a white square with a contrasting skull-free emblem (a lightning bolt or star). Power-ups are readable at hub-preview size: banana is yellow and curved, sneakers are chunky shoes, sparkle is a four-point star. Big `PULL` lettering in `Bungee` / `Silkscreen`, timer in `VT323`.

## Accessibility

Minimum 44 px pads (`--tap` is 48 px). `:focus-visible` already dashed cyan from `crt.css`. Scores and banners have real text, not only canvas pixels; keep an `aria-live="assertive"` status line for “Round 2”, “Banana peel!”, “You win the round!”. Colour is paired with player numbers. Reduced motion as above. No device-tilt permission.

## Edge cases

- Several fingers on one pad share the cap; fingers on both pads in 2P count independently (two caps).
- A 1P touch on the computer half is ignored.
- Resize or rotation mid-round keeps `x`, scores and timer; rebuild the view and drop stale `pointerId`s.
- Tab hide pauses the loop and clears pointers; resume in place.
- Mute stays global.
- No page scroll while mashing (`touch-action: none` on the stage, `preventDefault` on `pointerdown` over pads). Do not call `preventDefault` on keys `FP.input.keys` would ignore.

## Music

Original tune, 120 BPM, C major, four-bar parts. Each channel must sum to the same 16th-note length (16 steps per bar × 4 bars = 64). Paste into `shared/tracks.js` inside the existing wrapper. Do not edit other tracks. Until that paste lands, the player uses its fallback.

```js
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
```

Verify with `tests/free-play/music.test.mjs` after pasting (every channel the same step count).

## Effort and risks

**Effort: M.** Discrete rules and a rate cap are straightforward; the risk is input (multi-touch, orientation swap, pad layout on a phone).

**Risks:** A round that never ends if both mash equally — solved by the 20 s cap. Auto-clickers or ten fingers — solved by `CAP = 8`. Portrait left/right pads that force two kids to share one edge — solved by the vertical rope. Impossible feeling unfair — it must not beat the cap. Power-ups that decide every round — only one, mid-round, small `sparkle` tug. Test on a real tablet with two thumbs before calling it done.

## Acceptance checklist

- [ ] 1P Easy / Medium / Hard / Impossible and 2P one-device matches both reach the over screen.
- [ ] Best of three; first to two can end early; a 1–1 match is a draw; no overtime.
- [ ] A full match including banners is under about two minutes.
- [ ] Each counted tap moves the flag; held fingers do not machine-gun; 9 taps in one second produce 8 pulls.
- [ ] Two pointers on opposite halves in 2P both pull, with separate ownership.
- [ ] Computer uses `TW.tap` and never exceeds 8 taps/s at any level.
- [ ] Banana / sneakers / sparkle match the table; effects are announced in text.
- [ ] Portrait uses a vertical rope with top/bottom pads; landscape uses a horizontal rope with left/right pads. Pads ≥ 44 px.
- [ ] Tab hide pauses and resumes in place; mute works; resize/rotation keeps the score.
- [ ] Reduced motion still shows flag, scores, timer and banners.
- [ ] Hub preview uses real rules and painter; reduced-motion still at 1600 ms is readable.
- [ ] No new libraries; each production file stays under about 300 lines.
- [ ] Setup, play and over fit without scroll at 390×844, 844×390, 820×1180 and 1280×800 (the Window Post verification widths).
- [ ] `games.js` entry replaces `soon`; a new `soon` teaser is added after the later games (or immediately after this card if this ships alone).

## Open questions for David

None that block building. If he later wants best-of-five, add it only if a five-round match still stays under two minutes (it likely will not with 20 s rounds).
