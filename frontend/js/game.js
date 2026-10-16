const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);


const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const AmbientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(AmbientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const gridHelper = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444
);
scene.add(gridHelper);

const controls = new THREE.PointerLockControls(camera, document.body);

const instructions = document.getElementById('instructions');
const crosshair = document.getElementById('crosshair');

instructions.addEventListener('click', () => {
    controls.lock();
});

controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
    crosshair.style.display = 'block';
});


controls.addEventListener('unlock', () => {
    instructions.style.display = 'block';
    crosshair.style.display = 'none';
});

const moveState = { forward: false, backward: false, left: false, right: false };

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveState.forward = true;
    if (e.code === 'KeyS') moveState.backward = true;
    if (e.code === 'KeyA') moveState.left = true;
    if (e.code === 'KeyD') moveState.right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveState.forward = false;
    if (e.code === 'KeyS') moveState.backward = false;
    if (e.code === 'KeyA') moveState.left = false;
    if (e.code === 'KeyD') moveState.right = false;
}); 

const clientId = "player_" + Math.floor(Math.random() * 1000);

const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${clientId}`);

ws.onopen = () => {
    console.log('Connected to the server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
};

ws.onclose = () => {
    console.log('Disconnected from the server');
};

setInterval(() => {
    if (ws.readyState === WebSocket.OPEN && controls.isLocked) {
        const playload = {
            type: 'input',
            data: {
                forward: moveState.forward,
                backward: moveState.backward,
                left: moveState.left,
                right: moveState.right,
            }
        };
        ws.send(JSON.stringify(playload));
    }
}, 100);


// --- 5. Advanced Sci-Fi Pistol Assembly ---
const weaponGroup = new THREE.Group();

// Materials for different parts of the gun
const slideMat = new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.3, metalness: 0.9 });
const frameMat = new THREE.MeshStandardMaterial({ color: 0x222629, roughness: 0.5, metalness: 0.7 });
const gripMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.8 });
const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
const orangeAccentMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });

// 1. Upper Slide & Barrel Assembly
const slideGeo = new THREE.BoxGeometry(0.09, 0.11, 0.55);
const slide = new THREE.Mesh(slideGeo, slideMat);
slide.position.set(0, 0.03, -0.25);
weaponGroup.add(slide);

// 2. Glowing Energy Core (Center Window)
const coreGeo = new THREE.BoxGeometry(0.07, 0.06, 0.28);
const core = new THREE.Mesh(coreGeo, cyanGlowMat);
core.position.set(0, 0.03, -0.25);
weaponGroup.add(core);

// 3. Lower Frame & Trigger Guard
const frameGeo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
const frame = new THREE.Mesh(frameGeo, frameMat);
frame.position.set(0, -0.04, -0.15);
weaponGroup.add(frame);

// 4. Ergonomic Handle / Grip
const gripGeo = new THREE.BoxGeometry(0.08, 0.28, 0.11);
const grip = new THREE.Mesh(gripGeo, gripMat);
grip.rotation.x = 0.35; // Tilt back like a real service pistol
grip.position.set(0, -0.2, 0.04);
weaponGroup.add(grip);

// 5. Orange Accent Stripe on Grip
const stripeGeo = new THREE.BoxGeometry(0.085, 0.16, 0.015);
const stripe = new THREE.Mesh(stripeGeo, orangeAccentMat);
stripe.rotation.x = 0.35;
stripe.position.set(0, -0.18, 0.095);
weaponGroup.add(stripe);

// 6. Top Mounted Optic Sight
const opticBaseGeo = new THREE.BoxGeometry(0.05, 0.05, 0.08);
const opticBase = new THREE.Mesh(opticBaseGeo, frameMat);
opticBase.position.set(0, 0.11, -0.25);
weaponGroup.add(opticBase);

const opticWindowGeo = new THREE.BoxGeometry(0.04, 0.03, 0.01);
const opticWindow = new THREE.Mesh(opticWindowGeo, cyanGlowMat);
opticWindow.position.set(0, 0.12, -0.28);
weaponGroup.add(opticWindow);

// Add the finished weapon to the scene
scene.add(weaponGroup);




// --- 5. Main Animation & Movement Loop ---
function animate() {
    requestAnimationFrame(animate);
// 1. Sync weapon position and rotation with the camera, then offset locally
    weaponGroup.position.copy(camera.position);
    weaponGroup.quaternion.copy(camera.quaternion);
    weaponGroup.translateX(0.2);
    weaponGroup.translateY(-0.2);
    weaponGroup.translateZ(-0.5);
    const speed = 0.1;

    if (controls.isLocked) {
        // 1. Remember our position before moving
        const oldPosition = camera.position.clone();

        // 2. Apply movement inputs
        if (moveState.forward) controls.moveForward(speed);
        if (moveState.backward) controls.moveForward(-speed);
        if (moveState.left) controls.moveRight(-speed);
        if (moveState.right) controls.moveRight(speed);

        // 3. Create a bounding box for the player at the new position
        const playerBox = new THREE.Box3(
            new THREE.Vector3(camera.position.x - 0.4, camera.position.y - 1.8, camera.position.z - 0.4),
            new THREE.Vector3(camera.position.x + 0.4, camera.position.y, camera.position.z + 0.4)
        );

        // 4. Check against all obstacle boxes
        let collided = false;
        for (let i = 0; i < obstacles.length; i++) {
            if (playerBox.intersectsBox(obstacles[i].box)) {
                collided = true;
                break;
            }
        }

        // 5. If a collision is detected, revert to the old position
        if (collided) {
            camera.position.copy(oldPosition);
        }
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const obstacles = [];

function createBox(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    // Save mesh and its bounding box for collision detection
    obstacles.push({
        mesh: mesh,
        box: new THREE.Box3().setFromObject(mesh)
    });
}

createBox(5, 1, -5, 2, 2, 2, 0x3388ff);
createBox(-6, 1.5, -8, 3, 3, 1, 0xff8833);
createBox(0, 1, -15, 6, 2, 2, 0x8833ff);






const raycaster = new THREE.Raycaster();

window.addEventListener('mousedown', (e) => {
    if (controls.isLocked && e.button === 0) {
        weaponGroup.position.z += 0.05; // Recoil effect
        setTimeout(() => { weaponGroup.position.z -= 0.05; }, 100); // Reset after 100ms

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        const obstacleMeshes = obstacles.map(obs => obs.mesh);
        const intersect = raycaster.intersectObjects(obstacleMeshes);

        if (intersect.length > 0) {
            const hitObject = intersect[0].object;
            console.log('Hit Target!', hitObject);

            const orignalColor = hitObject.material.color.getHex();
            hitObject.material.color.set(0xff0000);
            setTimeout(() => { hitObject.material.color.set(orignalColor); }, 150);
        }

    }
});




