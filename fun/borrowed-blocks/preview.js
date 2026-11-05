/* Borrowed Blocks: Deterministic hub match using the real rules and shared painter. */
(function () {
  "use strict";
  let frames = [];
  function reset() {
    frames = [];
    let state = BB.create(1);
    while (!state.over) {
      const move = BB.choose(state, "hard");
      frames.push({ state, move });
      state = BB.step(state, move);
    }
  }
  reset();
  function frame(g, t) {
    const tick = Math.max(0, t) % (frames.length * 1800),
      index = Math.floor(tick / 1800),
      phase = tick % 1800;
    const { state, move } = frames[index];
    let ghost = null;
    if (move && phase > 650) {
      const r = phase < 1000 ? (move.r + 3) % 4 : move.r;
      ghost = BB.preview(state, move.slot, r, move.x, move.y);
    }
    BBRender.scene(g, state, ghost, phase < 240 ? Math.round((1 - phase / 240) * 12) : 0);
    if (move && phase > 250 && phase < 1000) {
      const r = phase < 650 ? (move.r + 3) % 4 : move.r;
      BBRender.piece(g, move.id, r, g.canvas.width / 2 - 10, g.canvas.height - 36, 8, BBRender.colors[state.player]);
    }
  }
  frame.reset = reset;
  window.FP_SCENES["borrowed-blocks"] = frame;
  window.FP_SCENE_SIZES["borrowed-blocks"] = [192, 144];
  window.FP_SCENE_STILLS = window.FP_SCENE_STILLS || {};
  window.FP_SCENE_STILLS["borrowed-blocks"] = 8400;
})();
