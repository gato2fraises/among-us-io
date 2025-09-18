# 🚀 Among Us .io - Jeu Multijoueur Complet# 🚀 Among Us .io



## 🎮 DescriptionUn jeu multijoueur inspiré d'Among Us, créé en HTML5 Canvas avec JavaScript vanilla.



Among Us .io est une version complète et étendue du célèbre jeu Among Us, développée en HTML5/JavaScript avec des fonctionnalités avancées :## 🎮 Comment jouer



- **5 systèmes de jeu complets** : Solo, multijoueur, éditeur, tournois, replays### Pour les Crewmates (👨‍🚀)

- **Interface moderne** : Design responsive avec animations fluides- **Objectif** : Accomplir toutes les tâches assignées ou éliminer tous les imposteurs

- **Mini-jeux interactifs** : 5 types de tâches complexes avec mécaniques uniques- **Mouvement** : Utilisez WASD ou les flèches directionnelles

- **Éditeur de cartes** : Création et personnalisation complète des niveaux- **Tâches** : Approchez-vous des points jaunes pour accomplir les tâches automatiquement

- **Système de tournois** : Classements ELO et compétitions organisées- **Survie** : Évitez les imposteurs et restez en groupe si possible

- **Replays avancés** : Enregistrement et lecture des parties

### Pour les Imposteurs (🔪)

## 📁 Structure du Projet- **Objectif** : Éliminer tous les crewmates sans être découvert

- **Mouvement** : Utilisez WASD ou les flèches directionnelles  

```- **Kill** : Cliquez sur le bouton "KILL" quand vous êtes près d'un crewmate

jeux .io/- **Cooldown** : Attendez 30 secondes entre chaque élimination

├── index.html                    # Page principale du jeu- **Sabotage** : Cliquez sur le bouton "🔧 SABOTAGE" pour perturber les crewmates

├── package.json                  # Configuration Node.js- **Identification** : Les autres imposteurs sont marqués d'un 🔪 rouge

├── src/                          # Code source

│   ├── game.js                   # Moteur de jeu principal### 🎮 Contrôles Avancés

│   ├── maps.js                   # Cartes par défaut (Skeld, Mira, Polus)- **F** : Activer/désactiver le mode debug (affiche position, couloirs, etc.)

│   ├── task-minigames.js         # Système de mini-jeux interactifs- **M** : Activer/désactiver les effets sonores

│   ├── map-editor.js             # Éditeur de cartes avancé- **🚨 Bouton Réunion d'urgence** : Déclencher un vote (3 utilisations max)

│   ├── tournament-system.js      # Tournois et classements ELO- **Souris** : Navigation et interactions

│   ├── replay-system.js          # Enregistrement et lecture

│   └── server.js                 # Serveur multijoueur Node.js### 🗳️ Système de Vote

├── assets/                       # Ressources statiques- **Réunions d'urgence** : Chaque joueur peut appeler 3 réunions maximum

│   └── style.css                 # Feuilles de style- **Découverte de corps** : Déclenche automatiquement un vote

└── docs/                         # Documentation technique- **Phases de vote** : 30s de discussion + 30s de vote

    ├── CORRECTIONS.md            # Historique des corrections- **Élimination** : Le joueur avec le plus de votes est éliminé

    └── EDITOR_README.md          # Guide de l'éditeur- **Vote égal** : Personne n'est éliminé en cas d'égalité

```

### � Chat en Jeu

## ✨ Fonctionnalités Principales- **Discussion pendant les votes** : Interface de chat pendant les réunions d'urgence

- **Bots interactifs** : Les bots participent automatiquement aux discussions

### 🎯 **Jeu Principal - Solo & IA**- **Historique** : Messages sauvegardés pendant la phase de vote

- **Gameplay authentique** : Crewmates vs Imposters, tâches, votes, éliminations- **Accusations** : Système de votes et d'accusations entre joueurs

- **Intelligence artificielle** : 9 bots avec comportements réalistes

- **3 cartes officielles** : The Skeld, Mira HQ, Polus### 🎨 Personnalisation

- **Personnalisation** : Couleurs, chapeaux, skins sauvegardés- **Couleurs custom** : 16 couleurs de base + sélecteur personnalisé

- **Système de chapeaux** : 8 chapeaux différents disponibles

### 🎲 **Mini-jeux Interactifs**- **Aperçu en temps réel** : Prévisualisation des changements

