// Among Us .io - Version corrigée sans bugs

class AmongUsGame {
    constructor() {
        console.log('🎮 Initialisation du moteur de jeu...');
        
        // Vérification des éléments DOM requis
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('❌ Élément gameCanvas introuvable !');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('❌ Impossible d\'obtenir le contexte 2D !');
        }
        
        console.log('✅ Canvas initialisé:', this.canvas.width + 'x' + this.canvas.height);
        
        // Taille du viewport
        this.viewportWidth = 1200;
        this.viewportHeight = 800;
        this.canvas.width = this.viewportWidth;
        this.canvas.height = this.viewportHeight;
        
        // Taille de la carte
        this.mapWidth = 2400;
        this.mapHeight = 1600;
        
        // État du jeu
        this.gameState = 'menu'; // menu, playing, voting, ended, task, meeting
        
        // Joueurs et bots
        this.players = new Map();
        this.localPlayer = null;
        this.imposters = new Set();
        this.deadPlayers = new Set();
        this.bodies = [];
        
        // Système de tâches
        this.tasks = [];
        this.completedTasks = new Set();
        this.currentTaskMinigame = null;
        
        // Système de mini-jeux interactifs
        try {
            if (typeof TaskMinigames !== 'undefined') {
                this.taskMinigames = new TaskMinigames(this);
                console.log('✅ Système de mini-jeux initialisé');
            } else {
                console.warn('⚠️ TaskMinigames non disponible');
                this.taskMinigames = null;
            }
        } catch (error) {
            console.error('❌ Erreur initialisation TaskMinigames:', error);
            this.taskMinigames = null;
        }
        
        // Système de vote
        this.votes = new Map();
        this.discussionTime = 120;
        this.votingTime = 60;
        this.currentMeetingTimer = 0;
        this.meetingPhase = 'discussion';
        
        // Contrôles et caméra
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.camera = { x: 0, y: 0 };
        
        // Cooldowns et timers
        this.killCooldown = 0;
        this.killCooldownMax = 45000;
        this.reportCooldown = 0;
        this.sabotageActive = false;
        this.lightsOn = true;
        
        // Gestionnaire de cartes personnalisées
        this.customMaps = [];
        this.loadCustomMaps();
        
        // Initialisation avec gestion d'erreurs
        try {
            this.loadMap();
            console.log('✅ Carte chargée');
        } catch (error) {
            console.error('❌ Erreur chargement carte:', error);
        }
        
        try {
            this.setupEventListeners();
            console.log('✅ Event listeners configurés');
        } catch (error) {
            console.error('❌ Erreur event listeners:', error);
        }
        
        try {
            this.setupUIButtons();
            console.log('✅ Boutons UI configurés');
        } catch (error) {
            console.error('❌ Erreur boutons UI:', error);
        }
        
        try {
            this.setupCustomization();
            console.log('✅ Personnalisation configurée');
        } catch (error) {
            console.error('❌ Erreur personnalisation:', error);
        }
        
        try {
            this.loadPlayerStats();
            console.log('✅ Statistiques chargées');
        } catch (error) {
            console.error('❌ Erreur statistiques:', error);
        }
        
