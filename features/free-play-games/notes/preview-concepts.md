# FREE PLAY preview concepts

## Current previews

At 1440 wide the three built scenes have generous space and distinct identities. Quick Draw's actual town and Air Puck's real rink are the strongest assets. Higher or Lower has the right structure, but unlabeled emoji and a long empty gap make the comparison less specific than the game. The reveal jumps straight to the answer. Quick Draw spends much of its loop holding the fallen pose, with no visible DRAW control. Air Puck is convincing because it is a real match; keep that rather than scripting fake puck movement. Stack It's swaying pile reads as a rough illustration. The teaser's rapidly changing noise attracts more attention than it earns.

At 390 wide the compact side-by-side card layout makes the preview roughly 125px wide. Big silhouettes survive; small questions and values are harder to read. Do not add tiny HUDs, scores or tutorial paragraphs. Keep large item art, shorten item labels accurately, and make the preview available at full card width on narrow phones so the actual moment is readable. Preserve a clear PLAY link.

## 1. A complete little round

A 4.8-second story: anticipation, action, payoff, then a brief hold. No title overlays or frame.

- Higher or Lower: named items, hidden values, selected card presses, values count up, green winner.
- Quick Draw: real town; wait, signal, DRAW pad presses, shot and fall. Alternate the winner.
- Air Puck: keep the real computer match; its rallies and goal flashes supply their own timing rather than forcing a goal every five seconds.
- Stack It: retain the existing illustration, held still until there is a real game to depict. Teaser: stable dark noise.

Pros: communicates the actual game and payoff without prose. Cons: a viewer can arrive midway; a rigid loop is unsuitable for real hockey physics. Effort: medium.

## 2. Start when seen; replay on demand

Each visible preview has its own clock. Entering the viewport begins at the setup; scrolling away pauses work. A plain Replay preview button, shown for built games, restarts its demonstration. Keyboard and touch get exactly the same affordance. Hover/focus highlight the preview region but do not repeatedly interrupt it.

- Higher or Lower: begin on the question, replay starts that comparison again.
- Quick Draw: replay returns both cowboys to their feet and begins the wait again.
- Air Puck: replay serves a fresh real match.
- Stack It and the teaser have no replay button: they are unavailable, not playable demos.

Pros: phone visitors see the beginning; intentional replay works without hover. Cons: adds a control and requires per-scene reset behavior. Effort: medium.

## 3. Show the input

Make the actual control's state change visible, without a cartoon hand.

- Higher or Lower: a brief press of the chosen card before the count-up.
- Quick Draw: two real-colored DRAW pads below the town; winning pad visibly depresses after the signal.
- Air Puck: a translucent contact ring could track one mallet to demonstrate dragging.
- Stack It: defer a drop control until the game exists; teaser: no control clues.

Pros: teaches by observation, no pointer assumptions. Cons: a finger/contact ring can obscure the puck and suggest the preview itself is playable; tiny controls fail on phone thumbnails. Effort: medium. Build the card press and DRAW pads, defer the contact ring.

## 4. Your saved best

After FP.ready, read only existing records from FP.store and show them in the scene's quiet phase.

- Higher or Lower: best streak for the saved category.
- Quick Draw: fastest draw on this device, clearly separated from the demonstration's reaction time.
- Air Puck: no invented record if the game does not save one.
- Stack It and teaser: no records.

Pros: gives returning visitors a personal reason to play. Cons: small labels compete with the game; mixing a saved time with an animated fictional duel is misleading. Effort: medium. Defer until there is room for an accessible, explicit record outside the preview.

## 5. Calm gallery, active selection

Show stills by default and run a loop while a card is hovered, focused or explicitly tapped.

- Higher or Lower: finished comparison still, then a new question on activation.
- Quick Draw: signal still, then a duel on activation.
- Air Puck: paused rally, then resume real physics.
- Stack It and teaser: always still.

Pros: lowest battery cost and very quiet grid. Cons: discovery relies on activation; tapping a preview can be confused with PLAY; keyboard focus should not unexpectedly replace information. Effort: medium. Prefer automatic visible stories with explicit replay for this arcade.

## Selection

Build concepts 1 and 2, with the useful control states from 3. Give phone previews full width so the real scenes remain readable. Keep the games' painters and hockey physics. Do not add saved records or a fake hand. Keep Stack It as an unchanged static concept illustration and replace animated mystery noise with a deterministic still; no TILT! name, tags or stats.

Use one capped 30fps animation scheduler, viewport observation, local elapsed time, and no hidden-tab animation. Pause invisible scenes and restart stories on re-entry. Real hockey advances at fixed physics steps rather than varying with display refresh rate. Reduced motion draws deliberate stills, responds to preference changes immediately, and never runs loops. Replay is hidden when motion is reduced. Font readiness redraws stills. No audio or new game mechanics in previews.

## Verification — 2026-11-05

Checked the real hub at http://localhost:1313/fun/ with reloaded script/style caches. Used local headless Chromium after the shared preview browser timed out twice taking a phone snapshot.

- 1440×900, 1024×768, 820×1180 and 390×844: scenes render, no console errors, no horizontal overflow. Full-page screenshots inspected. Phone scenes now have readable names and controls; the cost is a longer page, deliberately chosen over tiny scene details.
- All three live previews change across their action phase. Touch replay and keyboard Space restart local time; keyboard focus is visible. Hover highlights the preview without interrupting the scene.
- Scrolling back into view restarts the story. Scene-call counters stay unchanged while the built previews are off screen and only the unavailable cards are visible.
- Emulated reduced motion at all four sizes: every scene's image stays identical across samples, including after scrolling; replay controls are hidden. Changing the preference restores animation.
- All three PLAY links navigate to their respective game pages. Replay controls are 44px high, PLAY links 52px, sound button 48px.
- Additional overflow checks at 280, 320, 360, 600, 759, 760, 1180 and 1920 wide passed.
- `node --test tests/free-play/`: 35/35 passed. Both edited JavaScript files pass `node --check`. Production files: scenes.js 145 lines, hub.js 137, hub.css 82; index.html unchanged.

Screenshots: `/tmp/free-play-1440.png`, `/tmp/free-play-1024.png`, `/tmp/free-play-820.png`, `/tmp/free-play-390.png`; reduced-motion equivalents: `/tmp/free-play-reduced-1440.png`, `/tmp/free-play-reduced-1024.png`, `/tmp/free-play-reduced-820.png`, `/tmp/free-play-reduced-390.png`.
