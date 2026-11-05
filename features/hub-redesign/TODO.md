# Hub Redesign — TODO

- [x] Branding decided: neutral, with a small link back to jenkinsdev.us
- [x] First mock round (`scratchpad/hub-mock.html`: Editorial / Poster / Night lab + names like Rabbit Holes): all rejected. User wants something more creative and arcade-like.
- [x] Arcade mock round (`scratchpad/arcade-mock.html`): A's neon-floor style liked but its machines too generic; B (CRT menu) cute but its game viewing too plain
- [x] Name decided: FREE PLAY (TILT! saved as a game idea)
- [x] Archive the old toys and the fridge hub into `archive/fun-v1/` (only `static/fun/shared/sound.js` stays)
- [ ] Choose the launch lineup: a mix of 1P and 2P games
- [x] Mock again (`scratchpad/arcade-mock-2.html`): A with a unique machine per game, and B as a character-select screen, with 1P/2P shown. Uses a placeholder lineup (Higher or Lower, Stack It, Quick Draw, Air Puck)
- [x] Layout: built the arcade floor first (archived in `archive/fun-v2-floor/`; the user found it "noisy and messy"), then rebuilt as **B, the CRT character select**. Approved ("looks nice").
- [x] Typeface and palette chosen, written as tokens in `hub.css`
- [x] Built `static/fun/index.html`, `hub.css`, `hub.js` and `scenes.js`
- [x] Registry is `games.js` (`window.FP_GAMES`), with a `players` field
- [x] Kept only mute (as the VOL knob). Dropped favourites and the "new" marker.
- [x] Checked at 1280 and 390: no horizontal scroll, even columns, targets ≥ 44px
- [x] No console errors (the only one was the dev server's missing favicon; an inline favicon was added)
- [x] User reviewed the hub: approved
- [x] In-repo docs written: `docs/free-play/README.md`
- [ ] Add the `/fun/` menu entry to `config.toml` and run `hugo` to confirm the build (once the user wants it public; the first live game is probably the right moment)
