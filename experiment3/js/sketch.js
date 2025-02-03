// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let mic;
let fft;  // Add this line for frequency analysis
let rectangles = [];
let triangles = [];
let circles = [];
const MAX_SHAPES = 3;  // Maximum number of each shape type
const LIFETIME = 500; // 500 milliseconds = 0.5 seconds

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

  mic = new p5.AudioIn();
  fft = new p5.FFT();  // Create FFT analyzer
  mic.start();
  fft.setInput(mic);   // Connect mic to FFT
  stroke(255);
  background(0);

  rectMode(CENTER);
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  let vol = mic.getLevel();
  let spectrum = fft.analyze();
  
  let bass = fft.getEnergy("bass");
  let mid = fft.getEnergy("mid");
  let treble = fft.getEnergy("treble");
  
  background(0);
  
  let size = map(vol, 0, .2, 10, .8);
  var m = map(mouseX, 0, width, 100, 255);
  fill(m, 20);
  
  let currentTime = millis(); // Get current time
  
  // Add new shapes based on frequency with timestamp
  if (bass > 210) {
    rectangles.push({
      x: width / 2,
      y: 300,
      size: size * bass/2.6,
      timestamp: currentTime
    });
  } 
  if (treble > 60) {
    triangles.push({
      x: width / 2,
      y: 300,
      size: size * treble/1.3,
      timestamp: currentTime
    });
  } 
  if (mid > 100) {
    circles.push({
      x: width / 2,
      y: 300,
      size: size * mid/2.7,
      timestamp: currentTime
    });
  }
  
  // Remove old shapes
  rectangles = rectangles.filter(r => currentTime - r.timestamp < LIFETIME);
  triangles = triangles.filter(t => currentTime - t.timestamp < LIFETIME);
  circles = circles.filter(c => currentTime - c.timestamp < LIFETIME);
  
  // Limit arrays to MAX_SHAPES
  if (rectangles.length > MAX_SHAPES) rectangles.shift();
  if (triangles.length > MAX_SHAPES) triangles.shift();
  if (circles.length > MAX_SHAPES) circles.shift();
  
  // Draw rectangles
  rectangles.forEach(r => {
    rectMode(CENTER);
    rect(r.x, r.y, r.size, r.size);
  });
  
  // Draw triangles
  triangles.forEach(t => {
    triangle(
      t.x, t.y - t.size/2,
      t.x - t.size/2, t.y + t.size/2,
      t.x + t.size/2, t.y + t.size/2
    );
  });
  
  // Draw circles
  circles.forEach(c => {
    ellipse(c.x, c.y, c.size, c.size);
    ellipse(c.x, c.y, c.size/5, c.size/5);
  }); 
}