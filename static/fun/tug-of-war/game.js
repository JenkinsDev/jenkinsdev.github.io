(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const store = FP.store('tug-of-war');
  const canvas = $('scene'), g = canvas.getContext('2d');
  const pads = [$('pad-0'), $('pad-1')];
  FP.shell({ title: 'Tug of War' });

  const state = {
    mode: '1p', level: 'medium', match: null, round: null, phase: 'idle',
    pointers: new Map(), cpu: null, dust: [], status: '', between: 0, cheer: false, dpr: 1,
    muddy: [false, false], shake: 0, sploosh: null, yank: [0, 0], lastTap: [-99, -99],
    claim: null, confetti: [], particles: [], hitstop: 0, flash: 0, hot: [0, 0],
    deepAAt: [-99, -99], secondWind: null, contactAt: false
  };
  const names = () => state.mode === '1p' ? ['You', 'Computer'] : ['Player 1', 'Player 2'];
  const portrait = () => FP.layout.current.orient === 'portrait';
  const playing = () => FP.screens.current === 'play' && state.round;

  function syncTitle() {
    $('modes').querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
    $('levels').querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === state.level)));
    $('level-option').hidden = state.mode !== '1p';
    $('mode-rule').textContent = state.mode === '1p' ? 'Mash against the computer.' : 'Two people mash at once, each on their own half.';
    const how = 'Tap your side of the rope';
    FP.controlCards($('control-cards'), state.mode === '1p'
      ? [{ who: 'You', how, keys: [['A'], ['Space'], [portrait() ? 'Down' : 'Left']] }]
      : [
          { who: 'Player 1', how, keys: [['A'], portrait() ? ['S'] : []] },
          { who: 'Player 2', how, keys: [['L'], portrait() ? ['Up'] : []] }
        ].map((c) => ({ ...c, keys: c.keys.filter((k) => k.length && k[0]) })));
  }
  Object.entries(TW.LEVELS).forEach(([key, L]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.level = key; b.textContent = L.label;
    $('levels').append(b);
  });
  $('modes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    state.mode = b.dataset.mode; store.set('mode', state.mode); FP.sfx.move(); syncTitle();
  });
  $('levels').addEventListener('click', (e) => {
    const b = e.target.closest('[data-level]'); if (!b) return;
    state.level = b.dataset.level; store.set('level', state.level); FP.sfx.move(); syncTitle();
  });

  function setup() {
    state.phase = 'idle'; state.round = null; state.match = null;
    syncTitle(); FP.screens.go('title');
  }
  function announce(msg, kind) {
    state.status = msg;
    $('banner').textContent = msg;
    $('banner').className = kind || '';
    $('live').textContent = msg;
  }
  function paintScores() {
    names().forEach((n, i) => {
      $('name-' + i).textContent = n;
      $('score-' + i).textContent = String(state.match ? state.match.scores[i] : 0);
    });
    $('timer').textContent = state.round && state.round.phase === 'pull'
      ? String(Math.ceil(state.round.remain)) : (state.round && state.round.phase === 'countdown' ? '' : '');
    const now = state.round ? state.round.time : 0;
    pads.forEach((pad, i) => {
      pad.classList.toggle('whoa', !!(state.round && now < state.round.slipUntil[i]));
      pad.classList.toggle('boost', !!(state.round && now < state.round.sneakUntil[i]));
    });
  }
  function layoutPads() {
    const two = state.mode === '2p';
    const keys = FP.layout.current.size !== 'phone';
    $('strip').classList.toggle('solo', !two);
    pads[1].hidden = !two;
    pads[1].disabled = !two;
    $('cpu-badge').hidden = true;
    $('cpu-level').textContent = two ? '' : (TW.LEVELS[state.level] || {}).label || '';
    $('key-0').textContent = keys ? 'A' : '';
    $('key-1').textContent = keys && two ? 'L' : '';
    pads[0].setAttribute('aria-label', two ? 'Player 1: pull' : 'Pull');
    pads[1].setAttribute('aria-label', two ? 'Player 2: pull' : 'Computer');
  }
  function startMatch() {
    state.match = TW.newMatch();
    state.muddy = [false, false];
    state.confetti = [];
    FP.sfx.start();
    FP.screens.go('play');
    layoutPads();
    resize();
    beginRound();
  }
  function beginRound() {
    state.round = TW.newRound();
    state.pointers.clear();
    state.cpu = TW.newCpu(state.level);
    state.dust = [];
    state.between = 0;
    state.cheer = false;
    state.sploosh = null;
    state.yank = [0, 0];
    state.claim = null;
    state.particles = [];
    state.hitstop = 0;
    state.flash = 0;
    state.hot = [0, 0];
    state.deepAAt = [-99, -99];
    state.secondWind = null;
    state.contactAt = false;
    state.phase = 'round';
    paintScores();
    announce('Round ' + (state.match.played + 1));
  }
  function spark(player) {
    const pad = pads[player];
    if (!pad || pad.hidden) return;
    pad.classList.add('pressed', 'flash');
    setTimeout(() => pad.classList.remove('flash'), 240);
  }
  function counted(player, result) {
    if (!result || !result.ok) return;
    if (!FunSound.muted) FunSound.tone(200 + Math.abs(state.round.x) * 90, { duration: 0.04, type: 'square', volume: 0.07 });
    const rope = TWRender.ropeGeom(portrait());
    const at = TWRender.flagAt(state.round.x, rope);
    if (!FP.reducedMotion) state.dust.push({ x: at.x + (player ? 8 : -8), y: at.y + 6, age: 0, born: state.round.time, p: player });
    state.lastTap[player] = state.round.time;
    state.yank[player] = 1;
    state.shake = result.claimed ? 1 : 0;
    if (!FP.reducedMotion && state.hot[player] > 1) {
      const dir = player ? 1 : -1;
      state.particles.push({ x: at.x + dir * 10, y: at.y + 10, vx: dir * 0.8, vy: -0.4, life: 18, size: 2, color: '#6a5030' });
      if (state.particles.length > 60) state.particles.shift();
    }
    if (player === 0 || state.mode === '2p') spark(player);
    if (result.claimed) {
      const who = names()[player];
      const kind = result.claimed;
      announce((kind === 'banana' ? 'BANANA! ' : '') + who + ' got ' + TW.label(kind) + '!', 'power');
      if (kind === 'banana') FunSound.boing(); else FunSound.ding();
      if (!FP.reducedMotion) {
        state.claim = { kind, x: at.x, y: at.y - 16, tx: player ? 200 : 40, ty: 130, t: 0 };
      }
    }
  }
  function sideOf(e) {
    const box = $('stage').getBoundingClientRect();
    if (portrait()) return e.clientY > box.top + box.height / 2 ? 0 : 1;
    return e.clientX < box.left + box.width / 2 ? 0 : 1;
  }
  function pull(player) {
    if (!playing() || state.phase !== 'round' || !state.round || state.round.phase !== 'pull') return { ok: false };
    if (state.mode === '1p' && player === 1) return { ok: false };
    const result = TW.tap(state.round, player, state.round.time);
    counted(player, result);
    return result;
  }
  function onDown(e, player) {
    if (!playing() || state.phase !== 'round') return;
    if (state.mode === '1p' && player === 1) return;
    if (state.round.phase !== 'pull') { e.preventDefault(); return; }
    e.preventDefault();
    const result = TW.down(state.pointers, e.pointerId, player, state.round, state.round.time);
    counted(player, result);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* capture is optional */ }
  }
  function onUp(e) {
    TW.up(state.pointers, e.pointerId);
    pads.forEach((p) => p.classList.remove('pressed'));
  }
  ['pad-0', 'pad-1', 'scene'].forEach((id) => {
    const el = $(id);
    el.addEventListener('pointerdown', (e) => onDown(e, id === 'scene' ? sideOf(e) : Number(id.slice(-1))));
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) state.pointers.clear(); });
  FP.input.keys({
    a: () => pull(0), A: () => pull(0),
    ' ': () => state.mode === '1p' ? pull(0) : false,
    ArrowLeft: () => state.mode === '1p' && !portrait() ? pull(0) : false,
    ArrowDown: () => state.mode === '1p' && portrait() ? pull(0) : false,
    s: () => state.mode === '2p' && portrait() ? pull(0) : false,
    S: () => state.mode === '2p' && portrait() ? pull(0) : false,
    l: () => state.mode === '2p' ? pull(1) : false,
    L: () => state.mode === '2p' ? pull(1) : false,
    ArrowUp: () => state.mode === '2p' && portrait() ? pull(1) : false
  });

  function burstConfetti() {
    if (FP.reducedMotion) return;
    const bits = ['#ff3d3d', '#2c7bff', '#ffd23f', '#ff8c42', '#fff6de'];
    const n = (state.match && state.match.winner !== null && state.match.winner !== 'draw') ? 36 : 18;
    for (let i = 0; i < n; i++) state.confetti.push({ x: 20 + Math.random() * 200, y: 20 + Math.random() * 40, c: bits[i % bits.length], v: 20 + Math.random() * 40 });
  }
  function endRound() {
    const winner = state.round.winner;
    state.phase = 'between';
    state.between = FP.reducedMotion ? 0.9 : 2.4;
    state.cheer = winner !== null && winner !== undefined;
    TW.addRound(state.match, winner === 0 || winner === 1 ? winner : null);
    paintScores();
    state.contactAt = false;
    if (winner === 0 || winner === 1) {
      state.muddy[1 - winner] = true;
      state.sploosh = { player: 1 - winner, age: 0, critter: state.match.played === 3 && Math.random() < 0.1 };
      state.shake = 0;
      state.hitstop = FP.reducedMotion ? 0 : 8 / 60;
      state.flash = FP.reducedMotion ? 0 : 0.3;
      if (!FunSound.muted) FunSound.tone(160, { duration: 0.06, type: 'square', volume: 0.04 });
      setTimeout(() => announce('SPLOOSH!', 'sploosh'), FP.reducedMotion ? 0 : 720);
      setTimeout(() => {
        if (winner === 0) announce(state.mode === '1p' ? 'You win the round!' : 'Player 1 wins the round!', 'win');
        else announce(state.mode === '1p' ? 'The computer wins the round!' : 'Player 2 wins the round!', state.mode === '1p' ? 'lose' : 'win');
      }, FP.reducedMotion ? 0 : 1600);
      if (computerWon(winner)) FP.sfx.wrong(); else FP.sfx.right();
      burstConfetti();
    } else {
      state.muddy = [true, true];
      state.sploosh = { player: 'both', age: 0, critter: false };
      state.hitstop = FP.reducedMotion ? 0 : 8 / 60;
      state.flash = FP.reducedMotion ? 0 : 0.3;
      announce("It's a draw!", 'draw');
    }
  }
  function computerWon(winner) { return state.mode === '1p' && winner === 1; }
  function showOver() {
    const w = state.match.winner;
    const title = $('result');
    if (w === 'draw' || w === null) { title.textContent = "It's a draw"; title.className = 'over-title draw'; $('over-note').textContent = 'A muddy tie. Rematch?'; }
    else if (w === 0 && state.mode === '1p') { title.textContent = 'You win!'; title.className = 'over-title win'; $('over-note').textContent = 'What a tug!'; }
    else if (w === 1 && state.mode === '1p') { title.textContent = 'The computer wins'; title.className = 'over-title lose'; $('over-note').textContent = 'Those robots can pull! Nice match.'; }
    else if (w === 0) { title.textContent = 'Player 1 wins!'; title.className = 'over-title win'; $('over-note').textContent = 'What a tug!'; }
    else { title.textContent = 'Player 2 wins!'; title.className = 'over-title win'; $('over-note').textContent = 'What a tug!'; }
    $('final-score').textContent = state.match.scores[0] + ' – ' + state.match.scores[1];
    state.phase = 'idle';
    FP.screens.go('over');
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(box.width * state.dpr);
    canvas.height = Math.round(box.height * state.dpr);
  }
  new ResizeObserver(resize).observe(canvas);
  FP.layout.on(() => { resize(); state.pointers.clear(); if (FP.screens.current === 'title') syncTitle(); layoutPads(); });

  function extras() {
    const now = state.round.time;
    const sw = state.secondWind && now - state.secondWind.at < 0.4 ? state.secondWind : null;
    const losses = state.match ? [state.match.scores[1], state.match.scores[0]] : [0, 0];
    return {
      dust: FP.reducedMotion ? [] : state.dust,
      cheer: state.cheer && !FP.reducedMotion,
      muddy: state.muddy,
      yank: FP.reducedMotion ? [0, 0] : [now - state.lastTap[0] < 0.12 ? 1 : 0, now - state.lastTap[1] < 0.12 ? 1 : 0],
      shake: FP.reducedMotion ? 0 : state.shake,
      sploosh: state.sploosh,
      cpu: state.mode === '1p',
      slack: now - Math.max(state.lastTap[0], state.lastTap[1]) > 0.35,
      vibrate: !FP.reducedMotion && now - Math.max(state.lastTap[0], state.lastTap[1]) < 0.1,
      claim: FP.reducedMotion ? null : state.claim,
      confetti: FP.reducedMotion ? [] : state.confetti,
      particles: FP.reducedMotion ? [] : state.particles,
      flash: FP.reducedMotion ? 0 : state.flash,
      hot: state.hot,
      taps: state.round.taps ? [state.round.taps[0].length, state.round.taps[1].length] : [0, 0],
      secondWind: FP.reducedMotion ? null : sw,
      losses,
      matchOver: !!(state.match && state.match.winner !== null),
      matchWinner: state.match ? state.match.winner : null,
      reduced: !!FP.reducedMotion,
      hitstop: state.hitstop
    };
  }

  FP.loop((dt) => {
    if (!playing()) return;
    if (state.flash) state.flash = Math.max(0, state.flash - dt * 1.6);
    if (state.shake) state.shake = Math.max(0, state.shake - dt * (state.shake > 1.5 ? 22.5 : 14));
    if (state.hitstop > 0) { state.hitstop = Math.max(0, state.hitstop - dt); return; }
    if (state.sploosh) {
      state.sploosh.age += dt;
      if (!state.contactAt && state.sploosh.age >= 42 / 60) {
        state.contactAt = true;
        if (!FP.reducedMotion) {
          state.hitstop = 5 / 60;
          state.shake = 3;
          if (!FunSound.muted) FunSound.tone(90, { duration: 0.1, type: 'square', volume: 0.06 });
        }
      }
    }
    if (!FP.reducedMotion && state.particles.length) {
      const f = dt * 60;
      state.particles.forEach((p) => { p.vy += 0.25 * f; p.x += p.vx * f; p.y += p.vy * f; p.life -= f; });
      state.particles = state.particles.filter((p) => p.life > 0).slice(-60);
    }
    if (state.claim) {
      state.claim.t += dt;
      const p = Math.min(1, state.claim.t / 0.28);
      state.claim.x += (state.claim.tx - state.claim.x) * p;
      state.claim.y += (state.claim.ty - state.claim.y) * p;
      if (p >= 1) state.claim = null;
    }
    state.confetti.forEach((c) => { c.y += c.v * dt; });
    state.confetti = state.confetti.filter((c) => c.y < 180);
    if (state.phase === 'between') {
      state.between -= dt;
      state.dust.forEach((d) => { d.age += dt; });
      if (state.between <= 0) {
        if (state.match.winner !== null) showOver();
        else beginRound();
      }
      return;
    }
    if (state.phase !== 'round' || !state.round) return;
    const had = state.round.powerup;
    const was = state.round.phase;
    TW.step(state.round, dt);
    if (state.round.phase === 'pull') {
      [0, 1].forEach((side) => {
        const adv = side === 0 ? -state.round.x : state.round.x;
        const taps = state.round.taps[side] || [];
        let n = 0;
        for (let i = 0; i < taps.length; i++) if (state.round.time - taps[i] < 0.6) n++;
        const e = Math.min(1, n / 4.8);
        if (e > 0.8) state.hot[side] += dt; else state.hot[side] = 0;
        if (adv < -0.6) state.deepAAt[side] = state.round.time;
        if (adv > -0.2 && state.deepAAt[side] > 0 && state.round.time - state.deepAAt[side] < 1.5) {
          state.secondWind = { side, at: state.round.time };
          state.deepAAt[side] = -99;
          if (!FP.reducedMotion) state.hitstop = 6 / 60;
        }
      });
    }
    if (!had && state.round.powerup) FunSound.pop();
    state.dust = state.dust.filter((d) => { d.age = state.round.time - d.born; return d.age < 0.3; });
    if (state.round.phase === 'countdown') {
      const left = TW.COUNTDOWN - state.round.time;
      announce(left > 0.53 ? '3' : left > 0.28 ? '2' : left > 0.08 ? '1' : 'PULL!', left > 0.08 ? 'count' : 'go');
    } else if (was === 'countdown' && state.round.phase === 'pull') {
      announce('Tap your side faster than the other side.');
    }
    paintScores();
    if (state.round.phase === 'pull' && state.mode === '1p') {
      const rnd = Math.random;
      if (TW.cpuShouldTap(state.round, 1, state.round.time, state.cpu, rnd, dt)) {
        const result = TW.tap(state.round, 1, state.round.time);
        TW.cpuNote(state.cpu, state.round.time, result.ok, rnd);
        counted(1, result);
      }
    }
    if (state.round.phase === 'over') endRound();
  }, () => {
    if (!playing() || !state.round) return;
    TWRender.paint(g, { portrait: portrait(), still: FP.reducedMotion, time: state.round.time }, state.round, extras());
  }).start();

  FP.input.tap($('play'), startMatch);
  FP.input.tap($('again'), startMatch);
  FP.input.tap($('change'), setup);
  FP.ready.then(() => {
    const mode = store.get('mode', '1p'), level = store.get('level', 'medium');
    state.mode = ['1p', '2p'].includes(mode) ? mode : '1p';
    state.level = TW.LEVELS[level] ? level : 'medium';
    setup();
  });
})();
