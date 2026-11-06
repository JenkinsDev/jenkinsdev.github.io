(function () {
  'use strict';
  let round, last = -1, dust = [], cheer = false, sploosh = null, muddy;
  let seed, lastTap = [0, 0];
  function reset() {
    seed = 43;
    round = TW.newRound(() => 0.62);
    round.spawnAt = 1.2;
    round.spawnKind = 'banana';
    round.x = 0.62;
    last = -1; dust = []; cheer = false; sploosh = null; muddy = [false, false];
    lastTap = [0, 0];
  }
  function script() {
    if (round.phase === 'over' && round.winner != null) {
      cheer = true;
      muddy[1 - round.winner] = true;
      if (!sploosh) sploosh = { player: 1 - round.winner, age: 0, critter: false };
      return;
    }
    if (round.phase !== 'pull') return;
    const t = round.time;
    if (t - lastTap[1] >= 0.13) {
      const result = TW.tap(round, 1, t);
      lastTap[1] = t;
      if (result.ok) {
        const rope = TWRender.ropeGeom(false);
        const at = TWRender.flagAt(round.x, rope);
        dust.push({ x: at.x + 8, y: at.y + 6, age: 0, born: t, p: 1 });
      }
    }
    if (t < 1.35 && t - lastTap[0] >= 0.28) {
      TW.tap(round, 0, t);
      lastTap[0] = t;
    }
  }
  function scene(g, ms) {
    const t = (ms % 9000) / 1000;
    if (!round || t < last) reset();
    while (round.time < t && round.phase !== 'over') {
      const dt = Math.min(0.04, t - round.time);
      TW.step(round, dt);
      script();
    }
    last = t;
    dust = dust.filter((d) => { d.age = round.time - d.born; return d.age < 0.3; });
    if (round.phase === 'over') {
      if (!sploosh) {
        cheer = true;
        if (round.winner === 0 || round.winner === 1) muddy[1 - round.winner] = true;
        sploosh = { player: (round.winner === 0 || round.winner === 1) ? 1 - round.winner : 'both', age: 0, critter: false };
      }
      sploosh.age = Math.max(0, t - round.time);
    }
    TWRender.paint(g, { portrait: false, still: false, time: round.phase === 'over' ? t : round.time }, round, {
      dust, cheer, muddy: muddy || [false, false],
      yank: [0, t - lastTap[1] < 0.12 ? 1 : 0], shake: 0,
      sploosh, cpu: false, slack: false, vibrate: !sploosh && round.phase === 'pull',
      confetti: [], particles: [], flash: (sploosh && sploosh.age < 0.12) ? 0.3 : 0,
      hot: [0, 0], taps: round.taps ? [round.taps[0].length, round.taps[1].length] : [0, 0],
      secondWind: null, losses: sploosh ? [1, 0] : [0, 0], matchOver: false, matchWinner: null
    });
  }
  scene.reset = reset;
  window.FP_SCENES = window.FP_SCENES || {};
  window.FP_SCENE_SIZES = window.FP_SCENE_SIZES || {};
  window.FP_SCENE_STILLS = window.FP_SCENE_STILLS || {};
  window.FP_SCENES.tug = scene;
  window.FP_SCENE_SIZES.tug = [240, 180];
  window.FP_SCENE_STILLS.tug = 3100;
})();
