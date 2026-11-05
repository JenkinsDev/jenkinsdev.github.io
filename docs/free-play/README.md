# FREE PLAY

Original browser games for kids and adults, served at **`jenkinsdev.us/fun/`** and played mostly on an iPad. There are no ads, accounts or tracking.

The hub is a grid of game cards: each shows a pixel preview of the game, its name, 1P/2P tags, a one-line description, five stat bars and its own PLAY button (or "Coming soon"). Three columns on desktop, two on tablet, one row per game on phones. Every page of the main site links to it with a FREE PLAY button under the header.

## Games

| Game | Players | Status | Folder |
|---|---|---|---|
| Higher or Lower | 1P | live | `static/fun/higher-or-lower/` |
| Quick Draw | 1P vs computer / 2P | live | `static/fun/quick-draw/` |
| Air Puck | 1P vs computer / 2P | live | `static/fun/air-puck/` |
| Stack It | Solo / 1P vs computer / 2P | live | `static/fun/stack-it/` |
| TILT! | ? | locked teaser | n/a |

Each game's spec and as-built notes are in `features/free-play-games/notes/<slug>.md`.

- **Higher or Lower:**
  - Two real things, both numbers hidden, one question ("Which is heavier?"). Tap a card, then both numbers count up.
  - 5 categories and 214 items, with random pairs that must make sense (pairs are 1.25×–20× apart; sizes only tall-vs-tall or long-vs-long), getting harder with the streak.
  - US units by default, metric toggle. Best streak per category.
- **Quick Draw:**
  - A reaction duel in a pixel-art western town at sunset. Wait for the **!**, then hit DRAW. Drawing early loses the round.
  - 1P vs the computer (Easy / Medium / Hard / Impossible) or 2P with a DRAW button each (keys A and L).
  - In 1P there is a single full-width DRAW button (the computer has no pad), which is easy to hit on a phone. 2P keeps two pads.
  - Best of 3, 5 or 7. Fastest draw saved.
- **Air Puck:**
  - Air hockey on a neon rink with rounded corners. Drag your mallet with a finger or the mouse, or use the keys (WASD for P1, arrows for P2).
  - Portrait runs top to bottom (P1 at the bottom, good for an iPad lying between two players); landscape runs left to right.
  - 1P vs the computer (the four levels) or 2P with multi-touch. First to 3, 5 or 7.
  - The setup screen has a separate **Controls** section: one card per player showing how to move on this device (drag / mouse, plus the keys as key caps), next to a saved **Keyboard sensitivity** slider (1–10, in 1P and 2P, hidden on phones). 5 = normal, 1 about half speed, 10 about 1.6×.
  - Hit and wall sounds are limited to one per frame with a short cooldown, because a mallet pressing on the puck reports many hits in a row.
