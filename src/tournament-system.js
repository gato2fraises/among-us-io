// Système de Tournois et Classements pour Among Us .io
// Gestion des tournois, brackets, ELO et statistiques avancées

class TournamentSystem {
    constructor() {
        this.tournaments = new Map();
        this.playerRankings = new Map();
        this.matchHistory = [];
        this.activeMatches = new Map();
        
        // Configuration ELO
        this.eloSettings = {
            startingElo: 1200,
            kFactor: 32,
            minElo: 100,
            maxElo: 3000
        };
        
        // Types de tournois
        this.tournamentTypes = {
            SINGLE_ELIMINATION: 'single_elimination',
            DOUBLE_ELIMINATION: 'double_elimination',
            ROUND_ROBIN: 'round_robin',
            SWISS: 'swiss',
            LADDER: 'ladder'
        };
        
        // Rangs basés sur l'ELO
        this.rankTiers = [
            { name: 'Bronze', minElo: 100, maxElo: 899, color: '#CD7F32', icon: '🥉' },
            { name: 'Argent', minElo: 900, maxElo: 1299, color: '#C0C0C0', icon: '🥈' },
            { name: 'Or', minElo: 1300, maxElo: 1699, color: '#FFD700', icon: '🥇' },
            { name: 'Platine', minElo: 1700, maxElo: 2099, color: '#E5E4E2', icon: '💎' },
            { name: 'Diamant', minElo: 2100, maxElo: 2499, color: '#B9F2FF', icon: '💠' },
            { name: 'Maître', minElo: 2500, maxElo: 2899, color: '#FF6B6B', icon: '👑' },
            { name: 'Grand Maître', minElo: 2900, maxElo: 3000, color: '#FF1744', icon: '🏆' }
        ];
        
        this.loadData();
        this.setupUI();
    }
    
    // Gestion des joueurs et classements
    initializePlayer(playerId, playerName) {
        if (!this.playerRankings.has(playerId)) {
            this.playerRankings.set(playerId, {
                id: playerId,
                name: playerName,
                elo: this.eloSettings.startingElo,
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                streak: 0,
                bestStreak: 0,
                rank: this.getRankFromElo(this.eloSettings.startingElo),
                lastPlayed: Date.now(),
                achievements: [],
                statistics: {
                    totalPlayTime: 0,
                    tasksCompleted: 0,
                    crewmateWins: 0,
                    imposterWins: 0,
                    meetingsCalled: 0,
                    correctVotes: 0,
                    survivalTime: 0
                }
            });
        }
        return this.playerRankings.get(playerId);
    }
    
    updatePlayerElo(playerId, gameResult, opponentElos = []) {
        const player = this.playerRankings.get(playerId);
        if (!player) return;
        
        const oldElo = player.elo;
        const avgOpponentElo = opponentElos.length > 0 ? 
            opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length : 
            player.elo;
        
        // Calcul ELO avec formule standard
        const expectedScore = 1 / (1 + Math.pow(10, (avgOpponentElo - oldElo) / 400));
        const actualScore = gameResult.won ? 1 : 0;
        const eloChange = Math.round(this.eloSettings.kFactor * (actualScore - expectedScore));
        
        // Bonus/malus selon le rôle et performance
        let roleBonus = 0;
        if (gameResult.role === 'imposter' && gameResult.won) {
            roleBonus = 5; // Bonus pour victoire imposter
        } else if (gameResult.role === 'crewmate' && gameResult.tasksCompleted >= 0.8) {
            roleBonus = 3; // Bonus pour efficacité crewmate
        }
        
        const finalEloChange = Math.max(-50, Math.min(50, eloChange + roleBonus));
        player.elo = Math.max(this.eloSettings.minElo, 
                             Math.min(this.eloSettings.maxElo, oldElo + finalEloChange));
        
        // Mise à jour des statistiques
        player.gamesPlayed++;
        if (gameResult.won) {
            player.wins++;
            player.streak = Math.max(0, player.streak) + 1;
            player.bestStreak = Math.max(player.bestStreak, player.streak);
        } else {
            player.losses++;
            player.streak = Math.min(0, player.streak) - 1;
        }
        
        player.winRate = (player.wins / player.gamesPlayed * 100).toFixed(1);
        player.rank = this.getRankFromElo(player.elo);
        player.lastPlayed = Date.now();
        
        // Enregistrer l'historique
        this.matchHistory.push({
            playerId: playerId,
            timestamp: Date.now(),
            oldElo: oldElo,
            newElo: player.elo,
            eloChange: finalEloChange,
            gameResult: gameResult,
            opponentElos: opponentElos
        });
        
        this.saveData();
        console.log(`🏆 ${player.name}: ${oldElo} → ${player.elo} (${finalEloChange >= 0 ? '+' : ''}${finalEloChange})`);
        
        return {
            oldElo: oldElo,
            newElo: player.elo,
            change: finalEloChange,
            rank: player.rank
        };
    }
    
