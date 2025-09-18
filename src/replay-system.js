// Système de Replay pour Among Us .io
// Enregistrement, compression et lecture des parties

class ReplaySystem {
    constructor() {
        this.isRecording = false;
        this.isPlaying = false;
        this.recordedGames = new Map();
        this.currentRecording = null;
        this.playbackData = null;
        this.playbackSpeed = 1.0;
        this.playbackTime = 0;
        this.maxReplayDuration = 1800000; // 30 minutes max
        
        // Configuration de compression
        this.recordingInterval = 100; // Enregistrer toutes les 100ms
        this.compressionLevel = 5; // Niveau de compression des données
        
        // Interface de contrôle
        this.setupReplayInterface();
        this.loadSavedReplays();
        
        console.log('🎬 Système de replay initialisé');
    }
    
    // Enregistrement des parties
    startRecording(gameInstance) {
        if (this.isRecording) {
            this.stopRecording();
        }
        
        this.isRecording = true;
        this.gameInstance = gameInstance;
        
        this.currentRecording = {
            id: 'replay_' + Date.now(),
            startTime: Date.now(),
            gameMode: 'classic',
            mapId: gameInstance.currentMapId,
            mapName: gameInstance.currentMap?.name || 'Carte inconnue',
            playerCount: gameInstance.players.size,
            frames: [],
            events: [],
            metadata: {
                gameVersion: '1.0',
                recordedBy: gameInstance.localPlayer?.name || 'Joueur',
                totalDuration: 0,
                winner: null,
                gameResult: null
            }
        };
        
        // Enregistrer l'état initial
        this.recordInitialState();
        
        // Démarrer l'enregistrement périodique
        this.recordingTimer = setInterval(() => {
            this.recordFrame();
        }, this.recordingInterval);
        
        console.log(`🎬 Enregistrement démarré: ${this.currentRecording.id}`);
        this.showRecordingIndicator();
    }
    
    stopRecording() {
        if (!this.isRecording || !this.currentRecording) return;
        
        this.isRecording = false;
        clearInterval(this.recordingTimer);
        
        // Finaliser l'enregistrement
        this.currentRecording.metadata.totalDuration = Date.now() - this.currentRecording.startTime;
        this.currentRecording.endTime = Date.now();
        
        // Compresser les données
        this.compressRecording(this.currentRecording);
        
        // Sauvegarder
        this.recordedGames.set(this.currentRecording.id, this.currentRecording);
        this.saveReplayToStorage(this.currentRecording);
        
        console.log(`✅ Enregistrement terminé: ${this.formatDuration(this.currentRecording.metadata.totalDuration)}`);
        this.hideRecordingIndicator();
        this.showRecordingSavedNotification();
        
        this.currentRecording = null;
    }
    
    recordInitialState() {
        if (!this.gameInstance) return;
        
        const initialState = {
            timestamp: 0,
            type: 'initial_state',
            data: {
                map: {
                    id: this.gameInstance.currentMapId,
                    width: this.gameInstance.mapWidth,
                    height: this.gameInstance.mapHeight,
                    rooms: this.gameInstance.rooms,
                    tasks: this.gameInstance.tasks
                },
                players: this.serializePlayers(),
                gameSettings: {
                    killCooldown: this.gameInstance.killCooldownMax,
                    discussionTime: this.gameInstance.discussionTime,
                    votingTime: this.gameInstance.votingTime
                }
            }
        };
        
        this.currentRecording.frames.push(initialState);
    }
    
    recordFrame() {
        if (!this.isRecording || !this.gameInstance) return;
        
        const currentTime = Date.now() - this.currentRecording.startTime;
        
        // Ne pas enregistrer si trop long
        if (currentTime > this.maxReplayDuration) {
            this.stopRecording();
            return;
        }
        
        const frame = {
            timestamp: currentTime,
            type: 'game_frame',
            data: {
                gameState: this.gameInstance.gameState,
                players: this.serializePlayers(),
                camera: { ...this.gameInstance.camera },
                completedTasks: Array.from(this.gameInstance.completedTasks),
                meetingPhase: this.gameInstance.meetingPhase,
                meetingTimer: this.gameInstance.currentMeetingTimer,
                votes: this.gameInstance.votes ? Array.from(this.gameInstance.votes.entries()) : []
            }
        };
        
        // Compression delta: ne stocker que les changements
        const lastFrame = this.currentRecording.frames[this.currentRecording.frames.length - 1];
        if (lastFrame && this.shouldRecordFrame(frame, lastFrame)) {
            this.currentRecording.frames.push(frame);
        }
    }
    
