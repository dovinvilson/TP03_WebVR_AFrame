// --- COMPOSANT POUR MASQUER LES MAINS HORS VR ---
AFRAME.registerComponent('hide-on-desktop', {
    init: function () {
        const el = this.el;
        
        // Par défaut sur PC, on cache l'objet
        el.setAttribute('visible', false);
        if (el.components.raycaster) el.components.raycaster.pause();

        // Quand on entre en mode VR (casque connecté)
        el.sceneEl.addEventListener('enter-vr', () => {
            if (el.sceneEl.is('vr-mode')) {
                el.setAttribute('visible', true);
                if (el.components.raycaster) el.components.raycaster.play();
            }
        });

        // Quand on sort du mode VR
        el.sceneEl.addEventListener('exit-vr', () => {
            el.setAttribute('visible', false);
            if (el.components.raycaster) el.components.raycaster.pause();
        });
    }
});


// --- GESTION DU TIR VIA LE VISEUR CENTRAL DE LA CAMÉRA ---
window.addEventListener('DOMContentLoaded', () => {
    // Écoute du clic sur l'écran (PC) ou gâchette VR
    window.addEventListener('mousedown', () => {
        shootFromCamera();
    });

    const rightHand = document.querySelector('#right-hand');
    const leftHand = document.querySelector('#left-hand');

    if (rightHand) {
        rightHand.addEventListener('triggerdown', () => {
            shootFromCamera();
        });
    }

    if (leftHand) {
        leftHand.addEventListener('triggerdown', () => {
            shootFromCamera();
        });
    }
});

function shootFromCamera() {
    const scene = document.querySelector('a-scene');
    const hitSound = document.querySelector('#hit-sound');
    const cameraEl = document.querySelector('[camera]');
    
    if (!scene || !cameraEl) return;

    const worldPos = new THREE.Vector3();
    const worldDir = new THREE.Vector3();

    // 1. On récupère la position et la direction exacte où regarde la caméra (le centre de l'écran / le viseur)
    const cameraObj = cameraEl.object3D;
    cameraObj.getWorldPosition(worldPos);
    
    const localDir = new THREE.Vector3(0, 0, -1);
    const worldQuaternion = new THREE.Quaternion();
    cameraObj.getWorldQuaternion(worldQuaternion);
    worldDir.copy(localDir).applyQuaternion(worldQuaternion);

    // 2. Raycaster basé sur le centre de l'écran
    const raycaster = new THREE.Raycaster(worldPos, worldDir);
    const targets = Array.from(document.querySelectorAll('.target'));
    const intersects = raycaster.intersectObjects(targets.map(t => t.object3D), true);

    if (intersects.length > 0) {
        let targetEl = intersects[0].object.el;
        
        while (targetEl && !targetEl.classList.contains('target')) {
            targetEl = targetEl.parentNode;
        }

        if (targetEl && targetEl.parentNode) {
            // Destruction de la cible violette visée par le viseur central
            targetEl.parentNode.removeChild(targetEl);

            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.play().catch(err => console.log("Audio play error:", err));
            }
        }
    }

    // 3. Effet visuel de la balle partie du centre de la caméra
    worldPos.addScaledVector(worldDir, 0.5); 
    const bullet = document.createElement('a-sphere');
    bullet.setAttribute('radius', '0.04');
    bullet.setAttribute('color', '#FF0000');
    bullet.setAttribute('position', worldPos);
    scene.appendChild(bullet);

    let steps = 0;
    const maxSteps = 45;
    function animateBullet() {
        bullet.object3D.translateZ(-0.8);
        steps++;
        if (steps < maxSteps && bullet.parentNode) {
            requestAnimationFrame(animateBullet);
        } else if (bullet.parentNode) {
            bullet.parentNode.removeChild(bullet);
        }
    }
    requestAnimationFrame(animateBullet);
}


// --- GÉNÉRATION AUTOMATIQUE DES CIBLES VIOLETTES ---
AFRAME.registerComponent('target-spawner', {
    init: function () {
        this.spawnInterval = 3000;
        this.timer = 0;
        
        setTimeout(() => {
            this.spawnTarget();
        }, 1500);
    },
    tick: function (time, timeDelta) {
        this.timer += timeDelta;
        if (this.timer >= this.spawnInterval) {
            this.timer = 0;
            this.spawnTarget();
        }
    },
    spawnTarget: function () {
        const container = document.querySelector('#targets-container');
        if (!container) return;

        const target = document.createElement('a-box');
        
        const randomX = (Math.random() - 0.5) * 5;
        const randomY = Math.random() * 1.5 + 1; 
        const randomZ = -Math.random() * 3 - 2; 
        
        target.setAttribute('position', `${randomX} ${randomY} ${randomZ}`);
        target.setAttribute('scale', '0.5 0.5 0.5');
        target.setAttribute('color', '#9900CC');
        target.setAttribute('class', 'target');
        
        container.appendChild(target);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('target-spawner', '');
    }
});