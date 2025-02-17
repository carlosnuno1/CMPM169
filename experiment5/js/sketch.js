// sketch.js - Purpose and description here
// Author: Your Name
// Date:

// Three.js scene setup
let scene, camera, renderer;
let canvasContainer;
let ground;
let weapon;

// FPS controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let euler = new THREE.Euler(0, 0, 0, 'YXZ');

const PLAYER_HEIGHT = 2;

// Shooting controls
let canShoot = true;
let shootCooldown = 100; // Milliseconds between shots
const raycaster = new THREE.Raycaster();

// Add to existing global variables
let collidableObjects = [];
let playerCollider;
const COLLISION_DISTANCE = 1.0;

// Add at the top with other global variables
let groundTexture;
let shootSound;

// Add to existing global variables
let isJumping = false;
const JUMP_FORCE = 12;
const GRAVITY = -30;

// Add to existing global variables
let targets = [];
const TARGET_COUNT = 5;  // Number of targets in the air at once
const TARGET_SPAWN_RANGE = 50;  // How far targets can spawn
const TARGET_HEIGHT_RANGE = { min: 5, max: 20 };  // Height range for targets

// Add to existing global variables
let menuVisible = false;

// Add to existing global variables
let mouseSensitivity = 0.001;

// Add to existing global variables
let gameStarted = false;

// Add to existing global variables
let gameTimer = null;
let timeRemaining = 30;
let gameEnded = false;

// Add to existing global variables
let score = 0;
let topScore = localStorage.getItem('topScore') || 0; // Get saved top score

function createWeapon() {
    // Create a simple gun shape
    const gunGroup = new THREE.Group();
    
    // Gun barrel
    const barrelGeometry = new THREE.BoxGeometry(0.1, 0.1, 1);
    const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.z = -0.5;
    barrel.position.y = -0.05; // Moved barrel down slightly
    gunGroup.add(barrel);
    
    // Gun body
    const bodyGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.1;
    gunGroup.add(body);
    
    // Position the weapon in view
    gunGroup.position.set(0.3, -0.3, -0.5);
    
    return gunGroup;
}

function createTarget() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const target = new THREE.Mesh(geometry, material);
    
    // Random position within range
    target.position.x = (Math.random() - 0.5) * TARGET_SPAWN_RANGE * 2;
    target.position.y = Math.random() * (TARGET_HEIGHT_RANGE.max - TARGET_HEIGHT_RANGE.min) + TARGET_HEIGHT_RANGE.min;
    target.position.z = (Math.random() - 0.5) * TARGET_SPAWN_RANGE * 2;
    
    scene.add(target);
    targets.push(target);
}

function respawnTarget(target) {
    target.position.x = (Math.random() - 0.5) * TARGET_SPAWN_RANGE * 2;
    target.position.y = Math.random() * (TARGET_HEIGHT_RANGE.max - TARGET_HEIGHT_RANGE.min) + TARGET_HEIGHT_RANGE.min;
    target.position.z = (Math.random() - 0.5) * TARGET_SPAWN_RANGE * 2;
}

function shoot() {
    if (!canShoot || gameEnded) return;
    
    // Start game on first shot
    if (!gameStarted) {
        gameStarted = true;
        // Remove start text
        const startText = document.getElementById('start-text');
        if (startText) {
            startText.style.display = 'none';
        }
        // Create initial targets
        for (let i = 0; i < TARGET_COUNT; i++) {
            createTarget();
        }
        // Start timer
        startTimer();
    }
    
    // Play sound
    if (shootSound && shootSound.isPlaying) {
        shootSound.stop();
    }
    if (shootSound) {
        shootSound.play();
    }
    
    // Gun recoil animation
    if (weapon) {
        weapon.position.z += 0.1;
        weapon.rotation.x -= 0.1;
        
        setTimeout(() => {
            if (weapon) {
                weapon.position.z = -0.5;
                weapon.rotation.x = 0;
            }
        }, 50);
    }
    
    // Raycast from camera center
    raycaster.setFromCamera(new THREE.Vector2(), camera);
    const intersects = raycaster.intersectObjects(targets, false);
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        
        // Update score
        score += 5;
        document.getElementById('score').textContent = `Score: ${score}`;
        
        // Create hit effect
        const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 1
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        
        spark.position.copy(hit.point);
        scene.add(spark);
        
        // Fade out and remove spark
        const fadeOut = setInterval(() => {
            sparkMaterial.opacity -= 0.1;
            if (sparkMaterial.opacity <= 0) {
                scene.remove(spark);
                clearInterval(fadeOut);
            }
        }, 50);

        // Respawn hit target
        respawnTarget(hit.object);
    } else {
        // Penalty for missing
        score = Math.max(0, score - 2); // Prevent score from going below 0
        document.getElementById('score').textContent = `Score: ${score}`;
    }
    
    // Implement cooldown
    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, shootCooldown);
}