    shouldRecordFrame(newFrame, lastFrame) {
        // Toujours enregistrer les changements d'état
        if (newFrame.data.gameState !== lastFrame.data.gameState) return true;
        
        // Vérifier les mouvements significatifs des joueurs
        const newPlayers = newFrame.data.players;
        const oldPlayers = lastFrame.data.players;
        
        for (const player of newPlayers) {
            const oldPlayer = oldPlayers.find(p => p.id === player.id);
            if (!oldPlayer) return true;
            
            const distance = Math.sqrt(
                Math.pow(player.x - oldPlayer.x, 2) + 
                Math.pow(player.y - oldPlayer.y, 2)
            );
            
            if (distance > 5) return true; // Mouvement significatif
            if (player.isDead !== oldPlayer.isDead) return true;
        }
        
        // Vérifier les tâches complétées
        if (newFrame.data.completedTasks.length !== lastFrame.data.completedTasks.length) return true;
        
        return false;
    }
    
    recordEvent(eventType, eventData) {
        if (!this.isRecording || !this.currentRecording) return;
        
        const event = {
            timestamp: Date.now() - this.currentRecording.startTime,
            type: eventType,
            data: eventData
        };
        
        this.currentRecording.events.push(event);
        
        console.log(`📹 Événement enregistré: ${eventType}`);
    }
    
    serializePlayers() {
        if (!this.gameInstance || !this.gameInstance.players) return [];
        
        return Array.from(this.gameInstance.players.values()).map(player => ({
            id: player.id,
            name: player.name,
            x: Math.round(player.x),
            y: Math.round(player.y),
            color: player.color,
            isImposter: player.isImposter,
            isDead: player.isDead,
            isBot: player.isBot || false,
            tasks: player.tasks?.map(task => ({
                type: task.type,
                completed: task.completed
            })) || []
        }));
    }
    
    // Compression des données
    compressRecording(recording) {
        console.log(`🗜️ Compression du replay (${recording.frames.length} frames)...`);
        
        // Supprimer les frames redondantes
        const compressedFrames = [];
        let lastSignificantFrame = null;
        
        for (const frame of recording.frames) {
            if (!lastSignificantFrame || this.isFrameSignificant(frame, lastSignificantFrame)) {
                compressedFrames.push(frame);
                lastSignificantFrame = frame;
            }
        }
        
        recording.frames = compressedFrames;
        
        // Arrondir les coordonnées pour économiser l'espace
        recording.frames.forEach(frame => {
            if (frame.data.players) {
                frame.data.players.forEach(player => {
                    player.x = Math.round(player.x);
                    player.y = Math.round(player.y);
                });
            }
        });
        
        const compressionRatio = ((recording.frames.length / compressedFrames.length) * 100).toFixed(1);
        console.log(`✅ Compression terminée: ${compressedFrames.length} frames (${compressionRatio}% de réduction)`);
    }
    
    isFrameSignificant(frame, lastFrame) {
        if (frame.type !== 'game_frame' || lastFrame.type !== 'game_frame') return true;
        
        // Changement d'état de jeu
        if (frame.data.gameState !== lastFrame.data.gameState) return true;
        
        // Mouvements des joueurs
        const threshold = 3; // pixels
        for (let i = 0; i < frame.data.players.length; i++) {
            const player = frame.data.players[i];
            const lastPlayer = lastFrame.data.players[i];
            
            if (!lastPlayer) return true;
            
            if (Math.abs(player.x - lastPlayer.x) > threshold || 
                Math.abs(player.y - lastPlayer.y) > threshold) {
                return true;
            }
        }
        
        return false;
    }
    
    // Lecture des replays
    startPlayback(replayId) {
        const replay = this.recordedGames.get(replayId);
        if (!replay) {
            console.error('Replay introuvable:', replayId);
            return false;
        }
        
        this.isPlaying = true;
        this.playbackData = replay;
        this.playbackTime = 0;
        this.playbackSpeed = 1.0;
        
        // Créer l'interface de lecture
        this.showPlaybackInterface();
        
        // Démarrer la lecture
        this.playbackTimer = setInterval(() => {
            this.updatePlayback();
        }, 50); // 20 FPS pour la lecture
        
        console.log(`▶️ Lecture démarrée: ${replay.metadata.recordedBy} - ${this.formatDuration(replay.metadata.totalDuration)}`);
        return true;
    }
    
