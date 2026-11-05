# Spec: Higher or Lower (1P)

**Status:** BUILT (v2), waiting for the user's review. Changes from the approved spec are listed at the bottom.

## The game
Each round shows two real things from one category, such as weight. The left one shows its number. The right one is hidden. The player guesses whether the right one is higher or lower. A correct guess adds 1 to the streak and starts a new round. A wrong guess ends the game.

Every round is a fresh pair. The right card does not carry over to the next round (another well-known game works that way, so we avoid it). This also lets the category change between rounds.

## Controls
- Two buttons: HIGHER and LOWER. On a keyboard, ↑ and ↓ also work.
- After the reveal, tap anywhere or wait 2.5 seconds to go to the next round.

## Reveal
The hidden number counts up from 0 over about a second, then shows:
- a ratio, e.g. "about 12 times heavier"
- one short fact about the hidden item

A wrong answer shows the same information, then the game-over screen.

## Categories
Weight, height/length, speed, age, count, temperature, loudness and lifespan. About 150 items in total. An item can have values in several categories.

- **Real values only.** Each data file lists its sources at the top. Numbers are rounded and labelled "about" where the real value is a range.
- **No near-ties:** two values must differ by at least 10% to be paired.
- **Category choice:** the title screen offers "All" (mixed) or a single category.

## Difficulty
Pairs are picked by how far apart their values are:

| Streak | Ratio between the two values |
|---|---|
| 0–4 | 5× or more |
| 5–9 | 2–5× |
| 10–19 | 1.3–2× |
| 20+ | 1.1–1.5× |

Young kids get easy rounds early. Adults get hard ones once the streak is long.

## Saving
The best streak, overall and per category, is kept in `localStorage` (`fun:higher-or-lower:best`).

## Art
Each item is drawn from its emoji into a 16×16 canvas and scaled up with crisp pixels, so it matches the hub's pixel look without image files. Any emoji that looks bad on iPad gets a hand-made sprite instead.

## Units
US units by default (lb, ft, mph, °F). There's a metric toggle on the title screen, saved per device.

## Screens
1. **Title:** start, category choice, best streak, units toggle, back to the hub.
2. **Round:** the category, the two items, HIGHER and LOWER, the current streak.
3. **Game over:**
   - the streak and the best streak
   - the pair you missed, with both numbers
   - play again, back to the hub

## Sound
Through `FunSound`: a tick during the count-up, one tone for right and one for wrong. Reduced motion skips the count-up and any shake.

## Files
```
static/fun/higher-or-lower/
  index.html
  game.css
  game.js      screens and flow
  pick.js      pair selection by difficulty
  data/*.js    items, one file per category group, sources at the top
```
Each file stays under 300 lines.

## Not in v1
- A 2-player mode.
- Timers.
- Online scores.

## Look
Use the CRT **effect** (scanlines, glow, pixel text) over a full-screen layout. **No** monitor frame or bezel. The user likes the effect but not the CRT-monitor layout.

## Changes after the first build (2026-11-05)
- **Pairing rules.** The user found random pairs nonsensical ("astronaut vs Earth"). Random pairing stays for variety, but every question must make sense at a glance and never be a trick:
  - Pairs must be between 1.25× and 20× apart. The difficulty levels are 4–20×, 2–4×, 1.5–2× and 1.25–1.5×.
  - Sizes only pair tall with tall, or long with long.
  - Items with no sensible partner are removed. A test enforces this.
- **"How many" dropped.** Its items can't be compared sensibly at random. 8 categories became 7, and there are 130 items.
- **"How long ago" asks "before or after".** Dated events (the first iPhone, 2007) are exact, so they don't say "about".
- **No auto-advance.** The player taps NEXT, so there's time to read the fact.
- **Art** is drawn at 24×24 instead of 16×16, so items are recognisable.
- **Temperature dropped.** Everyone already knows the order of temperatures (freezer < boiling water < lava < the Sun), so every question was obvious. The user got a streak of 11 without thinking. 6 categories and 118 items remain.
- **Loudness dropped** for the same reason. 5 categories remain: Weight, Height or length, Speed, How long ago and Lifespan.
- **Harder.** Pairs are capped at 10× apart. The difficulty levels are 3–10× (streak 0–2), 1.8–3× (3–7), 1.4–1.8× (8–14) and 1.25–1.4× (15+).
- **New round format (the user's idea).** Neither number is shown up front. Each round asks one question ("Which is heavier?" / "Which came first?" / "Which lives longer?"), the player taps a card, then both numbers count up together and the winner is highlighted. ←/↑ picks the first card and →/↓ the second. The ▲/▼ buttons are gone.
- **Desktop and tablet** fill the viewport height. Cards and art scale with the screen, and the result area keeps its space reserved so nothing shifts.