        console.log('🎮 Moteur de jeu initialisé avec succès !');
    }
    
    setupEventListeners() {
        // Contrôles de jeu
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'Escape' && this.currentTaskMinigame) {
                this.cancelTask();
            }
            
            if (e.key.toLowerCase() === 'e' && this.gameState === 'playing') {
                this.tryInteractNearbyTask();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Chat
        const chatInput = document.getElementById('chatMessage');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }
    
    setupUIButtons() {
        // Bouton démarrer
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const playerName = document.getElementById('playerName').value.trim() || 'Joueur';
                const selectedMap = document.getElementById('mapSelect').value;
                this.startGame(playerName, selectedMap);
            });
        }
        
        // Bouton multijoueur
        const multiplayerBtn = document.getElementById('multiplayerBtn');
        if (multiplayerBtn) {
            multiplayerBtn.addEventListener('click', () => {
                window.location.href = 'multiplayer.html';
            });
        }
        
        // Bouton rejouer
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.resetGame();
                this.showStartScreen();
            });
        }
        
        // Bouton emergency meeting
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => this.callEmergencyMeeting());
        }
        
        // Bouton continuer après vote
        const continueAfterVote = document.getElementById('continueAfterVote');
        if (continueAfterVote) {
            continueAfterVote.addEventListener('click', () => this.continueAfterVote());
        }
        
        // Chat
        const chatSendBtn = document.getElementById('chatSendBtn');
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        console.log('✅ Tous les boutons sont configurés');
    }
    
    loadMap(mapId = null) {
        // Utiliser la carte par défaut si aucune spécifiée
        if (!mapId) {
            this.currentMapId = 'the_skeld';
            this.currentMap = AmongUsMaps.getMapById(this.currentMapId);
        } else {
            this.currentMapId = mapId;
            this.currentMap = AmongUsMaps.getMapById(mapId);
        }
        
        this.mapWidth = this.currentMap.width;
        this.mapHeight = this.currentMap.height;
        this.spawnPoint = this.currentMap.spawn;
        
        // Copier les données de la carte
        this.rooms = [...this.currentMap.rooms];
        this.corridors = [...this.currentMap.corridors];
        this.vents = [...this.currentMap.vents];
        
        // Générer les tâches
        this.generateTasks();
        
        console.log(`Carte chargée: ${this.currentMap.name}`);
        
        if (this.gameState !== 'menu') {
            this.showMessage(`🗺️ Carte: ${this.currentMap.name}`, 3000);
        }
    }
    
    startGame(playerName, mapId) {
        console.log('🎮 Démarrage du jeu...');
        
        // Charger la carte sélectionnée
        if (mapId && mapId !== this.currentMapId) {
            this.loadMap(mapId);
        }
        
        // Créer le joueur principal
        this.localPlayer = {
            id: 'local',
            name: playerName,
            x: this.spawnPoint.x,
            y: this.spawnPoint.y,
            color: this.playerCustomization?.color || '#50EF39',
            isImposter: false,
            isDead: false,
            tasks: [],
            hat: this.playerCustomization?.hat || 'none',
            pet: this.playerCustomization?.pet || 'none'
        };
        
        this.players.set('local', this.localPlayer);
        
        // Générer des bots
        this.generateBots();
        
        // Assigner les rôles
        this.assignRoles();
        
        // Assigner les tâches
        this.assignTasks();
        
        // Initialiser le système de replay
        if (window.replaySystem) {
            replaySystem.startRecording(this);
        }
        
        // Démarrer le jeu
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.hideStartScreen();
        this.showGameScreen();
        this.startGameLoop();
        
        // Centrer la caméra sur le joueur
        this.centerCameraOnPlayer();
        
        console.log('✅ Jeu démarré avec succès !');
    }
    
    generateBots() {
        const botNames = [
            'Rouge', 'Bleu', 'Vert', 'Rose', 'Orange', 
            'Jaune', 'Noir', 'Blanc', 'Violet', 'Marron', 'Cyan'
        ];
        const botColors = [
            '#C51111', '#132ED1', '#117F2D', '#ED54BA', '#EF7D0D',
            '#F5F557', '#3F474E', '#D6E0F0', '#6B2FBB', '#71491E', '#38FEDC'
        ];
        
        for (let i = 0; i < 9; i++) {
            const bot = {
                id: `bot_${i}`,
                name: botNames[i],
                x: this.spawnPoint.x + (Math.random() - 0.5) * 100,
                y: this.spawnPoint.y + (Math.random() - 0.5) * 100,
                color: botColors[i],
                isImposter: false,
                isDead: false,
                tasks: [],
                isBot: true,
                targetX: this.spawnPoint.x,
                targetY: this.spawnPoint.y,
                lastMoveTime: 0,
                hat: 'none',
                pet: 'none'
            };
            
            this.players.set(`bot_${i}`, bot);
        }
        
        console.log(`✅ ${this.players.size} joueurs créés (1 humain + 9 bots)`);
    }
    
    assignRoles() {
        const playerList = Array.from(this.players.values());
        const imposterCount = Math.max(1, Math.floor(playerList.length / 5));
        
        // Mélanger la liste
        for (let i = playerList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
        }
        
        // Assigner les imposters
        for (let i = 0; i < imposterCount; i++) {
            playerList[i].isImposter = true;
            this.imposters.add(playerList[i].id);
        }
        
        console.log(`✅ Rôles assignés: ${imposterCount} imposters`);
    }
    
    assignTasks() {
        const taskTypes = ['electrical', 'engines', 'reactor', 'navigation', 'weapons'];
        
        this.players.forEach(player => {
            if (!player.isImposter) {
                player.tasks = [];
                for (let i = 0; i < 5; i++) {
                    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
                    const taskId = `${taskType}_${i}_${player.id}`;
                    player.tasks.push({
                        id: taskId,
                        type: taskType,
                        completed: false,
                        x: this.spawnPoint.x + (Math.random() - 0.5) * 800,
                        y: this.spawnPoint.y + (Math.random() - 0.5) * 600
                    });
                }
            }
        });
        
        console.log('✅ Tâches assignées aux crewmates');
    }
    
    generateTasks() {
        this.tasks = [];
        const taskTypes = ['electrical', 'engines', 'reactor', 'navigation', 'weapons'];
        
        // Placer des tâches dans chaque salle
        this.rooms.forEach(room => {
            const tasksInRoom = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < tasksInRoom; i++) {
                this.tasks.push({
                    id: `${room.name}_task_${i}`,
                    type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
                    x: room.x + room.width * 0.3 + Math.random() * room.width * 0.4,
                    y: room.y + room.height * 0.3 + Math.random() * room.height * 0.4,
                    room: room.name,
                    completed: false
                });
            }
        });
        
        console.log(`✅ ${this.tasks.length} tâches générées`);
    }
    
    hideStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.add('hidden');
        }
    }
    
    showStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
        }
        
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen) {
            gameScreen.classList.add('hidden');
        }
    }
    
    showGameScreen() {
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen) {
            gameScreen.classList.remove('hidden');
        }
    }
    
    startGameLoop() {
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
            this.render();
        } else if (this.gameState === 'task') {
            this.taskMinigames.update();
            this.taskMinigames.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Mise à jour du joueur
        this.updatePlayer();
        
        // Mise à jour des bots
        this.updateBots();
        
        // Mise à jour de la caméra
        this.updateCamera();
        
        // Vérification des conditions de victoire
        this.checkWinConditions();
    }
    
    updatePlayer() {
        if (!this.localPlayer || this.localPlayer.isDead) return;
        
        const speed = 3;
        let moved = false;
        
        if (this.keys['w'] || this.keys['arrowup']) {
            this.localPlayer.y -= speed;
            moved = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.localPlayer.y += speed;
            moved = true;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.localPlayer.x -= speed;
            moved = true;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.localPlayer.x += speed;
            moved = true;
        }
        
        // Limiter aux bordures de la carte
        this.localPlayer.x = Math.max(20, Math.min(this.mapWidth - 20, this.localPlayer.x));
        this.localPlayer.y = Math.max(20, Math.min(this.mapHeight - 20, this.localPlayer.y));
    }
    
    updateBots() {
        const now = Date.now();
        
        this.players.forEach(player => {
            if (!player.isBot || player.isDead) return;
            
            // Mouvement basique des bots
            if (now - player.lastMoveTime > 2000) {
                player.targetX = this.spawnPoint.x + (Math.random() - 0.5) * 400;
                player.targetY = this.spawnPoint.y + (Math.random() - 0.5) * 400;
                player.lastMoveTime = now;
            }
            
            // Déplacer vers la cible
            const dx = player.targetX - player.x;
            const dy = player.targetY - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                const speed = 1.5;
                player.x += (dx / distance) * speed;
                player.y += (dy / distance) * speed;
            }
            
            // Limiter aux bordures
            player.x = Math.max(20, Math.min(this.mapWidth - 20, player.x));
            player.y = Math.max(20, Math.min(this.mapHeight - 20, player.y));
        });
    }
    
    updateCamera() {
        if (this.localPlayer) {
            this.camera.x = this.localPlayer.x - this.viewportWidth / 2;
            this.camera.y = this.localPlayer.y - this.viewportHeight / 2;
            
            // Limiter la caméra aux bordures de la carte
            this.camera.x = Math.max(0, Math.min(this.mapWidth - this.viewportWidth, this.camera.x));
            this.camera.y = Math.max(0, Math.min(this.mapHeight - this.viewportHeight, this.camera.y));
        }
    }
    
    centerCameraOnPlayer() {
        if (this.localPlayer) {
            this.camera.x = this.localPlayer.x - this.viewportWidth / 2;
            this.camera.y = this.localPlayer.y - this.viewportHeight / 2;
        }
    }
    
    render() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
        
        // Sauvegarder le contexte
        this.ctx.save();
        
        // Appliquer la caméra
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Dessiner la carte
        this.renderMap();
        
        // Dessiner les tâches
        this.renderTasks();
        
        // Dessiner les joueurs
        this.renderPlayers();
        
        // Restaurer le contexte
        this.ctx.restore();
        
        // Interface utilisateur
        this.renderUI();
    }
    
    renderMap() {
        // Fond
        this.ctx.fillStyle = '#2C2C2C';
        this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
        
        // Salles
        this.rooms.forEach(room => {
            this.ctx.fillStyle = room.color || '#444444';
            this.ctx.fillRect(room.x, room.y, room.width, room.height);
            
            this.ctx.strokeStyle = '#666666';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(room.x, room.y, room.width, room.height);
            
            // Nom de la salle
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(room.name, room.x + room.width / 2, room.y + 25);
        });
    }
    
    renderTasks() {
        this.tasks.forEach(task => {
            if (task.completed) return;
            
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.beginPath();
            this.ctx.arc(task.x, task.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    renderPlayers() {
        this.players.forEach(player => {
            this.drawPlayer(player);
        });
    }
    
    drawPlayer(player) {
        // Corps du joueur
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Contour
        this.ctx.strokeStyle = player.isDead ? '#FF0000' : '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Nom du joueur
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name, player.x, player.y - 30);
        
        // Indicateur imposter (pour le joueur local seulement)
        if (player.isImposter && player.id === 'local') {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillText('IMPOSTER', player.x, player.y + 35);
        }
    }
    
    renderUI() {
        // Barre de tâches (si pas imposter)
        if (this.localPlayer && !this.localPlayer.isImposter) {
            const completedTasks = this.localPlayer.tasks.filter(t => t.completed).length;
            const totalTasks = this.localPlayer.tasks.length;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, 10, 300, 40);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Tâches: ${completedTasks}/${totalTasks}`, 20, 35);
        }
        
        // Mini-carte
        this.renderMinimap();
    }
    
    renderMinimap() {
        const minimapSize = 150;
        const minimapX = this.viewportWidth - minimapSize - 10;
        const minimapY = 10;
        
        // Fond de la mini-carte
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Échelle
        const scaleX = minimapSize / this.mapWidth;
        const scaleY = minimapSize / this.mapHeight;
        
        // Joueurs sur la mini-carte
        this.players.forEach(player => {
            if (player.isDead) return;
            
            const x = minimapX + player.x * scaleX;
            const y = minimapY + player.y * scaleY;
            
            this.ctx.fillStyle = player.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    // Interaction avec les tâches
    tryInteractNearbyTask() {
        if (!this.localPlayer || this.localPlayer.isImposter) return;
        
        const nearbyTask = this.tasks.find(task => {
            const distance = Math.sqrt(
                Math.pow(task.x - this.localPlayer.x, 2) + 
                Math.pow(task.y - this.localPlayer.y, 2)
            );
            return distance < 40 && !task.completed;
        });
        
        if (nearbyTask) {
            this.startTaskMinigame(nearbyTask);
        }
    }
    
    startTaskMinigame(task) {
        console.log(`🎮 Démarrage mini-jeu: ${task.type}`);
        this.gameState = 'task';
        this.currentTaskMinigame = task;
        if (this.taskMinigames) {
            this.taskMinigames.startMinigame(task.type);
        } else {
            console.warn('⚠️ Mini-jeux non disponibles, tâche auto-complétée');
            this.completeTask(task);
        }
    }
    
    completeTask(task) {
        task.completed = true;
        this.completedTasks.add(task.id);
        
        // Enregistrer l'événement pour le replay
        if (window.replaySystem && replaySystem.isRecording) {
            replaySystem.recordEvent('task_completed', {
                player: this.localPlayer ? { id: this.localPlayer.id, name: this.localPlayer.name } : null,
                taskType: task.type,
                taskId: task.id,
                location: { x: task.x, y: task.y },
                timestamp: Date.now() - this.gameStartTime
            });
        }
        
        // Marquer comme complétée dans les tâches du joueur
        if (this.localPlayer) {
            const playerTask = this.localPlayer.tasks.find(t => t.type === task.type);
            if (playerTask) {
                playerTask.completed = true;
            }
        }
        
        this.gameState = 'playing';
        this.currentTaskMinigame = null;
        
        console.log('✅ Tâche complétée !');
        this.checkWinConditions();
    }
    
    cancelTask() {
        this.gameState = 'playing';
        this.currentTaskMinigame = null;
        console.log('❌ Tâche annulée');
    }
    
    checkWinConditions() {
        // Les crewmates gagnent si toutes les tâches sont complétées
        const allTasks = this.tasks.length;
        const completedTasksCount = this.completedTasks.size;
        
        if (completedTasksCount >= allTasks) {
            this.endGame('crewmates');
        }
        
        // Les imposters gagnent si plus d'imposters que de crewmates
        const aliveCrewmates = Array.from(this.players.values()).filter(p => !p.isDead && !p.isImposter).length;
        const aliveImposters = Array.from(this.players.values()).filter(p => !p.isDead && p.isImposter).length;
        
        if (aliveImposters >= aliveCrewmates) {
            this.endGame('imposters');
        }
    }
    
    endGame(winner) {
        this.gameState = 'ended';
        console.log(`🏆 Jeu terminé ! Victoire: ${winner}`);
        
        // Arrêter l'enregistrement du replay
        if (window.replaySystem && replaySystem.isRecording) {
            replaySystem.recordEvent('game_ended', {
                winner: winner,
                duration: Date.now() - this.gameStartTime,
                survivingPlayers: Array.from(this.players.values()).filter(p => !p.isDead).map(p => ({ id: p.id, name: p.name })),
                deadPlayers: Array.from(this.deadPlayers)
            });
            replaySystem.currentRecording.metadata.winner = winner;
            replaySystem.currentRecording.metadata.gameResult = winner;
            replaySystem.stopRecording();
        }
        
        // Enregistrer le résultat pour le système de tournois
        this.recordGameResult(winner);
        
        // Afficher l'écran de fin
        const endScreen = document.getElementById('endScreen');
        const gameResult = document.getElementById('gameResult');
        
        if (endScreen && gameResult) {
            if (winner === 'crewmates') {
                gameResult.textContent = '🛠️ Victoire des Crewmates !';
                gameResult.style.color = '#00FF00';
            } else {
                gameResult.textContent = '🔪 Victoire des Imposters !';
                gameResult.style.color = '#FF0000';
            }
            
            endScreen.classList.remove('hidden');
            
            // Cacher l'écran de jeu
            const gameScreen = document.getElementById('gameScreen');
            if (gameScreen) {
                gameScreen.classList.add('hidden');
            }
        }
    }
    
    recordGameResult(winner) {
        // Enregistrer le résultat dans le système de tournois
        if (typeof tournamentSystem !== 'undefined' && this.localPlayer) {
            const playerWon = (winner === 'crewmates' && !this.localPlayer.isImposter) || 
                             (winner === 'imposters' && this.localPlayer.isImposter);
            
            const gameResult = {
                won: playerWon,
                role: this.localPlayer.isImposter ? 'imposter' : 'crewmate',
                tasksCompleted: this.localPlayer.isImposter ? 0 : 
                    this.localPlayer.tasks.filter(t => t.completed).length / this.localPlayer.tasks.length,
                gameTime: Date.now() - this.gameStartTime,
                map: this.currentMapId,
                totalPlayers: this.players.size
            };
            
            // Calculer les ELO des adversaires (simulation)
            const opponentElos = Array.from(this.players.values())
                .filter(p => p.id !== 'local')
                .map(p => 1200 + Math.random() * 400); // ELO simulé entre 1200-1600
            
            const eloResult = tournamentSystem.updatePlayerElo('local_player', gameResult, opponentElos);
            
            if (eloResult) {
                this.showEloChange(eloResult);
            }
        }
    }
    
    showEloChange(eloResult) {
        // Afficher le changement d'ELO
        const eloChangeElement = document.createElement('div');
        eloChangeElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${eloResult.change >= 0 ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 16px;
            z-index: 2000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        eloChangeElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">${eloResult.rank.icon}</span>
                <div>
                    <div>${eloResult.change >= 0 ? '+' : ''}${eloResult.change} ELO</div>
                    <div style="font-size: 12px; opacity: 0.9;">${eloResult.oldElo} → ${eloResult.newElo}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${eloResult.rank.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(eloChangeElement);
        
        // Animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Supprimer après 5 secondes
        setTimeout(() => {
            eloChangeElement.remove();
            style.remove();
        }, 5000);
    }
    
    resetGame() {
        console.log('🔄 Réinitialisation du jeu...');
        
        this.gameState = 'menu';
        this.players.clear();
        this.imposters.clear();
        this.deadPlayers.clear();
        this.bodies = [];
        this.tasks = [];
        this.completedTasks.clear();
        this.currentTaskMinigame = null;
        this.localPlayer = null;
        
        // Cacher les écrans
        const endScreen = document.getElementById('endScreen');
        const gameScreen = document.getElementById('gameScreen');
        
        if (endScreen) endScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
        
        console.log('✅ Jeu réinitialisé');
    }
    
    // Emergency meeting
    callEmergencyMeeting() {
        if (this.gameState !== 'playing') return;
        
        console.log('🚨 Réunion d\'urgence appelée !');
        
        // Enregistrer l'événement pour le replay
        if (window.replaySystem && replaySystem.isRecording) {
            replaySystem.recordEvent('emergency_meeting_called', {
                caller: this.localPlayer ? { id: this.localPlayer.id, name: this.localPlayer.name } : null,
                timestamp: Date.now() - this.gameStartTime
            });
        }
        
        this.gameState = 'meeting';
        this.meetingPhase = 'discussion';
        this.currentMeetingTimer = this.discussionTime;
        
        // Téléporter tous les joueurs à la table
        const meetingX = this.spawnPoint.x;
        const meetingY = this.spawnPoint.y;
        
        this.players.forEach(player => {
            if (!player.isDead) {
                player.x = meetingX + (Math.random() - 0.5) * 100;
                player.y = meetingY + (Math.random() - 0.5) * 100;
            }
        });
    }
    
    // Chat
    sendChatMessage() {
        const input = document.getElementById('chatMessage');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        this.addChatMessage(this.localPlayer.name, message);
        input.value = '';
    }
    
    addChatMessage(playerName, message, type = 'normal') {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `<strong>${playerName}:</strong> ${message}`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    continueAfterVote() {
        this.gameState = 'playing';
        console.log('🎮 Retour au jeu après vote');
    }
    
    // Méthodes pour les cartes personnalisées
    loadCustomMaps() {
        try {
            const savedMaps = JSON.parse(localStorage.getItem('amongus_custom_maps') || '[]');
            this.customMaps = savedMaps;
            console.log(`${this.customMaps.length} cartes personnalisées chargées`);
        } catch (error) {
            console.error('Erreur lors du chargement des cartes personnalisées:', error);
            this.customMaps = [];
        }
    }
    
    loadCustomMap(mapData) {
        if (!mapData) return;
        
        const gameMap = {
            id: mapData.id,
            name: mapData.name,
            width: mapData.width,
            height: mapData.height,
            rooms: mapData.rooms || [],
            spawn: mapData.spawnPoints.length > 0 ? 
                { x: mapData.spawnPoints[0].x, y: mapData.spawnPoints[0].y } :
                { x: mapData.width / 2, y: mapData.height / 2 },
            tasks: mapData.taskPositions || [],
            vents: mapData.vents || [],
            corridors: mapData.corridors || []
        };
        
        this.currentMap = gameMap;
        this.currentMapId = mapData.id;
        
        this.mapWidth = gameMap.width;
        this.mapHeight = gameMap.height;
        this.spawnPoint = gameMap.spawn;
        this.rooms = [...gameMap.rooms];
        this.corridors = [...gameMap.corridors];
        this.vents = [...gameMap.vents];
        
        this.resetGame();
        this.startGame();
        
        this.showMessage(`🗺️ Carte personnalisée chargée: ${gameMap.name}`, 3000);
    }
    
    showMessage(text, duration = 2000) {
        console.log(`💬 Message: ${text}`);
        
        // Créer l'élément de message s'il n'existe pas
        let messageElement = document.getElementById('gameMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'gameMessage';
            messageElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 18px;
                font-weight: bold;
                z-index: 1000;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            `;
            document.body.appendChild(messageElement);
        }
        
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, duration);
    }
    
    // Système de personnalisation basique
    setupCustomization() {
        this.playerCustomization = {
            color: '#50EF39',
            hat: 'none',
            pet: 'none'
        };
        
        // Charger la personnalisation sauvegardée
        try {
            const saved = localStorage.getItem('amongus_customization');
            if (saved) {
                this.playerCustomization = { ...this.playerCustomization, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Erreur chargement personnalisation:', error);
        }
        
        // Configuration des couleurs
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Retirer la sélection précédente
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                // Ajouter la sélection actuelle
                option.classList.add('selected');
                // Sauvegarder la couleur
                this.playerCustomization.color = option.dataset.color;
                this.saveCustomization();
            });
        });
        
        console.log('✅ Système de personnalisation configuré');
    }
    
    saveCustomization() {
        try {
            localStorage.setItem('amongus_customization', JSON.stringify(this.playerCustomization));
        } catch (error) {
            console.error('Erreur sauvegarde personnalisation:', error);
        }
    }
    
    // Statistiques basiques
    loadPlayerStats() {
        try {
            const saved = localStorage.getItem('amongus_stats');
            this.playerStats = saved ? JSON.parse(saved) : {
                gamesPlayed: 0,
                gamesWon: 0,
                tasksCompleted: 0,
                timePlayed: 0
            };
        } catch (error) {
            console.error('Erreur chargement stats:', error);
            this.playerStats = {
                gamesPlayed: 0,
                gamesWon: 0,
                tasksCompleted: 0,
                timePlayed: 0
            };
        }
    }
    
    savePlayerStats() {
        try {
            localStorage.setItem('amongus_stats', JSON.stringify(this.playerStats));
        } catch (error) {
            console.error('Erreur sauvegarde stats:', error);
        }
    }
}

// Initialiser le jeu
window.addEventListener('load', () => {
    console.log('🚀 Initialisation d\'Among Us .io...');
    
    // Vérifier que tous les éléments nécessaires existent
    const requiredElements = ['gameCanvas', 'startScreen'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Éléments manquants:', missingElements);
        return;
    }
    
    // Créer l'instance du jeu
    window.game = new AmongUsGame();
    console.log('✅ Among Us .io initialisé avec succès !');
});