    updatePlayback() {
        if (!this.isPlaying || !this.playbackData) return;
        
        this.playbackTime += 50 * this.playbackSpeed;
        
        // Trouver la frame correspondante
        const currentFrame = this.findFrameAtTime(this.playbackTime);
        if (currentFrame) {
            this.renderReplayFrame(currentFrame);
        }
        
        // Mettre à jour l'interface
        this.updatePlaybackUI();
        
        // Vérifier si c'est terminé
        if (this.playbackTime >= this.playbackData.metadata.totalDuration) {
            this.stopPlayback();
        }
    }
    
    findFrameAtTime(time) {
        if (!this.playbackData.frames) return null;
        
        // Recherche binaire pour trouver la frame la plus proche
        let left = 0;
        let right = this.playbackData.frames.length - 1;
        let bestFrame = this.playbackData.frames[0];
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const frame = this.playbackData.frames[mid];
            
            if (frame.timestamp <= time) {
                bestFrame = frame;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return bestFrame;
    }
    
    renderReplayFrame(frame) {
        const canvas = document.getElementById('replayCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (frame.type === 'initial_state' || frame.type === 'game_frame') {
            this.renderReplayMap(ctx, frame);
            this.renderReplayPlayers(ctx, frame);
            this.renderReplayUI(ctx, frame);
        }
    }
    
    renderReplayMap(ctx, frame) {
        // Fond
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(0, 0, 800, 600);
        
        // Carré représentant la carte (vue d'ensemble)
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, 500, 400);
        
        // Salles simplifiées
        if (frame.data.map && frame.data.map.rooms) {
            frame.data.map.rooms.forEach(room => {
                const x = 50 + (room.x / frame.data.map.width) * 500;
                const y = 50 + (room.y / frame.data.map.height) * 400;
                const w = (room.width / frame.data.map.width) * 500;
                const h = (room.height / frame.data.map.height) * 400;
                
                ctx.fillStyle = room.color || '#444';
                ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = '#666';
                ctx.strokeRect(x, y, w, h);
            });
        }
    }
    