- **Electrical Puzzle** : Connexion de câbles avec drag-and-drop- **Sauvegarde automatique** : Préférences conservées via localStorage

- **Medbay Scanner** : Simulation médicale avec signes vitaux

- **Weapons Targeting** : Jeu de tir spatial avec cibles mobiles### 📊 Statistiques et Progression

- **Shields Calibration** : Système d'énergie hexagonal complexe- **Statistiques détaillées** : Parties jouées, victoires, éliminations, tâches

- **Navigation Stabilizer** : Stabilisation avec suivi de souris précis- **Système d'achievements** : 12 succès à débloquer

- **Persistance** : Données sauvegardées localement

### 🗺️ **Éditeur de Cartes**- **Écran dédié** : Interface complète accessible depuis le menu

- **Interface complète** : Outils de dessin professionnels

- **Éléments disponibles** : Salles, couloirs, spawns, tâches, vents### 👻 Mode Spectateur

- **Navigation avancée** : Zoom, déplacement, grille d'alignement- **Observation post-mortem** : Continuez à regarder après élimination

- **Historique** : Undo/Redo avec 50 niveaux de sauvegarde- **Caméra libre** : Déplacez-vous librement sur la carte

- **Export/Import** : Partage et sauvegarde des créations- **Suivi automatique** : Camera suit les joueurs vivants

- **Interface adaptée** : Contrôles spécialisés pour spectateurs

### 🏆 **Système de Tournois**

- **Classement ELO** : 7 niveaux (Bronze → Grand Master)### ⚡ Événements et Power-ups

- **Types de tournois** : Élimination simple/double, Round Robin, Swiss- **Événements aléatoires** : Speed Boost, Vision étendue, Mode fantôme, Confusion

- **Statistiques détaillées** : Win rate, temps de survie, performances- **Power-ups collectibles** : Vitesse, Vision, Furtivité, Bouclier

- **Interface complète** : Inscription, brackets, historique- **Effets temporaires** : Améliorations limitées dans le temps

- **Rendu visuel** : Animations et effets de particules

### 🎬 **Système de Replay**

- **Enregistrement automatique** : Toutes les parties sont sauvegardées## 🗺️ Cartes Disponibles

- **Compression intelligente** : Optimisation de l'espace de stockage

- **Lecteur avancé** : Timeline, vitesses variables (0.25x-4x)Le jeu dispose de 5 cartes différentes inspirées d'Among Us :

- **Partage facile** : Export JSON pour partager des moments épiques

- **🚀 The Skeld** - Le vaisseau spatial classique (carte par défaut)

### 🌐 **Mode Multijoueur** (Nécessite Node.js)- **🌙 Mira HQ** - Quartier général dans l'espace

- **Serveur temps réel** : Socket.io pour synchronisation instantanée- **🌎 Polus** - Base de recherche polaire

- **Salles de jeu** : Création et gestion de parties privées- **🔬 The Airship** - Dirigeable de recherche

- **Chat intégré** : Communication entre joueurs- **⚡ Reactor** - Station énergétique

- **Anti-triche** : Validation côté serveur

### Navigation

## 🚀 Installation et Lancement- **Boutons de changement** : Naviguez entre les cartes depuis l'interface

- **Layouts uniques** : Chaque carte a sa propre disposition de salles

### **Mode Solo (Immédiat)**- **Adaptation automatique** : Tâches et gameplay s'adaptent à chaque carte

1. **Téléchargez** le projet complet

2. **Ouvrez** `index.html` dans votre navigateur### 🏢 Salles Principales (The Skeld)

3. **Jouez** immédiatement ! Toutes les fonctionnalités solo sont actives

- **Cafétéria** - Point de spawn principal

### **Mode Multijoueur (Optionnel)**- **Médbay** - Scanner médical

