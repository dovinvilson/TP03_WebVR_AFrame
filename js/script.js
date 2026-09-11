// --- GESTION DU TIR INDÉPENDANT POUR CHAQUE MAIN (BASÉ SUR LE RAYCASTER NATIF) ---
window.addEventListener('DOMContentLoaded', () => {
    const rightHand = document.querySelector('#right-hand');
    const leftHand = document.querySelector('#left-hand');
    
    // Ciblage et tir spécifique à la main droite
    if (rightHand) {
        rightHand.addEventListener('triggerdown', function () {
            shootFromHand(rightHand);
        });
    }

    // Ciblage et tir spécifique à la main gauche
    if (leftHand) {
        leftHand.addEventListener('triggerdown', function () {
            shootFromHand(leftHand);
        });
    }

    // Secours PC (souris)
    window.addEventListener('mousedown', () => {
        if (rightHand) shootFromHand(rightHand);
    });
});

function shootFromHand(handEl) {
    const scene = document.querySelector('a-scene');
    const hitSound = document.querySelector('#hit-sound');
    
    if (!scene || !handEl) return;

    const worldPos = new THREE.Vector3();
    const worldDir = new THREE.Vector3();

    // 1. Récupération exacte de la position et de l'orientation mondiale de CETTE main spécifique
    handEl.object3D.getWorldPosition(worldPos);
    const localDirection = new THREE.Vector3(0, 0, -1);
    const worldQuaternion = new THREE.Quaternion();
    handEl.object3D.getWorldQuaternion(worldQuaternion);
    worldDir.copy(localDirection).applyQuaternion(worldQuaternion);

    // 2. Utilisation directe du Raycaster de la main pour toucher précisément ce que son laser vise
    const raycasterComp = handEl.components.raycaster;
    
    if (raycasterComp && raycasterComp.intersectedEls.length > 0) {
        // On récupère la première cible valide (.target) touchée par le laser de cette manette
        const targetEl = raycasterComp.intersectedEls.find(el => el.classList.contains('target'));

        if (targetEl && targetEl.parentNode) {
            targetEl.parentNode.removeChild(targetEl);

            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.play().catch(err => console.log("Audio play error:", err));
            }
        }
    }

    // 3. Balle visuelle rouge partie de cette main précise
    worldPos.addScaledVector(worldDir, 0.2); 
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