// Mini-jeux interactifs pour Among Us .io
// Système de tâches complexes avec interfaces dédiées

class TaskMinigames {
    constructor(game) {
        this.game = game;
        this.currentMinigame = null;
        this.minigameCanvas = null;
        this.minigameCtx = null;
        this.setupMinigameCanvas();
    }
    
    setupMinigameCanvas() {
        // Créer un canvas dédié aux mini-jeux
        this.minigameCanvas = document.createElement('canvas');
        this.minigameCanvas.id = 'minigameCanvas';
        this.minigameCanvas.width = 800;
        this.minigameCanvas.height = 600;
        this.minigameCanvas.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            border: 3px solid #FFD700;
            border-radius: 15px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            z-index: 1000;
            display: none;
        `;
        this.minigameCtx = this.minigameCanvas.getContext('2d');
        document.body.appendChild(this.minigameCanvas);
        
        // Interface de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '❌';
        closeBtn.style.cssText = `
            position: absolute;
            top: -15px;
            right: -15px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f44336;
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            z-index: 1001;
            display: none;
        `;
        closeBtn.id = 'closeMinigameBtn';
        closeBtn.addEventListener('click', () => this.closeMinigame());
        document.body.appendChild(closeBtn);
    }
    
    startMinigame(task) {
        this.currentMinigame = this.createMinigameByType(task.type);
        if (this.currentMinigame) {
            this.minigameCanvas.style.display = 'block';
            document.getElementById('closeMinigameBtn').style.display = 'block';
            this.currentMinigame.start(task);
        }
    }
    
    createMinigameByType(taskType) {
        switch (taskType) {
            case 'electrical':
                return new ElectricalPuzzle(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'medbay':
                return new MedbayScanner(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'weapons':
                return new WeaponsTargeting(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'shields':
                return new ShieldsCalibration(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'navigation':
                return new NavigationStabilizer(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'admin':
                return new AdminDataEntry(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'o2':
                return new OxygenFilter(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'communications':
                return new CommunicationsFrequency(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'storage':
                return new StorageOrganization(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            case 'upperEngine':
            case 'lowerEngine':
                return new EngineAlignment(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
            default:
                return new DefaultMinigame(this.minigameCanvas, this.minigameCtx, () => this.onMinigameComplete());
        }
    }
    
    onMinigameComplete() {
        this.closeMinigame();
        if (this.game.currentTaskMinigame) {
            this.game.completeTask(this.game.currentTaskMinigame.id);
        }
    }
    
    closeMinigame() {
        if (this.currentMinigame) {
            this.currentMinigame.destroy();
            this.currentMinigame = null;
        }
        this.minigameCanvas.style.display = 'none';
        document.getElementById('closeMinigameBtn').style.display = 'none';
        this.game.cancelTask();
    }
    
    update() {
        if (this.currentMinigame) {
            this.currentMinigame.update();
        }
    }
    
    render() {
        if (this.currentMinigame) {
            this.currentMinigame.render();
        }
    }
}

// =====================================
// MINI-JEU 1: ELECTRICAL PUZZLE
// =====================================
class ElectricalPuzzle {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.wires = [];
        this.connections = [];
        this.draggedWire = null;
        this.completed = false;
        this.startTime = Date.now();
        
        this.setupWires();
        this.setupEventListeners();
    }
    
    setupWires() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
        const leftY = [150, 220, 290, 360, 430];
        const rightY = [180, 250, 320, 390, 460];
        
        // Mélanger les positions de droite
        const shuffledRight = [...rightY].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < 5; i++) {
            this.wires.push({
                id: i,
                color: colors[i],
                startX: 100,
                startY: leftY[i],
                endX: 700,
                endY: shuffledRight[i],
                correctEndY: rightY[i],
                connected: false,
                connectionX: 700,
                connectionY: shuffledRight[i]
            });
        }
    }
    
    setupEventListeners() {
        this.mouseDownHandler = (e) => this.onMouseDown(e);
        this.mouseMoveHandler = (e) => this.onMouseMove(e);
        this.mouseUpHandler = (e) => this.onMouseUp(e);
        
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Vérifier si on clique sur un fil côté gauche
        this.wires.forEach(wire => {
            const distance = Math.sqrt(Math.pow(x - wire.startX, 2) + Math.pow(y - wire.startY, 2));
            if (distance < 30 && !wire.connected) {
                this.draggedWire = wire;
            }
        });
    }
    
    onMouseMove(e) {
        if (this.draggedWire) {
            const rect = this.canvas.getBoundingClientRect();
            this.draggedWire.connectionX = e.clientX - rect.left;
            this.draggedWire.connectionY = e.clientY - rect.top;
        }
    }
    
    onMouseUp(e) {
        if (this.draggedWire) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Vérifier si on lâche près de la bonne connexion
            const distance = Math.sqrt(Math.pow(x - this.draggedWire.endX, 2) + Math.pow(y - this.draggedWire.correctEndY, 2));
            if (distance < 40) {
                this.draggedWire.connected = true;
                this.draggedWire.connectionX = this.draggedWire.endX;
                this.draggedWire.connectionY = this.draggedWire.correctEndY;
                
                // Vérifier si tous les fils sont connectés
                if (this.wires.every(wire => wire.connected)) {
                    this.completed = true;
                    setTimeout(() => this.onComplete(), 500);
                }
            } else {
                // Remettre à la position de départ
                this.draggedWire.connectionX = this.draggedWire.endX;
                this.draggedWire.connectionY = this.draggedWire.endY;
            }
            this.draggedWire = null;
        }
    }
    
    start(task) {
        // Animation d'entrée
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTitle('RÉPARATION ÉLECTRIQUE');
    }
    
    update() {
        // Logique d'update si nécessaire
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Titre
        this.drawTitle('RÉPARATION ÉLECTRIQUE');
        
        // Panneaux électriques
        this.drawElectricalPanels();
        
        // Connexions correctes (en arrière-plan)
        this.drawCorrectConnections();
        
        // Fils
        this.drawWires();
        
        // Instructions
        this.drawInstructions();
        
        // Progress
        const connected = this.wires.filter(w => w.connected).length;
        this.drawProgress(connected, this.wires.length);
        
        if (this.completed) {
            this.drawCompletionEffect();
        }
    }
    
    drawTitle(title) {
        this.ctx.save();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 40);
        this.ctx.restore();
    }
    
    drawElectricalPanels() {
        // Panneau gauche
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(50, 100, 100, 400);
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(50, 100, 100, 400);
        
        // Panneau droite
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(650, 100, 100, 400);
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(650, 100, 100, 400);
    }
    
    drawCorrectConnections() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.wires.forEach(wire => {
            if (!wire.connected) {
                this.ctx.beginPath();
                this.ctx.moveTo(wire.startX, wire.startY);
                this.ctx.lineTo(wire.endX, wire.correctEndY);
                this.ctx.stroke();
            }
        });
        
        this.ctx.restore();
    }
    
    drawWires() {
        this.wires.forEach(wire => {
            // Connexion de départ
            this.ctx.fillStyle = wire.color;
            this.ctx.beginPath();
            this.ctx.arc(wire.startX, wire.startY, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Connexion d'arrivée
            this.ctx.fillStyle = wire.connected ? wire.color : '#555';
            this.ctx.beginPath();
            this.ctx.arc(wire.endX, wire.correctEndY, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Fil
            if (wire.connected) {
                this.ctx.strokeStyle = wire.color;
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.moveTo(wire.startX, wire.startY);
                this.ctx.lineTo(wire.connectionX, wire.connectionY);
                this.ctx.stroke();
                
                // Effet de brillance
                this.ctx.strokeStyle = '#FFF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else if (this.draggedWire === wire) {
                this.ctx.strokeStyle = wire.color;
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.moveTo(wire.startX, wire.startY);
                this.ctx.lineTo(wire.connectionX, wire.connectionY);
                this.ctx.stroke();
            }
        });
    }
    
    drawInstructions() {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Connectez chaque fil à sa prise de la même couleur', this.canvas.width / 2, this.canvas.height - 60);
        this.ctx.fillText('Cliquez et glissez depuis la gauche vers la droite', this.canvas.width / 2, this.canvas.height - 40);
    }
    
    drawProgress(current, total) {
        const x = this.canvas.width / 2 - 100;
        const y = 70;
        const width = 200;
        const height = 20;
        
        // Barre de fond
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        
        // Barre de progression
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(x, y, (current / total) * width, height);
        
        // Bordure
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Texte
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${current}/${total} connexions`, this.canvas.width / 2, y + 35);
    }
    
    drawCompletionEffect() {
        this.ctx.save();
        
        // Effet de flash
        const time = (Date.now() - this.startTime) % 1000;
        const alpha = 0.3 + 0.3 * Math.sin(time * 0.01);
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texte de succès
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TÂCHE TERMINÉE !', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }
    
    destroy() {
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
    }
}

