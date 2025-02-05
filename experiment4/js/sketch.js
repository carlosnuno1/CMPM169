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
const MAX_SHAPES = 2;  // Maximum number of each shape type
const LIFETIME = 35; // 500 milliseconds = 0.5 seconds
let audioReady = false; // Add this flag to check if audio is ready
let startButton;
let audioOutputButton;
let audioSource;
let audioContext;
let isAudioMuted = true; // Track mute state

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
async function setup() {
  frameRate(60);
  
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  // Create start button and place it on the right side
  startButton = createButton('Start Audio');
  startButton.parent("content");
  startButton.position(canvasContainer.position().left + canvasContainer.width() - 120,
                      canvasContainer.position().top + canvasContainer.height() + 20);
  startButton.addClass('start-button');
  startButton.mousePressed(initializeAudio);

  // Create mute toggle button
  audioOutputButton = createButton('Unmute Tab');
  audioOutputButton.parent("content");
  audioOutputButton.position(canvasContainer.position().left + canvasContainer.width() - 120,
                           canvasContainer.position().top + canvasContainer.height() + 70);
  audioOutputButton.addClass('start-button');
  audioOutputButton.mousePressed(() => {
    if (audioSource && audioContext) {
      if (audioOutputButton.html() === 'Unmute Tab') {
        audioSource.connect(audioContext.destination);
        audioOutputButton.html('Mute Tab');
      } else {
        audioSource.disconnect(audioContext.destination);
        audioOutputButton.html('Unmute Tab');
      }
    }
  });

  stroke(255);
  background(0);
  rectMode(CENTER);
}

async function initializeAudio() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      video: {
        displaySurface: 'browser'
      }
    });
    
    // Set up p5 audio analysis
    mic = new p5.AudioIn();
    fft = new p5.FFT();
    
    // Use p5.sound's audio context
    audioContext = p5.prototype.getAudioContext();
    audioSource = audioContext.createMediaStreamSource(stream);
    
    // Connect to FFT
    fft.setInput(audioSource);
    audioReady = true;
    
    startButton.hide();
  } catch (err) {
    console.error('Error accessing audio:', err);
    audioReady = false;
  }
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  if (!audioReady) return;
  
  try {
    let spectrum = fft.analyze();
    let lowBass = fft.getEnergy(20, 100);    // Lower bass frequencies
    let highBass = fft.getEnergy(100, 200);  // Higher bass frequencies
    let lowMid = fft.getEnergy(200, 800);    // Lower mid frequencies
    let highMid = fft.getEnergy(800, 1500);  // Higher mid frequencies
    let lowTreble = fft.getEnergy(1500, 3000); // Lower treble frequencies
    let highTreble = fft.getEnergy(3000, 5000); // Higher treble frequencies
    
    background(0);
    
    var m = map(mouseX, 0, width, 100, 255);
    fill(m, 20);
    
    let currentTime = millis();
    
    // Bass shapes
    if (lowBass > 130) {
      rectangles.push({
        x: width / 2,
        y: 300,
        size: map(lowBass, 0, 255, .1, 25) * lowBass/10,
        timestamp: currentTime,
        isLowBass: true
      });
    }
    if (highBass > 130) {
      rectangles.push({
        x: width / 2,
        y: 300,
        size: map(highBass, 0, 255, .1, 25) * highBass/10,
        timestamp: currentTime,
        isLowBass: false

      });
    }

    // Mid shapes
    if (lowMid > 40) {
      circles.push({
        x: width / 2,
        y: 300,
        size: map(lowMid, 0, 255, .1, 25) * lowMid/10,
        timestamp: currentTime,
        intensity: lowMid,
        isHighMid: false
      });
    }
    if (highMid > 40) {
      circles.push({
        x: width / 2,
        y: 300,
        size: map(highMid, 0, 255, .1, 25) * highMid/10,
        timestamp: currentTime,
        intensity: highMid,
        isHighMid: true
      });
    }

    // Treble shapes
    if (lowTreble > 80) {
      triangles.push({
        x: width / 2,
        y: 300,
        size: map(lowTreble, 0, 255, .1, 25) * lowTreble/8,
        timestamp: currentTime,
        intensity: lowTreble,
        isHighTreble: false
      });
    }
    if (highTreble > 80) {
      triangles.push({
        x: width / 2,
        y: 300,
        size: map(highTreble, 0, 255, .1, 25) * highTreble/8,
        timestamp: currentTime,
        intensity: highTreble,
        isHighTreble: true
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
    
    // Draw bass shapes
    rectangles.forEach(r => {
      push();
      if (r.isLowBass) {
        // Hexagon for low bass
        beginShape();
        for (let i = 0; i < 6; i++) {
          let angle = TWO_PI * i / 6;
          let x = r.x + cos(angle) * r.size/2;
          let y = r.y + sin(angle) * r.size/2;
          vertex(x, y);
        }
        endShape(CLOSE);
      } else {
        // Square for high bass
        rectMode(CENTER);
        rect(r.x, r.y, r.size, r.size);
      }
      pop();
    });
    
    // Draw mid shapes
    circles.forEach(c => {
      push();
      if (c.isHighMid) {
        // Simple circle for high mids
        ellipse(c.x, c.y, c.size, c.size);
      } else {
        // Morphing circle for low mids
        let points = floor(map(c.intensity, 40, 255, 20, 40));
        beginShape();
        for (let i = 0; i < points; i++) {
          let angle = TWO_PI * i / points;
          let radius = c.size/2;
          let wave = sin(angle * 5) * (c.intensity / 255) * c.size/8;
          let x = c.x + cos(angle) * (radius + wave);
          let y = c.y + sin(angle) * (radius + wave);
          vertex(x, y);
        }
        endShape(CLOSE);
      }
      pop();
    });
    
    // Draw treble shapes
    triangles.forEach(t => {
      push();
      if (t.isHighTreble) {
        // Upside down triangle for high treble
        triangle(
          t.x, t.y + t.size/2,
          t.x - t.size/2, t.y - t.size/2,
          t.x + t.size/2, t.y - t.size/2
        );
      } else {
        // Normal triangle for low treble
        triangle(
          t.x, t.y - t.size/2,
          t.x - t.size/2, t.y + t.size/2,
          t.x + t.size/2, t.y + t.size/2
        );
      }
      pop();
    });
  } catch (err) {
    console.error('Error in draw loop:', err);
    audioReady = false;
  }
}

// Add keyPressed function
function keyPressed() {
  if (key === ' ') { // Check for space key
    if (audioSource && audioContext) {
      if (audioOutputButton.html() === 'Unmute Tab') {
        audioSource.connect(audioContext.destination);
        audioOutputButton.html('Mute Tab');
      } else {
        audioSource.disconnect(audioContext.destination);
        audioOutputButton.html('Unmute Tab');
      }
    }
  }
}