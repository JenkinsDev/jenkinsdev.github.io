/* Borrowed Blocks: shared pixel painter, rack sizing, board markup and placement feedback. */
(function () {
  "use strict";
  const colors = ["#ff3d3d", "#2c7bff"];
  // Thick edges remain visible on the hub preview and enlarged boards.
  function block(g, x, y, size, color) {
    const edge = Math.max(1, Math.round(size * 0.12)),
      inset = Math.max(1, Math.round(size * 0.04));
    g.fillStyle = "#070b16";
    g.fillRect(x, y, size, size);
    g.fillStyle = color;
    g.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
    g.fillStyle = "#ffffff66";
    g.fillRect(x + inset, y + inset, size - inset * 2, edge);
    g.fillRect(x + inset, y + inset, edge, size - inset * 2);
    g.fillStyle = "#00000066";
    g.fillRect(x + edge, y + size - edge - inset, size - edge - inset, edge);
    g.fillRect(x + size - edge - inset, y + edge, edge, size - edge - inset);
    g.fillStyle = "#ffffff99";
    g.fillRect(x + edge + inset, y + edge + inset, Math.max(2, size * 0.22), inset * 2);
  }
  // Shared 3×3 frames keep every rack cell the same size, including rotated pieces.
  function fittedPiece(g, id, r = 0) {
    const cells = BB.variants[id][r % 4],
      size = 28;
    const width = Math.max(...cells.map((c) => c[0])) + 1,
      height = Math.max(...cells.map((c) => c[1])) + 1;
    g.clearRect(0, 0, g.canvas.width, g.canvas.height);
    piece(g, id, r, (96 - width * size) / 2, (96 - height * size) / 2, size, "#c8b78a");
  }
  function miniature(id) {
    const c = document.createElement("canvas");
    c.width = 96;
    c.height = 96;
    fittedPiece(c.getContext("2d"), id);
    return c;
  }
  function snap(placed) {
    if (!placed || FP.reducedMotion) return;
    const cells = document.getElementById(`board-${placed.player}`).parentElement.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
      if (placed.mask & (1 << i))
        cell.animate(
          [
            { background: colors[placed.player], transform: "scale(.78)", opacity: 0.9 },
            { background: "transparent", transform: "scale(1)", opacity: 1 },
          ],
          { duration: 180, easing: "ease-out" },
        );
    });
  }
  function piece(g, id, r, x, y, size, color = "#c8b78a") {
    BB.variants[id][r % 4].forEach(([a, b]) => block(g, x + a * size, y + b * size, size, color));
  }
  function board(g, s, p, x, y, size, ghost = null) {
    g.fillStyle = "#080c19";
    g.fillRect(x - 2, y - 2, size * 4 + 4, size * 4 + 4);
    for (let i = 0; i < 16; i++) {
      const a = x + (i % 4) * size,
        b = y + Math.floor(i / 4) * size,
        bit = 1 << i;
      if (BB.blocked[p] & bit) {
        block(g, a, b, size, "#36405a");
        g.fillStyle = "#111827";
        g.fillRect(a + size * 0.24, b + size * 0.45, size * 0.52, size * 0.12);
        g.fillStyle = "#a0adc1";
        for (const [u, v] of [
          [0.22, 0.22],
          [0.72, 0.72],
        ])
          g.fillRect(a + size * u, b + size * v, size * 0.09, size * 0.09);
      } else if (s.boards[p] & bit) block(g, a, b, size, colors[p]);
      else {
        g.fillStyle = "#192139";
        g.fillRect(a + 1, b + 1, size - 2, size - 2);
        g.fillStyle = "#27334e";
        g.fillRect(a + size / 2, b + size / 2, 1, 1);
      }
      if (ghost && ghost.mask & bit) {
        g.globalAlpha = 0.55;
        block(g, a, b, size, colors[p]);
        g.globalAlpha = 1;
      }
    }
  }
  function scene(g, s, ghost = null, slide = 0) {
    const w = g.canvas.width,
      h = g.canvas.height;
    g.fillStyle = "#101629";
    g.fillRect(0, 0, w, h);
    const z = Math.floor(Math.min((w - 24) / 8, (h - 40) / 4));
    board(g, s, 0, 8, 8, z, s.player === 0 ? ghost : null);
    board(g, s, 1, w - 8 - z * 4, 8, z, s.player === 1 ? ghost : null);
    s.rack.forEach((id, i) => piece(g, id, 0, 14 + i * (w / 3) + slide, h - 27, 7));
  }
  function mount(state, who, isHuman) {
    const $ = (id) => document.getElementById(id),
      p = state.player;
    $("boards").innerHTML = [0, 1]
      .map((i) => {
        const cells = Array.from(
          { length: 16 },
          (_, j) => `<button class="cell" data-cell="${j}"
        aria-label="${who(i)}, row ${Math.floor(j / 4) + 1}, column ${(j % 4) + 1}" ${i !== p || !isHuman ? "disabled" : ""}></button>`,
        ).join("");
        return `<div class="board ${i === p ? "active" : ""}" style="--player:${colors[i]}">
        <p class="board-title"><span>${who(i)}</span><b>${state.scores[i]} / 14</b></p>
        <div class="board-wrap"><canvas id="board-${i}" width="128" height="128"
          aria-label="${who(i)}: ${state.scores[i]} squares covered"></canvas>
          <div class="cells" data-player="${i}">${cells}</div></div></div>`;
      })
      .join("");
    $("rack").replaceChildren(
      ...state.rack.map((id, i) => {
        const b = document.createElement("button");
        b.className = "piece";
        b.dataset.slot = i;
        b.setAttribute("aria-label", `${BB.names[id]}, ${BB.shapes[id].length} squares`);
        b.append(miniature(id));
        return b;
      }),
    );
    $("queue").replaceChildren(
      ...state.queue.map((id) => {
        const c = miniature(id);
        c.setAttribute("aria-label", BB.names[id]);
        c.setAttribute("role", "img");
        return c;
      }),
    );
  }
  window.BBRender = { colors, block, piece, fittedPiece, board, scene, mount, snap };
})();
