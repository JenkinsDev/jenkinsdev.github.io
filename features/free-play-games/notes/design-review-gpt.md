# FREE PLAY — design review

Reviewed 2026-11-05. Read `docs/free-play/README.md` first; inspected the running pages and their HTML/CSS/JS. No production files changed. The checkout is being built concurrently, so line references describe the version read during this review.

The character-select concept, strong type, dark ground and small original attract scenes work. Keep them. The biggest gains come from stable geometry, fewer competing effects and clearer controls—not a new visual direction.

## Top 5 changes, in priority order

### 1. Keep Quick Draw's targets stationary when the signal appears

**Evidence:** `quick-draw/game.css:51,89–109`. Compare [phone ready](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415zzs-b63b6caa.png) with [phone signal](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw416a85-e5f92110.png). In portrait, the middle track is `auto`; hiding/showing the signal changes its height and shrinks both pads. At 390×844, the lower pad starts around y=494 in ready and y=531 at the signal. This is especially distracting in a reaction game.

**Change:** reserve one fixed center region for ready, wait, signal and outcome. Overlay the status and signal in the same cell; keep the detail line separate. Allow longer outcome text to wrap inside that region. Replace the current portrait row rule and center/signal placement with:

```css
.center {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  align-content: stretch;
  place-items: center;
}
.status, .signal { grid-area: 1 / 1; }
.detail { grid-area: 2 / 1; }
.status { max-width: 20ch; font-size: clamp(1.25rem, 2.8vh, 2rem); }
html[data-orient="portrait"] .duel {
  grid-template-rows: minmax(0, 1fr) 160px minmax(0, 1fr);
}
html[data-orient="portrait"] .center { padding: 4px 0; }
html[data-orient="portrait"] .signal { width: 88px; }
```

Keep the current top/bottom ordering and 180° rotation for player 2. Verify ready → wait → signal → foul/win without any pad boundary moving. Give short landscape phones their own compact treatment if the content cannot fit; do not clip controls to force a viewport fit.

### 2. Make the primary action steady and simplify button feedback

**Evidence:** `hub.css:56–58` makes the whole Start button disappear every blink cycle; it is absent in the [1440 hub capture](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw4158xf-f6e9ff78.png). `shared/crt.css:93–106` adds both lift and an 18px glow on hover, then a 3px press. The movement is responsive, but the glow adds noise to already glowing pages. Native `disabled` buttons also match the current hover selector because it checks only `aria-disabled`.

**Change:** delete the three `.start` animation rules. Keep the 120ms timing and brightness response, reduce travel, remove the hover halo, and account for both disabled forms. Replace the existing hover/active/disabled rules, rather than appending competing selectors:

```css
@media (hover: hover) and (pointer: fine) {
  .fp-btn:not(:disabled):not([aria-disabled="true"]):hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
    box-shadow: 0 5px 0 rgb(0 0 0 / .5);
  }
}
.fp-btn:not(:disabled):not([aria-disabled="true"]):active {
  transform: translateY(2px);
  filter: brightness(.96);
  box-shadow: 0 2px 0 rgb(0 0 0 / .5);
  transition-duration: 40ms;
}
.fp-btn:is(:disabled, [aria-disabled="true"]) {
  background: #232036; color: var(--dim);
  box-shadow: none; cursor: default; transform: none; filter: none;
}
.fp-btn.secondary { background: transparent; color: var(--soft);
  border: 2px solid var(--line); box-shadow: none; }
@media (hover: hover) and (pointer: fine) {
  .fp-btn.secondary:not(:disabled):not([aria-disabled="true"]):hover {
    border-color: var(--soft); box-shadow: none;
  }
}
.fp-btn.secondary:active { box-shadow: none; }
```

Move `.secondary` into the shared stylesheet and remove its two game-local copies. Keep the visible cyan keyboard focus and reduced-motion rule. Apply the same hover-capability guard to Higher or Lower's card hover (`game.css:57`) and chip/icon hover rules so touch devices do not retain hover presentation.

### 3. Turn down the CRT overlay and distinguish muted text from disabled text

**Evidence:** `shared/crt.css:49–50` draws 22% black scanlines over every label, plus a 55% corner vignette. Category/Units/Players/Computer labels use `--dim`, as do useful chip subtitles. See [Higher or Lower phone setup](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415gf4-ef10b964.png): small text is noticeably harder to read than the main copy. The screen texture competes with pixel letterforms and dominates bright button fills.

**Change:** keep the effect but halve its strength. Reserve `--dim` for unavailable controls; use a brighter secondary token for information people need to read. In the shared stylesheet and both game stylesheets respectively:

```css
/* shared/crt.css */
:root { --muted: #96a5bb; }
body::after {
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / .10) 0 1px,
      transparent 1px 3px),
    radial-gradient(ellipse at 50% 50%, transparent 65%,
      rgb(0 0 0 / .25) 100%);
}
/* both games; Higher or Lower also has .item-note */
.option-label, .chip small, .best, .item-note { color: var(--muted); }
```

Retain the pink/cyan title offset, yellow actions and green/red outcomes. Do not brighten every border or add more neon. Check text contrast on the final composited screen, including corners.

