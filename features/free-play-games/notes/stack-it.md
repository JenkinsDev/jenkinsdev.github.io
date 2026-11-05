# Stack It (game 4) — spec

Status: APPROVED. Modes: Solo + 1P vs computer + 2P. Physics: vendor Planck.js.

## Core loop
- A crane hook swings back and forth at the top of the screen holding the next object (matches the hub preview).
- Tap / click / Space drops it. It falls onto a small plinth, or onto the pile, with real physics: it can slide, tip, roll and knock things off.
- Anything that lands on the ground (off the plinth) ends the turn that caused it.
- The camera rises with the pile, so the tower can keep growing on any screen size.
- Score is the pile's height (in feet, or metres with Metric), measured once the pile settles.

## Objects
Real, recognisable things with believable shapes and weights, drawn as pixel art in the arcade look:
fridge, washing machine, piano, cat, rubber duck, watermelon, bowling ball, traffic cone, teapot, tuba,
suitcase, car tyre, cake, fish tank, armchair, toaster, pumpkin, snowman, … Round things roll, flat things are easy,
tall thin things are hard. The order is random but fair: a hard object never comes twice in a row.

## Modes (follows the arcade's rule: 1P vs computer + 2P)
- **2P:** take turns dropping on the same tower. Whoever knocks something off loses the round. Best of 3 / 5 / 7.
- **1P vs computer:** same, against the computer (Easy / Medium / Hard / Impossible: how well it times the drop).
- **Solo:** no opponent, just build as high as you can. Best height saved per device.

## Controls
- Touch / mouse: tap anywhere. Keyboard: Space or Enter (1P), A and L (2P, matching Quick Draw).
- Setup screen uses the shared Controls cards.

## Kid + adult appeal
Kids: silly objects, wobbles, crashes. Adults: timing the swing, planning where a round object can sit, and the 2P mind-game of leaving the other player a bad spot.

## Scope cuts
No wind, no special power-ups, no rotating the object before dropping (maybe later).

## Open technical decision
Stacking needs solid rigid-body physics (rotation, friction, resting contact without jitter). Either vendor a small
proven engine (Planck.js, a Box2D port, MIT) into `static/fun/vendor/`, or write our own in `stack-it/physics.js`.
