// here lies a mess of code :-)

const CANVAS_ELE = document.querySelector('#game-canvas');
const ANIMATION_SPEED_MULTIPLIER_ELE = document.querySelector('#animation-speed-multiplier');
const CELL_SIZE_ELE = document.querySelector('#cell-size');
const DEFAULT_ANIMATION_SPEED = 1000;

let animationSpeedMultiplier = 1.0;
let animationSpeed = DEFAULT_ANIMATION_SPEED / animationSpeedMultiplier;
let cellSize = 20;
let cells = [];

const style = document.createElement('style');
style.innerHTML = `
input[type=checkbox] {
  width: ${cellSize}px;
  height: ${cellSize}px;
  margin: 0;
  padding: 0;
  border: 1px solid black;
  background-color: white;
}
`;
document.head.appendChild(style);

function regenerateCells() {
  const CANVAS_ELEBoundingRect = CANVAS_ELE.getBoundingClientRect();
  const numCols = Math.floor(CANVAS_ELEBoundingRect.width / cellSize);
  const numRows = Math.floor(CANVAS_ELEBoundingRect.height / cellSize);

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.flexDirection = 'row';
  row.style.justifyContent = 'center';

  const ele = document.createElement('input');
  ele.type = 'checkbox';
  ele.autocomplete = 'off';
  ele.dataset.lpignore = "true";

  const rowCells = [];
  for (let i = 0; i < numCols; i++) {
    rowCells.push(0);
    row.appendChild(ele.cloneNode());
  }

  for (let i = 0; i < numRows; i++) {
    cells.push(rowCells.slice());

    const newRow = row.cloneNode(true);
    CANVAS_ELE.appendChild(newRow);
    newRow.querySelectorAll('input[type=checkbox]').forEach((ele, j) => {
      ele.dataset.row = i;
      ele.dataset.col = j;
    });
  }
}


function setupCanvas() {
  CANVAS_ELE.innerHTML = '';
  regenerateCells();

  document.querySelectorAll('input[type=checkbox]').forEach(ele => {
    ele.addEventListener('click', () => {
      const row = parseInt(ele.dataset.row);
      const col = parseInt(ele.dataset.col);

      cells[row][col] = ele.checked ? 1 : 0;
    });
  });
}

let previousTimestamp;
let lastAnimationFrameReq;

function tick(timestamp) {
  if (previousTimestamp === undefined || timestamp - previousTimestamp > animationSpeed) {
    const cellEles = CANVAS_ELE.querySelectorAll('input[type=checkbox]');
    const newCells = [];

    for (let i = 0; i < cellEles.length; i++) {
      const row = parseInt(cellEles[i].dataset.row);
      const col = parseInt(cellEles[i].dataset.col);

      const isCellAlive = cells[row][col] === 1
      const adjacentAliveCells = [
        cells[row - 1] && cells[row - 1][col - 1],  // top left
        cells[row - 1] && cells[row - 1][col],      // top middle
        cells[row - 1] && cells[row - 1][col + 1],  // top right
        cells[row] && cells[row][col - 1],          // middle left
        cells[row] && cells[row][col + 1],          // middle right
        cells[row + 1] && cells[row + 1][col - 1],  // bottom left
        cells[row + 1] && cells[row + 1][col],      // bottom middle
        cells[row + 1] && cells[row + 1][col + 1],  // bottom right
      ].filter(cell => cell === 1).length;

      if (newCells[row] === undefined) {
        newCells[row] = Array(cells[0].length).fill(0);
      }

      if (isCellAlive) {
        // under and over population death
        if (adjacentAliveCells < 2 || adjacentAliveCells > 3) {
          newCells[row][col] = 0;
        }

        // 2-3 adjacent cells, cell lives
      } else {
        // reproduction at 3 adjacent cells
        if (adjacentAliveCells === 3) {
          newCells[row][col] = 1;
        }
      }

      cellEles[i].checked = newCells[row][col] === 1;
    }

    previousTimestamp = timestamp;
    cells = newCells;
  }

  lastAnimationFrameReq = window.requestAnimationFrame(tick);
}

