// sketch.js - GPU Failure Simulator
// Author: Your Name
// Date:

// Constants
const WIDTH = 800;
const HEIGHT = 600;
const SLICE_HEIGHT = 2;

// Globals
let canvasContainer;
let centerHorz, centerVert;
let capture;
let glitchIntensity = 0;
let glitchMode = 0;
let scanlines = [];
let slices = [];
let isGlitching = true;

function initSlices() {
    slices = [];
    for(let y = 0; y < height; y += SLICE_HEIGHT) {
        slices.push({
            y: y,
            offset: random(-50, 50),
            active: random() > 0.3
        });
    }
}

function initScanlines() {
    scanlines = [];
    for(let i = 0; i < height; i += 2) {
        scanlines.push({
            y: i,
            offset: 0,
            active: random() > 0.5
        });
    }
}

function resizeScreen() {
    centerHorz = canvasContainer.width() / 2;
    centerVert = canvasContainer.height() / 2;
    console.log("Resizing...");
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
    initScanlines();
    initSlices();
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");

    capture = createCapture(VIDEO);
    capture.size(width, height);
    capture.hide();

    $(window).resize(function() {
        resizeScreen();
    });
    
    // Prevent context menu on right click
    canvas.elt.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    resizeScreen();
}

function draw() {
    background(0);
    let img = capture.get();
    
    if (!isGlitching) {
        // Just show the normal image when not glitching
        noTint(); // Reset any tint effects
        image(img, 0, 0);
        return;
    }
    
    switch(glitchMode) {
        case 0: // RGB shift with horizontal slices
            // Draw base image with RGB shift
            image(img, 0, 0);
            
            // Apply sliced RGB shift
            for(let slice of slices) {
                if(slice.active) {
                    let sliceImg = img.get(0, slice.y, width, SLICE_HEIGHT);
                    let offset = slice.offset + sin(frameCount * 0.05 + slice.y * 0.01) * glitchIntensity;
                    
                    // Red channel
                    tint(255, 0, 0, 127);
                    image(sliceImg, offset + glitchIntensity, slice.y);
                    
                    // Green channel
                    tint(0, 255, 0, 127);
                    image(sliceImg, offset - glitchIntensity, slice.y);
                    
                    // Blue channel
                    tint(0, 0, 255, 127);
                    image(sliceImg, offset, slice.y + sin(frameCount * 0.1) * glitchIntensity * 0.5);
                } else {
                    noTint();
                    let sliceImg = img.get(0, slice.y, width, SLICE_HEIGHT);
                    image(sliceImg, 0, slice.y);
                }
            }
            break;
            
        case 1: // Matrix-like corruption
            image(img, 0, 0);
            loadPixels();
            for(let i = 0; i < width * height * 0.1; i++) {
                let x = floor(random(width));
                let y = floor(random(height));
                let index = (x + y * width) * 4;
                pixels[index] = 0;
                pixels[index + 1] = random(255);
                pixels[index + 2] = random(255);
                pixels[index + 3] = 255;
            }
            updatePixels();
            stroke(0, 255, 255, 100);
            for(let x = 0; x < width; x += 20) {
                line(x + sin(frameCount * 0.1) * 5, 0, x, height);
            }
            break;
            
        case 2: // Scanline chaos
            image(img, 0, 0);
            loadPixels();
            for(let line of scanlines) {
                if(line.active) {
                    for(let x = 0; x < width; x++) {
                        let pixelIndex = (line.y * width + x) * 4;
                        let shift = sin(x * 0.1 + frameCount * 0.1) * glitchIntensity;
                        pixels[pixelIndex] = random(255);
                        pixels[pixelIndex + 1] = x % 255;
                        pixels[pixelIndex + 2] = (x + shift) % 255;
                        pixels[pixelIndex + 3] = 255;
                    }
                }
            }
            updatePixels();
            break;

        case 3: // Complete meltdown
            loadPixels();
            img.loadPixels();
            for(let y = 0; y < height; y++) {
                for(let x = 0; x < width; x++) {
                    let index = (x + y * width) * 4;
                    
                    // Create extreme distortion
                    let distX = x + sin(y * 0.1 + frameCount * 0.2) * 100;
                    let distY = y + cos(x * 0.1 + frameCount * 0.1) * 50;
                    
                    // Add noise and color corruption
                    let noise = random(-50, 50);
                    let sourceIndex = (floor(distX) + floor(distY) * width) * 4;
                    
                    if(sourceIndex < img.pixels.length - 4 && sourceIndex >= 0) {
                        // Extreme color manipulation
                        pixels[index] = (img.pixels[sourceIndex] * 2 + noise) % 255; // Red
                        pixels[index + 1] = (img.pixels[sourceIndex + 1] / 2 + frameCount) % 255; // Green
                        pixels[index + 2] = (img.pixels[sourceIndex + 2] * 1.5 + x) % 255; // Blue
                        pixels[index + 3] = 255;
                    } else {
                        // Create artifacts when out of bounds
                        pixels[index] = random(255);
                        pixels[index + 1] = (x * y) % 255;
                        pixels[index + 2] = (frameCount * 5) % 255;
                        pixels[index + 3] = 255;
                    }
                }
            }
            updatePixels();
            
            // Add intense vertical tears
            for(let i = 0; i < 20; i++) {
                let tearX = random(width);
                stroke(random(255), random(255), random(255));
                line(tearX, 0, tearX + random(-100, 100), height);
            }
            break;

        case 4: // Extreme pixel sorting
            loadPixels();
            img.loadPixels();
            
            // Create wave patterns
            for(let y = 0; y < height; y++) {
                let sortedRow = [];
                for(let x = 0; x < width; x++) {
                    let index = (x + y * width) * 4;
                    let wave = sin(y * 0.05 + frameCount * 0.1) * 100;
                    let wave2 = cos(x * 0.02 + frameCount * 0.05) * 50;
                    
                    // Sample from distorted position
                    let sampleX = (x + wave) % width;
                    let sampleY = (y + wave2) % height;
                    let sampleIndex = (floor(sampleX) + floor(sampleY) * width) * 4;
                    
                    if(sampleIndex >= 0 && sampleIndex < img.pixels.length - 4) {
                        sortedRow.push({
                            r: img.pixels[sampleIndex],
                            g: img.pixels[sampleIndex + 1],
                            b: img.pixels[sampleIndex + 2],
                            brightness: (img.pixels[sampleIndex] + 
                                       img.pixels[sampleIndex + 1] + 
                                       img.pixels[sampleIndex + 2]) / 3
                        });
                    }
                }
                
                // Sort pixels by brightness with some randomness
                if(random() > 0.5) {
                    sortedRow.sort((a, b) => b.brightness - a.brightness);
                }
                
                // Apply sorted pixels back with extreme color manipulation
                for(let x = 0; x < width; x++) {
                    let index = (x + y * width) * 4;
                    if(x < sortedRow.length) {
                        let pixel = sortedRow[x];
                        pixels[index] = (pixel.r * 2 + frameCount) % 255; // Red channel manipulation
                        pixels[index + 1] = (pixel.g + x) % 255; // Green channel manipulation
                        pixels[index + 2] = (pixel.b * 1.5 + y) % 255; // Blue channel manipulation
                        pixels[index + 3] = 255;
                    }
                }
                
                // Add glitch lines
                if(random() > 0.95) {
                    for(let x = 0; x < width; x++) {
                        let index = (x + y * width) * 4;
                        pixels[index] = 255;
                        pixels[index + 1] = 0;
                        pixels[index + 2] = random(255);
                        pixels[index + 3] = 255;
                    }
                }
            }
            
            updatePixels();
            
            // Add digital noise
            stroke(255, 0, 0, 50);
            for(let i = 0; i < 100; i++) {
                let x1 = random(width);
                let y1 = random(height);
                let x2 = x1 + random(-50, 50);
                let y2 = y1 + random(-50, 50);
                line(x1, y1, x2, y2);
            }
            
            // Add vertical tears
            stroke(0, 255, 255, 100);
            for(let i = 0; i < 10; i++) {
                let x = random(width);
                let offset = sin(frameCount * 0.1) * 50;
                line(x + offset, 0, x - offset, height);
            }
            break;
    }
    
    glitchIntensity = min(glitchIntensity + 0.2, 30);
}

function mousePressed() {
    if (mouseButton === LEFT) {
        // Left click changes glitch mode
        if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
            glitchMode = (glitchMode + 1) % 5;
            glitchIntensity = 0;
            initScanlines();
            initSlices();
        }
    } else if (mouseButton === RIGHT) {
        // Right click toggles glitch effect
        isGlitching = !isGlitching;
        if (!isGlitching) {
            glitchIntensity = 0;
            noTint(); // Reset tint when turning off glitch
        }
    }
}