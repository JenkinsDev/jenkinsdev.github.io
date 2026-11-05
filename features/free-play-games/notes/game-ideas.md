# FREE PLAY game ideas

Design shortlist, 2026-11-05. Proposals only; no changes to the lineup are implied.

Read against the arcade README, PLAN, registry, and the Higher or Lower, Quick Draw, Air Puck and Stack It notes. Stack It's approved spec includes computer and shared-device play, even though the registry still lists 1P. These ideas avoid its dropping and balancing loop.

## Rules shared by these proposals

- Every idea has 1P against Easy / Medium / Hard / Impossible and 2P on one device. No online play, accounts or extra score modes are proposed.
- Every match has a fixed finish below two minutes, including turn animations. Ties stand; no overtime. Timed turns choose a safe default when time expires.
- Touch comes first. Buttons are at least 44px; no device-tilt permission, precision swipes or hidden choices. Turn-based games pass control on the same screen; simultaneous games give each player a separate touch area and pointer ownership. Mouse clicks use the touch controls; simultaneous 2P on a desktop uses the keyboard, or mouse for P1 and keys for P2.
- The computer obeys the same rules and sees only public information. Impossible gets better planning, never faster movement, extra resources or knowledge of future random events. It means the strongest offered opponent, not a promise that nobody can win.
- Use the FP shell, screens, loop, controls cards, input and store, shared pixel/CRT styling, and FunSound with an original chiptune. Reduced motion removes flourishes, never information needed to play. Colour is paired with player numbers or distinct shapes.
- No new library is needed. Separate rules/AI, renderer, page flow, CSS and HTML so every production file stays under 300 lines. Effort includes the four computer levels, responsive controls, original art/music, preview and verification: S is mostly discrete rules; M adds search or motion tuning; L adds substantial simulation or input risk.
- Each preview should run the eventual game's rules and painter with computer players; reduced motion gets a readable still. No invented cabinets, credits or unrelated animation.

## 1. TILT!

**Pitch:** Tilt a shared maze to roll your marble into its cup, knowing the other marble moves too.

**Core loop:** A small tray contains two marked marbles, two matching cups and fixed walls. Players alternate choosing one of four directions; both marbles roll that way until blocked. A marble in its own cup earns one point. After any delivery, both marbles return to their marked starts before the next turn. The next player can then exploit the same maze from a different position. Most points after 12 total turns wins. Each turn allows seven seconds, followed by at most one second of rolling: a match takes at most 96 seconds. The on-screen instruction is “Roll your marble into your cup.”

Use a 6×6 grid with corridors, rather than free rigid-body physics. Occupied cells block movement; marbles advance in lockstep, and a contested destination stops both. Show the selected direction before confirming it. Start with three original, symmetric wall layouts, each checked for reachable cups and useful choices for both players. Alternate the starting player on rematch.

**Controls:** In 1P touch/mouse, select a direction with four real buttons, then press ROLL; the computer takes the other turns. In 2P the same controls belong to the highlighted player, with no need to reach across the board. Keyboard 1P: arrows select, Enter rolls. Keyboard 2P: P1 WASD then Space; P2 arrows then Enter. The last valid selection rolls at timeout; without a selection, the turn passes.

**Computer:** Easy chooses a legal move that shortens its route, with occasional random moves. Medium evaluates all four resulting positions and avoids an immediate opposing delivery. Hard searches its move, the opponent's reply and its next move. Impossible searches six plies with cached board states, scoring deliveries, forced replies and recurring positions. All levels use the actual shared-marble rules.

**Why replay:** Kids get the satisfaction of making both marbles rattle through a tray and finding a route to a cup. Adults can set up a delivery, force a bad reply or decline an apparent shortcut that scores for the opponent. The shared movement is the reason to return; maze navigation alone would be too thin.

**Hub preview:** Both marbles roll left, one stops against a wall, then a downward tilt sends the other into its marked cup. Use the actual maze and score change.

