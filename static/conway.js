// here lies a mess of code :-)

const CANVAS_ELE = document.querySelector('#game-canvas');
const ANIMATION_SPEED_MULTIPLIER_ELE = document.querySelector('#animation-speed-multiplier');
const CELL_SIZE_ELE = document.querySelector('#cell-size');
const DEFAULT_ANIMATION_SPEED = 750;
const QUERY_PARAMS = new URLSearchParams(window.location.search);

const CELL_ACTIVE_COLOR = QUERY_PARAMS.has('color') ? QUERY_PARAMS.get('color') : '#4CAF50';
const CELL_DEATH_COLOR = '#F44336';
const MAX_AGE = 8;
const DEATH_FLASH_MS = 400;
const HUE_YOUNG = 122;
const HUE_OLD = 54;

function ageColor(age) {
  const clamped = Math.min(Math.max(age - 1, 0), MAX_AGE - 1);
  const t = MAX_AGE > 1 ? clamped / (MAX_AGE - 1) : 0;
  const hue = HUE_YOUNG + (HUE_OLD - HUE_YOUNG) * t;
  const sat = 55 + 35 * t;
  const light = 55 - 5 * t;
  return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
}

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
      transition: background-color 0.15s linear;
    }

    input[type=checkbox]:checked {
      background-color: var(--cell-color, ${CELL_ACTIVE_COLOR}) !important;
      animation: glow-${styleRenderCnt} ${1.5 / animationSpeedMultiplier}s infinite alternate, fadeIn 0.05s ease-in !important;
    }

    input[type=checkbox].dying {
      background-color: ${CELL_DEATH_COLOR} !important;
      animation: death-flash-${styleRenderCnt} ${DEATH_FLASH_MS}ms ease-out forwards !important;
    }

    @keyframes glow-${styleRenderCnt} {
      from {
        filter: brightness(0.95) saturate(1);
        box-shadow: 0 0 0 rgba(255, 255, 255, 0);
      }
      to {
        filter: brightness(1.15) saturate(1.35);
        box-shadow: 0 0 4px rgba(255, 255, 255, 0.25);
      }
    }

    @keyframes death-flash-${styleRenderCnt} {
      0% {
        background-color: ${CELL_DEATH_COLOR};
        box-shadow: 0 0 6px ${CELL_DEATH_COLOR};
        opacity: 1;
      }
      60% {
        background-color: ${CELL_DEATH_COLOR};
        box-shadow: 0 0 2px ${CELL_DEATH_COLOR};
        opacity: 0.8;
      }
      100% {
        background-color: ${CELL_DEATH_COLOR};
        box-shadow: 0 0 0 rgba(244, 67, 54, 0);
        opacity: 0;
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
      ele.classList.remove('dying');
      if (ele.checked) {
        ele.style.setProperty('--cell-color', ageColor(1));
      } else {
        ele.style.removeProperty('--cell-color');
      }
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

      const isCellAlive = cells[row][col] >= 1;
      const adjacentAliveCells = [
        col - 1 >= 0 ? upperRow[col - 1] : upperRow[upperRow.length - 1],  // top left
        upperRow[col],                                                     // top middle
        col + 1 < upperRow.length ? upperRow[col + 1] : upperRow[0],       // top right

        col - 1 >= 0 ? currentRow[col - 1] : currentRow[currentRow.length - 1], // middle left
        col + 1 < currentRow.length ? currentRow[col + 1] : currentRow[0],      // middle right

        col - 1 >= 0 ? lowerRow[col - 1] : lowerRow[lowerRow.length - 1],  // bottom left
        lowerRow[col],                                                     // bottom middle
        col + 1 < lowerRow.length ? lowerRow[col + 1] : lowerRow[0],       // bottom right
      ].filter(cell => cell >= 1).length;

      if (isCellAlive) {
        if (adjacentAliveCells < 2 || adjacentAliveCells > 3) {
          // under and over population death
          newCells[row][col] = 0;
        } else {
          // 2-3 adjacent cells, cell lives — age it up
          newCells[row][col] = cells[row][col] + 1;
        }
      } else {
        // reproduction at 3 adjacent cells
        if (adjacentAliveCells === 3) {
          newCells[row][col] = 1;
        }
      }

      const ele = cellEles[i];
      const newAge = newCells[row][col];

      if (newAge >= 1) {
        ele.classList.remove('dying');
        ele.checked = true;
        ele.style.setProperty('--cell-color', ageColor(newAge));
      } else if (isCellAlive) {
        // just died this tick — flash red, then disappear
        ele.checked = false;
        ele.style.removeProperty('--cell-color');
        ele.classList.add('dying');
        setTimeout(() => ele.classList.remove('dying'), DEATH_FLASH_MS);
      } else {
        ele.classList.remove('dying');
        ele.checked = false;
        ele.style.removeProperty('--cell-color');
      }
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
      ele.classList.remove('dying');
      ele.style.setProperty('--cell-color', ageColor(1));
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
        ele.classList.remove('dying');
        ele.style.setProperty('--cell-color', ageColor(1));
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
