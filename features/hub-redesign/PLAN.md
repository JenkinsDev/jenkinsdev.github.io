# Hub Redesign

## Goal
Redesign the landing page of the fun site (`static/fun/index.html`, served at `jenkinsdev.us/fun/`) so that it suits **all ages**, the way neal.fun does: kids, teens and parents should all want to click in, and families should enjoy it together.

This is step 1 of the fun-site project. It covers the hub only, and the user reviews the result before any other work starts.

Previous attempts were rejected because they were designed for small children:
- v1 (pastel, rounded, bouncy) read as a generic AI-made design.
- v2 (fridge door with magnets and crayon drawings) was too young and felt like a costume.

See `notes/design-history.md`.

## Direction update (2026-11-05)
- **Arcade theme.** The neon-carpet style of the arcade floor mock is liked, but the machines were too generic. Every machine should be unique and match its game. The CRT game-select idea is also liked, but it needs a better, stylized way to view the games (exploring a character-select screen).
- **Name: FREE PLAY** (decided). **TILT!** is now a candidate *game* name. The coming-soon pinball machine already flashes "TILT", so it can tease that game.
- **Branding:** jenkinsdev.us appears exactly once, as a small dim footer link. Not in the subtitle, the CRT footer or anywhere else.
- **Mock 2** (`arcade-mock-2.html`) got "pretty cute". It's the working basis.
- **Games reset.** The existing toys were cleared (archived in `archive/fun-v1/`), and the lineup must include both **1-player and 2-player** games. 2P means two people on one device, for example one at each end of an iPad.

## Approach (original; the arcade direction above supersedes the visual parts)
- **The frame stays quiet; the toys are the show.** Use a light, plain page, strong typography and a short, witty intro, with no props or fake textures.
- **Thumbnails carry the personality.** Each toy gets a bold, distinctive preview image that hints at what the toy does (e.g. a scale comparison, a cross-section of the Earth), each in its own style rather than one uniform card template.
- **One typeface family, used well.** It should be expressive enough for the title and readable for descriptions. It must not be Fredoka, Patrick Hand or a "kiddie" font.
- **Copy does the charm.** Each toy gets a one-line, curious or funny hook that works for adults and kids ("How many of you would it take to reach the Moon?").
- **Stays kid-safe and easy:**
  - large enough touch targets
  - works on iPad and phone
  - no external links in the toys
  - no tracking
- **Tech:** plain HTML, CSS and JS, no build step, deployed by the existing Hugo/GitHub Pages workflow.
  - `toys.js` remains the registry the hub renders from.
  - The hub stops depending on the kid-styled `shared/fun.css` and `shared/paper.js`. Toys keep using them until each toy is restyled in a later step.

### Rejected
- Pastel rounded cards with emoji icons. Generic and AI-looking.
- Skeuomorphic fridge, crayon and tape styling. Aimed at toddlers, and the costume upstaged the toys.
- "Tap a toy to play!"-style copy, giant chunky buttons, and bouncing letters. Too young.

## Scope
- In scope:
  - New hub layout, type, colour and copy.
  - Thumbnail art for the current toys: How Many Me's?, Dig to the Middle of the Earth, Monster Maker.
  - Keeping the favourites, "new" marker and mute features only if they still earn their place.
  - Checks at phone, tablet and desktop sizes.
- Out of scope:
  - Restyling the toys themselves (later steps).
  - Monster Maker v2.
  - Finishing Dig Down.
  - Adding a menu entry in `config.toml`. Do it once the user approves the hub.

## Open decisions (need the user)
- **Branding:** a family site ("made by David & the kids"), or neutral?
- **Site name:** "Jenkins Fun House" was a placeholder.

## Status
COMPLETE. The hub is built and approved. The only remaining item is the site-menu link (see TODO). Games continue in `features/free-play-games/`.