function checkCollisions() {
    // Create raycasters for each direction
    const directions = [
        new THREE.Vector3(1, 0, 0),  // right
        new THREE.Vector3(-1, 0, 0), // left
        new THREE.Vector3(0, 0, 1),  // front
        new THREE.Vector3(0, 0, -1), // back
    ];
    
    for (let direction of directions) {
        // Rotate direction based on camera rotation
        direction.applyQuaternion(camera.quaternion);
        
        // Create raycaster
        raycaster.set(camera.position, direction);
        const intersects = raycaster.intersectObjects(collidableObjects, false);
        
        // Check for collisions
        if (intersects.length > 0 && intersects[0].distance < COLLISION_DISTANCE) {
            // Calculate overlap distance
            const overlap = COLLISION_DISTANCE - intersects[0].distance;
            
            // Get normalized push direction (away from collision)
            const pushDir = intersects[0].face.normal.clone();
            
            // Add push-back force
            camera.position.add(pushDir.multiplyScalar(overlap));
        }
    }
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Load grass texture with more verbose error handling
    const textureLoader = new THREE.TextureLoader();
    groundTexture = textureLoader.load(
        'grass.jpg', 
        function(texture) {
            console.log("Texture loaded successfully!");
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(100, 100);
            ground.material.needsUpdate = true;
            ground.material.map = texture;
            console.log("Texture applied to material");
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(err) {
            console.error("Error loading texture:", err);
            console.log("Attempted to load from path:", 'grass.jpg');
        }
    );
    
    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = PLAYER_HEIGHT;
    
    // Set up renderer
    canvasContainer = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    canvasContainer.appendChild(renderer.domElement);

    // Create ground with texture
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        map: groundTexture,
        side: THREE.DoubleSide,
        color: 0xffffff
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    scene.fog = new THREE.Fog(0x87CEEB, 1, 100);

    // Create and add weapon to camera
    weapon = createWeapon();
    camera.add(weapon);
    scene.add(camera);

    // Enhance lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Load sound
    const audioLoader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();
    camera.add(listener);
    
    shootSound = new THREE.Audio(listener);
    audioLoader.load('fire.mp3', function(buffer) {
        shootSound.setBuffer(buffer);
        shootSound.setVolume(4);
    });

    // Add event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', function() {
        canvasContainer.requestPointerLock();
    });

    // Add mouse click listener for shooting
    document.addEventListener('mousedown', (event) => {
        if (document.pointerLockElement === canvasContainer && event.button === 0) {
            shoot();
        }
    });

    // Create menu with updated styles and reset button
    const menuHTML = `
        <div id="game-menu" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            background: rgba(0, 0, 0, 0.8); padding: 20px; border-radius: 10px; color: white; text-align: center;
            z-index: 1000; pointer-events: auto; user-select: none;">
            <h2 style="margin: 0 0 20px 0;">Menu</h2>
            <div style="margin: 10px 0;">
                Sensitivity: <input type="range" id="sensitivity" min="1" max="100" value="50" step="1">
                <span id="sensitivityValue">0.002</span>
            </div>
            <div style="margin: 10px 0;">Volume: <input type="range" id="volume" min="0" max="100" value="50"></div>
            <button id="resetTopScore" style="padding: 10px 20px; margin: 10px; background: #ff4444; border: none; 
                color: white; cursor: pointer; border-radius: 5px;">Reset Top Score</button>
            <button id="resumeButton" style="padding: 10px 20px; margin: 10px; background: #4CAF50; border: none; 
                color: white; cursor: pointer; border-radius: 5px;">Resume (Tab)</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    // Add menu event listeners
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Tab') {
            event.preventDefault();
            toggleMenu();
        }
    });

    document.getElementById('resumeButton').addEventListener('click', () => {
        toggleMenu();
    });

    document.getElementById('resetTopScore').addEventListener('click', () => {
        topScore = 0;
        localStorage.setItem('topScore', 0);
        document.getElementById('top-score').textContent = 'Top Score: 0';
    });

    document.getElementById('sensitivity').addEventListener('input', (e) => {
        const value = e.target.value / 25000;
        document.getElementById('sensitivityValue').textContent = value.toFixed(5);
        mouseSensitivity = value;
    });

    document.getElementById('volume').addEventListener('input', (e) => {
        if (shootSound) {
            shootSound.setVolume(e.target.value / 100);
        }
    });

    // Add start text overlay
    const startTextHTML = `
        <div id="start-text" style="
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            user-select: none;">
            Fire to Start
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', startTextHTML);

    // Add timer display
    const timerHTML = `
        <div id="timer" style="
            display: none;
            position: fixed;
            top: 5%;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            user-select: none;">
            30
        </div>
        <div id="game-over" style="
            display: none;
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 36px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            user-select: none;">
            Time's Up!
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', timerHTML);

    // Add score and top score displays
    const scoreHTML = `
        <div id="score" style="
            position: fixed;
            top: 5%;
            left: 5%;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            user-select: none;">
            Score: 0
        </div>
        <div id="top-score" style="
            position: fixed;
            top: 5%;
            right: 5%;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            user-select: none;">
            Top Score: ${topScore}
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', scoreHTML);

    // Add menu indicator text
    const menuIndicatorHTML = `
        <div id="menu-indicator" style="
            position: fixed;
            top: 2%;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            user-select: none;
            opacity: 0.7;">
            Tab for Menu
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuIndicatorHTML);

    animate();
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (!isJumping) {
                velocity.y = JUMP_FORCE;
                isJumping = true;
            }
            break;
        case 'KeyR':
            if (gameEnded) {
                // Reset game state
                gameEnded = false;
                timeRemaining = 30;
                score = 0;
                document.getElementById('score').textContent = 'Score: 0';
                document.getElementById('game-over').style.display = 'none';
                
                // Create new targets
                for (let i = 0; i < TARGET_COUNT; i++) {
                    createTarget();
                }
                
                // Start timer
                startTimer();
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function onMouseMove(event) {
    if (document.pointerLockElement === canvasContainer) {
        // Use raw mouse movement values without any additional scaling
        euler.setFromQuaternion(camera.quaternion);
        
        // Apply sensitivity directly to movement values
        euler.y -= event.movementX * mouseSensitivity;
        euler.x -= event.movementY * mouseSensitivity;
        
        // Clamp vertical rotation to prevent over-rotation
        euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));
        
        camera.quaternion.setFromEuler(euler);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (document.pointerLockElement === canvasContainer && !menuVisible) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        // Apply gravity and update vertical position
        velocity.y += GRAVITY * delta;
        camera.position.y += velocity.y * delta;

        // Check for ground collision
        if (camera.position.y < PLAYER_HEIGHT) {
            camera.position.y = PLAYER_HEIGHT;
            velocity.y = 0;
            isJumping = false;
        }

        // Horizontal movement
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize();

        const speed = 120;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        // Update position
        camera.translateX(velocity.x * delta);
        camera.translateZ(velocity.z * delta);

        // Add subtle weapon sway
        if (weapon) {
            weapon.position.x = 0.3 + Math.sin(time * 0.002) * 0.002;
            weapon.position.y = -0.3 + Math.cos(time * 0.002) * 0.002;
        }

        prevTime = time;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height, true);
}

// Update fullscreen event listener
document.addEventListener('fullscreenchange', function() {
    setTimeout(function() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height, true);
    }, 100);
});

function toggleMenu() {
    const menu = document.getElementById('game-menu');
    const menuIndicator = document.getElementById('menu-indicator');
    menuVisible = !menuVisible;
    
    if (menuVisible) {
        menu.style.display = 'block';
        menuIndicator.style.display = 'none';
        document.exitPointerLock();
    } else {
        menu.style.display = 'none';
        menuIndicator.style.display = 'block';
        canvasContainer.requestPointerLock();
    }
}

function startTimer() {
    const timerDisplay = document.getElementById('timer');
    timerDisplay.style.display = 'block';
    
    gameTimer = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(gameTimer);
    gameEnded = true;
    
    // Update top score if current score is higher
    if (score > topScore) {
        topScore = score;
        localStorage.setItem('topScore', topScore);
        document.getElementById('top-score').textContent = `Top Score: ${topScore}`;
    }
    
    // Remove all targets
    targets.forEach(target => scene.remove(target));
    targets = [];
    
    // Show game over message with final score and restart instruction
    document.getElementById('timer').style.display = 'none';
    document.getElementById('game-over').textContent = `Time's Up! Final Score: ${score}\nPress R to Play Again`;
    document.getElementById('game-over').style.display = 'block';
}

init();