// here lies a mess of code :-)

const canvasEle = document.getElementById('game-canvas');
const cellSize = 20;
const animationSpeed = 200;

let cells = [];

document.head.innerHTML += `
<style>
input[type=checkbox] {
  width: ${cellSize}px;
  height: ${cellSize}px;
  margin: 0;
  padding: 0;
  border: 1px solid black;
  background-color: white;
}
</style>
`;

function regenerateCells() {
  const numCols = Math.floor(window.innerWidth / cellSize);
  const numRows = Math.floor(window.innerHeight / cellSize);

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
    canvasEle.appendChild(newRow);
    newRow.querySelectorAll('input[type=checkbox]').forEach((ele, j) => {
      ele.dataset.row = i;
      ele.dataset.col = j;
    });
  }
}


function setupCanvas() {
  canvasEle.innerHTML = '';
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
    const cellEles = canvasEle.querySelectorAll('input[type=checkbox]');
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
  console.log('stopped');
}

function startAnimation() {
  lastAnimationFrameReq = window.requestAnimationFrame(tick);
  console.log('started');
}

document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();
});

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
    stopAnimation();
    cells = [];
    canvasEle.innerHTML = '';
    setupCanvas();
    e.preventDefault();

  }
});

document.addEventListener('resize', _ => {
  stopAnimation();
  cells = [];
  canvasEle.innerHTML = '';
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
