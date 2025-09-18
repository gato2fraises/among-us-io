const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Gestion des salles de jeu
class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.gameState = {
            phase: 'lobby', // lobby, playing, meeting, voting
            tasks: [],
            bodies: [],
            votes: new Map(),
            emergencyMeetings: 0,
            sabotages: {},
            events: [],
            powerUps: [],
            startTime: null,
            settings: {
                maxPlayers: 10,
                impostersCount: 2,
                discussionTime: 30,
                votingTime: 30,
                killCooldown: 30,
                emergencyMeetings: 3
            }
        };
        this.gameTimer = null;
        this.voteTimer = null;
    }

    addPlayer(socket, playerData) {
        const player = {
            id: socket.id,
            name: playerData.name,
            color: playerData.color || this.getRandomColor(),
            hat: playerData.hat || 'none',
            x: 400,
            y: 300,
            isImpostor: false,
            isAlive: true,
            tasks: [],
            completedTasks: 0,
            kills: 0,
            votes: 0,
            lastKillTime: 0,
            emergencyMeetingsUsed: 0,
            socket: socket
        };
        
        this.players.set(socket.id, player);
        this.broadcastPlayerUpdate();
        return player;
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
        this.broadcastPlayerUpdate();
        
        // Si plus assez de joueurs, arrêter la partie
        if (this.players.size < 3 && this.gameState.phase === 'playing') {
            this.endGame('insufficient_players');
        }
    }

    startGame() {
        if (this.players.size < 4) {
            return false;
        }

        this.gameState.phase = 'playing';
        this.gameState.startTime = Date.now();
        
        // Assigner les rôles
        this.assignRoles();
        
        // Créer les tâches
        this.createTasks();
        
        // Notifier tous les joueurs
        this.broadcastGameStart();
        
        // Démarrer la boucle de jeu
        this.startGameLoop();
        
        return true;
    }

    assignRoles() {
        const playerIds = Array.from(this.players.keys());
        const impostersCount = Math.min(this.gameState.settings.impostersCount, Math.floor(playerIds.length / 3));
        
        // Mélanger et sélectionner les imposteurs
        const shuffled = playerIds.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < impostersCount; i++) {
            const player = this.players.get(shuffled[i]);
            player.isImpostor = true;
        }
    }

    createTasks() {
        const taskTypes = [
            'electrical', 'medbay', 'weapons', 'shields', 'navigation',
            'admin', 'o2', 'communications', 'storage', 'upperEngine', 'lowerEngine'
        ];
        
        this.players.forEach(player => {
            if (!player.isImpostor) {
                // Assigner 4-6 tâches aléatoires
                const taskCount = Math.floor(Math.random() * 3) + 4;
                player.tasks = [];
                
                for (let i = 0; i < taskCount; i++) {
                    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
                    player.tasks.push({
                        type: taskType,
                        x: this.getTaskPosition(taskType).x,
                        y: this.getTaskPosition(taskType).y,
                        completed: false
                    });
                }
            }
        });
    }

    getTaskPosition(taskType) {
        const positions = {
            electrical: { x: 200, y: 400 },
            medbay: { x: 600, y: 200 },
            weapons: { x: 100, y: 100 },
            shields: { x: 150, y: 300 },
            navigation: { x: 700, y: 150 },
            admin: { x: 500, y: 350 },
            o2: { x: 300, y: 100 },
            communications: { x: 650, y: 450 },
            storage: { x: 450, y: 500 },
            upperEngine: { x: 100, y: 200 },
            lowerEngine: { x: 100, y: 400 }
        };
        return positions[taskType] || { x: 400, y: 300 };
    }

    handlePlayerMovement(socketId, movement) {
        const player = this.players.get(socketId);
        if (!player || !player.isAlive) return;

        player.x = Math.max(50, Math.min(750, movement.x));
        player.y = Math.max(50, Math.min(550, movement.y));
        
        this.broadcastPlayerMovement(player);
    }

    handleKill(killerId, targetId) {
        const killer = this.players.get(killerId);
        const target = this.players.get(targetId);
        
        if (!killer || !target || !killer.isImpostor || !target.isAlive) return;
        
        // Vérifier le cooldown
        const now = Date.now();
        if (now - killer.lastKillTime < this.gameState.settings.killCooldown * 1000) return;
        
        // Vérifier la distance
        const distance = Math.sqrt(
            Math.pow(killer.x - target.x, 2) + Math.pow(killer.y - target.y, 2)
        );
        if (distance > 50) return;
        
        // Effectuer le kill
        target.isAlive = false;
        killer.kills++;
        killer.lastKillTime = now;
        
        // Ajouter le corps
        this.gameState.bodies.push({
            id: Date.now(),
            playerId: targetId,
            x: target.x,
            y: target.y,
            reportedBy: null
        });
        
        this.broadcastKill(killer, target);
        this.checkWinConditions();
    }

    handleEmergencyMeeting(callerId) {
        const caller = this.players.get(callerId);
        if (!caller || !caller.isAlive) return;
        
        if (caller.emergencyMeetingsUsed >= this.gameState.settings.emergencyMeetings) return;
        
        caller.emergencyMeetingsUsed++;
        this.startMeeting('emergency', caller);
    }

    handleBodyReport(reporterId, bodyId) {
        const reporter = this.players.get(reporterId);
        if (!reporter || !reporter.isAlive) return;
        
        const body = this.gameState.bodies.find(b => b.id === bodyId);
        if (!body || body.reportedBy) return;
        
        body.reportedBy = reporterId;
        this.startMeeting('body', reporter, body);
    }

    startMeeting(type, caller, body = null) {
        this.gameState.phase = 'meeting';
        this.gameState.votes.clear();
        
        const meetingData = {
            type,
            caller: caller.name,
            body: body ? this.players.get(body.playerId)?.name : null,
            discussionTime: this.gameState.settings.discussionTime,
            votingTime: this.gameState.settings.votingTime
        };
        
        this.broadcastMeetingStart(meetingData);
        
        // Timer pour la phase de discussion
        setTimeout(() => {
            this.gameState.phase = 'voting';
            this.broadcastVotingStart();
            
            // Timer pour la phase de vote
            this.voteTimer = setTimeout(() => {
                this.endVoting();
            }, this.gameState.settings.votingTime * 1000);
        }, this.gameState.settings.discussionTime * 1000);
    }

    handleVote(voterId, targetId) {
        if (this.gameState.phase !== 'voting') return;
        
        const voter = this.players.get(voterId);
        if (!voter || !voter.isAlive) return;
        
        this.gameState.votes.set(voterId, targetId);
        this.broadcastVoteUpdate();
    }

    endVoting() {
        if (this.voteTimer) {
            clearTimeout(this.voteTimer);
            this.voteTimer = null;
        }
        
        // Compter les votes
        const voteCounts = new Map();
        this.gameState.votes.forEach(targetId => {
            if (targetId === 'skip') {
                voteCounts.set('skip', (voteCounts.get('skip') || 0) + 1);
            } else {
                voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
            }
        });
        
        // Trouver le joueur avec le plus de votes
        let maxVotes = 0;
        let eliminated = null;
        let tie = false;
        
        voteCounts.forEach((votes, playerId) => {
            if (votes > maxVotes) {
                maxVotes = votes;
                eliminated = playerId;
                tie = false;
            } else if (votes === maxVotes && votes > 0) {
                tie = true;
            }
        });
        
        // Éliminer le joueur si pas d'égalité
        if (!tie && eliminated && eliminated !== 'skip') {
            const player = this.players.get(eliminated);
            if (player) {
                player.isAlive = false;
            }
        }
        
        this.broadcastVotingResults(eliminated, tie, voteCounts);
        
        // Retourner au jeu
        setTimeout(() => {
            this.gameState.phase = 'playing';
            this.gameState.votes.clear();
            this.broadcastGameResume();
            this.checkWinConditions();
        }, 5000);
    }

    checkWinConditions() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.isAlive);
        const aliveImpostors = alivePlayers.filter(p => p.isImpostor);
        const aliveCrewmates = alivePlayers.filter(p => !p.isImpostor);
        
        // Victoire des imposteurs
        if (aliveImpostors.length >= aliveCrewmates.length) {
            this.endGame('impostors_win');
            return;
        }
        
        // Victoire des crewmates (tous les imposteurs éliminés)
        if (aliveImpostors.length === 0) {
            this.endGame('crewmates_win_elimination');
            return;
        }
        
        // Victoire des crewmates (toutes les tâches terminées)
        let totalTasks = 0;
        let completedTasks = 0;
        
        this.players.forEach(player => {
            if (!player.isImpostor && player.isAlive) {
                totalTasks += player.tasks.length;
                completedTasks += player.completedTasks;
            }
        });
        
        if (totalTasks > 0 && completedTasks >= totalTasks) {
            this.endGame('crewmates_win_tasks');
        }
    }

    endGame(reason) {
        this.gameState.phase = 'ended';
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.voteTimer) {
            clearTimeout(this.voteTimer);
            this.voteTimer = null;
        }
        
        this.broadcastGameEnd(reason);
        
        // Réinitialiser la salle après 10 secondes
        setTimeout(() => {
            this.resetRoom();
        }, 10000);
    }

    resetRoom() {
        this.gameState = {
            phase: 'lobby',
            tasks: [],
            bodies: [],
            votes: new Map(),
            emergencyMeetings: 0,
            sabotages: {},
            events: [],
            powerUps: [],
            startTime: null,
            settings: this.gameState.settings
        };
        
        // Réinitialiser les joueurs
        this.players.forEach(player => {
            player.isImpostor = false;
            player.isAlive = true;
            player.tasks = [];
            player.completedTasks = 0;
            player.kills = 0;
            player.votes = 0;
            player.lastKillTime = 0;
            player.emergencyMeetingsUsed = 0;
            player.x = 400;
            player.y = 300;
        });
        
        this.broadcastRoomReset();
    }

    startGameLoop() {
        this.gameTimer = setInterval(() => {
            if (this.gameState.phase === 'playing') {
                this.updateGameState();
            }
        }, 100); // 10 FPS pour les updates serveur
    }

    updateGameState() {
        // Logique du jeu côté serveur
        // Synchronisation des événements, power-ups, etc.
        this.broadcastGameState();
    }

    getRandomColor() {
        const colors = [
            '#FF0000', '#0000FF', '#00FF00', '#FFB3DA', '#FFA500',
            '#FFFF00', '#000000', '#FFFFFF', '#800080', '#964B00',
            '#00FFFF', '#C0C0C0', '#008000', '#FFC0CB', '#FF69B4', '#808080'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Méthodes de broadcast
    broadcastPlayerUpdate() {
        const playersData = Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            color: p.color,
            hat: p.hat,
            x: p.x,
            y: p.y,
            isAlive: p.isAlive
        }));
        
        this.players.forEach(player => {
            player.socket.emit('playersUpdate', playersData);
        });
    }

    broadcastPlayerMovement(player) {
        this.players.forEach(p => {
            if (p.id !== player.id) {
                p.socket.emit('playerMovement', {
                    id: player.id,
                    x: player.x,
                    y: player.y
                });
            }
        });
    }

    broadcastGameStart() {
        this.players.forEach(player => {
            player.socket.emit('gameStart', {
                role: player.isImpostor ? 'impostor' : 'crewmate',
                tasks: player.tasks,
                players: Array.from(this.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    color: p.color,
                    hat: p.hat,
                    isImpostor: player.isImpostor ? p.isImpostor : false
                }))
            });
        });
    }

    broadcastKill(killer, target) {
        this.players.forEach(player => {
            player.socket.emit('playerKilled', {
                killerId: killer.id,
                targetId: target.id,
                x: target.x,
                y: target.y
            });
        });
    }

    broadcastMeetingStart(meetingData) {
        this.players.forEach(player => {
            player.socket.emit('meetingStart', meetingData);
        });
    }

    broadcastVotingStart() {
        this.players.forEach(player => {
            player.socket.emit('votingStart');
        });
    }

    broadcastVoteUpdate() {
        const voteData = {};
        this.gameState.votes.forEach((targetId, voterId) => {
            voteData[voterId] = targetId;
        });
        
        this.players.forEach(player => {
            player.socket.emit('voteUpdate', voteData);
        });
    }

    broadcastVotingResults(eliminated, tie, voteCounts) {
        this.players.forEach(player => {
            player.socket.emit('votingResults', {
                eliminated,
                tie,
                voteCounts: Object.fromEntries(voteCounts)
            });
        });
    }

    broadcastGameResume() {
        this.players.forEach(player => {
            player.socket.emit('gameResume');
        });
    }

    broadcastGameEnd(reason) {
        this.players.forEach(player => {
            player.socket.emit('gameEnd', {
                reason,
                players: Array.from(this.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    isImpostor: p.isImpostor,
                    isAlive: p.isAlive,
                    kills: p.kills,
                    completedTasks: p.completedTasks
                }))
            });
        });
    }

    broadcastRoomReset() {
        this.players.forEach(player => {
            player.socket.emit('roomReset');
        });
    }

    broadcastGameState() {
        // Broadcast périodique de l'état du jeu
        this.players.forEach(player => {
            player.socket.emit('gameStateUpdate', {
                phase: this.gameState.phase,
                bodies: this.gameState.bodies,
                events: this.gameState.events,
                powerUps: this.gameState.powerUps
            });
        });
    }
}

