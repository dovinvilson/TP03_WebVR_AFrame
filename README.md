# TP 03 - WebVR avec A-Frame

Projet de Réalité Virtuelle (WebVR) développé avec le framework **A-Frame**. Ce projet met en place un environnement 3D interactif et physique, compatible à la fois sur navigateur web classique (PC) et avec des casques de réalité virtuelle (VR).

---

## 🚀 Fonctionnalités principales

1. **Environnement 3D & Physique :**
   - Intégration d'un moteur physique (`aframe-physics-system`) gérant la gravité et les collisions.
   - Sol et objets interactifs 3D (cubes, sphères, cylindres) dynamiques et statiques.

2. **Système de Tir et de Cibles :**
   - Génération automatique et périodique de cibles violettes (`target-spawner`).
   - Système de tir interactif permettant de viser au centre de l'écran (viseur central / curseur) ou via les gâchettes VR.
   - Effet visuel de tir (projection de projectiles rouges) et retour audio lors de l'impact (`hit-sound`).

3. **Compatibilité Double Mode (PC / VR) :**
   - **Mode PC (Bureau) :** Les commandes de mouvement et le clic de souris permettent de naviguer et de tirer à l'aide du viseur central. Les modèles 3D des armes et manettes VR sont masqués par défaut (`hide-on-desktop`) pour garder une interface propre.
   - **Mode VR (Casque Oculus / WebXR) :** Détection automatique du casque pour afficher et activer les contrôleurs VR, permettant l'interaction directe et la manipulation d'objets (`grab`).

---

## 🛠️ Technologies utilisées

- **A-Frame (v1.5.0)** : Framework WebGL / WebVR pour créer des expériences 3D dans le navigateur.
- **A-Frame Physics System** : Gestion de la physique (gravité, forces, corps dynamiques et statiques).
- **A-Frame Extras** : Composants additionnels (contrôles de déplacement, etc.).
- **JavaScript & HTML5** : Logique de jeu, gestion des événements et des tirs.

---

## 📂 Structure du projet

```text
├── assets/
│   ├── models/       # Modèles 3D (ex: gun.glb)
│   └── sounds/       # Effets sonores (ex: hit.mp3)
├── css/
│   └── style.css     # Styles de l'interface
├── js/
│   └── script.js     # Logique des tirs et génération des cibles
└── index.html        # Scène principale A-Frame