    renderReplayPlayers(ctx, frame) {
        if (!frame.data.players) return;
        
        frame.data.players.forEach(player => {
            if (!frame.data.map) return;
            
            const x = 50 + (player.x / frame.data.map.width) * 500;
            const y = 50 + (player.y / frame.data.map.height) * 400;
            
            // Corps du joueur
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Contour
            ctx.strokeStyle = player.isDead ? '#FF0000' : '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Nom
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, x, y - 12);
            
            // Indicateur imposter
            if (player.isImposter) {
                ctx.fillStyle = '#FF0000';
                ctx.font = '8px Arial';
                ctx.fillText('IMP', x, y + 18);
            }
        });
    }
    
    renderReplayUI(ctx, frame) {
        // État du jeu
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(580, 50, 200, 100);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('État: ' + (frame.data.gameState || 'unknown'), 590, 70);
        
        if (frame.data.players) {
            const alive = frame.data.players.filter(p => !p.isDead).length;
            const dead = frame.data.players.filter(p => p.isDead).length;
            ctx.fillText(`Vivants: ${alive}`, 590, 90);
            ctx.fillText(`Morts: ${dead}`, 590, 110);
            
            const imposters = frame.data.players.filter(p => p.isImposter && !p.isDead).length;
            ctx.fillText(`Imposters: ${imposters}`, 590, 130);
        }
    }
    
    stopPlayback() {
        this.isPlaying = false;
        clearInterval(this.playbackTimer);
        this.hidePlaybackInterface();
        
        console.log('⏹️ Lecture arrêtée');
    }
    
    pausePlayback() {
        if (this.isPlaying) {
            clearInterval(this.playbackTimer);
            this.isPlaying = false;
            console.log('⏸️ Lecture en pause');
        }
    }
    
    resumePlayback() {
        if (!this.isPlaying && this.playbackData) {
            this.isPlaying = true;
            this.playbackTimer = setInterval(() => {
                this.updatePlayback();
            }, 50);
            console.log('▶️ Lecture reprise');
        }
    }
    
    setPlaybackSpeed(speed) {
        this.playbackSpeed = Math.max(0.25, Math.min(4.0, speed));
        console.log(`⚡ Vitesse de lecture: ${this.playbackSpeed}x`);
    }
    
    seekToTime(time) {
        this.playbackTime = Math.max(0, Math.min(this.playbackData.metadata.totalDuration, time));
        console.log(`⏭️ Saut à: ${this.formatDuration(this.playbackTime)}`);
    }
    
    // Interface utilisateur
    setupReplayInterface() {
        const replayUI = document.createElement('div');
        replayUI.id = 'replaySystem';
        replayUI.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            display: none;
            z-index: 4000;
        `;
        
        replayUI.innerHTML = `
            <!-- En-tête -->
            <div id="replayHeader" style="background: #2a2a2a; border-bottom: 3px solid #E91E63; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: #E91E63; margin: 0;">🎬 Système de Replay</h2>
                <div style="display: flex; gap: 15px;">
                    <button id="replayListBtn" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">📚 Mes Replays</button>
                    <button id="closeReplayBtn" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">❌ Fermer</button>
                </div>
            </div>
            
            <!-- Contenu principal -->
            <div id="replayContent" style="display: flex; height: calc(100% - 80px);">
                <!-- Liste des replays -->
                <div id="replayList" style="width: 400px; background: #2a2a2a; border-right: 2px solid #444; overflow-y: auto; padding: 20px;">
                    <h3 style="color: #E91E63; margin-top: 0;">📚 Replays Sauvegardés</h3>
                    <div id="replayItems"></div>
                </div>
                
                <!-- Lecteur -->
                <div id="replayPlayer" style="flex: 1; display: flex; flex-direction: column; background: #1a1a1a;">
                    <!-- Canvas de lecture -->
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative;">
                        <canvas id="replayCanvas" width="800" height="600" style="border: 2px solid #444; background: #000;"></canvas>
                        <div id="replayMessage" style="position: absolute; color: #ccc; font-size: 18px; text-align: center;">
                            Sélectionnez un replay pour commencer la lecture
                        </div>
                    </div>
                    
                    <!-- Contrôles de lecture -->
                    <div id="replayControls" class="hidden" style="background: #2a2a2a; padding: 20px; border-top: 2px solid #444;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                            <button id="playPauseBtn" style="background: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">▶️ Play</button>
                            <button id="stopBtn" style="background: #f44336; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">⏹️ Stop</button>
                            
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <label style="color: #ccc;">Vitesse:</label>
                                <select id="speedSelect" style="padding: 5px; border-radius: 3px; background: #333; color: white; border: 1px solid #555;">
                                    <option value="0.25">0.25x</option>
                                    <option value="0.5">0.5x</option>
                                    <option value="1" selected>1x</option>
                                    <option value="1.5">1.5x</option>
                                    <option value="2">2x</option>
                                    <option value="4">4x</option>
                                </select>
                            </div>
                            
                            <div style="flex: 1; margin: 0 20px;">
                                <input type="range" id="timelineSlider" min="0" max="100" value="0" style="width: 100%;">
                            </div>
                            
                            <div style="color: #ccc; font-family: monospace;">
                                <span id="currentTime">00:00</span> / <span id="totalTime">00:00</span>
                            </div>
                        </div>
                        
                        <!-- Informations sur le replay -->
                        <div id="replayInfo" style="color: #ccc; font-size: 14px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Indicateur d'enregistrement -->
            <div id="recordingIndicator" class="hidden" style="position: fixed; top: 20px; left: 20px; background: #f44336; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; z-index: 5000; animation: pulse 1s infinite;">
                🔴 REC
            </div>
        `;
        
        document.body.appendChild(replayUI);
        this.attachReplayEventListeners();
    }
    
    attachReplayEventListeners() {
        // Boutons principaux
        document.getElementById('closeReplayBtn')?.addEventListener('click', () => {
            this.close();
        });
        
        document.getElementById('replayListBtn')?.addEventListener('click', () => {
            this.refreshReplayList();
        });
        
        // Contrôles de lecture
        document.getElementById('playPauseBtn')?.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pausePlayback();
                document.getElementById('playPauseBtn').textContent = '▶️ Play';
            } else if (this.playbackData) {
                this.resumePlayback();
                document.getElementById('playPauseBtn').textContent = '⏸️ Pause';
            }
        });
        
        document.getElementById('stopBtn')?.addEventListener('click', () => {
            this.stopPlayback();
            document.getElementById('playPauseBtn').textContent = '▶️ Play';
        });
        
        document.getElementById('speedSelect')?.addEventListener('change', (e) => {
            this.setPlaybackSpeed(parseFloat(e.target.value));
        });
        
        document.getElementById('timelineSlider')?.addEventListener('input', (e) => {
            if (this.playbackData) {
                const time = (e.target.value / 100) * this.playbackData.metadata.totalDuration;
                this.seekToTime(time);
            }
        });
    }
    
    refreshReplayList() {
        const container = document.getElementById('replayItems');
        if (!container) return;
        
        const replays = Array.from(this.recordedGames.values())
            .sort((a, b) => b.startTime - a.startTime);
        
        if (replays.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">Aucun replay enregistré</p>';
            return;
        }
        
        container.innerHTML = replays.map(replay => `
            <div class="replay-item" style="background: #333; border-radius: 8px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: background 0.3s;" onclick="replaySystem.selectReplay('${replay.id}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h4 style="color: #E91E63; margin: 0;">${replay.metadata.recordedBy}</h4>
                        <p style="color: #ccc; margin: 5px 0;">📍 ${replay.mapName}</p>
                        <p style="color: #ccc; margin: 5px 0;">👥 ${replay.playerCount} joueurs</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #4CAF50; font-weight: bold;">${this.formatDuration(replay.metadata.totalDuration)}</div>
                        <div style="color: #999; font-size: 12px;">${new Date(replay.startTime).toLocaleDateString()}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="event.stopPropagation(); replaySystem.startPlayback('${replay.id}')" style="background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">▶️ Lire</button>
                    <button onclick="event.stopPropagation(); replaySystem.shareReplay('${replay.id}')" style="background: #2196F3; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">📤 Partager</button>
                    <button onclick="event.stopPropagation(); replaySystem.deleteReplay('${replay.id}')" style="background: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">🗑️ Supprimer</button>
                </div>
            </div>
        `).join('');
    }
    
    selectReplay(replayId) {
        const replay = this.recordedGames.get(replayId);
        if (!replay) return;
        
        // Mettre à jour les informations
        const replayInfo = document.getElementById('replayInfo');
        if (replayInfo) {
            replayInfo.innerHTML = `
                <strong>Replay:</strong> ${replay.metadata.recordedBy} | 
                <strong>Carte:</strong> ${replay.mapName} | 
                <strong>Joueurs:</strong> ${replay.playerCount} | 
                <strong>Durée:</strong> ${this.formatDuration(replay.metadata.totalDuration)} |
                <strong>Frames:</strong> ${replay.frames.length}
            `;
        }
        
        // Préparer la lecture
        this.playbackData = replay;
        this.playbackTime = 0;
        
        // Afficher les contrôles
        document.getElementById('replayControls')?.classList.remove('hidden');
        document.getElementById('replayMessage').style.display = 'none';
        
        // Mettre à jour la timeline
        const totalTime = document.getElementById('totalTime');
        if (totalTime) {
            totalTime.textContent = this.formatDuration(replay.metadata.totalDuration);
        }
        
        // Afficher la première frame
        if (replay.frames.length > 0) {
            this.renderReplayFrame(replay.frames[0]);
        }
    }
    
    updatePlaybackUI() {
        if (!this.playbackData) return;
        
        // Mettre à jour le temps
        const currentTime = document.getElementById('currentTime');
        if (currentTime) {
            currentTime.textContent = this.formatDuration(this.playbackTime);
        }
        
        // Mettre à jour la timeline
        const timelineSlider = document.getElementById('timelineSlider');
        if (timelineSlider) {
            const progress = (this.playbackTime / this.playbackData.metadata.totalDuration) * 100;
            timelineSlider.value = progress;
        }
    }
    
    shareReplay(replayId) {
        const replay = this.recordedGames.get(replayId);
        if (!replay) return;
        
        // Créer un fichier de partage
        const shareData = {
            id: replay.id,
            metadata: replay.metadata,
            mapName: replay.mapName,
            playerCount: replay.playerCount,
            frames: replay.frames,
            events: replay.events
        };
        
        const blob = new Blob([JSON.stringify(shareData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `amongus_replay_${replay.metadata.recordedBy}_${new Date(replay.startTime).toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Replay partagé:', replay.id);
    }
    
    deleteReplay(replayId) {
        if (confirm('Voulez-vous vraiment supprimer ce replay ?')) {
            this.recordedGames.delete(replayId);
            this.removeReplayFromStorage(replayId);
            this.refreshReplayList();
            
            console.log('🗑️ Replay supprimé:', replayId);
        }
    }
    
    // Indicateurs visuels
    showRecordingIndicator() {
        const indicator = document.getElementById('recordingIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }
    
    hideRecordingIndicator() {
        const indicator = document.getElementById('recordingIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }
    
    showRecordingSavedNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            z-index: 5000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        notification.textContent = '✅ Replay sauvegardé !';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showPlaybackInterface() {
        document.getElementById('replayControls')?.classList.remove('hidden');
        document.getElementById('replayMessage').style.display = 'none';
    }
    
    hidePlaybackInterface() {
        document.getElementById('replayControls')?.classList.add('hidden');
        document.getElementById('replayMessage').style.display = 'block';
    }
    
    // Utilitaires
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Sauvegarde
    saveReplayToStorage(replay) {
        try {
            const savedReplays = JSON.parse(localStorage.getItem('amongus_replays') || '[]');
            savedReplays.push({
                id: replay.id,
                metadata: replay.metadata,
                startTime: replay.startTime,
                mapName: replay.mapName,
                playerCount: replay.playerCount
            });
            
            // Garder seulement les 50 replays les plus récents
            const recentReplays = savedReplays
                .sort((a, b) => b.startTime - a.startTime)
                .slice(0, 50);
            
            localStorage.setItem('amongus_replays', JSON.stringify(recentReplays));
            localStorage.setItem(`amongus_replay_${replay.id}`, JSON.stringify(replay));
        } catch (error) {
            console.error('Erreur sauvegarde replay:', error);
        }
    }
    
    loadSavedReplays() {
        try {
            const savedReplays = JSON.parse(localStorage.getItem('amongus_replays') || '[]');
            
            for (const replayMeta of savedReplays) {
                const replayData = localStorage.getItem(`amongus_replay_${replayMeta.id}`);
                if (replayData) {
                    const replay = JSON.parse(replayData);
                    this.recordedGames.set(replay.id, replay);
                }
            }
            
            console.log(`📚 ${this.recordedGames.size} replays chargés`);
        } catch (error) {
            console.error('Erreur chargement replays:', error);
        }
    }
    
    removeReplayFromStorage(replayId) {
        try {
            localStorage.removeItem(`amongus_replay_${replayId}`);
            
            const savedReplays = JSON.parse(localStorage.getItem('amongus_replays') || '[]');
            const filteredReplays = savedReplays.filter(r => r.id !== replayId);
            localStorage.setItem('amongus_replays', JSON.stringify(filteredReplays));
        } catch (error) {
            console.error('Erreur suppression replay:', error);
        }
    }
    
    open() {
        const replayUI = document.getElementById('replaySystem');
        if (replayUI) {
            replayUI.style.display = 'block';
            this.refreshReplayList();
        }
    }
    
    close() {
        const replayUI = document.getElementById('replaySystem');
        if (replayUI) {
            replayUI.style.display = 'none';
        }
        
        if (this.isPlaying) {
            this.stopPlayback();
        }
    }
}

// Créer l'instance globale
const replaySystem = new ReplaySystem();

// Ajouter le bouton d'accès aux replays dans le menu principal
document.addEventListener('DOMContentLoaded', () => {
    const replayButton = document.createElement('button');
    replayButton.id = 'openReplayBtn';
    replayButton.textContent = '🎬 Système de Replay';
    replayButton.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background: linear-gradient(145deg, #E91E63, #AD1457);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        margin: 10px;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
    `;
    
    replayButton.addEventListener('click', () => {
        replaySystem.open();
    });
    
    replayButton.addEventListener('mouseenter', () => {
        replayButton.style.transform = 'translateY(-2px)';
        replayButton.style.boxShadow = '0 6px 20px rgba(233, 30, 99, 0.4)';
    });
    
    replayButton.addEventListener('mouseleave', () => {
        replayButton.style.transform = 'translateY(0)';
        replayButton.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
    });
    
    // Ajouter au menu principal
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        const menu = startScreen.querySelector('.menu');
        if (menu) {
            menu.appendChild(replayButton);
        }
    }
});

// CSS pour l'interface replay
const replayCSS = `
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.replay-item:hover {
    background: #444 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

#timelineSlider {
    appearance: none;
    height: 6px;
    background: #333;
    border-radius: 3px;
    outline: none;
}

#timelineSlider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #E91E63;
    border-radius: 50%;
    cursor: pointer;
}

#timelineSlider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #E91E63;
    border-radius: 50%;
    cursor: pointer;
    border: none;
}
`;

// Ajouter les styles
const replayStyleSheet = document.createElement('style');
replayStyleSheet.textContent = replayCSS;
document.head.appendChild(replayStyleSheet);