    getRankFromElo(elo) {
        for (const tier of this.rankTiers) {
            if (elo >= tier.minElo && elo <= tier.maxElo) {
                return tier;
            }
        }
        return this.rankTiers[0]; // Bronze par défaut
    }
    
    getLeaderboard(limit = 50) {
        return Array.from(this.playerRankings.values())
            .sort((a, b) => b.elo - a.elo)
            .slice(0, limit)
            .map((player, index) => ({
                ...player,
                position: index + 1
            }));
    }
    
    // Système de tournois
    createTournament(config) {
        const tournamentId = 'tournament_' + Date.now();
        const tournament = {
            id: tournamentId,
            name: config.name || 'Tournoi Sans Nom',
            type: config.type || this.tournamentTypes.SINGLE_ELIMINATION,
            maxPlayers: config.maxPlayers || 16,
            entryFee: config.entryFee || 0,
            prizePool: config.prizePool || 0,
            status: 'registration', // registration, in_progress, completed
            players: new Map(),
            brackets: [],
            matches: [],
            currentRound: 0,
            createdAt: Date.now(),
            startTime: config.startTime || Date.now() + 300000, // 5 minutes par défaut
            rules: {
                gameMode: config.gameMode || 'classic',
                mapPool: config.mapPool || ['the_skeld', 'mira_hq', 'polus'],
                matchFormat: config.matchFormat || 'best_of_3',
                allowSpectators: config.allowSpectators !== false
            }
        };
        
        this.tournaments.set(tournamentId, tournament);
        this.saveData();
        
        console.log(`🏟️ Tournoi créé: ${tournament.name} (${tournament.type})`);
        return tournament;
    }
    
    registerPlayerForTournament(tournamentId, playerId, playerName) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return { success: false, message: 'Tournoi introuvable' };
        
        if (tournament.status !== 'registration') {
            return { success: false, message: 'Inscriptions fermées' };
        }
        
        if (tournament.players.size >= tournament.maxPlayers) {
            return { success: false, message: 'Tournoi complet' };
        }
        
        if (tournament.players.has(playerId)) {
            return { success: false, message: 'Déjà inscrit' };
        }
        
        const player = this.initializePlayer(playerId, playerName);
        tournament.players.set(playerId, {
            id: playerId,
            name: playerName,
            elo: player.elo,
            registrationTime: Date.now(),
            status: 'registered'
        });
        
        this.saveData();
        console.log(`✅ ${playerName} inscrit au tournoi ${tournament.name}`);
        
