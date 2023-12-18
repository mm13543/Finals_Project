let rowsAndCols = 10;
let grid = [];
let currentCell;
let cellStack;
let butterfly;
let grassImage;
let flowers = []; // Define flowers as a global variable

class MazeCell {
  constructor(row, col, cellWidth, cellHeight) {
    this.row = row;
    this.col = col;
    this.width = cellWidth;
    this.height = cellHeight;
    this.x = this.row * this.width;
    this.y = this.col * this.height;
    this.visited = false;
    this.walls = [true, true, true, true];
  }

  show() {
    if (this.visited) {
      // Use grass image instead of fill color
      image(grassImage, this.x, this.y, this.width, this.height);
    } else {
      fill(255);
      noStroke();
      rect(this.x, this.y, this.width, this.height);
    }
  
    fill(0);
    noStroke();
    // Draw rectangles to represent walls
    if (this.walls[0]) {
      rect(this.x, this.y, this.width, 2); // Top wall
    }
    if (this.walls[1]) {
      rect(this.x + this.width - 2, this.y, 2, this.height); // Right wall
    }
    if (this.walls[2]) {
      rect(this.x, this.y + this.height - 2, this.width, 2); // Bottom wall
    }
    if (this.walls[3]) {
      rect(this.x, this.y, 2, this.height); // Left wall
    }
  }
}  

class InteractiveCell extends MazeCell {
  constructor(row, col, cellWidth, cellHeight, img, flower) {
    super(row, col, cellWidth, cellHeight);
    this.brightness = 0;
    this.img = img;
    this.flower = flower;
    this.isClicked = false; // Flag to indicate if the cell is clicked
  }

  display() {
    super.show(); // Display maze cell background
    if (this.isClicked) {
      image(this.flower, this.x, this.y, this.width, this.height); // Display flower image
    }
  }

  contains(x, y) {
    // Bounds checking for rectangles (in case rectangular images are used).
    // Works also for circular images.
    if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
      this.isClicked = true; // Set the flag to indicate that the cell is clicked
      return true; // Report that the cell was clicked
    }
    return false; // Report that the cell was not clicked
  }
}

function preload() {
  butterfly = createImg('./images/butterfly.gif');
  grassImage = loadImage('./images/grass.png');
  
  // Load flower images
  for (let i = 1; i < 4; ++i) {
    flowers.push(loadImage(`./images/flowers/flower-0${i}.png`));
  }
}

function setup() {
  createCanvas(800, 800);
  frameRate(15); 
  let xOffset = (width % rowsAndCols) / 2;
  let yOffset = (height % rowsAndCols) / 2;

  grid = Array.from({ length: rowsAndCols }, (_, i) =>
    Array.from({ length: rowsAndCols }, (_, j) => {
      let x = i * (width / rowsAndCols) + xOffset;
      let y = j * (height / rowsAndCols) + yOffset;
      let r = width / rowsAndCols;
      let myFlower = random(flowers);
      return new InteractiveCell(i, j, width / rowsAndCols, height / rowsAndCols, myFlower, myFlower);
    })
  );

  currentCell = grid[0][0];
  currentCell.visited = true;
  cellStack = [currentCell];

  butterfly.hide(); // Hide the image initially
}

function draw() {
  background(240);
  for (let i = 0; i < rowsAndCols; i++) {
    for (let j = 0; j < rowsAndCols; j++) {
      grid[i][j].display(); // Display the cell based on its state
    }
  }

  fill(0, 255, 0, 100);
  noStroke();
  rect(currentCell.x, currentCell.y, currentCell.width, currentCell.height);

  image(butterfly, currentCell.x, currentCell.y, currentCell.width, currentCell.height); // Draw butterfly image

  if (cellStack.length != 0) {
    let nextCell = checkNeighbours();
    if (nextCell == 'noway') {
      currentCell = cellStack.pop();
    } else {
      removeWalls(currentCell, nextCell);
      currentCell = nextCell;
      currentCell.visited = true;
      cellStack.push(currentCell);
    }
  }
  textSize(30);
  fill(0);
  textAlign(RIGHT, BOTTOM);
  text("END", width - 10, height - 10);

  // Display instructions
  textSize(22);
  fill(255);
  textAlign(LEFT, TOP);
  text("Once the maze is generated, click on the path to reach the END", 90, 10);
}

function checkNeighbours() {
  let neighbours = [];

  if (currentCell.row > 0 && !grid[currentCell.row - 1][currentCell.col].visited) {
    neighbours.push(grid[currentCell.row - 1][currentCell.col]);
  }
  if (currentCell.row < rowsAndCols - 1 && !grid[currentCell.row + 1][currentCell.col].visited) {
    neighbours.push(grid[currentCell.row + 1][currentCell.col]);
  }
  if (currentCell.col > 0 && !grid[currentCell.row][currentCell.col - 1].visited) {
    neighbours.push(grid[currentCell.row][currentCell.col - 1]);
  }
  if (currentCell.col < rowsAndCols - 1 && !grid[currentCell.row][currentCell.col + 1].visited) {
    neighbours.push(grid[currentCell.row][currentCell.col + 1]);
  }

  if (neighbours.length == 0) {
    return 'noway';
  } else {
    return random(neighbours);
  }
}

function removeWalls(cell1, cell2) {
  let x = cell1.row - cell2.row;
  let y = cell1.col - cell2.col;

  if (x == 1) {
    cell2.walls[1] = false;
    cell1.walls[3] = false;
  }
  if (x == -1) {
    cell1.walls[1] = false;
    cell2.walls[3] = false;
  }
  if (y == 1) {
    cell1.walls[0] = false;
    cell2.walls[2] = false;
  }
  if (y == -1) {
    cell1.walls[2] = false;
    cell2.walls[0] = false;
  }
}

function mousePressed() {
  for (let i = 0; i < rowsAndCols; i++) {
    for (let j = 0; j < rowsAndCols; j++) {
      if (grid[i][j].contains(mouseX, mouseY)) {
        grid[i][j].display(); // Redraw the cell to update the display
      }
    }
  }
}