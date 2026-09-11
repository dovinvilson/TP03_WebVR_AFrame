// --- GESTION DU TIR ET DES INTERACTIONS (DEUX MAINS) ---
window.addEventListener('DOMContentLoaded', () => {
    const rightHand = document.querySelector('#right-hand');
    const leftHand = document.querySelector('#left-hand');
    
    // Déclenchement en VR (gâchette du contrôleur droit)
    if (rightHand) {
        rightHand.addEventListener('triggerdown', function () {
            shootWeapon(rightHand);
        });
    }

    // Déclenchement en VR (gâchette du contrôleur gauche)
    if (leftHand) {
        leftHand.addEventListener('triggerdown', function () {
            shootWeapon(leftHand);
        });
    }

    // Déclenchement de secours (clic de souris PC)
    window.addEventListener('mousedown', () => {
        if (rightHand) shootWeapon(rightHand);
    });
});

function shootWeapon(handEl) {
    const scene = document.querySelector('a-scene');
    const hitSound = document.querySelector('#hit-sound');
    
    if (!scene || !handEl) return;

    const worldPos = new THREE.Vector3();
    const worldDir = new THREE.Vector3();

    // Récupération de la position et de l'orientation mondiale de la main qui tire
    if (handEl.object3D) {
        handEl.object3D.getWorldPosition(worldPos);
        const localDir = new THREE.Vector3(0, 0, -1);
        worldDir.copy(localDir).applyQuaternion(handEl.object3D.getWorldQuaternion(new THREE.Quaternion()));
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

    // Effet visuel : petite balle rouge rapide qui part de la main active
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