**Effort: M. Risks:** Repeated positions, first-player advantage and accidentally unreachable cups. Reject weak layouts before building art; validate reachability and run computer matches for loops and scoring balance. Cap the search work per turn. If collisions make a route hard to read, simplify the walls before adding rules. This is a positional puzzle, distinct from Air Puck's striking and Stack It's balancing.

## 2. Window Post

**Pitch:** Throw paper parcels through open windows before the other player claims the best ones.

**Core loop:** Two couriers take turns throwing from the same pavement spot at a building with eight open windows. Wide, low windows are worth one point; smaller or higher ones are worth two or three, printed on their sills. A successful delivery closes that window for both players. A visible, steady crosswind is fixed for the match. Eight total throws, ten seconds to aim and at most two seconds of flight each, finish within 96 seconds. Highest score wins. A short dotted guide shows only the start of the flight, so players must judge the rest. The instruction is “Land a parcel in an open window.”

**Controls:** In 1P touch/mouse, move two large sliders for angle and power, then press THROW. In 2P players take turns with that same panel. Keyboard 1P: left/right change angle, up/down change power, Enter throws. Keyboard 2P: P1 A/D angle, W/S power, Space throws; P2 arrows and Enter. Timeout throws with the current settings. No dragging directly on a tiny parcel or timing a moving aim meter.

**Computer:** Easy chooses a wide window and uses a coarse angle/power estimate with bounded error. Medium tests a small grid of trajectories toward available windows. Hard tests a finer grid and compares expected points with the risk of missing. Impossible searches the same allowed angle/power settings accurately and considers which window its choice leaves the opponent. None changes the wind or reads the human's next throw.

**Why replay:** Kids enjoy a delivery landing cleanly and shutters closing. Adults learn to read arcs, choose a reliable single point over a risky three, and remove a window their opponent has learned to hit. Different original window arrangements and wind strengths change the useful throws.

**Hub preview:** A parcel arcs past a balcony into a numbered window; its shutters close. The next courier aims at a different opening.

**Effort: M. Risks:** Becoming a solved aiming exercise, frustrating small targets, or feeling like another timing game. Keep aiming untimed within a generous turn, use generous collision mouths, and vary the building between matches. Prototype at phone size first. Simple projectile equations and swept window intersections suffice; no physics library. Choose reachable windows under every offered wind.

## 3. Borrowed Blocks

**Pitch:** Pick a piece from a shared rack and fit it into your board before your opponent takes the piece you need.

**Core loop:** Each player has a 4×4 board with two blocked cells. A public rack holds three pieces of two to four joined squares; after a pick, the next piece from a visible short queue refills the rack. Players alternate taking one piece, rotating it and placing it on their board. Covered squares score one point each; no rows disappear. Six placements per player finish the match. A seven-second turn plus a brief placement animation keeps the match below 100 seconds. If nothing fits, pass. At timeout, commit a valid placement preview or pass. The instruction is “Fit more squares on your board.”

**Controls:** In 1P touch/mouse, tap a rack piece, tap ROTATE, then tap a board position and PLACE; a ghost shows the footprint before committing. In 2P the active player's board expands for placement while the other stays visible as a thumbnail. Keyboard 1P: left/right selects from the rack, Enter picks; arrows position, R rotates, Enter places. Keyboard 2P passes those same keys with the turn. Selection can be cancelled before placement. PASS is a real button.

**Computer:** Easy picks a fitting piece and placement at random. Medium prefers larger pieces and fewer isolated empty squares. Hard considers the opponent's available fits before choosing from the rack and searches its next placement using the public queue. Impossible uses a bounded four-ply search across both boards, including passes, to maximize the final area advantage. It cannot inspect unrevealed pieces.

**Why replay:** Kids can fit chunky shapes without needing arithmetic beyond comparing filled space. Adults plan the remaining holes and take a useful piece away from the opponent. The shared rack supplies the competition; this is a discrete packing game with no falling pieces, balancing or speed inputs.

**Hub preview:** Two boards and a three-piece rack; a piece rotates, fills an awkward gap, and disappears from the shared rack.