1. **Installez Node.js** depuis [nodejs.org](https://nodejs.org)- **Upper/Lower Engine** - Maintenance des moteurs

2. **Terminal** : `cd "chemin/vers/jeux .io"`- **Electrical** - Réparations électriques

3. **Installation** : `npm install`- **Storage** - Stockage et organisation

4. **Lancement** : `node src/server.js`- **Admin** - Consultation des données

5. **Connexion** : Ouvrez `http://localhost:3000`- **O2** - Purification de l'oxygène

- **Navigation** - Calibrage de navigation

## 🎮 Guide de Jeu- **Weapons** - Nettoyage des armes

- **Shields** - Activation des boucliers

### **Démarrage Rapide**- **Communications** - Réparations de communication

1. **Nom** : Entrez votre pseudonyme

2. **Carte** : Sélectionnez Skeld, Mira ou Polus## 🎯 Fonctionnalités

3. **Rejoindre** : Cliquez "Rejoindre le jeu"

4. **Déplacement** : WASD ou flèches directionnelles- ✅ Mouvement fluide en temps réel avec animations

5. **Interaction** : Touche E près des objets jaunes- ✅ Système de rôles (Crewmate/Imposteur)

- ✅ 12 tâches différentes à accomplir

### **Objectifs par Rôle**- ✅ Mécaniques d'élimination avec cooldown

- **🛠️ Crewmate** : Complétez toutes les tâches ou identifiez les imposteurs- ✅ Minimap en temps réel

- **🔪 Imposter** : Éliminez discrètement tous les crewmates- ✅ IA pour les bots

- **☠️ Fantôme** : Aidez votre équipe en terminant vos tâches- ✅ Conditions de victoire multiples

- ✅ Interface utilisateur intuitive

### **Actions Disponibles**- ✅ **Effets visuels et animations avancés**

- **Tâches** : Appuyez E près des points jaunes → Mini-jeu- ✅ **Système d'effets sonores complet**

- **Emergency** : Bouton rouge pour réunion d'urgence- ✅ **Particules et explosions**

- **Report** : Signalez un corps trouvé- ✅ **Animations de personnages (bobbing, rotation, respiration)**

- **Chat** : Communicuez pendant les réunions- ✅ **Effets de caméra (shake, smooth follow)**

- **Vote** : Éliminez un joueur suspect- ✅ **Textes flottants et notifications**

- ✅ **Animations CSS pour l'interface**

## 🛠️ Fonctionnalités Techniques- ✅ **Sons d'ambiance et feedback audio**

- ✅ **Système de vote et réunions d'urgence complet**

### **Moteur de Jeu**- ✅ **Découverte et signalement de corps**

- **Canvas HTML5** : Rendu 60fps optimisé- ✅ **Interface de vote avec phases de discussion**

- **Architecture modulaire** : Code organisé en classes spécialisées- ✅ **Élimination par vote majoritaire**

- **Sauvegarde locale** : localStorage pour persistance des données- ✅ **Système de sabotage complet (Lumières, Communications, Critique)**

- **Responsive** : Compatible desktop, tablette, mobile- ✅ **Réparation automatique par les bots**

- ✅ **Effets visuels de sabotage et cooldowns**

### **Systèmes Avancés**- ✅ **Chat en jeu pendant les réunions d'urgence**

- **Pathfinding** : IA avec navigation intelligente- ✅ **Skins et personnalisation des personnages (couleurs, chapeaux)**

- **Collision detection** : Physique précise pour tous les objets- ✅ **Statistiques et historique des parties avec localStorage**

- **State management** : Gestion complexe des états de jeu- ✅ **Mode spectateur pour les joueurs éliminés**

- **Event system** : Architecture événementielle scalable- ✅ **Événements spéciaux et power-ups (vitesse, vision, bouclier)**

- ✅ **Système de cartes modulaire avec 5 cartes différentes**

### **Performance**

- **Optimisation** : Rendu conditionnel et culling## 🚀 Installation et Lancement

- **Compression** : Réduction automatique des replays

- **Caching** : Mise en cache des ressources fréquentes1. **Téléchargez les fichiers** dans un dossier

- **Memory management** : Nettoyage automatique des objets2. **Ouvrez `index.html`** dans votre navigateur web

3. **Entrez votre nom** et cliquez sur "Rejoindre le jeu"

## 🎯 Utilisation des Fonctionnalités Avancées4. **Amusez-vous !**



### **🗺️ Créer une Carte Personnalisée**Aucune installation supplémentaire nécessaire - le jeu fonctionne directement dans le navigateur !

1. Menu principal → "🗺️ Éditeur de Cartes"

2. Définir les propriétés (nom, taille)## 🎲 Mécaniques de Jeu

3. Dessiner avec les outils : Salles, couloirs, spawns

4. Sauvegarder et tester directement### Assignation des Rôles

5. Jouer sur votre création !- 30% de chance d'être imposteur

- 25% de chance pour les bots d'être imposteurs

### **🏆 Participer aux Tournois**- 6-9 bots générés automatiquement

1. Menu principal → "🏆 Système de Tournois"  

2. S'inscrire avec un pseudonyme unique### Tâches

3. Rejoindre un tournoi existant ou en créer un- 4-6 tâches assignées aléatoirement aux crewmates

4. Jouer les matchs selon le bracket- Tâches simples et complexes

5. Progresser dans le classement ELO- Completion automatique en s'approchant



### **🎬 Regarder des Replays**### Conditions de Victoire

1. Menu principal → "🎬 Système de Replay"

2. Sélectionner un replay dans la liste**Crewmates gagnent si :**

3. Utiliser les contrôles : play/pause, vitesse- Toutes les tâches sont accomplies

4. Naviguer avec la timeline- Tous les imposteurs sont éliminés

5. Partager les moments épiques

**Imposteurs gagnent si :**

## 📊 État de Développement- Le nombre d'imposteurs ≥ nombre de crewmates



| Fonctionnalité | Statut | Testé | Notes |## 🎨 Technologies Utilisées

|---|---|---|---|

| **Jeu principal** | ✅ 100% | ✅ | Entièrement fonctionnel |- **HTML5 Canvas** pour le rendu graphique

| **Mini-jeux** | ✅ 100% | ✅ | 5 types implémentés |- **JavaScript ES6+** pour la logique de jeu

| **Éditeur de cartes** | ✅ 100% | ✅ | Interface complète |- **CSS3** pour l'interface utilisateur

| **Système de tournois** | ✅ 100% | ✅ | ELO et brackets opérationnels |- **Animations CSS** pour les effets visuels

| **Système de replay** | ✅ 100% | ✅ | Enregistrement et lecture complets |

| **Mode multijoueur** | ✅ 100% | 🔄 | Prêt, nécessite Node.js |## 🔧 Personnalisation



## 🆘 Support et DépannageVous pouvez facilement modifier :

- Les couleurs des joueurs dans `getRandomColor()`

### **Problèmes Fréquents**- La taille de la carte dans les variables `mapWidth` et `mapHeight`

- **Boutons inactifs** : Vérifiez la console (F12) pour erreurs JavaScript- Le cooldown des kills dans `killCooldownMax`

- **Jeu lent** : Fermez les autres onglets, réduisez le zoom navigateur- Les tâches disponibles dans `createTasks()`

- **Sauvegarde échouée** : Vérifiez l'espace disque et les autorisations- La disposition des salles dans `createMap()`



### **Console de Debug**## 🐛 Problèmes Connus

- Appuyez **F12** pour ouvrir les outils développeur

- Onglet **Console** pour voir les messages de debug- Le jeu est actuellement en mode solo avec des bots

- Messages en vert = succès, rouge = erreur- Pas de véritable multijoueur réseau (nécessiterait un serveur)

- Les bots ont une IA très basique

### **Réinitialisation**

- **localStorage** : F12 → Application → Storage → Clear## 🔮 Améliorations Futures

- **Cache** : Ctrl+F5 pour rechargement forcé

- **Paramètres** : Supprimer les cookies du site- [ ] Véritable multijoueur avec WebSockets

- [ ] Tâches interactives avec mini-jeux plus complexes

## 🏅 Crédits et Remerciements- [ ] Nouvelles cartes personnalisées

- [ ] Mode tournoi et classements

- **Développement principal** : GitHub Copilot Agent  - [ ] Système de replay des parties

- **Inspiration** : Among Us par InnerSloth

- **Technologies** : HTML5 Canvas, Node.js, Socket.io, WebRTC---

- **Design** : Interface inspirée du jeu original

**Amusez-vous bien dans l'espace ! 🚀**
## 📝 Changelog

### Version 1.0 (Septembre 2025)
- ✅ **Jeu principal** complet avec IA avancée
- ✅ **Mini-jeux interactifs** - 5 types uniques
- ✅ **Éditeur de cartes** - Création complète
- ✅ **Système de tournois** - ELO et compétitions
- ✅ **Système de replay** - Enregistrement et lecture
- ✅ **Architecture multijoueur** - Prête pour Node.js

## 🎯 Roadmap Future

### Court Terme
- **Audio** : Effets sonores et musique d'ambiance
- **Mobile** : Optimisation tactile complète
- **Cartes** : Plus de cartes officielles

### Long Terme  
- **Mods** : Support de modifications communautaires
- **Spectateur** : Mode observation en temps réel
- **Analytics** : Statistiques avancées de gameplay

---

**🚀 Among Us .io - L'expérience Among Us la plus complète en navigateur !**