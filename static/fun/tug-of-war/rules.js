(function () {
  'use strict';
  const Math = globalThis.Math;
  const WIN = 0.92, PULL = 0.038, CAP = 8, CENTRE = 0.02;
  const ROUND = 20, COUNTDOWN = 0.8, SPARKLE = 0.16, SLIP = 0.9, SNEAK = 1.2, LIFE = 2.4;
  const KINDS = ['banana', 'sneakers', 'sparkle'];
  const LABELS = { banana: 'a banana peel', sneakers: 'super sneakers', sparkle: 'a party sparkle' };
  const LEVELS = {
    easy: { label: 'Easy', rate: 2.8, jitter: 0.5, pauseChance: 0.08, contest: 0.4, delay: [0.28, 0.45] },
    medium: { label: 'Medium', rate: 4.4, jitter: 0.4, pauseChance: 0, contest: 0.7, delay: [0.16, 0.24] },
    hard: { label: 'Hard', rate: 6.2, jitter: 0.3, pauseChance: 0, contest: 0.9, delay: [0.08, 0.14] },
    impossible: { label: 'Impossible', rate: 8, jitter: 0.05, pauseChance: 0, contest: 1, delay: [0.04, 0.08] }
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const recent = (taps, time) => taps.reduce((n, t) => n + (time - t < 1 && time - t >= 0 ? 1 : 0), 0);

  function newMatch() {
    return { scores: [0, 0], winner: null, rounds: 3, winAt: 2, played: 0 };
  }
  function addRound(match, winner) {
    if (match.winner !== null) return match;
    if (winner === 0 || winner === 1) match.scores[winner] += 1;
    match.played += 1;
    if (match.scores[0] >= match.winAt) match.winner = 0;
    else if (match.scores[1] >= match.winAt) match.winner = 1;
    else if (match.played >= match.rounds) {
      match.winner = match.scores[0] === match.scores[1] ? 'draw' : (match.scores[0] > match.scores[1] ? 0 : 1);
    }
    return match;
  }
  function newRound(random = Math.random) {
    return {
      x: 0, time: 0, t: 0, remain: ROUND, phase: 'countdown', winner: undefined,
      taps: [[], []], slipUntil: [0, 0], sneakUntil: [0, 0],
      powerup: null, spawned: false,
      spawnAt: 5 + random() * 9,
      spawnKind: KINDS[Math.floor(random() * KINDS.length)],
      practice: false
    };
  }
  function finish(state) {
    if (state.phase !== 'pull' || state.practice) return;
    if (state.x <= -WIN) { state.phase = 'over'; state.winner = 0; }
    else if (state.x >= WIN) { state.phase = 'over'; state.winner = 1; }
  }
  function claim(state, player, time) {
    const kind = state.powerup.kind;
    state.powerup.claimed = player;
    state.powerup.claimedAt = time;
    if (kind === 'banana') state.slipUntil[1 - player] = time + SLIP;
    else if (kind === 'sneakers') state.sneakUntil[player] = time + SNEAK;
    else state.x = clamp(state.x + (player === 0 ? -SPARKLE : SPARKLE), -1, 1);
    return kind;
  }
  function tap(state, player, time) {
    if (state.phase !== 'pull' || (player !== 0 && player !== 1)) return { ok: false, reason: 'phase' };
    if (time < state.slipUntil[player]) return { ok: false, reason: 'slip' };
    if (recent(state.taps[player], time) >= CAP) return { ok: false, reason: 'cap' };
    state.taps[player].push(time);
    const pull = PULL * (time < state.sneakUntil[player] ? 2 : 1);
    state.x = clamp(state.x + (player === 0 ? -pull : pull), -1, 1);
    let claimed = null;
    const pu = state.powerup;
    if (pu && pu.claimed === null && time >= pu.t0 && time < pu.until) claimed = claim(state, player, time);
    finish(state);
    return { ok: true, claimed, x: state.x, winner: state.phase === 'over' ? state.winner : undefined };
  }
  function down(map, id, player, state, time) {
    if (map.has(id)) return { ok: false, reason: 'held' };
    map.set(id, player);
    return tap(state, player, time);
  }
  function up(map, id) { map.delete(id); }
  function effectBusy(state, time) {
    return Math.max(state.slipUntil[0], state.slipUntil[1], state.sneakUntil[0], state.sneakUntil[1]) > time;
  }
  function step(state, dt) {
    if (state.phase === 'over') return state;
    state.time += dt;
    if (state.phase === 'countdown') {
      if (state.time >= COUNTDOWN) state.phase = 'pull';
      return state;
    }
    if (state.phase !== 'pull') return state;
    state.t = state.time - COUNTDOWN;
    state.remain = Math.max(0, ROUND - state.t);
    const pu = state.powerup;
    if (pu && pu.claimed === null && state.time >= pu.until) state.powerup = null;
    if (!state.powerup && !state.spawned && state.t >= state.spawnAt && state.remain > 3 && !effectBusy(state, state.time)) {
      state.spawned = true;
      state.powerup = { kind: state.spawnKind, t0: state.time, until: state.time + LIFE, claimed: null };
    }
    if (!state.practice && state.remain <= 0) {
      state.phase = 'over';
      state.winner = Math.abs(state.x) < CENTRE ? null : (state.x < 0 ? 0 : 1);
    }
    finish(state);
    return state;
  }
  function newCpu(level) {
    return { level, nextAt: 0, pauseUntil: 0, seen: null, contest: false, contestAt: Infinity, didContest: false };
  }
  function cpuShouldTap(state, player, time, mem, random = Math.random, dt = 1 / 60) {
    if (state.phase !== 'pull') return false;
    const L = LEVELS[mem.level] || LEVELS.medium;
    const pu = state.powerup && state.powerup.claimed === null && time >= state.powerup.t0 && time < state.powerup.until
      ? state.powerup : null;
    if (pu && mem.seen !== pu.t0) {
      mem.seen = pu.t0;
      mem.didContest = false;
      let contest = random() < L.contest;
      if (mem.level === 'impossible') {
        const ahead = player === 0 ? state.x < -0.7 : state.x > 0.7;
        contest = !(pu.kind === 'banana' && ahead);
      }
      mem.contest = contest;
      mem.contestAt = contest ? time + L.delay[0] + random() * (L.delay[1] - L.delay[0]) : Infinity;
    }
    if (pu && mem.contest && !mem.didContest && time >= mem.contestAt) {
      mem.didContest = true;
      return true;
    }
    if (time < mem.pauseUntil) return false;
    if (L.pauseChance && random() < L.pauseChance * dt) {
      mem.pauseUntil = time + 0.3;
      return false;
    }
    return time >= mem.nextAt;
  }
  function cpuNote(mem, time, accepted, random = Math.random) {
    if (!accepted) return;
    const L = LEVELS[mem.level] || LEVELS.medium;
    const rate = clamp(L.rate + (random() * 2 - 1) * L.jitter, 0.4, CAP);
    mem.nextAt = time + 1 / rate;
  }
  function label(kind) { return LABELS[kind] || kind; }

  window.TW = {
    WIN, PULL, CAP, CENTRE, ROUND, COUNTDOWN, SPARKLE, SLIP, SNEAK, LIFE, KINDS, LEVELS,
    newMatch, addRound, newRound, tap, step, down, up, newCpu, cpuShouldTap, cpuNote, label
  };
})();