**Effort: S. Risks:** Seven seconds may feel rushed when choosing and placing; test that budget before committing to it. Limit the shape set and keep boards small. Search can grow quickly, so cap candidate placements and cache board masks. Board pairs should be mirrored, with the starting player alternating on rematch. Do not add clearing rows, cascading pieces or special tiles.

## 4. Light Work

**Pitch:** Turn a mirror to send your lamp through more unclaimed bulbs than the other player's lamp.

**Core loop:** A small board has fixed obstacles, six turnable mirrors and eight unlit bulbs. The two lamps start on different edges. On each turn, rotate one mirror, then press LIGHT: both lamps trace their paths. Each newly reached bulb scores one point for that lamp and stays lit; a bulb reached by both on the same pulse scores for neither. Beams stop at walls or a repeated path state. Most bulbs after ten total turns wins, or finish early when all bulbs are claimed. Eight seconds to choose plus one second to resolve gives a 90-second maximum. The instruction is “Light more bulbs with your lamp.”

**Controls:** In 1P touch/mouse, tap a mirror to rotate its preview, then press LIGHT to commit. In 2P control passes between players on the same board. Each mirror has a generous hit area; only one mirror's rotation can be pending. Keyboard 1P and 2P: arrows move the focus between mirrors, Space rotates the preview, Enter sends the light. Timeout commits the current preview, or pulses without a change if none was selected.

**Computer:** Easy aims at the nearest unlit bulb, ignoring its effect on the other lamp. Medium evaluates every single-mirror change by net bulbs gained. Hard also searches the opponent's reply. Impossible searches four plies and values access to remaining bulbs when no immediate score is possible. All use the same finite beam tracer.

**Why replay:** Kids can follow a beam bouncing around a room and see exactly what a mirror changed. Adults can build a route that looks good for the opponent until a later rotation takes the remaining bulbs. Original layouts matter more than adding rules.

**Hub preview:** One mirror turns; two numbered lamp beams travel through the board, with one lighting two bulbs and the other stopping at a wall.

**Effort: M. Risks:** Crowded phone art, runaway reflection loops and boards with no useful opening. Use a 5×5 board, wide beam strokes and a visited-state limit. Check every bulb is reachable and compare starting-player results across generated computer matches. This overlaps TILT!'s shared-board tactics; choose one first rather than building both consecutively.

## 5. Brush Off

**Pitch:** Paint more floor than your opponent, then decide whether to defend it or go back for paint.

**Core loop:** Two small floor rollers move around one tiled room for 60 seconds. A roller paints the tile it crosses, including repainting the other player's tiles. Painting a tile that is not already yours spends one unit from a 12-unit tank. Each player has a refill pad in its own corner; standing there refills the tank over two seconds. An empty roller can still move. Most painted tiles at the buzzer wins. Rollers pass through each other, so no body-blocking. The instruction is “Paint more floor before time runs out.”

**Controls:** In 1P touch, use a four-way button pad beneath the room; release to stop. In 2P touch, P1 has a pad below the room and P2 above it, facing the other edge of the device. Each pad owns its pointer. Mouse 1P: hold a direction button; mouse-plus-keyboard 2P: P1 uses the buttons, P2 arrows. Keyboard: P1 WASD, P2 arrows; 1P accepts either. Movement proceeds at a fixed tile speed, with no advantage from tapping faster.

**Computer:** Easy follows short wandering routes and refills only when empty. Medium prefers nearby unpainted tiles and plans the journey back to refill. Hard targets exposed opposing territory and avoids spending its last paint far from home. Impossible replans short routes against the human's visible position, tank and likely return path, maximizing tile advantage at the buzzer. All rollers have identical speed and capacity.

**Why replay:** Kids can chase someone else's paint and make a visible mess. Adults must judge whether a raid is worth the refill trip, and when defending a lead beats covering untouched floor. A late repainting run can change the result without any special powers.

**Hub preview:** Two rollers cross the same patch, changing its tile markings; one returns to its corner and its tank fills.

