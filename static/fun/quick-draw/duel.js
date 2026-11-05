/*
 * Quick Draw: the rules, kept free of the page so they can be tested (tests/free-play/quick-draw.test.mjs).
 * Times are in milliseconds from the start of the round's "wait" phase.
 */
(function () {
  "use strict";

  /** Computer opponent. min/max = reaction time after the signal; early = chance it jumps the gun. */
  const LEVELS = {
    easy: { label: "Easy", min: 550, max: 800, early: 0.1 },
    medium: { label: "Medium", min: 360, max: 480, early: 0.04 },
    hard: { label: "Hard", min: 240, max: 300, early: 0 },
    // about as fast as the fastest human reactions ever measured: you need a near-perfect draw (or luck)
    impossible: { label: "Impossible", min: 105, max: 135, early: 0 },
  };

  /** Match lengths offered: best of 3, 5 or 7 rounds. */
  const ROUNDS = [3, 5, 7];
  const DEFAULT_ROUNDS = 5;

  /** How long players wait before the signal: 1.5–4.5 s, so nobody can count it out. */
  const signalDelay = (random = Math.random) => 1500 + random() * 3000;

  /** When the computer taps, as { early, at } (ms from the start of the wait). */
  function cpuPlan(level, random, delay) {
    const L = LEVELS[level];
    if (random() < L.early) return { early: true, at: delay * (0.35 + random() * 0.55) };
    return { early: false, at: delay + L.min + random() * (L.max - L.min) };
  }

  /** A tap at `tapAt`; signalAt is null while still waiting. A touch's timestamp is when the finger
   *  landed, which can be just before the signal even if the event is handled just after: still a foul. */
  function judge(tapAt, signalAt) {
    if (signalAt === null || tapAt < signalAt) return { early: true, ms: null };
    return { early: false, ms: Math.round(tapAt - signalAt) };
  }

  /** A best-of-`rounds` match: first to win more than half the rounds. */
  const newMatch = (rounds = DEFAULT_ROUNDS) => ({ scores: [0, 0], winner: null, rounds, winAt: Math.floor(rounds / 2) + 1 });

  function addPoint(match, player) {
    if (match.winner !== null) throw new Error("match is over");
    const scores = match.scores.slice();
    scores[player] += 1;
    return Object.assign({}, match, { scores, winner: scores[player] >= match.winAt ? player : null });
  }

  window.QD = { LEVELS, ROUNDS, DEFAULT_ROUNDS, signalDelay, cpuPlan, judge, newMatch, addPoint };
})();