// =====================================
// MINI-JEU 2: MEDBAY SCANNER
// =====================================
class MedbayScanner {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.scanning = false;
        this.scanProgress = 0;
        this.scanSpeed = 0.5;
        this.completed = false;
        this.scanLine = 0;
        this.vitalSigns = this.generateVitalSigns();
        
        this.setupEventListeners();
    }
    
    generateVitalSigns() {
        return {
            heartRate: 70 + Math.random() * 30,
            bloodPressure: `${120 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 10)}`,
            temperature: (36.5 + Math.random() * 1.5).toFixed(1),
            oxygen: (95 + Math.random() * 5).toFixed(1)
        };
    }
    
    setupEventListeners() {
        this.clickHandler = (e) => this.onClick(e);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    onClick(e) {
        if (!this.scanning && !this.completed) {
            this.scanning = true;
        }
    }
    
    start(task) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTitle('SCANNER MÉDICAL');
    }
    
    update() {
        if (this.scanning && !this.completed) {
            this.scanProgress += this.scanSpeed;
            this.scanLine = Math.sin(Date.now() * 0.005) * 50 + this.canvas.height / 2;
            
            if (this.scanProgress >= 100) {
                this.completed = true;
                setTimeout(() => this.onComplete(), 1000);
            }
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Titre
        this.drawTitle('SCANNER MÉDICAL');
        
        // Écran principal
        this.drawScannerScreen();
        
        // Données vitales
        this.drawVitalSigns();
        
        // Instructions
        if (!this.scanning && !this.completed) {
            this.drawInstructions();
        }
        
        // Ligne de scan
        if (this.scanning) {
            this.drawScanLine();
        }
        
        // Progress
        this.drawProgress();
        
        if (this.completed) {
            this.drawCompletionEffect();
        }
    }
    
    drawTitle(title) {
        this.ctx.save();
        this.ctx.fillStyle = '#00FF88';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 40);
        this.ctx.restore();
    }
    
    drawScannerScreen() {
        // Écran principal
        this.ctx.fillStyle = '#001a00';
        this.ctx.fillRect(200, 100, 400, 300);
        this.ctx.strokeStyle = '#00FF88';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(200, 100, 400, 300);
        
        // Grille de scan
        this.ctx.strokeStyle = '#004400';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const x = 200 + (i * 20);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 100);
            this.ctx.lineTo(x, 400);
            this.ctx.stroke();
        }
        for (let i = 0; i < 15; i++) {
            const y = 100 + (i * 20);
            this.ctx.beginPath();
            this.ctx.moveTo(200, y);
            this.ctx.lineTo(600, y);
            this.ctx.stroke();
        }
        
        // Silhouette humaine
        this.drawHumanSilhouette();
    }
    
    drawHumanSilhouette() {
        this.ctx.save();
        this.ctx.strokeStyle = this.scanning ? '#00FF88' : '#006600';
        this.ctx.lineWidth = 3;
        
        const centerX = 400;
        const centerY = 250;
        
        // Tête
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 80, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Corps
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 50);
        this.ctx.lineTo(centerX, centerY + 50);
        this.ctx.stroke();
        
        // Bras
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 40, centerY - 20);
        this.ctx.lineTo(centerX + 40, centerY - 20);
        this.ctx.stroke();
        
        // Jambes
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY + 50);
        this.ctx.lineTo(centerX - 30, centerY + 120);
        this.ctx.moveTo(centerX, centerY + 50);
        this.ctx.lineTo(centerX + 30, centerY + 120);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawVitalSigns() {
        const x = 50;
        let y = 450;
        
        this.ctx.fillStyle = '#00FF88';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`💓 Rythme cardiaque: ${this.vitalSigns.heartRate.toFixed(0)} BPM`, x, y);
        y += 25;
        this.ctx.fillText(`🩸 Tension: ${this.vitalSigns.bloodPressure} mmHg`, x, y);
        y += 25;
        this.ctx.fillText(`🌡️ Température: ${this.vitalSigns.temperature}°C`, x, y);
        y += 25;
        this.ctx.fillText(`💨 Oxygène: ${this.vitalSigns.oxygen}%`, x, y);
    }
    
    drawInstructions() {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Cliquez pour démarrer le scan médical', this.canvas.width / 2, this.canvas.height - 40);
    }
    
    drawScanLine() {
        this.ctx.save();
        this.ctx.strokeStyle = '#00FFFF';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00FFFF';
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(200, this.scanLine);
        this.ctx.lineTo(600, this.scanLine);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawProgress() {
        const x = this.canvas.width / 2 - 100;
        const y = 70;
        const width = 200;
        const height = 20;
        
        // Barre de fond
        this.ctx.fillStyle = '#001a00';
        this.ctx.fillRect(x, y, width, height);
        
        // Barre de progression
        this.ctx.fillStyle = '#00FF88';
        this.ctx.fillRect(x, y, (this.scanProgress / 100) * width, height);
        
        // Bordure
        this.ctx.strokeStyle = '#00FF88';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Texte
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Scan: ${this.scanProgress.toFixed(0)}%`, this.canvas.width / 2, y + 35);
    }
    
    drawCompletionEffect() {
        this.ctx.save();
        
        // Effet de flash vert
        const time = Date.now() % 1000;
        const alpha = 0.2 + 0.2 * Math.sin(time * 0.01);
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#00FF88';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texte de succès
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#00FF88';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SCAN TERMINÉ ✓', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }
    
    destroy() {
        this.canvas.removeEventListener('click', this.clickHandler);
    }
}

// =====================================
// MINI-JEU 3: WEAPONS TARGETING
// =====================================
class WeaponsTargeting {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.targets = [];
        this.score = 0;
        this.targetScore = 10;
        this.timeLeft = 30;
        this.completed = false;
        this.lastTargetTime = 0;
        
        this.setupEventListeners();
        this.spawnTarget();
    }
    
    setupEventListeners() {
        this.clickHandler = (e) => this.onClick(e);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    onClick(e) {
        if (this.completed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Vérifier si on a cliqué sur une cible
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
            
            if (distance < target.radius) {
                this.targets.splice(i, 1);
                this.score++;
                this.createExplosion(target.x, target.y);
                
                if (this.score >= this.targetScore) {
                    this.completed = true;
                    setTimeout(() => this.onComplete(), 1000);
                }
                return;
            }
        }
    }
    
    spawnTarget() {
        if (this.completed) return;
        
        const target = {
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: Math.random() * (this.canvas.height - 200) + 100,
            radius: 20 + Math.random() * 15,
            speed: 1 + Math.random() * 2,
            direction: Math.random() * Math.PI * 2,
            life: 3000 + Math.random() * 2000
        };
        
        this.targets.push(target);
        
        // Programmer la prochaine cible
        setTimeout(() => this.spawnTarget(), 800 + Math.random() * 1200);
    }
    
    createExplosion(x, y) {
        // Créer un effet d'explosion simple
        const explosion = { x, y, time: Date.now(), particles: [] };
        
        for (let i = 0; i < 8; i++) {
            explosion.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 500
            });
        }
        
        this.explosions = this.explosions || [];
        this.explosions.push(explosion);
    }
    
    start(task) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTitle('SYSTÈME D\'ARMEMENT');
        
        // Démarrer le timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0 && !this.completed) {
                this.completed = true;
                setTimeout(() => this.onComplete(), 1000);
            }
        }, 1000);
    }
    
    update() {
        const now = Date.now();
        
        // Mettre à jour les cibles
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            
            // Mouvement
            target.x += Math.cos(target.direction) * target.speed;
            target.y += Math.sin(target.direction) * target.speed;
            
            // Rebond sur les bords
            if (target.x < target.radius || target.x > this.canvas.width - target.radius) {
                target.direction = Math.PI - target.direction;
            }
            if (target.y < 100 + target.radius || target.y > this.canvas.height - 50 - target.radius) {
                target.direction = -target.direction;
            }
            
            // Supprimer les cibles anciennes
            target.life -= 16;
            if (target.life <= 0) {
                this.targets.splice(i, 1);
            }
        }
        
        // Mettre à jour les explosions
        if (this.explosions) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const explosion = this.explosions[i];
                const age = now - explosion.time;
                
                explosion.particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.life -= 16;
                });
                
                if (age > 500) {
                    this.explosions.splice(i, 1);
                }
            }
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond spatial
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Étoiles de fond
        this.drawStars();
        
        // Titre
        this.drawTitle('SYSTÈME D\'ARMEMENT');
        
        // Interface
        this.drawUI();
        
        // Cibles
        this.drawTargets();
        
        // Explosions
        this.drawExplosions();
        
        // Viseur
        this.drawCrosshair();
        
        if (this.completed) {
            this.drawCompletionEffect();
        }
    }
    
    drawTitle(title) {
        this.ctx.save();
        this.ctx.fillStyle = '#FF4444';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 40);
        this.ctx.restore();
    }
    
    drawStars() {
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 97) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawUI() {
        // Score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Cibles détruites: ${this.score}/${this.targetScore}`, 20, 80);
        
        // Timer
        this.ctx.fillStyle = this.timeLeft < 10 ? '#FF4444' : '#FFF';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Temps: ${this.timeLeft}s`, this.canvas.width - 20, 80);
    }
    
    drawTargets() {
        this.targets.forEach(target => {
            // Cible avec anneaux
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 3;
            
            // Anneaux externes
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius * 0.4, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Centre
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.radius * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Indicateur de vie
            const lifePercent = target.life / 5000;
            this.ctx.fillStyle = `rgba(255, 255, 0, ${lifePercent})`;
            this.ctx.fillRect(target.x - target.radius, target.y - target.radius - 10, target.radius * 2 * lifePercent, 5);
        });
    }
    
    drawExplosions() {
        if (!this.explosions) return;
        
        this.explosions.forEach(explosion => {
            explosion.particles.forEach(particle => {
                if (particle.life > 0) {
                    const alpha = particle.life / 500;
                    this.ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        });
    }
    
    drawCrosshair() {
        // Viseur au centre
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        
        // Croix
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, centerY);
        this.ctx.lineTo(centerX + 20, centerY);
        this.ctx.moveTo(centerX, centerY - 20);
        this.ctx.lineTo(centerX, centerY + 20);
        this.ctx.stroke();
        
        // Cercle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawCompletionEffect() {
        this.ctx.save();
        
        // Effet de flash
        const time = Date.now() % 1000;
        const alpha = 0.2 + 0.2 * Math.sin(time * 0.01);
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texte de succès
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('MISSION ACCOMPLIE !', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }
    
    destroy() {
        this.canvas.removeEventListener('click', this.clickHandler);
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// =====================================
// MINI-JEU 4: SHIELDS CALIBRATION
// =====================================
class ShieldsCalibration {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.hexagons = [];
        this.completedHexagons = 0;
        this.targetHexagons = 6;
        this.completed = false;
        
        this.setupHexagons();
        this.setupEventListeners();
    }
    
    setupHexagons() {
        const rows = 2;
        const cols = 3;
        const startX = 200;
        const startY = 200;
        const spacingX = 130;
        const spacingY = 120;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.hexagons.push({
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    size: 50,
                    active: false,
                    energy: 0,
                    maxEnergy: 100,
                    charging: false
                });
            }
        }
    }
    
    setupEventListeners() {
        this.clickHandler = (e) => this.onClick(e);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    onClick(e) {
        if (this.completed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hexagons.forEach(hex => {
            const distance = Math.sqrt(Math.pow(x - hex.x, 2) + Math.pow(y - hex.y, 2));
            if (distance < hex.size && !hex.active) {
                hex.charging = true;
            }
        });
    }
    
    start(task) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTitle('CALIBRAGE DES BOUCLIERS');
    }
    
    update() {
        if (this.completed) return;
        
        this.hexagons.forEach(hex => {
            if (hex.charging && !hex.active) {
                hex.energy += 2;
                if (hex.energy >= hex.maxEnergy) {
                    hex.active = true;
                    hex.charging = false;
                    this.completedHexagons++;
                    
                    if (this.completedHexagons >= this.targetHexagons) {
                        this.completed = true;
                        setTimeout(() => this.onComplete(), 1000);
                    }
                }
            }
        });
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Titre
        this.drawTitle('CALIBRAGE DES BOUCLIERS');
        
        // Instructions
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Cliquez sur chaque hexagone pour charger les boucliers', this.canvas.width / 2, this.canvas.height - 60);
        
        // Hexagones
        this.drawHexagons();
        
        // Progress
        this.drawProgress(this.completedHexagons, this.targetHexagons);
        
        if (this.completed) {
            this.drawCompletionEffect();
        }
    }
    
    drawTitle(title) {
        this.ctx.save();
        this.ctx.fillStyle = '#00AAFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 40);
        this.ctx.restore();
    }
    
    drawHexagons() {
        this.hexagons.forEach(hex => {
            // Hexagone de base
            this.drawHexagon(hex.x, hex.y, hex.size, hex.active ? '#00AAFF' : '#333');
            
            // Barre d'énergie
            if (hex.charging || hex.active) {
                const energyPercent = hex.energy / hex.maxEnergy;
                this.ctx.fillStyle = hex.active ? '#00FF00' : '#FFAA00';
                this.ctx.fillRect(hex.x - 30, hex.y + 70, 60 * energyPercent, 10);
                
                this.ctx.strokeStyle = '#FFF';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(hex.x - 30, hex.y + 70, 60, 10);
            }
            
            // Effet de brillance si actif
            if (hex.active) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.3 + 0.3 * Math.sin(Date.now() * 0.01);
                this.drawHexagon(hex.x, hex.y, hex.size + 10, '#00FFFF');
                this.ctx.restore();
            }
        });
    }
    
    drawHexagon(x, y, size, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hexX = x + size * Math.cos(angle);
            const hexY = y + size * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(hexX, hexY);
            } else {
                this.ctx.lineTo(hexX, hexY);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawProgress(current, total) {
        const x = this.canvas.width / 2 - 100;
        const y = 70;
        const width = 200;
        const height = 20;
        
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = '#00AAFF';
        this.ctx.fillRect(x, y, (current / total) * width, height);
        
        this.ctx.strokeStyle = '#00AAFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${current}/${total} boucliers activés`, this.canvas.width / 2, y + 35);
    }
    
    drawCompletionEffect() {
        this.ctx.save();
        
        const time = Date.now() % 1000;
        const alpha = 0.2 + 0.2 * Math.sin(time * 0.01);
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#00AAFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#00AAFF';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BOUCLIERS ACTIVÉS !', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }
    
    destroy() {
        this.canvas.removeEventListener('click', this.clickHandler);
    }
}