**Effort: M. Risks:** Repetitive chasing, a dominant camping route, and cramped 2P phone controls. Begin with a 7×9 room and symmetric refill distances; test whether a smaller or larger tank produces useful choices. Use inset tile patterns as well as colour. Keep the input pads outside the playing field. Unlike Air Puck, this is a coverage and resource game, with no impacts or goals.

## 6. Kite Haul

**Pitch:** Send a kite up for ribbons, then bring it home to bank them before the line breaks.

**Core loop:** Two kites fly in separate lanes under the same visible weather. Letting out line raises a kite; reeling in lowers it. Ribbons drift across both lanes, with the same scoring opportunities for each player. High ribbons are worth more, but the upper gust band steadily strains the line. Lower air relieves strain. Reaching the ground banks carried ribbons; a full strain meter breaks the line, loses only unbanked ribbons and restarts that kite at the ground after one second. After 60 seconds, banked points win; carried ribbons do not count. The instruction is “Bring ribbons home before your line breaks.”

**Controls:** In 1P touch/mouse, hold LET OUT or REEL IN; releasing holds line length while strain still changes with the weather. In 2P touch, each lane has its own pair of buttons, with pointer ownership so both work together. Keyboard 1P: W raises, S lowers. Keyboard 2P: P1 W/S, P2 up/down. Mouse-plus-keyboard 2P: P1 buttons, P2 arrows. The ground banks automatically; no extra action or tilt sensor.

**Computer:** Easy heads for the next ribbon and comes down late. Medium descends at a fixed strain threshold and banks small loads. Hard estimates the time needed to return, compares ribbon value with strain cost and leaves a safety margin. Impossible plans a short route through the currently visible ribbons and gust movement, including the final trip home before the buzzer. It cannot see unspawned ribbons or future weather.

**Why replay:** Kids get the physical rhythm of sending a kite up and bringing a haul down. Adults choose when to stop collecting, whether to wait below a gust and how much risk is worth taking while behind. The contest uses matching conditions rather than attacks or reaction speed.

**Hub preview:** One kite catches a high ribbon while its line meter rises; the other reaches the ground and banks its haul.

**Effort: M. Risks:** A fixed best altitude, unclear strain, or play feeling too passive. Make strain rise continuously in the upper band so camping cannot work, show the return distance clearly, and tune ribbon spacing around several viable trips. Draw taut lines, anchored hands and distinct ribbon shapes. Simple height, drift and strain equations suffice; no rope simulation. This is the weakest direct rivalry of the six because players compete through scores rather than changing each other's board.

## Ranked recommendation

1. **TILT!** Best fit for the empty slot and the biggest addition to the lineup: a quiet tactical duel with a physical-looking result. Four direction choices are easy to try, while moving the opposing marble gives adults something to think about. Prototype two-marble routing and check for repeated positions before approving a full spec.
2. **Window Post.** Best alternative if the next game should feel more like a sport. Aiming and judging risk are distinct from reacting to a signal, and closing a shared window makes every successful throw affect the other player's choices. The main approval test is whether aiming remains readable and satisfying on a phone.
3. **Borrowed Blocks.** Lowest build risk and a useful change of pace. Drafting from a shared rack makes a small packing puzzle competitive without adding continuous controls or a physics dependency. Test the turn budget and first-player advantage early.

**Best candidate for the TILT! slot:** the shared-marble maze in idea 1. Keep touch buttons as its primary input; physically tilting a device would give two players conflicting control and make desktop play an afterthought. Pinball would add collision tuning and another fast moving-ball game beside Air Puck. The shared maze gives the name a clear meaning and the arcade a different pace.

## Owner's idea (2026-11-05): an arcade Jenga

Some form of block-tower pulling, made to fit the arcade: players take turns removing a block from a tower and putting it on top, and whoever makes it fall loses. Not yet specced. Can reuse Stack It's Planck.js setup and its fairness lessons (weights within 3:1, simulate before tuning). Needs an original look and name, not the trademarked game's.

## Owner's decision (2026-11-05)

Build TILT!, Window Post and Borrowed Blocks (all three), each 1P vs computer (Easy–Impossible) + 2P on one device.
