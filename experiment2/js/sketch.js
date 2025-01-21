// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;
var number = 0;
// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
} 

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
let phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

function setup() {
    // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
  background(0);
  stroke(0, 255, 0);
  noFill();
  translate(width * 0.3, height * 0.5);
  drawGoldenSpiral(400);
  noLoop();
}

function drawGoldenSpiral(startSize) {
  if (number == 0){
    let size = startSize;
    let x = -165;
    let y = -size/2;
    
    for (let i = 0; i < 11; i++) {  // Changed to 6 iterations
      // Draw current square
      rect(x, y, size, size);
      
      // Draw appropriate curve based on position
      if (i === 0) {
        // First square curve
        arc(x + size, y + size, size * 2, size * 2, -PI, -PI/2);
      } else if (i === 1) {
        // Second square curve
        arc(x, y + size, size * 2, size * 2, -PI/2, 0);
      } else if (i === 2) {
        // Third square curve
        arc(x, y, size * 2, size * 2, 0, HALF_PI);
      } else if (i === 3) {
        // Fourth square curve
        arc(x + size, y, size * 2, size * 2, HALF_PI, PI);
      } else if (i === 4) {
        // Fifth square curve
        arc(x + size, y + size, size * 2, size * 2, -PI, -PI/2);
      } else if (i === 5) {
        // Sixth square curve
        arc(x, y + size, size * 2, size * 2, -PI/2, 0);
      } else if (i === 6) {
        // Seventh square curve
        arc(x, y, size * 2, size * 2, 0, HALF_PI);
      } else if (i === 7) {
        // Eighth square curve
        arc(x + size, y, size * 2, size * 2, HALF_PI, PI);
      } else if (i === 8) {
        // Ninth square curve
        arc(x + size, y + size, size * 2, size * 2, -PI, -PI/2);
      } else if (i === 9) {
        // Tenth square curve
        arc(x, y + size, size * 2, size * 2, -PI/2, 0);
      } else if (i === 10) {
        // Eleventh square curve
        arc(x, y, size * 2, size * 2, 0, HALF_PI);
      }
      
      // Calculate next position and size
      if (i === 0) {
        x += size;  // Move right for second square
      } else if (i === 1) {
        x += size - size/phi;  // Position for third square
        y += size;
      } else if (i === 2) {
        x -= size/phi;  // Move left for fourth square
        y += size/phi/2 + 11;  // Adjusted to connect curves
      } else if (i === 3) {
        x += size - 94;  // Move right for fifth square
        y += size/phi - 116.5;
      } else if (i === 4) {
        x -= size - 116.5;  // Move left for sixth square
        y += size - 58;
      } else if (i === 5) {
        x -= size/phi - 35.5;  // Move left for seventh square
        y += size/phi + 13.7;
      } else if (i === 6) {
        x += size - 36;  // Move right for eighth square
        y += size/phi - 5;
      } else if (i === 7) {
        x += size/phi - 8.4;  // Move right for ninth square
        y += size/phi - 17;
      } else if (i === 8) {
        x -= size - 17;  // Move left for tenth square
        y += size - 8;
      } else if (i === 9) {
        x -= size/phi - 5;  // Move left for eleventh square
        y += size/phi + 1.9;
      }
      
      
      size = size/phi;  // Reduce size for next square
    }
  } else if (number == 1){
    let size = startSize;
    push();
    translate(0, -height/2.7); // Move up by half the canvas height
    
    for (let i = 0; i < 8; i++) {
      // Draw rectangle
      rect(0, 0, size, size);
      
      // Draw quarter circle
      arc(0, 0, size * 2, size * 2, 0, HALF_PI);
      
      // Move to next position and scale down
      translate(size, 0);
      rotate(HALF_PI);
      size = size / phi;
    }
    
    pop();
  } else if (number == 2){
    let size = startSize;
    let x = 0;
    let y = 0;
    
    push();
    translate(50, height/18 - startSize/2);  // Moved higher up on canvas
    
    for (let i = 0; i < 8; i++) {
      // Draw rectangle
      rect(x, y, size, size);
      
      // Draw quarter circle
      if (i % 4 === 0) {
        arc(x, y, size * 2, size * 2, 0, HALF_PI);
      } else if (i % 4 === 1) {
        arc(x + size, y, size * 2, size * 2, HALF_PI, PI);
      } else if (i % 4 === 2) {
        arc(x + size, y + size, size * 2, size * 2, PI, PI + HALF_PI);
      } else {
        arc(x, y + size, size * 2, size * 2, PI + HALF_PI, TWO_PI);
      }
      
      // Move to next position
      if (i % 4 === 0) {
        x += size;
      } else if (i % 4 === 1) {
        y += size;
      } else if (i % 4 === 2) {
        x -= size;
      } else {
        y -= size;
      }
      
      size /= phi;
    }
    pop();
  } else if (number == 3){
    let size = startSize;
    push();
    translate(size/.7, height/10);  // Move right and down
    
    // Start with largest square
    rect(-size, -size, size, size);
    arc(-size, -size, size * 2, size * 2, 0, HALF_PI);
    
    // Second square
    rect(-size, 0, size/phi, size/phi);
    arc(-size + size/phi, 0, (size/phi) * 2, (size/phi) * 2, HALF_PI, PI);
    
    // Continue with smaller squares
    let nextSize = size/phi;
    for (let i = 2; i < 8; i++) {
      let x = -size + (i % 2 === 0 ? nextSize : 0);
      let y = (i % 2 === 0 ? 0 : nextSize);
      
      rect(x, y, nextSize/phi, nextSize/phi);
      
      if (i % 4 === 0) {
        arc(x + nextSize/phi, y + nextSize/phi, (nextSize/phi) * 2, (nextSize/phi) * 2, PI, PI + HALF_PI);
      } else if (i % 4 === 1) {
        arc(x, y + nextSize/phi, (nextSize/phi) * 2, (nextSize/phi) * 2, -HALF_PI, 0);
      } else if (i % 4 === 2) {
        arc(x, y, (nextSize/phi) * 2, (nextSize/phi) * 2, 0, HALF_PI);
      } else {
        arc(x + nextSize/phi, y, (nextSize/phi) * 2, (nextSize/phi) * 2, HALF_PI, PI);
      }
      
      nextSize = nextSize/phi;
    }
    
    pop();
  }
 }


function draw() {
  // Empty since we're using noLoop()
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    if (number == 3){
      number = 0;
    } else {
      number ++;
    }
    setup();
}