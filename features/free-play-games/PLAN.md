# FREE PLAY Games

## Goal
Fill the FREE PLAY arcade (`/fun/`) with original games that kids and adults both enjoy, including both 1-player and 2-player (shared screen) games.

## Approach
- **One game at a time.** Each game goes plan → build → user review → `live: true` before the next one starts. No parallel builds.
- Every game follows the game contract in `docs/free-play/README.md`: standalone page, touch first, kid-safe, shared `FunSound`, arcade look, under 300 lines per file.
- Before building, each game gets a short spec in `notes/<slug>.md` covering the core loop, controls, win/lose, what makes it fun for both a kid and an adult, and scope cuts. The user OKs the spec.

## Lineup (placeholder; the user can swap any of these)
| # | Game | Players | Status |
|---|---|---|---|
| 1 | Higher or Lower: real-fact comparisons, streaks, rankings | 1P | spec drafted |
| 2 | Quick Draw: wait for the !, tap first | 2P | not started |
| 3 | Air Puck: air hockey, one player at each end | 2P | not started |
| 4 | Stack It: stack ridiculous real objects | Solo / 1P vs computer / 2P | live |
| 5 | TILT!: shared-marble maze | 1P vs computer / 2P | removed 2026-11-06 |
| 6 | Window Post: parcels into windows | 1P vs computer / 2P | live |
| 7 | Borrowed Blocks: shared-rack packing | 1P vs computer / 2P | removed 2026-11-06 |
| 8 | Arcade Jenga (owner's idea) | ? | idea |

The user chose Higher or Lower to go first.

## Scope
- In scope: the games, their attract loops in `scenes.js`, their registry entries.
- Out of scope: accounts, online multiplayer, leaderboards beyond per-device `localStorage` bests.

## Status
IN PROGRESS. Game 1 (Higher or Lower) spec is drafted and waiting for the user's OK.
