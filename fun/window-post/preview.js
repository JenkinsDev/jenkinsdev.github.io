(function () {
  'use strict';
  let game, last = -1, clock = 0, phase, aim, shot, elapsed;
  function newMatch() {
    let seed = 43;
    game = WP.create(() => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646);
    phase = 'aim'; elapsed = 0; aim = WP.computer(game, 'hard', () => .5);
  }
  function reset() { newMatch(); last = -1; clock = 0; }
  function step(dt) {
    clock += dt; elapsed += dt;
    if (phase === 'aim' && elapsed > .8) { shot = WP.flight(game, aim); phase = 'flight'; elapsed = 0; }
    if (phase === 'flight' && elapsed >= shot.time) {
      if (shot.hit >= 0) game.closedAt[shot.hit] = clock;
      WP.deliver(game, shot); phase = 'pause'; elapsed = 0;
    }
    if (phase === 'pause' && elapsed > .6) {
      if (game.over) newMatch(); else { aim = WP.computer(game, 'hard', () => .5); phase = 'aim'; elapsed = 0; }
    }
  }
  function scene(g, t) {
    const target = (t % 24000) / 1000;
    if (!game || target < last) reset();
    while (clock < target) step(Math.min(.04, target - clock));
    last = target;
    const parcel = phase === 'flight' ? { ...WP.point(game, aim, elapsed), spin: elapsed * 10 } : null;
    WPRender.paint(g, game, { time: clock, aim, guide: phase === 'aim', parcel });
  }
  scene.reset = reset;
  window.FP_SCENES['window-post'] = scene;
  window.FP_SCENE_SIZES['window-post'] = [240, 180];
  window.FP_SCENE_STILLS = window.FP_SCENE_STILLS || {};
  window.FP_SCENE_STILLS['window-post'] = 1300;
})();
