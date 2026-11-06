# Rocket Lander

Rocket Lander is built in `static/fun/rocket-lander/`. It uses the shared shell, layout, control cards, storage, sound and CRT stylesheet (`FP.shell`, `FP.screens`, `FP.loop`, `FP.input` is not used for hold-to-thrust; keys are tracked with a `Set` like Air Puck). No new libraries, no Planck.js, no build step. Physics is a custom thrust-and-rotate integrator in `rules.js` with a fixed 1/120 s step.

## Rules and presentation

Player 0 is red (`#ff3d3d`); player 1 is blue (`#2c7bff`). Hub accent: `#7eb8ff`. Names are “You” / “Computer” or “Player 1” / “Player 2”.

Both players (or you and the computer) launch 22 m above the same pad at the same moment, with the same fuel and the same rocket. Thrust shortens the fall; rotation aims the nose. A safe landing is slow, upright and on the pad. The first safe landing wins the round. If both crash, the round is a draw. If both land on the same physics frame, the cleaner landing (more fuel left, slower impact, closer to pad centre) wins; if those still tie, the round is a draw. Draws stand; there is no overtime.

A match is best of three (first to two). Each round is capped at 45 seconds. Anyone still flying at the timeout crashes. After every round a fact card about that world appears for about 2.8 s (about half a second under reduced motion). Each world has a pool of kid-safe facts; a round picks one at random and will not repeat the previous line if another is available.

On-screen instruction: “Land upright and gently on the pad.”

### Worlds

Gravity is downward acceleration in m/s². Shared thrust is always 28 m/s² — it does not change per world.

| id | World | g | Pad | Notes |
|---|---|---:|---:|---|
| moon | Moon | 1.62 | 3.4 m | Default. Grey craters. |
| mars | Mars | 3.73 | 3.4 m | Rust ground. |
| earth | Earth | 9.80 | 3.4 m | Blue limb and green ground. |
| pluto | Pluto | 0.62 | 3.4 m | Icy beige. |
| jupiter | Jupiter | 24.79 | 4.2 m | Banded clouds. Floating cloud pad with an 8.0 m/s² updraft within 2.5 m of the pad, applied equally to both rockets. Banner: “No solid ground — aim for the cloud pad.” |

Kid-safe facts (shown after each round; source URLs live only as comments in `rules.js`):

- Moon: The Moon does not make its own light — it shines by reflecting the Sun.
- Mars: A year on Mars is about 687 Earth days, because Mars is farther from the Sun.
- Earth: Earth is the world we live on, with air to breathe and oceans of liquid water.
- Pluto: Pluto is a dwarf planet in the distant Kuiper Belt.
- Jupiter: Jupiter is a giant ball of gas — there is no solid ground to park on. This pad is a floating cloud deck.

### Shared rocket

- `THRUST = 30` m/s² while thrust is held and fuel remains (bumped from the original 28 so lift answers a tap more clearly on Earth/Mars, without changing per-world gravity).
- `ROT = 6.4` rad/s²; angular damping `2.8` /s (snappy turn, still settles when released).
- Fuel starts at 100 and burns 18 per second. Empty fuel cuts thrust to zero; rotation still works.
- The shared world is 28 m wide. Each round places the pad clearly left or right of center (not under the ships) and may raise it on a short shelf (`padY` 0–1.15 m). Both ships start together at world center (`x = 14`), 22 m above the deck, so they have to fly sideways to reach it. Each camera follows its ship left and right instead of framing the whole world. When the pad is off-camera in a viewport — including the usual case where you are high and it sits below the view — that canvas pins a gold PAD cue to the bottom edge at the pad’s horizontal position (clamped), with an arrow aimed at it (straight down, or down-left / down-right if it is also off to a side) and the distance in meters. The cue hides as soon as any part of the pad is on screen. The pad is a simple arcade plate (outline, one stripe, two lights) sitting on a low mesa. Mountains stay off it; the shelf around the deck is not a safe landing. Physics constants stay the same. Both rockets start nose up.
- There is no height ceiling — you may fly as high as you like and the camera follows. Shared mountains are solid: touching one is a kid-safe cartoon crash (BOOM plus a punchy FunSound). The pad is the only safe landing surface; bumps are placed so they never cover it. Leaving the sides of the world, hitting flat ground off-pad, hitting a mountain, tipping on contact, or failing the safe-landing thresholds is a crash: a seated, dented cartoon with a soot puff and “Oops!”. No fireballs.

Safe landing, all required on first pad contact:

- centre over the pad with 0.15 m of forgiveness
- `abs(vy) ≤ 2.4` m/s (downward `vy`) and `abs(vx) ≤ 1.8` m/s
- `abs(angle) ≤ 12°` from upright