### 4. Give the phone hub fewer competing rows of information

**Evidence:** [390 hub](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw4159mw-f0cc919e.png), `hub.js:103–109`, `hub.css:69–86`. Each game repeats the five stat meters and a full-width action; Quick Draw repeats player information in badges, a long player line and the hook. Its row is about 275px tall. The fifth teaser and three unavailable entries make the phone arcade feel mostly like disabled cards.

**Change:** keep the required row-per-game structure, but show the meters only in the wide detail card. Remove phone badges (the written player count is clearer), shorten Quick Draw's player line to “1 or 2 players” and its hook to “Wait for !, then tap first.” Move the complete early-tap rule to the game's setup screen, where it already exists. Use a compact status label for unavailable games, keeping full-sized targets for playable ones.

```css
@media (max-width: 759px) {
  .row { grid-template-columns: 104px minmax(0, 1fr);
    grid-template-areas: "thumb info" "go go"; gap: 12px; }
  .row .stats, .row .row-players .tag { display: none; }
  .row .fp-btn[aria-disabled="true"] {
    min-height: 28px; padding: 0; justify-self: start;
    background: transparent; font: 1rem var(--font-screen);
    letter-spacing: 0; color: var(--muted);
  }
}
```

That last element is status text, not an actionable target: render it as a `<span>` instead of an anchor and omit its click handler (`hub.js:106–112`). Do not reduce the 52px playable button or 48px sound target. Keep the wide-screen stat bars: they support the character-select idea there. Quick Draw remaining “Coming soon” is consistent with the review gate; do not flip `live` solely for this pass.

### 5. Remove decorative emoji avatars from Quick Draw

**Evidence:** `quick-draw/game.js:91` creates “🤠” and “🤖” canvases; [duel portrait](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415zw3-233e10ae.png). Enlarged emoji faces look like generic sticker art beside the hub's original silhouettes. Pixelating them does not make their visual style original; rendering also depends on the device's emoji font. The player names already explain the roles, so these faces are decoration under the user's rule.

**Change:** remove `.pad-avatar` spans and the JS line that fills them. Keep only the score, name and useful input hint inside each pad:

```html
<button class="pad" id="pad-0" type="button" data-player="0">
  <span class="pad-score" id="score-0">0</span>
  <span class="pad-name" id="name-0"></span>
  <span class="pad-hint" id="hint-0"></span>
</button>
```

Apply the same structure to pad 1. If character art is retained later, draw original silhouettes in the vocabulary of `scenes.js:36–43`; do not add stock decorative icons. Higher or Lower's subject images serve identification, so they are not the same copy/design-rule violation, though original subject art would eventually improve consistency.

## Per-page pass

### Hub

- **Hierarchy/type/color:** the title and colorful attract loops provide a strong entry point. The selected tile currently stacks yellow border, pink outer ring and yellow halo (`hub.css:40`); simplify to the yellow border plus a 1px yellow outer ring, with no halo. The large card's accent border identifies the selection sufficiently; reduce it from 3px to 2px and remove its glow (`:46–49`). These are content panels, not CRT bezels; keep the page frameless.
- **Spacing/layout:** 1440×900 fits the full roster and detail card. At 1024×768 the action ends around y=763 and the footer is below the fold: workable scrolling, but tighter than necessary. In a wide-layout, short-height media query, cap `.preview` at 240px tall with `object-fit: contain` and reduce `main` top padding to 20px. At 820×1180 the two-column composition fits comfortably; do not upscale everything merely to fill the blank lower area. At 390×844, use priority 4 to reduce repeated information; keep 14–16px between rows.
- **States/motion:** selected, focused and unavailable are distinct, but unavailable roster entries look as playable as live ones until selected. Add plain “Coming soon” text to those tile captions in `buildRoster`, leaving tile selection available for preview. No padlock glyph is needed. `hub.js:118–128` runs canvas loops even with reduced motion; CSS cannot stop them. Freeze each scene at one representative time when `FP.reducedMotion` is true, and use deterministic still noise for the teaser. Keep normal attract loops otherwise.

### Higher or Lower

- **Hierarchy/type/color:** the question → two subjects → revealed values → fact sequence reads clearly. The 390px stacked cards are particularly effective. Green/red title arrows communicate higher/lower rather than acting as unrelated decoration. Preserve them. Shorten the lede to “Pick the heavier, faster, taller, older or longer-lived thing.” The current “Two real things” sentence adds little to the instruction.
- **Spacing/layout:** title and play screens fit at all four sizes. At 1440×900 and 1024×768, side-by-side cards give subjects useful presence. At 820×1180 the cards become very tall because of the `1fr` arena track; cap the arena at roughly 620px and align it to the top of its track if a more compact composition is wanted. Do not remove the reserved result area (`game.css:114–116`): it prevents cards jumping when feedback appears. At 390×844 the observed two-line result and Next button fit; longest notes/facts still need wrap checks.
- **Setup rhythm:** category chips wrap acceptably on the phone, but the US and Metric buttons become two unequal centered rows. Use a two-column grid on `#units`, `minmax(0,1fr)` columns, and allow the explanatory units to wrap. Remove “°F”/“°C” from the labels (`index.html:41–42`); there is no temperature category. Keep at least 44px height.
- **States/motion:** count-up plus explicit “Right!”/“Not this time” makes the answer understandable beyond color. Keep disabled cards visually readable after choosing. Guard hover for touch, and keep shake brief. The game-over structure has a clear score and replay action; its paired mini cards should retain equal widths and wrap long names/values. Game-over assessment is from source, not a rendered capture.

