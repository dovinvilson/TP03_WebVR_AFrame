// --- GESTION DU TIR ET DES INTERACTIONS ---
window.addEventListener('DOMContentLoaded', () => {
    const rightHand = document.querySelector('#right-hand');
    
    // Déclenchement en VR (gâchette du contrôleur droit)
    if (rightHand) {
        rightHand.addEventListener('triggerdown', function () {
            shootWeapon();
        });
    }

    // Déclenchement sur PC (clic de souris)
    window.addEventListener('mousedown', () => {
        shootWeapon();
    });
});

function shootWeapon() {
    const scene = document.querySelector('a-scene');
    const hitSound = document.querySelector('#hit-sound');
    const rightHand = document.querySelector('#right-hand');
    const cameraEl = document.querySelector('[camera], a-camera');
    
    if (!scene) return;

    const worldPos = new THREE.Vector3();
    const worldDir = new THREE.Vector3();

    // VÉRIFICATION VR vs PC (Notion de World Position du contrôleur)
    // Si on est en VR et que le contrôleur droit est connecté et visible dans l'espace
    if (rightHand && rightHand.object3D && rightHand.object3D.visible) {
        // Le tir part de la position mondiale (World Position) de la manette droite
        rightHand.object3D.getWorldPosition(worldPos);
        
        // On récupère la direction vers l'avant de la manette
        const localDir = new THREE.Vector3(0, 0, -1);
        worldDir.copy(localDir).applyQuaternion(rightHand.object3D.getWorldQuaternion(new THREE.Quaternion()));
    } else if (cameraEl) {
        // Mode PC : le tir part de la caméra (milieu de l'écran)
        cameraEl.object3D.getWorldPosition(worldPos);
        cameraEl.object3D.getWorldDirection(worldDir);
        worldDir.negate();
    } else {
        return;
    }

    // Raycaster pour détecter et détruire instantanément la cible violette visée
    const raycaster = new THREE.Raycaster(worldPos, worldDir);
    const targets = Array.from(document.querySelectorAll('.target'));
    const intersects = raycaster.intersectObjects(targets.map(t => t.object3D), true);

    if (intersects.length > 0) {
        let targetEl = intersects[0].object.el;
        
        while (targetEl && !targetEl.classList.contains('target')) {
            targetEl = targetEl.parentNode;
        }

        if (targetEl && targetEl.parentNode) {
            targetEl.parentNode.removeChild(targetEl);

            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.play().catch(err => console.log("Audio play error:", err));
            }
        }
    }

    // Effet visuel : petite balle rouge rapide qui part un tout petit peu devant la manette pour éviter l'auto-collision
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
        this.spawnInterval = 3000; // Toutes les 3 secondes
        this.timer = 0;
        
        // Apparition d'une première cible après 1.5 seconde
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