// =====================================
// MINI-JEU 5: NAVIGATION STABILIZER
// =====================================
class NavigationStabilizer {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.crosshair = { x: 400, y: 300 };
        this.target = this.generateTarget();
        this.stability = 0;
        this.targetStability = 100;
        this.completed = false;
        this.shakeMagnitude = 20;
        
        this.setupEventListeners();
    }
    
    generateTarget() {
        return {
            x: 300 + Math.random() * 200,
            y: 200 + Math.random() * 200,
            radius: 30
        };
    }
    
    setupEventListeners() {
        this.mouseMoveHandler = (e) => this.onMouseMove(e);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    }
    
    onMouseMove(e) {
        if (this.completed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.crosshair.x = e.clientX - rect.left;
        this.crosshair.y = e.clientY - rect.top;
    }
    
    start(task) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTitle('STABILISATEUR DE NAVIGATION');
    }
    
    update() {
        if (this.completed) return;
        
        // Calculer la distance au centre
        const distance = Math.sqrt(
            Math.pow(this.crosshair.x - this.target.x, 2) + 
            Math.pow(this.crosshair.y - this.target.y, 2)
        );
        
        if (distance < this.target.radius) {
            this.stability += 1.5;
            this.shakeMagnitude = Math.max(5, this.shakeMagnitude - 0.3);
        } else {
            this.stability = Math.max(0, this.stability - 0.8);
            this.shakeMagnitude = Math.min(20, this.shakeMagnitude + 0.2);
        }
        
        // Bouger la cible
        this.target.x += (Math.random() - 0.5) * this.shakeMagnitude;
        this.target.y += (Math.random() - 0.5) * this.shakeMagnitude;
        
        // Garder la cible dans l'écran
        this.target.x = Math.max(100, Math.min(700, this.target.x));
        this.target.y = Math.max(100, Math.min(500, this.target.y));
        
        if (this.stability >= this.targetStability) {
            this.completed = true;
            setTimeout(() => this.onComplete(), 1000);
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond avec effet radar
        this.ctx.fillStyle = '#001100';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Titre
        this.drawTitle('STABILISATEUR DE NAVIGATION');
        
        // Grille radar
        this.drawRadarGrid();
        
        // Zone cible
        this.drawTarget();
        
        // Viseur
        this.drawCrosshair();
        
        // Stabilité
        this.drawStabilityMeter();
        
        // Instructions
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Maintenez le viseur sur la cible pour stabiliser', this.canvas.width / 2, this.canvas.height - 40);
        
        if (this.completed) {
            this.drawCompletionEffect();
        }
    }
    
    drawTitle(title) {
        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 40);
        this.ctx.restore();
    }
    
    drawRadarGrid() {
        this.ctx.strokeStyle = '#004400';
        this.ctx.lineWidth = 1;
        
        // Lignes verticales
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 100);
            this.ctx.lineTo(x, 500);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 100; y < 500; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(100, y);
            this.ctx.lineTo(700, y);
            this.ctx.stroke();
        }
    }
    
    drawTarget() {
        // Zone cible avec pulsation
        const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.005);
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, this.target.radius * pulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Centre de la cible
        this.ctx.fillStyle = '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawCrosshair() {
        this.ctx.save();
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 2;
        
        // Croix
        this.ctx.beginPath();
        this.ctx.moveTo(this.crosshair.x - 15, this.crosshair.y);
        this.ctx.lineTo(this.crosshair.x + 15, this.crosshair.y);
        this.ctx.moveTo(this.crosshair.x, this.crosshair.y - 15);
        this.ctx.lineTo(this.crosshair.x, this.crosshair.y + 15);
        this.ctx.stroke();
        
        // Cercle
        this.ctx.beginPath();
        this.ctx.arc(this.crosshair.x, this.crosshair.y, 10, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawStabilityMeter() {
        const x = 50;
        const y = 70;
        const width = 200;
        const height = 20;
        
        // Fond
        this.ctx.fillStyle = '#001100';
        this.ctx.fillRect(x, y, width, height);
        
        // Barre de stabilité
        this.ctx.fillStyle = this.stability > 80 ? '#00FF00' : this.stability > 40 ? '#FFAA00' : '#FF0000';
        this.ctx.fillRect(x, y, (this.stability / this.targetStability) * width, height);
        
        // Bordure
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Texte
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Stabilité: ${Math.floor(this.stability)}%`, x, y + 35);
    }
    
    drawCompletionEffect() {
        this.ctx.save();
        
        const time = Date.now() % 1000;
        const alpha = 0.2 + 0.2 * Math.sin(time * 0.01);
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('NAVIGATION STABILISÉE !', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }
    
    destroy() {
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    }
}
class DefaultMinigame {
    constructor(canvas, ctx, onComplete) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.onComplete = onComplete;
        this.progress = 0;
        this.completed = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.clickHandler = () => {
            this.progress += 10;
            if (this.progress >= 100) {
                this.completed = true;
                setTimeout(() => this.onComplete(), 500);
            }
        };
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    start(task) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    update() {
        // Auto-progression lente
        if (!this.completed) {
            this.progress += 0.2;
            if (this.progress >= 100) {
                this.completed = true;
                setTimeout(() => this.onComplete(), 500);
            }
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Titre
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TÂCHE EN COURS', this.canvas.width / 2, 100);
        
        // Barre de progression
        const x = this.canvas.width / 2 - 150;
        const y = this.canvas.height / 2 - 25;
        const width = 300;
        const height = 50;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(x, y, (this.progress / 100) * width, height);
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Pourcentage
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`${Math.floor(this.progress)}%`, this.canvas.width / 2, y + 35);
        
        // Instructions
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Cliquez pour accélérer ou attendez...', this.canvas.width / 2, y + 80);
        
        if (this.completed) {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.fillText('TERMINÉ !', this.canvas.width / 2, y - 50);
        }
    }
    
    destroy() {
        this.canvas.removeEventListener('click', this.clickHandler);
    }
}

// Export pour utilisation dans le jeu principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskMinigames };
}