// Gestionnaire des salles
const rooms = new Map();

// Connexions Socket.IO
io.on('connection', (socket) => {
    console.log(`Joueur connecté: ${socket.id}`);
    
    socket.on('joinRoom', (data) => {
        const { roomId, playerData } = data;
        
        // Créer la salle si elle n'existe pas
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new GameRoom(roomId));
        }
        
        const room = rooms.get(roomId);
        
        // Vérifier si la salle est pleine
        if (room.players.size >= room.gameState.settings.maxPlayers) {
            socket.emit('roomFull');
            return;
        }
        
        // Ajouter le joueur à la salle
        socket.join(roomId);
        const player = room.addPlayer(socket, playerData);
        
        socket.emit('joinedRoom', {
            roomId,
            playerId: socket.id,
            player
        });
        
        console.log(`Joueur ${playerData.name} a rejoint la salle ${roomId}`);
    });
    
    socket.on('startGame', (roomId) => {
        const room = rooms.get(roomId);
        if (room) {
            const started = room.startGame();
            if (!started) {
                socket.emit('gameStartFailed', 'Pas assez de joueurs');
            }
        }
    });
    
    socket.on('playerMovement', (data) => {
        const room = Array.from(rooms.values()).find(r => r.players.has(socket.id));
        if (room) {
            room.handlePlayerMovement(socket.id, data);
        }
    });
    
    socket.on('killPlayer', (targetId) => {
        const room = Array.from(rooms.values()).find(r => r.players.has(socket.id));
        if (room) {
            room.handleKill(socket.id, targetId);
        }
    });
    
    socket.on('emergencyMeeting', () => {
        const room = Array.from(rooms.values()).find(r => r.players.has(socket.id));
        if (room) {
            room.handleEmergencyMeeting(socket.id);
        }
    });
    
    socket.on('reportBody', (bodyId) => {
        const room = Array.from(rooms.values()).find(r => r.players.has(socket.id));
        if (room) {
            room.handleBodyReport(socket.id, bodyId);
        }
    });
    
    socket.on('vote', (targetId) => {
        const room = Array.from(rooms.values()).find(r => r.players.has(socket.id));
        if (room) {
            room.handleVote(socket.id, targetId);
        }
    });
    
    socket.on('chatMessage', (data) => {
        const room = Array.from(rooms.values()).find(r => r.players.has(socket.id));
        if (room) {
            const player = room.players.get(socket.id);
            if (player) {
                room.players.forEach(p => {
                    p.socket.emit('chatMessage', {
                        playerId: socket.id,
                        playerName: player.name,
                        message: data.message,
                        timestamp: Date.now()
                    });
                });
            }
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`Joueur déconnecté: ${socket.id}`);
        
        // Retirer le joueur de toutes les salles
        rooms.forEach(room => {
            if (room.players.has(socket.id)) {
                room.removePlayer(socket.id);
                
                // Supprimer la salle si elle est vide
                if (room.players.size === 0) {
                    rooms.delete(room.id);
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur Among Us démarré sur le port ${PORT}`);
    console.log(`Accédez au jeu sur http://localhost:${PORT}`);
});