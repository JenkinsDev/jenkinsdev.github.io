# Spec: shared game engine (basics)

**Status:** DRAFT, waiting for the user's OK. It would be built together with Higher or Lower, which is its first user.

## Why
Every game needs the same plumbing:
- a layout that works on phone, tablet and desktop
- a way back to the hub
- sound on/off
- saving
- screens (title, play, game over)
- a game loop
- input

Writing these once means every game behaves the same way and each game's own code stays about the game.

## Files
```
static/fun/shared/
  crt.css     (exists) tokens, fonts, page base, CRT effect, buttons
  sound.js    (exists) FunSound: WebAudio tones and noise
  engine.js   (new) everything below, as window.FP
```
A game page loads `crt.css`, `sound.js` and `engine.js`, then its own files.

## What's in it

| Piece | What it does |
|---|---|
| `FP.layout` | Sets `<html data-layout="phone\|tablet\|desktop" data-orient="portrait\|landscape">` and keeps it updated on resize and rotation. Games style each layout in CSS with these attributes. Breakpoints: phone < 760px, tablet 760–1199px, desktop ≥ 1200px. |
| `FP.shell({ title })` | Adds the standard top bar: "← Arcade" (back to the hub), the game's name, and the sound button. Every game looks and exits the same way. |
| `FP.screens` | Shows one `<section data-screen="…">` at a time, e.g. `FP.screens.go("over")`. Moves focus to the new screen for keyboard and screen-reader users. |
| `FP.loop(update, draw)` | A `requestAnimationFrame` loop with a time step. It pauses when the tab is hidden and caps the step after a pause so nothing jumps. Only for games that animate continuously. |
| `FP.input` | `FP.input.keys({ ArrowUp: fn, … })` for keyboard. `FP.input.tap(el, fn)` for fast touch with no double-fire. Later, for 2-player games: split-screen touch zones. |
| `FP.store("slug")` | `get` / `set` in `localStorage` under `fun:<slug>:…`, with errors handled (private browsing, full storage). |
| `FP.sfx` | The shared sounds: move, start, right, wrong, tick, so every game sounds like part of the same arcade. |
| `FP.pixel.emoji(char, size)` | Draws an emoji into a tiny canvas and returns it scaled up with crisp pixels. Higher or Lower uses this for its item art. |

The hub would switch to `FP.layout`, `FP.sfx` and the shared sound button so it matches the games.

## Not in it (yet)
- Physics, collision and sprite animation. Add them when a game needs them (Air Puck, Stack It), then move them into the engine if a second game needs them too.
- Any framework or build step.

## Rules for games using it
- Design all three layouts: phone, tablet and desktop. Test at 390, 768, 1024 and 1440 wide, and in both orientations on tablet.
- Use `FP.shell` for the top bar. Don't build a custom exit or mute.
- Keep game-specific code out of `engine.js`. A helper is promoted into the engine only once two games need it.