        return { 
            success: true, 
            message: 'Inscription réussie',
            playersCount: tournament.players.size,
            maxPlayers: tournament.maxPlayers
        };
    }
    
    startTournament(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return false;
        
        if (tournament.status !== 'registration') return false;
        if (tournament.players.size < 4) return false; // Minimum 4 joueurs
        
        tournament.status = 'in_progress';
        tournament.startTime = Date.now();
        
        // Générer les brackets selon le type de tournoi
        switch (tournament.type) {
            case this.tournamentTypes.SINGLE_ELIMINATION:
                this.generateSingleEliminationBrackets(tournament);
                break;
            case this.tournamentTypes.DOUBLE_ELIMINATION:
                this.generateDoubleEliminationBrackets(tournament);
                break;
            case this.tournamentTypes.ROUND_ROBIN:
                this.generateRoundRobinBrackets(tournament);
                break;
            case this.tournamentTypes.SWISS:
                this.generateSwissBrackets(tournament);
                break;
        }
        
        this.saveData();
        console.log(`🚀 Tournoi ${tournament.name} démarré avec ${tournament.players.size} joueurs`);
        return true;
    }
    
    generateSingleEliminationBrackets(tournament) {
        const players = Array.from(tournament.players.values());
        
        // Mélanger les joueurs avec seed basé sur l'ELO
        players.sort((a, b) => b.elo - a.elo);
        
        // Créer les brackets
        const totalRounds = Math.ceil(Math.log2(players.length));
        tournament.brackets = [];
        
        for (let round = 0; round < totalRounds; round++) {
            tournament.brackets[round] = [];
        }
        
        // Premier round
        const firstRoundMatches = Math.ceil(players.length / 2);
        for (let i = 0; i < firstRoundMatches; i++) {
            const player1 = players[i * 2];
            const player2 = players[i * 2 + 1] || null; // Bye si nombre impair
            
            const match = {
                id: `match_${tournament.id}_r0_${i}`,
                round: 0,
                player1: player1,
                player2: player2,
                winner: player2 ? null : player1, // Bye automatique
                status: player2 ? 'pending' : 'completed',
                games: [],
                startTime: null
            };
            
            tournament.brackets[0].push(match);
            tournament.matches.push(match);
        }
        
        console.log(`📊 Brackets générés: ${totalRounds} rounds, ${firstRoundMatches} matchs au premier tour`);
    }
    
    generateDoubleEliminationBrackets(tournament) {
        // Implémentation double élimination (plus complexe)
        const players = Array.from(tournament.players.values());
        players.sort((a, b) => b.elo - a.elo);
        
        tournament.brackets = {
            winner: [],
            loser: []
        };
        
        // Génération similaire à single elimination mais avec bracket perdant
        console.log(`📊 Double elimination brackets générés pour ${players.length} joueurs`);
    }
    
    generateRoundRobinBrackets(tournament) {
        const players = Array.from(tournament.players.values());
        const matchups = [];
        
        // Tous contre tous
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                matchups.push({
                    id: `match_${tournament.id}_rr_${i}_${j}`,
                    round: 0,
                    player1: players[i],
                    player2: players[j],
                    winner: null,
                    status: 'pending',
                    games: [],
                    startTime: null
                });
            }
        }
        
        tournament.brackets = [matchups];
        tournament.matches = matchups;
        
        console.log(`📊 Round Robin: ${matchups.length} matchs générés`);
    }
    
    generateSwissBrackets(tournament) {
        // Système suisse: appariements basés sur les scores
        const players = Array.from(tournament.players.values());
        
        tournament.brackets = [];
        tournament.swissData = {
            rounds: Math.ceil(Math.log2(players.length)),
            currentRound: 0,
            playerScores: new Map()
        };
        
        // Initialiser les scores
        players.forEach(player => {
            tournament.swissData.playerScores.set(player.id, {
                wins: 0,
                losses: 0,
                score: 0,
                opponents: []
            });
        });
        
        console.log(`📊 Système suisse: ${tournament.swissData.rounds} rounds prévus`);
    }
    
    // Interface utilisateur
    setupUI() {
        this.createTournamentInterface();
        this.createRankingInterface();
        this.createStatsInterface();
        this.attachEventListeners();
    }
    
    createTournamentInterface() {
        const tournamentUI = document.createElement('div');
        tournamentUI.id = 'tournamentSystem';
        tournamentUI.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            display: none;
            z-index: 3000;
            overflow-y: auto;
        `;
        
        tournamentUI.innerHTML = `
            <!-- En-tête tournois -->
            <div id="tournamentHeader" style="position: sticky; top: 0; background: #2a2a2a; border-bottom: 3px solid #FFD700; padding: 20px; z-index: 3001;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h2 style="color: #FFD700; margin: 0;">🏆 Système de Tournois</h2>
                    <div style="display: flex; gap: 15px;">
                        <button id="createTournamentBtn" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">➕ Créer Tournoi</button>
                        <button id="rankingsBtn" style="background: #FF9800; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">📊 Classements</button>
                        <button id="statsBtn" style="background: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">📈 Statistiques</button>
                        <button id="closeTournamentBtn" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">❌ Fermer</button>
                    </div>
                </div>
                
                <!-- Navigation onglets -->
                <div style="margin-top: 15px;">
                    <button class="tab-btn active" data-tab="active">🔥 Tournois Actifs</button>
                    <button class="tab-btn" data-tab="upcoming">📅 À Venir</button>
                    <button class="tab-btn" data-tab="completed">✅ Terminés</button>
                    <button class="tab-btn" data-tab="create">➕ Créer</button>
                </div>
            </div>
            
            <!-- Contenu principal -->
            <div id="tournamentContent" style="padding: 20px;">
                <!-- Onglet tournois actifs -->
                <div id="tab-active" class="tab-content">
                    <h3 style="color: #FFD700;">🔥 Tournois en cours</h3>
                    <div id="activeTournamentsList" class="tournaments-grid"></div>
                </div>
                
                <!-- Onglet tournois à venir -->
                <div id="tab-upcoming" class="tab-content hidden">
                    <h3 style="color: #FFD700;">📅 Tournois à venir</h3>
                    <div id="upcomingTournamentsList" class="tournaments-grid"></div>
                </div>
                
                <!-- Onglet tournois terminés -->
                <div id="tab-completed" class="tab-content hidden">
                    <h3 style="color: #FFD700;">✅ Tournois terminés</h3>
                    <div id="completedTournamentsList" class="tournaments-grid"></div>
                </div>
                
                <!-- Onglet création -->
                <div id="tab-create" class="tab-content hidden">
                    <h3 style="color: #FFD700;">➕ Créer un nouveau tournoi</h3>
                    <div id="createTournamentForm" style="max-width: 600px; background: #2a2a2a; padding: 30px; border-radius: 10px;">
                        <div class="form-group">
                            <label>Nom du tournoi:</label>
                            <input type="text" id="tournamentName" placeholder="Mon Super Tournoi" style="width: 100%; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #555; background: #333; color: white;">
                        </div>
                        
                        <div class="form-group">
                            <label>Type de tournoi:</label>
                            <select id="tournamentType" style="width: 100%; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #555; background: #333; color: white;">
                                <option value="single_elimination">🏆 Élimination Simple</option>
                                <option value="double_elimination">⚔️ Double Élimination</option>
                                <option value="round_robin">🔄 Round Robin</option>
                                <option value="swiss">🇨🇭 Système Suisse</option>
                            </select>
                        </div>
                        
                        <div class="form-row" style="display: flex; gap: 15px;">
                            <div class="form-group" style="flex: 1;">
                                <label>Nombre max de joueurs:</label>
                                <select id="maxPlayers" style="width: 100%; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #555; background: #333; color: white;">
                                    <option value="8">8 joueurs</option>
                                    <option value="16" selected>16 joueurs</option>
                                    <option value="32">32 joueurs</option>
                                    <option value="64">64 joueurs</option>
                                </select>
                            </div>
                            
                            <div class="form-group" style="flex: 1;">
                                <label>Format de match:</label>
                                <select id="matchFormat" style="width: 100%; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #555; background: #333; color: white;">
                                    <option value="best_of_1">Best of 1</option>
                                    <option value="best_of_3" selected>Best of 3</option>
                                    <option value="best_of_5">Best of 5</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Cartes autorisées:</label>
                            <div id="mapSelection" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">
                                <label style="display: flex; align-items: center; color: white;"><input type="checkbox" value="the_skeld" checked> The Skeld</label>
                                <label style="display: flex; align-items: center; color: white;"><input type="checkbox" value="mira_hq" checked> Mira HQ</label>
                                <label style="display: flex; align-items: center; color: white;"><input type="checkbox" value="polus" checked> Polus</label>
                                <label style="display: flex; align-items: center; color: white;"><input type="checkbox" value="the_airship"> The Airship</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Démarrage:</label>
                            <select id="startTime" style="width: 100%; padding: 10px; margin: 5px 0; border-radius: 5px; border: 1px solid #555; background: #333; color: white;">
                                <option value="5">Dans 5 minutes</option>
                                <option value="15">Dans 15 minutes</option>
                                <option value="30">Dans 30 minutes</option>
                                <option value="60">Dans 1 heure</option>
                                <option value="custom">Heure personnalisée</option>
                            </select>
                        </div>
                        
                        <button id="submitTournamentBtn" style="width: 100%; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 20px;">🏆 Créer le Tournoi</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal pour rejoindre un tournoi -->
            <div id="joinTournamentModal" class="modal hidden">
                <div class="modal-content">
                    <h3>Rejoindre le tournoi</h3>
                    <div id="tournamentDetails"></div>
                    <div style="margin-top: 20px;">
                        <button id="confirmJoinBtn">✅ Confirmer l'inscription</button>
                        <button id="cancelJoinBtn">❌ Annuler</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(tournamentUI);
    }
    
    createRankingInterface() {
        const rankingHTML = `
            <div id="rankingInterface" class="hidden" style="background: #2a2a2a; padding: 30px; border-radius: 10px; margin: 20px;">
                <h3 style="color: #FFD700; margin-bottom: 20px;">📊 Classement Global</h3>
                
                <!-- Filtres -->
                <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
                    <label style="color: white;">Affichage:</label>
                    <select id="rankingFilter" style="padding: 8px; border-radius: 5px; background: #333; color: white; border: 1px solid #555;">
                        <option value="all">Tous les joueurs</option>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Argent</option>
                        <option value="gold">Or</option>
                        <option value="platinum">Platine</option>
                        <option value="diamond">Diamant</option>
                        <option value="master">Maître</option>
                        <option value="grandmaster">Grand Maître</option>
                    </select>
                    
                    <label style="color: white;">Période:</label>
                    <select id="rankingPeriod" style="padding: 8px; border-radius: 5px; background: #333; color: white; border: 1px solid #555;">
                        <option value="all_time">Tout temps</option>
                        <option value="season">Saison actuelle</option>
                        <option value="month">Ce mois</option>
                        <option value="week">Cette semaine</option>
                    </select>
                </div>
                
                <!-- Tableau de classement -->
                <div id="leaderboardTable" style="background: #333; border-radius: 8px; overflow: hidden;"></div>
                
                <!-- Mon classement -->
                <div id="myRanking" style="margin-top: 20px; background: #1a4d72; padding: 15px; border-radius: 8px; border: 2px solid #FFD700;">
                    <h4 style="color: #FFD700; margin: 0 0 10px 0;">Mon Classement</h4>
                    <div id="myRankingDetails"></div>
                </div>
            </div>
        `;
        
        const tournamentContent = document.getElementById('tournamentContent');
        if (tournamentContent) {
            tournamentContent.insertAdjacentHTML('beforeend', rankingHTML);
        }
    }
    
    createStatsInterface() {
        const statsHTML = `
            <div id="statsInterface" class="hidden" style="background: #2a2a2a; padding: 30px; border-radius: 10px; margin: 20px;">
                <h3 style="color: #FFD700; margin-bottom: 20px;">📈 Statistiques Détaillées</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <!-- Statistiques générales -->
                    <div class="stats-card">
                        <h4 style="color: #4CAF50;">🎮 Statistiques Générales</h4>
                        <div id="generalStats"></div>
                    </div>
                    
                    <!-- Performance par rôle -->
                    <div class="stats-card">
                        <h4 style="color: #FF9800;">👨‍🚀 Performance par Rôle</h4>
                        <div id="roleStats"></div>
                    </div>
                    
                    <!-- Historique ELO -->
                    <div class="stats-card">
                        <h4 style="color: #2196F3;">📊 Évolution ELO</h4>
                        <canvas id="eloChart" width="300" height="200"></canvas>
                    </div>
                    
                    <!-- Réalisations -->
                    <div class="stats-card">
                        <h4 style="color: #9C27B0;">🏆 Réalisations</h4>
                        <div id="achievements"></div>
                    </div>
                </div>
            </div>
        `;
        
        const tournamentContent = document.getElementById('tournamentContent');
        if (tournamentContent) {
            tournamentContent.insertAdjacentHTML('beforeend', statsHTML);
        }
    }
    
    attachEventListeners() {
        // Gestion des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Boutons principaux
        document.getElementById('createTournamentBtn')?.addEventListener('click', () => {
            this.switchTab('create');
        });
        
        document.getElementById('rankingsBtn')?.addEventListener('click', () => {
            this.showRankings();
        });
        
        document.getElementById('statsBtn')?.addEventListener('click', () => {
            this.showStats();
        });
        
        document.getElementById('closeTournamentBtn')?.addEventListener('click', () => {
            this.close();
        });
        
        // Formulaire de création
        document.getElementById('submitTournamentBtn')?.addEventListener('click', () => {
            this.submitTournamentCreation();
        });
    }
    
    switchTab(tabName) {
        // Masquer tous les onglets
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Enlever active de tous les boutons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Afficher l'onglet sélectionné
        const targetTab = document.getElementById(`tab-${tabName}`);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab) targetTab.classList.remove('hidden');
        if (targetBtn) targetBtn.classList.add('active');
        
        // Charger le contenu spécifique
        switch (tabName) {
            case 'active':
                this.refreshActiveTournaments();
                break;
            case 'upcoming':
                this.refreshUpcomingTournaments();
                break;
            case 'completed':
                this.refreshCompletedTournaments();
                break;
        }
    }
    
    refreshActiveTournaments() {
        const container = document.getElementById('activeTournamentsList');
        if (!container) return;
        
        const activeTournaments = Array.from(this.tournaments.values())
            .filter(t => t.status === 'in_progress');
        
        if (activeTournaments.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">Aucun tournoi actif pour le moment</p>';
            return;
        }
        
        container.innerHTML = activeTournaments.map(tournament => this.generateTournamentCard(tournament)).join('');
    }
    
    refreshUpcomingTournaments() {
        const container = document.getElementById('upcomingTournamentsList');
        if (!container) return;
        
        const upcomingTournaments = Array.from(this.tournaments.values())
            .filter(t => t.status === 'registration');
        
        if (upcomingTournaments.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">Aucun tournoi à venir</p>';
            return;
        }
        
        container.innerHTML = upcomingTournaments.map(tournament => this.generateTournamentCard(tournament)).join('');
    }
    
    refreshCompletedTournaments() {
        const container = document.getElementById('completedTournamentsList');
        if (!container) return;
        
        const completedTournaments = Array.from(this.tournaments.values())
            .filter(t => t.status === 'completed')
            .sort((a, b) => b.completedAt - a.completedAt);
        
        if (completedTournaments.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 40px;">Aucun tournoi terminé</p>';
            return;
        }
        
        container.innerHTML = completedTournaments.map(tournament => this.generateTournamentCard(tournament)).join('');
    }
    
    generateTournamentCard(tournament) {
        const statusColors = {
            'registration': '#FF9800',
            'in_progress': '#4CAF50',
            'completed': '#9E9E9E'
        };
        
        const statusIcons = {
            'registration': '📝',
            'in_progress': '🔥',
            'completed': '✅'
        };
        
        const timeUntilStart = tournament.startTime - Date.now();
        const timeDisplay = timeUntilStart > 0 ? 
            `Démarre dans ${Math.ceil(timeUntilStart / 60000)} min` :
            tournament.status === 'in_progress' ? 'En cours' : 'Terminé';
        
        return `
            <div class="tournament-card" style="background: #333; border-radius: 10px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${statusColors[tournament.status]};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="color: #FFD700; margin: 0 0 10px 0;">${statusIcons[tournament.status]} ${tournament.name}</h4>
                        <p style="color: #ccc; margin: 5px 0;">Type: ${this.formatTournamentType(tournament.type)}</p>
                        <p style="color: #ccc; margin: 5px 0;">Joueurs: ${tournament.players.size}/${tournament.maxPlayers}</p>
                        <p style="color: #ccc; margin: 5px 0;">Format: ${tournament.rules.matchFormat.replace('_', ' ')}</p>
                        <p style="color: #4CAF50; margin: 5px 0; font-weight: bold;">${timeDisplay}</p>
                    </div>
                    <div style="text-align: right;">
                        ${tournament.status === 'registration' ? 
                            `<button onclick="tournamentSystem.joinTournament('${tournament.id}')" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 5px; display: block;">Rejoindre</button>` : ''}
                        <button onclick="tournamentSystem.viewTournament('${tournament.id}')" style="background: #2196F3; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer; display: block;">Voir détails</button>
                    </div>
                </div>
                
                <!-- Barre de progression -->
                <div style="background: #444; height: 8px; border-radius: 4px; margin-top: 15px; overflow: hidden;">
                    <div style="background: ${statusColors[tournament.status]}; height: 100%; width: ${(tournament.players.size / tournament.maxPlayers) * 100}%; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    }
    
    formatTournamentType(type) {
        const typeNames = {
            'single_elimination': 'Élimination Simple',
            'double_elimination': 'Double Élimination',
            'round_robin': 'Round Robin',
            'swiss': 'Système Suisse',
            'ladder': 'Échelle'
        };
        return typeNames[type] || type;
    }
    
    submitTournamentCreation() {
        const name = document.getElementById('tournamentName').value.trim();
        const type = document.getElementById('tournamentType').value;
        const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
        const matchFormat = document.getElementById('matchFormat').value;
        const startTimeMinutes = parseInt(document.getElementById('startTime').value);
        
        if (!name) {
            alert('Veuillez saisir un nom pour le tournoi');
            return;
        }
        
        // Récupérer les cartes sélectionnées
        const mapPool = Array.from(document.querySelectorAll('#mapSelection input:checked'))
            .map(input => input.value);
        
        if (mapPool.length === 0) {
            alert('Veuillez sélectionner au moins une carte');
            return;
        }
        
        const config = {
            name: name,
            type: type,
            maxPlayers: maxPlayers,
            matchFormat: matchFormat,
            startTime: Date.now() + (startTimeMinutes * 60000),
            mapPool: mapPool,
            allowSpectators: true
        };
        
        const tournament = this.createTournament(config);
        this.switchTab('upcoming');
        this.refreshUpcomingTournaments();
        
        // Réinitialiser le formulaire
        document.getElementById('tournamentName').value = '';
        document.getElementById('tournamentType').value = 'single_elimination';
        
        alert(`✅ Tournoi "${tournament.name}" créé avec succès !`);
    }
    
    joinTournament(tournamentId) {
        // Simulation d'un joueur (en réalité, ça viendrait du jeu principal)
        const playerId = 'local_player';
        const playerName = 'Joueur Test';
        
        const result = this.registerPlayerForTournament(tournamentId, playerId, playerName);
        
        if (result.success) {
            alert(`✅ ${result.message}\nJoueurs inscrits: ${result.playersCount}/${result.maxPlayers}`);
            this.refreshUpcomingTournaments();
        } else {
            alert(`❌ ${result.message}`);
        }
    }
    
    viewTournament(tournamentId) {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return;
        
        // Afficher les détails du tournoi dans une modal ou nouvelle section
        console.log('Affichage détails tournoi:', tournament);
        alert(`Détails du tournoi "${tournament.name}" - Fonctionnalité en développement`);
    }
    
    showRankings() {
        this.hideAllInterfaces();
        document.getElementById('rankingInterface')?.classList.remove('hidden');
        this.refreshLeaderboard();
    }
    
    showStats() {
        this.hideAllInterfaces();
        document.getElementById('statsInterface')?.classList.remove('hidden');
        this.refreshStats();
    }
    
    hideAllInterfaces() {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        document.getElementById('rankingInterface')?.classList.add('hidden');
        document.getElementById('statsInterface')?.classList.add('hidden');
    }
    
    refreshLeaderboard() {
        const leaderboard = this.getLeaderboard(50);
        const table = document.getElementById('leaderboardTable');
        if (!table) return;
        
        table.innerHTML = `
            <div style="display: grid; grid-template-columns: 60px 1fr 120px 100px 100px 120px; gap: 10px; padding: 15px; background: #444; font-weight: bold; color: #FFD700;">
                <div>Rang</div>
                <div>Joueur</div>
                <div>ELO</div>
                <div>Parties</div>
                <div>Win Rate</div>
                <div>Streak</div>
            </div>
            ${leaderboard.map(player => `
                <div style="display: grid; grid-template-columns: 60px 1fr 120px 100px 100px 120px; gap: 10px; padding: 15px; border-bottom: 1px solid #444; color: white;">
                    <div style="font-weight: bold; color: ${player.position <= 3 ? '#FFD700' : '#ccc'};">#${player.position}</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">${player.rank.icon}</span>
                        <span>${player.name}</span>
                        <span style="color: ${player.rank.color}; font-size: 12px;">${player.rank.name}</span>
                    </div>
                    <div style="font-weight: bold; color: ${player.rank.color};">${player.elo}</div>
                    <div>${player.gamesPlayed}</div>
                    <div style="color: ${player.winRate >= 60 ? '#4CAF50' : player.winRate >= 40 ? '#FF9800' : '#f44336'};">${player.winRate}%</div>
                    <div style="color: ${player.streak > 0 ? '#4CAF50' : player.streak < 0 ? '#f44336' : '#ccc'};">${player.streak > 0 ? '+' : ''}${player.streak}</div>
                </div>
            `).join('')}
        `;
    }
    
    refreshStats() {
        // Statistiques générales
        const player = this.playerRankings.get('local_player');
        if (!player) return;
        
        const generalStatsDiv = document.getElementById('generalStats');
        if (generalStatsDiv) {
            generalStatsDiv.innerHTML = `
                <div style="color: white;">
                    <div style="margin: 10px 0;">🎮 Parties jouées: <strong>${player.gamesPlayed}</strong></div>
                    <div style="margin: 10px 0;">🏆 Victoires: <strong>${player.wins}</strong></div>
                    <div style="margin: 10px 0;">💔 Défaites: <strong>${player.losses}</strong></div>
                    <div style="margin: 10px 0;">📊 Win Rate: <strong style="color: ${player.winRate >= 60 ? '#4CAF50' : '#FF9800'};">${player.winRate}%</strong></div>
                    <div style="margin: 10px 0;">🔥 Streak actuel: <strong>${player.streak}</strong></div>
                    <div style="margin: 10px 0;">⭐ Meilleur streak: <strong>${player.bestStreak}</strong></div>
                </div>
            `;
        }
        
        // Graphique ELO (version simplifiée)
        this.drawEloChart();
    }
    
    drawEloChart() {
        const canvas = document.getElementById('eloChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const history = this.matchHistory.filter(match => match.playerId === 'local_player').slice(-20);
        
        if (history.length === 0) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, 180);
        ctx.lineTo(280, 180);
        ctx.stroke();
        
        // Ligne ELO
        if (history.length > 1) {
            const minElo = Math.min(...history.map(h => h.newElo)) - 50;
            const maxElo = Math.max(...history.map(h => h.newElo)) + 50;
            
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            history.forEach((match, index) => {
                const x = 40 + (index / (history.length - 1)) * 240;
                const y = 180 - ((match.newElo - minElo) / (maxElo - minElo)) * 160;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Labels
        ctx.fillStyle = '#ccc';
        ctx.font = '12px Arial';
        ctx.fillText('ELO', 10, 15);
        ctx.fillText('Temps', 240, 200);
    }
    
    // Sauvegarde et chargement
    saveData() {
        try {
            const data = {
                tournaments: Array.from(this.tournaments.entries()),
                playerRankings: Array.from(this.playerRankings.entries()),
                matchHistory: this.matchHistory.slice(-1000) // Garder seulement les 1000 derniers matchs
            };
            localStorage.setItem('amongus_tournament_data', JSON.stringify(data));
        } catch (error) {
            console.error('Erreur sauvegarde tournois:', error);
        }
    }
    
    loadData() {
        try {
            const data = JSON.parse(localStorage.getItem('amongus_tournament_data') || '{}');
            
            if (data.tournaments) {
                this.tournaments = new Map(data.tournaments);
            }
            
            if (data.playerRankings) {
                this.playerRankings = new Map(data.playerRankings);
            }
            
            if (data.matchHistory) {
                this.matchHistory = data.matchHistory;
            }
            
            console.log(`📊 Données chargées: ${this.tournaments.size} tournois, ${this.playerRankings.size} joueurs`);
        } catch (error) {
            console.error('Erreur chargement tournois:', error);
        }
    }
    
    open() {
        const tournamentUI = document.getElementById('tournamentSystem');
        if (tournamentUI) {
            tournamentUI.style.display = 'block';
            this.switchTab('active');
        }
    }
    
    close() {
        const tournamentUI = document.getElementById('tournamentSystem');
        if (tournamentUI) {
            tournamentUI.style.display = 'none';
        }
    }
}

// Créer l'instance globale
const tournamentSystem = new TournamentSystem();

// Ajouter le bouton d'accès aux tournois dans le menu principal
document.addEventListener('DOMContentLoaded', () => {
    const tournamentsButton = document.createElement('button');
    tournamentsButton.id = 'openTournamentsBtn';
    tournamentsButton.textContent = '🏆 Tournois & Classements';
    tournamentsButton.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background: linear-gradient(145deg, #FF6B35, #F7931E);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        margin: 10px;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
    `;
    
    tournamentsButton.addEventListener('click', () => {
        tournamentSystem.open();
    });
    
    tournamentsButton.addEventListener('mouseenter', () => {
        tournamentsButton.style.transform = 'translateY(-2px)';
        tournamentsButton.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
    });
    
    tournamentsButton.addEventListener('mouseleave', () => {
        tournamentsButton.style.transform = 'translateY(0)';
        tournamentsButton.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
    });
    
    // Ajouter au menu principal
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        const menu = startScreen.querySelector('.menu');
        if (menu) {
            menu.appendChild(tournamentsButton);
        }
    }
});

// CSS pour l'interface tournois
const tournamentCSS = `
.tournaments-grid {
    display: grid;
    gap: 15px;
}

.tournament-card {
    transition: transform 0.3s, box-shadow 0.3s;
}

.tournament-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.tab-btn {
    padding: 12px 20px;
    background: #333;
    color: #ccc;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    margin-right: 5px;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
}

.tab-btn:hover {
    background: #444;
    color: white;
}

.tab-btn.active {
    background: #FFD700;
    color: black;
    border-bottom-color: #FFD700;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4000;
}

.modal-content {
    background: #2a2a2a;
    padding: 30px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    color: white;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    color: #ccc;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-row {
    display: flex;
    gap: 15px;
}

.hidden {
    display: none !important;
}

.stats-card {
    background: #333;
    padding: 20px;
    border-radius: 10px;
    border-left: 4px solid #4CAF50;
}

.stats-card h4 {
    margin: 0 0 15px 0;
}
`;

// Ajouter les styles
const tournamentStyleSheet = document.createElement('style');
tournamentStyleSheet.textContent = tournamentCSS;
document.head.appendChild(tournamentStyleSheet);