function stopAnimation() {
  if (lastAnimationFrameReq === undefined) {
    return;
  }

  window.cancelAnimationFrame(lastAnimationFrameReq);
  lastAnimationFrameReq = undefined;
  document.querySelector('#start').disabled = false;
  document.querySelector('#stop').disabled = true;
  console.log('stopped');
}

function startAnimation() {
  lastAnimationFrameReq = window.requestAnimationFrame(tick);
  document.querySelector('#start').disabled = true;
  document.querySelector('#stop').disabled = false;
  console.log('started');
}

function resetAnimation() {
  stopAnimation();
  cells = [];
  CANVAS_ELE.innerHTML = '';
  setupCanvas();
}

document.addEventListener('keydown', e => {
  if (e.key === ' ') {
    if (lastAnimationFrameReq) {
      stopAnimation();
    } else {
      startAnimation();
    }
    e.preventDefault();
  }

  if (e.key === 'r') {
    resetAnimation();
    e.preventDefault();
  }
});

document.addEventListener('resize', _ => {
  stopAnimation();
  cells = [];
  CANVAS_ELE.innerHTML = '';
  setupCanvas();
});

let isDragging, dragListener;

document.addEventListener('mousedown', _ => {
  isDragging = true;
  dragListener = window.addEventListener('mousemove', e => {
    if (isDragging) {
      const ele = document.elementFromPoint(e.clientX, e.clientY);
      if (ele && ele.type === 'checkbox') {
        ele.checked = true;
        const row = parseInt(ele.dataset.row);
        const col = parseInt(ele.dataset.col);
        cells[row][col] = 1;
      }
    }
  });
});

document.addEventListener('mouseup', _ => {
  isDragging = false;

  if (dragListener) {
    window.removeEventListener('mousemove', dragListener);
    dragListener = undefined;
  }
  window.removeEventListener('mousemove', dragListener);
});

document.addEventListener('touchstart', e => {
  e.preventDefault();

  isDragging = true;
  dragListener = window.addEventListener('touchmove', e => {
    e.preventDefault();

    if (isDragging) {
      const firstTouch = e.touches[0];
      const ele = document.elementFromPoint(firstTouch.clientX, firstTouch.clientY);
      if (ele && ele.type === 'checkbox') {
        ele.checked = true;
        const row = parseInt(ele.dataset.row);
        const col = parseInt(ele.dataset.col);
        cells[row][col] = 1;
      }
    }
  });
});

document.addEventListener('touchend', _ => {
  isDragging = false;

  if (dragListener) {
    window.removeEventListener('touchmove', dragListener);
    dragListener = undefined;
  }
  window.removeEventListener('mousemove', dragListener);
});


ANIMATION_SPEED_MULTIPLIER_ELE.addEventListener('input', e => {
  animationSpeedMultiplier = parseFloat(e.target.value);
  animationSpeed = DEFAULT_ANIMATION_SPEED / animationSpeedMultiplier;
  document.querySelector('[for="animation-speed-multiplier"]').textContent = `Animation Speed: (${animationSpeedMultiplier})`;
  console.log('animation speed multiplier', animationSpeed, animationSpeedMultiplier);
});

CELL_SIZE_ELE.addEventListener('input', e => {
  cellSize = parseInt(e.target.value);
  document.querySelector('[for="cell-size"]').textContent = `Cell Size: (${cellSize})`;
  console.log('cell size', cellSize);
  resetAnimation();
  style.innerHTML = `
input[type=checkbox] {
  width: ${cellSize}px;
  height: ${cellSize}px;
  margin: 0;
  padding: 0;
  border: 1px solid black;
  background-color: white;
}
`;
  setupCanvas();
});

document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();

  document.querySelector('#start').addEventListener('click', startAnimation);
  document.querySelector('#stop').addEventListener('click', stopAnimation);
  document.querySelector('#reset').addEventListener('click', resetAnimation);
});