Landing score (same-frame tie-break only): `floor(remainingFuel * 4) + floor((1 - impactSpeed / 3.0) * 150) + floor((1 - padOffset / halfPad) * 120)`, each term ≥ 0.

If one player lands while the other is still flying, the round stops and the loser is frozen (not force-crashed).

Coordinate convention: `y` is height above the pad top; `vy` is downward speed, so a coasting rocket on the Moon gains about `1.62` m/s of `vy` each second.

## Controls and setup

Screens: `title` / `play` / `over`. Store `mode`, `level`, and `world` after `FP.ready`. Computer chips hide when `mode !== "1p"`.

Touch (primary), buttons ≥ 44 px, each button owns its `pointerId`:

- 1P: one cluster under the stage — rotate left, THRUST (largest), rotate right.
- 2P portrait: player 0 under the bottom viewport, player 1 above the top viewport (the top cluster is rotated 180°).
- 2P landscape: player 0 left of the left viewport, player 1 right of the right viewport. Clusters stay narrow so the playfield keeps its width.

Keyboard (held analog, `keydown`/`keyup` sets — not `FP.input.keys`):

- 1P: `A`/`D` or arrows rotate; `W`, `ArrowUp` or `Space` thrusts.
- 2P player 0: `A`/`D` rotate, `W` or `Space` thrusts.
- 2P player 1: arrows rotate, `ArrowUp` thrusts (not Space).

Split view: two canvases, each camera following that player’s rocket in the shared world. The camera zooms out at altitude so the pad stays visible below the ship and zooms in on approach. World-space stars/clouds, altitude marks (25m down to PAD), and speed lines make the fall readable from the start. A centered HUD in each viewport shows a large fuel bar and a large countdown; the shared scoreboard timer is also large (turns red at 10 s). The split between viewports is an arcade seam: red and blue dual stripes, gold chevron dashes, and a yellow VS pill in the middle (not a plain blue bar). `aria-live` announces “Safe landing!”, “Oops!”, and the fact text.

`document.hidden` pauses `FP.loop`. On return, pointer holds are cleared so a stuck thrust cannot linger.

Reduced motion: rockets jump to integrated positions without flame flicker or soot; crash pose and fact text still appear; banners do not blink.

## Computer

The computer pilots player 1 in 1P through `{ rotate: -1|0|1, thrust: boolean }` and the same `THRUST`, fuel and landing tests. It cannot burn extra fuel.

It sees only its own rocket and the pad. Planner: a suicide-burn estimate `t ≈ (-v + sqrt(v² + 2 a d)) / a` with `a = THRUST - g` (plus the Jupiter updraft when in range), plus a stopping-distance check. It rotates toward the pad when offset and toward upright when lined up. It cuts thrust when rising away from the pad with fuel to spare.

| Level | Degradation |
|---|---|
| Easy | Recalc every 0.35 s, ±18° aim error, 20% chance each second to forget thrust for 0.25 s, late burn (`t * 0.55`) |
| Medium | Every 0.18 s, ±8°, late burn (`t * 0.8`) |
| Hard | Every 0.08 s, ±3°, raw `t` |
| Impossible | Every frame, no injected error, raw `t`, upright alignment starts early |

Seeded Earth sample (30 drops): Easy crashed 30 / Impossible crashed 0.

## Hub integration

Load after `scenes.js` (and the other game previews):

1. `/fun/rocket-lander/rules.js`
2. `/fun/rocket-lander/render.js`
3. `/fun/rocket-lander/preview.js`

`FP_SCENES.lander`, size `[240, 180]`, still time `2200`. The preview runs Impossible and Hard computers on the Moon (the second ship starts slightly offset so a tip-over is visible) and paints with `RLRender.paint`. `scene.reset` clears the sim.

## Sound

Original chiptune `T["rocket-lander"]` at 98 BPM in `shared/tracks.js`. SFX: thrust is a low saw at most every 0.07 s; rotate ticks at most every 0.2 s; safe landing is `FP.sfx.right` plus `FunSound.ding()`; crash is `FunSound.boing()` then a short noise puff.

## Files

- `static/fun/rocket-lander/index.html`
- `static/fun/rocket-lander/game.css`
- `static/fun/rocket-lander/game.js`
- `static/fun/rocket-lander/rules.js`
- `static/fun/rocket-lander/render.js`
- `static/fun/rocket-lander/preview.js`
- `tests/free-play/rocket-lander.test.mjs`
- `features/free-play-games/notes/rocket-lander.md`

Also wired: `static/fun/games.js` (replaces the “soon” teaser), `static/fun/index.html` script list, `static/fun/shared/tracks.js`, `tests/free-play/music.test.mjs`, `docs/free-play/README.md`.

No commit or push. Animal Speedometer remains deferred.

## Open

A later “tour” that plays every world in one sitting would need a longer match budget than two minutes.
