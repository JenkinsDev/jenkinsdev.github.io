(function () {
  "use strict";
  let game, last = -1, clock = 0, mem = [{}, {}], fact = false;
  const rng = (function () { let s = 43; return () => ((s = s * 16807 % 2147483647) - 1) / 2147483646; })();
  function reset() {
    let s = 43;
    game = RL.create("moon", () => ((s = s * 16807 % 2147483647) - 1) / 2147483646);
    game.rockets[1].x = game.world.padX + 2.2;
    game.rockets[1].vx = 0.8;
    last = -1; clock = 0; mem = [{}, {}]; fact = false;
  }
  function scene(g, ms) {
    const t = (ms % 14000) / 1000;
    if (!game || t < last) reset();
    while (clock < t) {
      const dt = Math.min(RL.STEP, t - clock);
      const i0 = RL.cpuInput(game.rockets[0], game.world, "impossible", game.time, mem[0], rng);
      const i1 = RL.cpuInput(game.rockets[1], game.world, "hard", game.time, mem[1], rng);
      RL.step(game, dt, [i0, i1]);
      clock += dt;
      if (game.over) fact = true;
    }
    last = t;
    g.imageSmoothingEnabled = false;
    RLRender.paint(g, game, { w: g.canvas.width, h: g.canvas.height, follow: 0, time: clock, labels: ["P1", "P2"] });
    if (fact || game.over) {
      g.fillStyle = "rgba(12,14,22,0.82)";
      g.fillRect(18, g.canvas.height - 42, g.canvas.width - 36, 32);
      g.fillStyle = "#f4efe2";
      g.font = "11px VT323, monospace";
      g.textAlign = "center";
      g.fillText("The Moon shines by reflecting the Sun.", g.canvas.width / 2, g.canvas.height - 22);
    }
  }
  scene.reset = reset;
  window.FP_SCENES = window.FP_SCENES || {};
  window.FP_SCENE_SIZES = window.FP_SCENE_SIZES || {};
  window.FP_SCENE_STILLS = window.FP_SCENE_STILLS || {};
  window.FP_SCENES.lander = scene;
  window.FP_SCENE_SIZES.lander = [240, 180];
  window.FP_SCENE_STILLS.lander = 2200;
})();
