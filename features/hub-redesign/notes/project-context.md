# Fun-site project context (as of 2026-11-05)

## What it is
A neal.fun-style collection of original web toys at `jenkinsdev.us/fun/`. David is making it for his kids, but it's meant to be fun for all ages. Everything is uncommitted under `static/fun/`; Hugo copies `static/` to the site root verbatim.

## UPDATE 2026-11-05: games cleared
The user cleared the existing toys and archived them in `archive/fun-v1/`; they aren't published. The new lineup must include 1P and 2P games. The order below is superseded.

## Agreed order (superseded): one step at a time, the user reviews each
1. Hub redesign (this feature)
2. How Many Me's?: restyle into the new look
3. Dig to the Middle of the Earth: find where it stopped, finish it, review
4. Monster Maker v2:
   - many more parts
   - per-part colours
   - drag to place and resize parts
   - multiples of a part (e.g. 7 eyes)
   - a saved gallery

The user asked to slow down: no more parallel agents unless they ask.

## Current file state
- `shared/fun.css`, `shared/paper.js`, `shared/sound.js`: the shared kit, still styled for v2 (fridge and crayon). `sound.js` (a WebAudio helper with no audio files) can probably stay as it is.
- `toys.js`: the registry the hub renders from.
- `how-many-mes/`: built and working (21 real-world items, true-scale comparisons, height and figure profile in localStorage). Its weakest moment is the huge-item view.
- `dig-down/`: files exist, but the build agent stopped partway through. Unverified.
- `monster-maker/`: works, but it's a v1 dress-up toy with too few options.
- `.playwright-mcp/`: test screenshots, gitignored.

## Toy-design test
"Would a 9-year-old *and* their parent both play this for 10 minutes?"

Formats that work for all ages:
- real-world scale
- scroll journeys
- combine-and-discover
- fantasy spending
- rules that keep piling up
- "your life in numbers"

Formats that don't:
- fidget toys (the rejected Bubble Pop)
- plain dress-up screens
