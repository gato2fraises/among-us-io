# 🗺️ Éditeur de Cartes Among Us .io

## Fonctionnalités Avancées Implémentées

### ✅ 1. Tâches Interactives avec Mini-jeux Complexes
- **ElectricalPuzzle** : Puzzle de connexion de câbles avec drag-and-drop
- **MedbayScanner** : Simulation de scan médical avec signes vitaux
- **WeaponsTargeting** : Mini-jeu de tir spatial avec cibles mobiles
- **ShieldsCalibration** : Système de charge d'énergie hexagonal
- **NavigationStabilizer** : Jeu de stabilisation avec suivi de souris
- **Système modulaire** : Facile d'ajouter de nouveaux mini-jeux

### ✅ 2. Éditeur de Cartes Personnalisées
- **Interface complète** : Barre d'outils, panneau latéral, canvas interactif
- **Outils de dessin** :
  - 🏠 Création de salles (rectangulaires)
  - 🚪 Couloirs personnalisables
  - 🚀 Points d'apparition
  - ⚡ Positions de tâches
  - 🌪️ Bouches d'aération
  - 🗑️ Outil d'effacement
- **Navigation** : Zoom, déplacement, grille d'alignement
- **Historique** : Undo/Redo avec 50 niveaux
- **Sauvegarde** : Export JSON + localStorage
- **Test** : Test direct dans le jeu

### 🔄 3. Système Multijoueur (Prêt)
- **Architecture complète** : Node.js + Express + Socket.io
- **Fonctionnalités** :
  - Salles de jeu
  - Synchronisation temps réel
  - Chat intégré
  - Gestion des votes
  - États de jeu partagés
- **Statut** : Code complet, nécessite installation Node.js

### 🎯 4. Mode Tournoi et Classements (En cours)
- **Système ELO** : Calcul de classement basé sur les performances
- **Tournois** : Élimination simple/double, tournois suisses
- **Statistiques** : Win rate, temps de survie, tâches complétées
- **Historique** : Sauvegarde des parties jouées

### 📹 5. Système de Replay (En cours)
- **Enregistrement** : Capture des mouvements et actions
- **Lecture** : Visualisation des parties complètes
- **Contrôles** : Play/pause, vitesse, timeline
- **Export** : Partage des replays spectaculaires

## Comment utiliser l'Éditeur de Cartes

### 1. Ouvrir l'éditeur
- Cliquez sur "🗺️ Éditeur de Cartes" dans le menu principal
- L'interface de l'éditeur s'ouvre en plein écran

### 2. Créer une carte
1. **Propriétés** : Définissez nom, taille et couleur de fond
2. **Salles** : Sélectionnez l'outil "Salle" et dessinez en cliquant-glissant
3. **Couloirs** : Connectez les salles avec l'outil "Couloir"
4. **Points spéciaux** : Ajoutez spawns, tâches et vents en cliquant
5. **Navigation** : Utilisez zoom et déplacement pour naviguer

### 3. Outils disponibles
- **🏠 Salle** : Dessinez des rectangles pour les salles
- **🚪 Couloir** : Tracez des chemins entre les salles
- **🚀 Spawn** : Marquez les points d'apparition des joueurs
- **⚡ Tâche** : Placez les positions de tâches
- **🌪️ Vent** : Ajoutez des bouches d'aération
- **🗑️ Effacer** : Supprimez des éléments

### 4. Sauvegarder et partager
- **💾 Save** : Sauvegarde locale + téléchargement JSON
- **📁 Load** : Charge un fichier de carte
- **📤 Export** : Exporte pour utilisation dans le jeu
- **▶️ Test** : Teste immédiatement la carte

### 5. Navigation et contrôles
- **Zoom** : Molette ou boutons +/-
- **Déplacement** : Ctrl+clic ou molette centrale
- **Undo/Redo** : Ctrl+Z / Ctrl+Y
- **Supprimer** : Sélection + touche Delete

## Architecture Technique

### Structure des Fichiers
```
jeux .io/
├── index.html              # Page principale
├── game.js                 # Moteur de jeu principal
├── maps.js                 # Cartes par défaut
├── task-minigames.js       # Système de mini-jeux
├── map-editor.js           # Éditeur de cartes
├── server.js               # Serveur multijoueur
├── multiplayer-game.js     # Client multijoueur
├── multiplayer.html        # Interface multijoueur
└── package.json           # Dépendances Node.js
```

### Classes Principales
- **AmongUsGame** : Moteur principal du jeu
- **TaskMinigames** : Gestionnaire des mini-jeux interactifs
- **MapEditor** : Éditeur visuel de cartes
- **MultiplayerGame** : Client pour mode multijoueur

### Format des Cartes
```json
{
  "id": "custom_123456789",
  "name": "Ma Carte",
  "width": 2400,
  "height": 1600,
  "rooms": [
    {
      "name": "Cafétéria",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 150,
      "color": "#444444"
    }
  ],
  "spawnPoints": [
    { "x": 1200, "y": 800 }
  ],
  "taskPositions": [
    { "x": 150, "y": 150, "type": "generic" }
  ],
  "vents": [
    { "x": 300, "y": 300, "connections": [] }
  ]
}
```

## Prochaines Étapes

### Immédiat
1. ✅ Finaliser l'éditeur de cartes
2. 🔄 Implémenter le système de tournois
3. 🔄 Ajouter le système de replay
4. 🔄 Installer Node.js pour tester le multijoueur

### Améliorations Futures
- **Éditeur avancé** : Formes personnalisées, textures, décors
- **Mini-jeux** : Plus de types (Simon, Labyrinthe, Puzzle)
- **Multijoueur** : Rooms privées, modération, anti-triche
- **Mobile** : Support tactile et responsive
- **Audio** : Effets sonores et musique d'ambiance

## Installation et Lancement

### Mode Solo (Fonctionnel)
1. Ouvrez `index.html` dans un navigateur
2. Profitez des mini-jeux et de l'éditeur !

### Mode Multijoueur (Nécessite Node.js)
1. Installez Node.js
2. `npm install` dans le dossier du projet
3. `node server.js` pour démarrer le serveur
4. Ouvrez `multiplayer.html`

## Crédits
- **Développement** : GitHub Copilot Agent
- **Inspiré par** : Among Us (InnerSloth)
- **Technologies** : HTML5 Canvas, WebSockets, Node.js