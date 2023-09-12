// GOL Canvas Render Worker

var canvas:any, canvasCtx:any, canvasWidth:any, canvasHeight:any, cellSize:any;
var row:number, col:number, golGrid:any;
var generation = -1;
var activeCell = 0;

self.onmessage = (e: any) => {

  const action = e.data.action;
  const data = e.data.data;

  switch(action) {
    case 'initilize_canvas':
      canvas = e.data.canvas;
      canvasCtx = canvas.getContext('2d');
    break;

    case 'initilize':
      if(canvas && canvasCtx && (canvasWidth != data.canvasWidth || canvasHeight != data.canvasHeight)) {
        generation = -1;
        canvasWidth = data.canvasWidth;
        canvasHeight = data.canvasHeight;
        cellSize = data.cellSize;
        row = Math.floor(canvasWidth/cellSize);
        col = Math.floor(canvasHeight/cellSize);
        initializeCanvas();
        renderNewRandomGolGrid();
      }
    break;

    case 'gen_random':
      if(canvas && canvasCtx) {
        generation = -1;
        generateRandomGolGrid();
        paintCanvasGolGrid();
      }
    break;

    case 'clear_grid':
      generation = -1;
      generateClearGolGrid();
      paintCanvasGolGrid();
    break;

    case 'canvas_click':
        generation = -1;
        const x = Math.floor((data.pageX - data.offsetLeft) / cellSize);
        const y = Math.floor((data.pageY - data.offsetTop) / cellSize);
        golGrid[y][x] = golGrid[y][x] === 1 ? 0 : 1;
        paintCanvasGolGrid();
    break;

    case 'next_gol_grid':
      nextGolGrid();
    break;
  }

};
  
function initializeCanvas() {
  canvas.width = canvasWidth;
  canvas.height =  canvasHeight;
  canvasCtx = canvas.getContext("2d");
  canvasCtx.fillStyle = '#444';
}

function renderNewRandomGolGrid() {
  generateRandomGolGrid();
  paintCanvasGolGrid();
}

function paintCanvasGolGrid() {
  let currActiveCell = 0;
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  golGrid.forEach((Line:any, y:any) => {
    Line.forEach((cell:any, x:any) => {
      if(cell) {
        gridFillRect(x, y);
        currActiveCell++;
      }
    })
  });

  generation++;
  postMessage({'generation': generation, 'active_cell': currActiveCell});
}

const calculateActiveNeighbors = (i:number, j:number) => {
  let neighbors = 0;
  [[0, 1],[0, -1],[1, -1],[-1, 1],[1, 1],[-1, -1],[1, 0],[-1, 0]].forEach(([x, y]) => {
    const newI = i + x;
    const newJ = j + y;
    if ( newI >= 0 && newI < col && newJ >= 0 && newJ < row) {
        neighbors += golGrid[newI][newJ];
    }
  });
  return neighbors;
}

const nextGolGrid = () => {
  let newEmptyTable:any = JSON.parse(JSON.stringify(golGrid));
  for (let i = 0; i < col; i++) {
    for (let j = 0; j < row; j++) {
      let neighbors = calculateActiveNeighbors(i, j);
      if (neighbors < 2 || neighbors > 3) {
        newEmptyTable[i][j]  = 0;
      } else if (golGrid[i][j] === 0 && neighbors === 3) {
        newEmptyTable[i][j] = 1;
      }
    }
  }

  golGrid = newEmptyTable;
  paintCanvasGolGrid();
}

function gridFillRect(x:any, y:any) {
  canvasCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function generateRandomGolGrid() {
  golGrid = Array(col).fill(Array(row).fill(0)).map((r:any) => { return r.map(() => { return (Math.floor(Math.random() * 10) / Math.floor(Math.random() * 10)) > 3 ? 1 : 0; })});
}

function generateClearGolGrid() {
  golGrid = Array(col).fill(Array(row).fill(0)).map((r:any) => { return r.map(() => { return 0; })});
}