### Quick Draw

- **Hierarchy/type/color:** orange identifies the game cleanly; the setup instruction is useful and plain. The large inline title can remain, but use the same maximum title scale as Higher or Lower (4.4rem rather than 5.2rem). Define `--orange: #ff7a1a` in shared tokens and use it instead of repeating literals. Scores in yellow and named pads already establish roles; no additional decoration is needed.
- **Spacing/layout:** setup fits at 1440×900, 1024×768 and 820×1180. The centered portrait setup has generous empty space but does not require filling. At 390×844, Easy/Medium are on one row and Hard sits alone because each chip has a 140px minimum. Make `#levels` a three-column grid with `repeat(3,minmax(0,1fr))`, `gap:8px`, and `#levels .chip { min-width:0; padding-inline:8px; }`. Keep all three 52px tall. This is the most useful setup polish after the top five.
- **Duel:** left/right targets fit both landscape sizes; top/bottom targets and rotation fit both portrait sizes. Fix priority 1 before any decoration. At 1024×768 the center column is broad enough for outcomes; keep it bounded so a longer message cannot steal pad width. `minmax(0,1fr)` for the pad columns avoids text-driven widening.
- **States/motion:** preserve the sharp signal onset, brief press and named winner. Reduce the signal's 40px/80% red halo to `0 0 18px rgb(255 61 61 / .35)` so its edge stays crisp. The signal is essential game information and should remain immediate under reduced motion; the pop/scale can disappear. Match-over copy and actions are structurally clear in source; “CHANGE PLAYERS” is incomplete for solo difficulty changes—use “SETUP”. Round results advance after 1.8 seconds; hold enough space for the complete text and ensure it is readable before the next round. No additional scoreboard or mode is needed.

## Consistency and copy

- Use one shared chip base: 48px minimum height, 8px group gap, 4px radius, VT323 at 1.2rem; keep game accent colors for selected borders. Let two-line mode chips grow. Currently Higher or Lower uses 44px/8px/1.15rem and Quick Draw 52px/10px/1.25rem. Add a subtle accent-tinted selected fill so selection survives the CRT texture without a glow. Keep cyan focus distinct from selection.
- Use 8px inside groups, 20–24px between setup groups, and 12–16px between play regions. Share secondary-button styling and button behavior (priority 2), not identical game layouts.
- Keep Bungee Inline for large logos, Bungee for questions/game names, VT323 for descriptions, and Silkscreen for small group labels. The current four fonts have jobs; adding another will weaken the system.
- **Quoted filler/template candidates:** “▶ PRESS START”, “▶ PLAY”, “NEXT ▶”, “SEE SCORE ▶”, “▶ PLAY AGAIN”, “▶ REMATCH”. The verbs already explain the action; remove the triangles and use “PLAY”, “NEXT”, “SEE SCORE”, “PLAY AGAIN”, “REMATCH”. “PRESS START” is a genre convention, but “PLAY” is clearer on a touch-first page. Keep actual navigation arrows and the reaction “!” because they communicate actions or game state.
- “1P 1 player” and “1P 2P 1 player vs the computer, or 2 players” are duplication, not useful retro flavor. Remove phone badges as above. The existing wide badges do communicate player count at a glance.
- “BRAINS / SPEED / SKILL / LUCK / SILLY” are subjective, but they belong to the established character-select design; keep them in the wide detail card rather than treating them as a new feature. No fake credits, model numbers, three-part slogans or “new challenger” copy were found. The pixel cowboy/robot faces are the clearest decorative-emoji issue.

## Inspection record

All three pages were visually inspected at CSS viewports **1440×900, 1024×768, 820×1180 and 390×844**, using the shared preview browser. Browser `innerWidth` and layout attributes confirmed an actual 390px phone viewport; screenshot files may be scaled by device pixel ratio or the capture tool. Higher or Lower title/play/reveal and Quick Draw title/2-player duel/signal were rendered; game-over and some result variants were assessed from source. Hover/active/focus/disabled and reduced-motion findings are based on CSS/JS, not a claim of physical iPad testing.

Representative additional captures: [hub 1024](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw41596b-aa7ba382.png), [hub iPad portrait](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw4159h4-f59f28b7.png), [Higher or Lower desktop play](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415phc-ff6a3e4e.png), [Higher or Lower portrait play](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415pyf-782cfcc9.png), [Higher or Lower phone result](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw416f6m-0a9ffbda.png), [Quick Draw phone setup](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415r8q-47a095d0.png), [Quick Draw landscape duel](/Users/jenkinsdev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mw415zqf-16f9492f.png).
