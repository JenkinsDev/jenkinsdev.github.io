// here lies a mess of code :-)

const CANVAS_ELE = document.querySelector('#game-canvas');
const ANIMATION_SPEED_MULTIPLIER_ELE = document.querySelector('#animation-speed-multiplier');
const CELL_SIZE_ELE = document.querySelector('#cell-size');
const DEFAULT_ANIMATION_SPEED = 750;
const QUERY_PARAMS = new URLSearchParams(window.location.search);

const CELL_ACTIVE_COLOR = QUERY_PARAMS.has('color') ? QUERY_PARAMS.get('color') : '#4CAF50';

let animationSpeedMultiplier = QUERY_PARAMS.has('animation-speed') ? QUERY_PARAMS.get('animation-speed') : 1.0;
let animationSpeed = DEFAULT_ANIMATION_SPEED / animationSpeedMultiplier;
let cellSize = QUERY_PARAMS.has('cell-size') ? QUERY_PARAMS.get('cell-size') : 20.0;
let cells = [];

/*********** CANVAS GENERATION **************/
const style = document.createElement('style');
document.head.appendChild(style);

let styleRenderCnt = 0;
function updateStyle() {
  styleRenderCnt += 1;
  style.innerHTML = `
    input[type=checkbox] {
      width: ${cellSize}px;
      height: ${cellSize}px;
      margin: 0;
      padding: 0;
    }

    input[type=checkbox]:checked {
      background-color: ${CELL_ACTIVE_COLOR} !important;
	  animation: glow-${styleRenderCnt} ${1.5 / animationSpeedMultiplier}s infinite, fadeIn 0.05s ease-in !important;
    }
	
	@keyframes glow-${styleRenderCnt} {
      from {
        filter: saturate(100%) hue-rotate(0deg);
      }
      to {
        filter: saturate(200%) hue-rotate(-180deg);
      }
    }
  `;
}
updateStyle();

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





/** Tick function for animation **/

let previousTimestamp;
let lastAnimationFrameReq;

function tick(timestamp) {
  if (previousTimestamp === undefined || timestamp - previousTimestamp > animationSpeed) {
    const cellEles = CANVAS_ELE.querySelectorAll('input[type=checkbox]');
    const newCells = Array(cells.length).fill(0).map(_ => Array(cells[0].length).fill(0));

    for (let i = 0; i < cellEles.length; i++) {
      const row = parseInt(cellEles[i].dataset.row);
      const col = parseInt(cellEles[i].dataset.col);

      const upperRow = row - 1 >= 0 ? cells[row - 1] : cells[cells.length - 1];
      const currentRow = cells[row];
      const lowerRow = row + 1 < cells.length ? cells[row + 1] : cells[0];

      const isCellAlive = cells[row][col] === 1;
      const adjacentAliveCells = [
        col - 1 >= 0 ? upperRow[col - 1] : upperRow[upperRow.length - 1],  // top left
        upperRow[col],                                                     // top middle
        col + 1 < upperRow.length ? upperRow[col + 1] : upperRow[0],       // top right

        col - 1 >= 0 ? currentRow[col - 1] : currentRow[currentRow.length - 1], // middle left
        col + 1 < currentRow.length ? currentRow[col + 1] : currentRow[0],      // middle right

        col - 1 >= 0 ? lowerRow[col - 1] : lowerRow[lowerRow.length - 1],  // bottom left
        lowerRow[col],                                                     // bottom middle
        col + 1 < lowerRow.length ? lowerRow[col + 1] : lowerRow[0],       // bottom right
      ].filter(cell => cell === 1).length;

      if (isCellAlive) {
        if (adjacentAliveCells < 2 || adjacentAliveCells > 3) {
          // under and over population death
          newCells[row][col] = 0;
        } else {
          // 2-3 adjacent cells, cell lives
          newCells[row][col] = 1;
        }
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




/*********** ANIMATION CONTROLS **************/

function stopAnimation() {
  if (lastAnimationFrameReq === undefined) {
    return;
  }

  window.cancelAnimationFrame(lastAnimationFrameReq);
  lastAnimationFrameReq = undefined;
  const startEle = document.querySelector('#start');
  const stopEle = document.querySelector('#stop');
  startEle.disabled = false;
  stopEle.disabled = true;
  console.log('stopped');
}

function startAnimation() {
  lastAnimationFrameReq = window.requestAnimationFrame(tick);
  const startEle = document.querySelector('#start');
  const stopEle = document.querySelector('#stop');
  startEle.disabled = true;
  stopEle.disabled = false;
  console.log('started');
}

function resetAnimation() {
  stopAnimation();
  cells = [];
  CANVAS_ELE.innerHTML = '';
  setupCanvas();
}





/*********** CANVAS CONTROLS **************/

function onMouseMove(e) {
  const eles = document.elementsFromPoint(e.clientX, e.clientY);
  for (const ele of eles) {
    if (ele && ele.type === 'checkbox') {
      ele.checked = true;
      const row = parseInt(ele.dataset.row);
      const col = parseInt(ele.dataset.col);
      cells[row][col] = 1;
    }
  }
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

if (QUERY_PARAMS.has('no-click')) {
  window.addEventListener('mousemove', onMouseMove);
} else {
  let isDragging, dragListener;
  document.addEventListener('mousedown', _ => {
    isDragging = true;
    dragListener = window.addEventListener('mousemove', e => {
      if (isDragging) {
        onMouseMove(e);
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
}

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

document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();

  document.querySelector('#start').addEventListener('click', startAnimation);
  document.querySelector('#stop').addEventListener('click', stopAnimation);
  document.querySelector('#reset').addEventListener('click', resetAnimation);

  ANIMATION_SPEED_MULTIPLIER_ELE.addEventListener('input', e => {
    animationSpeedMultiplier = parseFloat(e.target.value);
    animationSpeed = DEFAULT_ANIMATION_SPEED / animationSpeedMultiplier;
    document.querySelector('[for="animation-speed-multiplier"]').textContent = `Animation Speed: (${animationSpeedMultiplier}x)`;
  });

  let cellSizeChangeTimeout;
  CELL_SIZE_ELE.addEventListener('input', e => {
    if (cellSizeChangeTimeout) {
      clearTimeout(cellSizeChangeTimeout);
    }

    document.querySelector('[for="cell-size"]').textContent = `Cell Size: (${parseInt(e.target.value)}px)`;

    cellSizeChangeTimeout = setTimeout(_ => {
      cellSize = parseInt(e.target.value);
      resetAnimation();
      updateStyle();
      setupCanvas();
    }, 500);
  });

  let resolutionChangeTimeout;
  window.addEventListener('resize', _ => {
    if (resolutionChangeTimeout) {
      clearTimeout(resolutionChangeTimeout);
    }

    resolutionChangeTimeout = setTimeout(_ => {
      stopAnimation();
      cells = [];
      CANVAS_ELE.innerHTML = '';
      setupCanvas();
    }, 250);
  });


  if (QUERY_PARAMS.has('autoplay')) {
    startAnimation();
    document.querySelector('header').remove();
    document.querySelector('body').style.padding = 0;
  }

  if (QUERY_PARAMS.has('animation-speed')) {
    ANIMATION_SPEED_MULTIPLIER_ELE.value = QUERY_PARAMS.get('animation-speed');
    ANIMATION_SPEED_MULTIPLIER_ELE.dispatchEvent(new Event('input'));
  }

  if (QUERY_PARAMS.has('cell-size')) {
    CELL_SIZE_ELE.value = QUERY_PARAMS.get('cell-size');
    CELL_SIZE_ELE.dispatchEvent(new Event('input'));
  }
});
