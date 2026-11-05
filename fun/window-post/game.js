(function () {
  'use strict';
  const $ = id => document.getElementById(id), store = FP.store('window-post');
  const state = { mode: '1p', level: 'medium', game: null, phase: 'idle', time: 0, wait: 0, start: 0, shot: null, aim: { angle: 50, power: 60 } };
  const names = () => state.mode === '1p' ? ['You', 'Computer'] : ['Player 1', 'Player 2'];
  const human = () => state.mode === '2p' || state.game.turn === 0;
  FP.shell({ title: 'Window Post' });
  function setup() {
    state.phase = 'idle';
    $('modes').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === state.mode));
    $('levels').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.level === state.level));
    $('level-option').hidden = state.mode !== '1p';
    $('mode-rule').textContent = state.mode === '1p' ? 'Take turns with the computer.' : 'Take turns with a friend on this screen.';
    const how = 'Set angle and power. Tap THROW.';
    FP.controlCards($('control-cards'), state.mode === '1p' ? [{ who: 'You', how, keys: [['Left', 'Right', 'Up', 'Down', 'Enter']] }] : [
      { who: 'Player 1', how, keys: [['A', 'D', 'W', 'S', 'Space']] }, { who: 'Player 2', how, keys: [['Left', 'Right', 'Up', 'Down', 'Enter']] }]);
    FP.screens.go('title');
  }
  ['easy', 'medium', 'hard', 'impossible'].forEach(level => {
    const b = document.createElement('button'); b.className = 'chip'; b.dataset.level = level;
    b.textContent = level[0].toUpperCase() + level.slice(1); $('levels').append(b);
  });
  for (const [id, key] of [['modes', 'mode'], ['levels', 'level']]) $(id).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state[key] = b.dataset[key]; store.set(key, state[key]); FP.sfx.move(); setup();
  });
  function controls() {
    for (const key of ['angle', 'power']) { $(key).value = state.aim[key]; $(key + '-value').textContent = state.aim[key] + (key === 'angle' ? '°' : ''); }
    const g = state.game, active = state.phase === 'aim' && human();
    $('aim-panel').disabled = !active;
    $('throw').textContent = state.phase === 'flight' ? 'IN FLIGHT' : active ? 'THROW' : 'WAIT';
    $('aim-owner').textContent = names()[g.turn] + (g.turn === 0 && state.mode === '1p' ? 'r parcel' : "'s parcel");
  }
  function status(message) {
    const g = state.game;
    document.querySelector('.wp').style.setProperty('--turn', WPRender.colors[g.turn]);
    names().forEach((n, i) => {
      $('score-' + i).innerHTML = n + '<b>' + g.scores[i] + '</b>';
      $('score-' + i).classList.toggle('active', g.turn === i);
    });
    $('banner').textContent = message || (state.mode === '1p' && g.turn === 0 ? 'Your turn' : names()[g.turn] + "'s turn");
    $('remaining').textContent = 'Throw ' + Math.min(8, g.throws + 1) + ' of 8';
    controls();
  }
  function begin() {
    state.game = WP.create(Math.random, state.start); state.start = 1 - state.start;
    state.time = 0; state.phase = 'aim'; state.wait = 0; state.shot = null; state.aim = { angle: 50, power: 60 };
    const w = state.game.wind; $('wind').textContent = w === 0 ? 'No wind' : 'Wind ' + (w > 0 ? 'right ' : 'left ') + Math.abs(w);
    FP.screens.go('play'); status(); FP.sfx.start();
  }
  function shoot() {
    if (state.phase !== 'aim') return;
    state.shot = WP.flight(state.game, state.aim); state.phase = 'flight'; state.wait = 0; controls();
    FunSound.tone(280, { duration: .09, volume: .04, slideTo: 420 });
  }
  $('throw').addEventListener('click', () => { if (human()) shoot(); });
  for (const key of ['angle', 'power']) $(key).addEventListener('input', () => { state.aim[key] = Number($(key).value); controls(); });
  function keyChange(player, key, delta) {
    if (state.phase !== 'aim' || !human() || (state.mode === '2p' && state.game.turn !== player)) return false;
    if (key === 'throw') { shoot(); return; }
    state.aim = WP.settings(state.aim.angle + (key === 'angle' ? delta : 0), state.aim.power + (key === 'power' ? delta : 0)); controls();
  }
  const keys = {};
  for (const [key, player, kind, delta] of [['a',0,'angle',2],['d',0,'angle',-2],['w',0,'power',2],['s',0,'power',-2],[' ',0,'throw',0],['ArrowLeft',1,'angle',2],['ArrowRight',1,'angle',-2],['ArrowUp',1,'power',2],['ArrowDown',1,'power',-2],['Enter',1,'throw',0]]) {
    keys[key] = () => keyChange(state.mode === '1p' ? 0 : player, kind, delta);
    if (key.length === 1) keys[key.toUpperCase()] = keys[key];
  }
  FP.input.keys(keys);
  $('play').addEventListener('click', begin); $('rematch').addEventListener('click', begin); $('setup').addEventListener('click', setup);
  const g = $('scene').getContext('2d');
  FP.loop(dt => {
    if (state.phase === 'idle' || state.phase === 'over') return;
    state.time += dt; state.wait += dt;
    if (state.phase === 'aim' && !human() && state.wait > .8) { state.aim = WP.computer(state.game, state.level); shoot(); }
    if (state.phase === 'flight' && state.wait >= (FP.reducedMotion ? .12 : state.shot.time)) {
      const hit = state.shot.hit;
      if (hit >= 0) { state.game.closedAt[hit] = state.time - (FP.reducedMotion ? .18 : 0); FP.sfx.right(); } else FP.sfx.wrong();
      WP.deliver(state.game, state.shot); state.phase = 'pause'; state.wait = 0;
      status(hit >= 0 ? '+' + state.game.windows[hit].points + (state.game.windows[hit].points === 1 ? ' point' : ' points') : 'Missed the windows');
    } else if (state.phase === 'pause' && state.wait > .7) {
      state.shot = null;
      if (state.game.over) {
        state.phase = 'over'; const [a, b] = state.game.scores;
        $('result').textContent = a === b ? 'A draw' : names()[a > b ? 0 : 1] + (a > b && state.mode === '1p' ? ' win' : ' wins');
        $('final-score').textContent = names()[0] + ': ' + a + '\n' + names()[1] + ': ' + b;
        FP.screens.go('over');
      } else { state.phase = 'aim'; state.wait = 0; status(); }
    }
  }, () => {
    if (!state.game || state.phase === 'over' || state.phase === 'idle') return;
    let parcel = null;
    if (state.shot && state.phase === 'flight' && !FP.reducedMotion) parcel = { ...WP.point(state.game, state.shot.aim, Math.min(state.wait, state.shot.time)), spin: state.wait * 10 };
    if (state.phase === 'pause' && state.shot.hit < 0) {
      const p = WP.point(state.game, state.shot.aim, state.shot.time);
      const t = FP.reducedMotion ? .7 : state.wait;
      parcel = { x: p.x - t * 12, y: Math.min(165, p.y + t * 30 - Math.sin(t * 6) * 7), spin: FP.reducedMotion ? 0 : t * 5 };
    }
    WPRender.paint(g, state.game, { time: state.time, aim: state.aim, guide: state.phase === 'aim', parcel, still: FP.reducedMotion });
  }).start();
  FP.ready.then(() => {
    const mode = store.get('mode', '1p'), level = store.get('level', 'medium');
    state.mode = ['1p', '2p'].includes(mode) ? mode : '1p';
    state.level = ['easy', 'medium', 'hard', 'impossible'].includes(level) ? level : 'medium'; setup();
  });
})();