- **Stack It:**
  - A crane swings an object over a stone plinth; tap (or Space / Enter) to drop it straight down. 18 real things (fridge, piano, cat, snowman in a top hat…) as pixel art, with real physics from Planck.js (`static/fun/vendor/planck.min.js`, MIT, Box2D port).
  - Solo: stack until something hits the ground; the height is the score (feet, with metres underneath), best saved, shown as a dashed gold line.
  - 1P vs computer / 2P rounds: the first player builds until their pile falls, then the other builds a fresh pile and must beat that height (a dashed line in the first player's colour). Passing it wins the round at once; falling first loses it. Who starts alternates. A banner names whose turn it is, and the height box shows the builder's name in their colour. Best of 3, 5 or 7.
  - Fairness rules, found by simulating thousands of drops (`tests/free-play/stack-it.test.mjs`): nothing is perfectly round (tyres lie flat, melons and snowmen have flat bottoms, the snowman has a hat), weights stay within 3:1 (the physics engine squashes very light things under very heavy ones), objects fall straight down from the hook, and a hard object never follows a hard one.
  - The hub preview is a real pile built by the Hard computer, using the game's own physics and drawing.

## Where things live

```
static/fun/                 ← published verbatim by Hugo at /fun/
  index.html, hub.css, hub.js   the hub (game cards, preview loops, sound button)
  games.js                  ★ the game registry (window.FP_GAMES): edit this to add or change games
  scenes.js                 hub preview loops (window.FP_SCENES, sizes in FP_SCENE_SIZES)
  shared/crt.css            tokens, fonts, page base, CRT effect, buttons, chips, top bar (link it first)
  shared/sound.js           FunSound: tiny WebAudio helper (also loads music.js on every page)
  shared/music.js           FunMusic: chiptune player (pulse lead, triangle bass, noise drums); plays the page's tune
  shared/tracks.js          the tunes: hub, higher-or-lower, quick-draw, air-puck, stack-it (original compositions)
  shared/engine.js          FP: layout, shell, screens, loop, input, saving, sounds, pixel emoji
  shared/controls.js        FP.controlCards(): the Controls section on setup screens (cards styled in crt.css)
  vendor/planck.min.js      Planck.js 1.4.3 (MIT, licence in the file header): 2D physics for Stack It
  <game-slug>/              one folder per game

layouts/partials/           ← site overrides of the Hugo theme: the FREE PLAY header button (header.html + extended_head.html)
tests/free-play/            ← Node tests for game logic: `node --test tests/free-play/`
docs/free-play/             ← this documentation (not published)
features/free-play-games/   ← plan, checklist, per-game specs, engine spec, design review
features/hub-redesign/      ← hub plan and design history
archive/                    ← earlier rejected versions (fun-v1 kid toys + fridge hub, fun-v2-floor arcade floor)
```

Hugo copies everything in `static/` to the site root, so `static/fun/index.html` is served at `/fun/`. Don't put docs or notes in `static/`, because they would be published.

## How the hub works

1. `games.js` defines `window.FP_GAMES`, an ordered array. The hub shows one card per entry.
2. `scenes.js` defines `window.FP_SCENES`. Each scene is `(ctx, t) => void` and draws one frame at time `t` (ms) into its canvas: 64×48 by default, or the size in `FP_SCENE_SIZES`. CSS scales it up with crisp pixels.
   - **Built games preview the real thing.** Higher or Lower draws its two-card round. Quick Draw calls the game's own painter (`QDScene.paint`). Air Puck runs a live computer-vs-computer match with the game's physics and renderer (`air-puck/physics.js` + `render.js`). The hub loads those scripts.
3. `hub.js` builds the cards and runs one `requestAnimationFrame` loop that only draws canvases on screen. With reduced motion, each preview is drawn once as a still.
4. PLAY opens `/fun/<slug>/` after a short coin sound. Games that aren't live show "Coming soon" text instead of a button. The TILT! teaser stays a "?" with no name, tags or stats.

### Registry fields (`games.js`)

| Field | Meaning |
|---|---|
| `slug` | Folder name under `static/fun/`; the game's URL is `/fun/<slug>/` |
| `name` | Display name |
| `live` | `false` shows "Coming soon"; set to `true` once the user has reviewed the game |
| `players` | `1`, `2`, or `[1, 2]` (solo vs the computer, or two people on **one** screen). Shown only as 1P / 2P tags, never in words |
| `teaser` | `true` renders a locked "?" card (currently TILT!) |
| `scene` | Key into `FP_SCENES` for the preview |
| `color` | Accent colour for the card, its border, stat bars and PLAY button |
| `stats` | `[brains, speed, skill, luck, silly]`, each 0–5, shown as bars |
| `hook` | One plain sentence saying what you do in the game |

## The shared engine (`shared/engine.js`, `window.FP`)

| Piece | Use |
|---|---|
| `FP.layout` | Sets `<html data-layout="phone\|tablet\|desktop" data-orient="portrait\|landscape">` (phone < 760px, desktop ≥ 1200px). Style each layout in CSS with these. |
| `FP.shell({ title })` | The standard top bar: ← back to the hub, the game's name, the sound button |
| `FP.screens.go(name)` | Shows one `<section data-screen="…">` and focuses its `[data-autofocus]` element |
| `FP.loop(update, draw)` | A requestAnimationFrame loop with a capped time step that pauses while the tab is hidden |
| `FP.animate(ms, fn, done)` | Ease-out tween; instant under reduced motion |
| `FP.input.keys(map)` / `.tap(el, fn)` | Keyboard map (return `false` to let the key through) and tap |
| `FP.store(slug)` | `get(key, fallback)` / `set(key, value)`. **IndexedDB** (`free-play` database, `kv` store) behind an in-memory copy. Read saved values after `FP.ready`. Old `localStorage` saves are migrated once. |
| `FP.sfx` | Shared sounds: move, start, nope, tick, right, wrong |
| `FP.muteButton(btn)` | Wire any button as the arcade-wide sound toggle (saved as `arcade:muted`) |
| `FP.pixel.emoji(char, size)` | Emoji drawn into a tiny canvas, shown as crisp pixel art |
| `FP.icon(name)` | Pixel icon as an inline SVG (`back`, `sound`, `off`); use these instead of text glyphs like ← or ♪, which phones draw off-centre with fallback fonts |

Spec and reasoning: `features/free-play-games/notes/engine.md`. A helper only moves into the engine once two games need it.

## Adding a game

1. Write a short spec in `features/free-play-games/notes/<slug>.md` and get the user's OK.
2. Create `static/fun/<slug>/` following the game contract below. Put rules and physics in their own file so they can be tested, then add tests in `tests/free-play/<slug>.test.mjs`.
3. Add or update its entry in `games.js` (`live: false`) and a preview in `scenes.js` that looks like the real game.
4. Check it at 390, 768/820, 1024, 1280 and 1440 wide, with no console errors and no sideways scrolling.
5. The user reviews it, then set `live: true`. Update this README and the checklist.

### Game contract

- **Standalone page.** Plain HTML, CSS and JS with no build step and no frameworks (a vendored library in `vendor/` only when a game clearly needs it, like physics for Stack It). Load `../shared/crt.css`, `../shared/sound.js`, `../shared/engine.js` (and `../shared/controls.js` for the setup Controls section) first, and use `FunSound` / `FP.sfx` rather than your own `AudioContext`.
- **Way back:** use `FP.shell()` for the top bar.
- **Phone, tablet and desktop.** Every game designs all three layouts and works in both tablet orientations. Touch targets ≥ 44px.
- **Real buttons for actions.** Quick Draw uses a DRAW button per player, not "tap anywhere".
- **2P games** share one screen, never two devices.
- **1P vs the computer** uses the same four levels everywhere: Easy, Medium, Hard, Impossible.
- **Kid-safe:** no external links, no network calls (except Google Fonts), no analytics, and no text entry that leaves the device. Save only with `FP.store`.
- **Accessible:** real `<button>`s, `aria-label`s on icon buttons, visible focus, respect for `prefers-reduced-motion`, keyboard playable where it makes sense.
- **Original.** Genre conventions (air hockey, quick-draw duels) are fine. Don't recreate a specific existing game's name, characters, art or levels.
- **Size:** each production file under 300 lines (500 is the hard limit).

## Writing and design rules

- **No filler.** Nothing goes on screen just to look retro or clever: no 1UP/2UP, no fake credits or model numbers, no "a new challenger approaches", no decorative glyphs (including ▶ on buttons), and no three-part slogans. Every label has to do a job.
- **Plain copy.** Hooks, facts and buttons say what happens, in normal sentences.
- **No invented features.** Don't add scoreboards, titles or modes nobody asked for. Propose them instead.
- **CRT effect, not a CRT frame.** Scanlines and pixel type are welcome; no monitor or bezel around content.
- **Questions must make sense at a glance and never be tricks** (Higher or Lower). Categories where everyone already knows the order (temperature, loudness) were dropped.
- **Setup screens keep controls out of the description.** The intro says what the game is; a separate Controls section (`<div class="option controls">` with `#control-cards`, filled by `FP.controlCards(el, [{ who, how, keys: [["A"], ["Space"]] }])`) shows a card per player: what to tap or drag, plus key caps. Key caps hide on phones automatically. All three live games use it.
- **Art should look made, not placeholder.** Hand-authored pixel art with real detail (e.g. Quick Draw's revolvers, neckerchiefs, readable shop signs). No floating sprites: characters stand on the ground with a shadow.

## Design tokens (`shared/crt.css`)

| Token | Value | Use |
|---|---|---|
| `--room` | `#0b0a10` | page background |
| `--text` | `#e8f6ff` | main text |
| `--soft` | `#b9c6d8` | secondary text |
| `--muted` | `#96a5bb` | small labels people still need to read |
| `--dim` | `#5d6678` | unavailable controls only |
| `--line` | `#2a3150` | borders |
| `--pink` / `--cyan` | `#ff3da0` / `#00e5ff` | the FREE PLAY title (pink with a tight cyan shadow) |
| `--sun` | `#ffd23f` | default accent, 1P tags |
| `--green` / `--red` | `#37e27d` / `#ff3d3d` | right/wrong, P1 colour |
| `--orange` | `#ff7a1a` | Quick Draw |

Shared components: `.fp-btn` (and `.secondary`) with a small lift on hover and a push on press, no glow, plus disabled states; `.chip` / `.chips` / `.option-label` for setup options (the selected chip is tinted with the game's `--accent`); `.fp-icon`; `.fp-bar`.

**Fonts:** Bungee Inline (big titles), Bungee (names, signs), VT323 (screen text), Silkscreen (tiny labels). All from Google Fonts.

## Sound (`shared/sound.js`)

`FunSound.tone(freq, { duration, type, volume, slideTo })`, `note(i)`, `pop()`, `ding()`, `boing()`, `whoosh()`, `clack()`, `rustle()`, `noise(opts)`, `muted`, `setMuted(bool)`. Audio unlocks on the first tap or keypress. The engine saves the mute setting. Keep volumes low (≤ 0.1 for square waves).

## Music (`shared/music.js` + `shared/tracks.js`)

- **Every page plays background music** in an old-console style: a 25% pulse-wave melody, a triangle bass and noise drums. It's all synthesized live, with no audio files.
- **Which tune plays** depends on the URL: the hub theme at `/fun/`, and each game's own at `/fun/<slug>/`.
  - Hub: easygoing, C major.
  - Higher or Lower: a bouncy quiz-show tune, F major.
  - Quick Draw: a western gallop, A minor.
  - Air Puck: fast and driving, E minor.
- **When it plays:** music starts on the first tap or key press anywhere on the page, which browsers require (iPad Safari on every page load). Where the browser can report up front that sound is allowed (`navigator.getAutoplayPolicy`, e.g. Firefox), it starts straight away. It fades in, follows the ♪ sound button, and stops scheduling while the tab is hidden.
- **Tune format:** `{ bpm, parts: { A: { lead, bass, drums }, … }, order: [...] }`. Each channel is `"Note:steps"` tokens in 16th-note steps (16 per bar); drums are `k` / `s` / `h`; `R` is a rest.
  - Every channel must add up to the same length, which `tests/free-play/music.test.mjs` checks.
  - Loops should run at least 20 s.
- **To add a game's tune:** add `TRACKS["<slug>"]` in `tracks.js`. Write original melodies, never existing game music.
- **To turn music off on a page:** put `data-music="off"` on its `<html>`.

## Run it locally

```bash
# just the arcade
cd static && python3 -m http.server 8750        # http://localhost:8750/fun/

# the whole site (header link included)
hugo server --disableKinds RSS                   # http://localhost:1313/
```

`--disableKinds RSS` is needed locally because the theme's RSS template uses `.Site.Author`, which newer Hugo (0.164 here) removed. The deploy workflow pins Hugo 0.121.2, so production is unaffected.

Browsers cache these scripts hard. After editing, force-refresh: a hard reload, or `fetch(url, { cache: "reload" })` for each file, then reload.

## Tests

```bash
node --test tests/free-play/
```

These cover Higher or Lower (formatting, pairing rules, data sanity, prompts), Quick Draw (signal timing, computer levels, fouls including taps that land just before the signal, match lengths) and Air Puck (physics, rounded corners, the computer's defending/attacking/corner-clearing, and a 90-second computer-vs-computer run that must keep scoring without stalling).

## Deploy

Pushing to `main` deploys via `.github/workflows` (Hugo 0.121.2 → GitHub Pages). GitHub Pages caches files for about 10 minutes.

## Decisions so far

- **Name:** FREE PLAY. TILT! is a future game.
- **Audience:** all ages, not just young kids.
- **Hub:** a grid of game cards. Rejected along the way: pastel kid UI, a fridge with crayons, editorial/poster/dark-lab layouts, a neon arcade floor (too noisy), a CRT monitor frame, and select-then-play.
- **Branding:** neutral, with one small `jenkinsdev.us` link in the hub footer.
- **Saving:** IndexedDB via `FP.store` (moved from localStorage for longer-lived storage and room to grow).
- **Process:** one game at a time, spec → build → user review → live. GPT-6.1 has been used for design reviews and isolated changes.

Full history: `features/hub-redesign/notes/design-history.md`.
