// Éditeur de cartes pour Among Us .io
// Permet de créer et modifier des cartes personnalisées

class MapEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        
        // État de l'éditeur
        this.mode = 'room'; // room, corridor, spawn, task, vent
        this.selectedTool = 'room';
        this.isDrawing = false;
        
        // Carte en cours d'édition
        this.currentMap = {
            id: 'custom_' + Date.now(),
            name: 'Nouvelle Carte',
            width: 2400,
            height: 1600,
            rooms: [],
            corridors: [],
            spawnPoints: [],
            taskPositions: [],
            vents: [],
            background: '#2c2c2c'
        };
        
        // Outils de dessin
        this.brush = {
            size: 20,
            color: '#444444'
        };
        
        // Navigation
        this.camera = { x: 0, y: 0 };
        this.zoom = 1;
        
        // Sélection
        this.selectedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Historique pour undo/redo
        this.history = [];
        this.historyIndex = -1;
        
        this.setupUI();
    }
    
    setupUI() {
        // Interface principale de l'éditeur
        const editorUI = document.createElement('div');
        editorUI.id = 'mapEditor';
        editorUI.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            display: none;
            z-index: 2000;
        `;
        
        editorUI.innerHTML = `
            <!-- Barre d'outils -->
            <div id="editorToolbar" style="position: absolute; top: 0; left: 0; right: 0; height: 60px; background: #333; border-bottom: 2px solid #555; display: flex; align-items: center; padding: 0 20px; gap: 15px; z-index: 2001;">
                <h3 style="color: #FFD700; margin: 0;">🗺️ Éditeur de Cartes</h3>
                
                <div style="display: flex; gap: 10px;">
                    <button class="tool-btn" data-tool="room" title="Créer une salle">🏠 Salle</button>
                    <button class="tool-btn" data-tool="corridor" title="Créer un couloir">🚪 Couloir</button>
                    <button class="tool-btn" data-tool="spawn" title="Point d'apparition">🚀 Spawn</button>
                    <button class="tool-btn" data-tool="task" title="Position de tâche">⚡ Tâche</button>
                    <button class="tool-btn" data-tool="vent" title="Bouche d'aération">🌪️ Vent</button>
                    <button class="tool-btn" data-tool="eraser" title="Effacer">🗑️ Effacer</button>
                </div>
                
                <div style="border-left: 2px solid #555; padding-left: 15px; display: flex; gap: 10px;">
                    <button id="undoBtn" title="Annuler">↶ Undo</button>
                    <button id="redoBtn" title="Refaire">↷ Redo</button>
                    <button id="clearBtn" title="Tout effacer">🗑️ Clear</button>
                </div>
                
                <div style="border-left: 2px solid #555; padding-left: 15px; display: flex; gap: 10px;">
                    <button id="saveMapBtn" title="Sauvegarder">💾 Save</button>
                    <button id="loadMapBtn" title="Charger">📁 Load</button>
                    <button id="exportMapBtn" title="Exporter">📤 Export</button>
                    <button id="testMapBtn" title="Tester">▶️ Test</button>
                </div>
                
                <div style="margin-left: auto;">
                    <button id="closeEditorBtn" style="background: #f44336; color: white;">❌ Fermer</button>
                </div>
            </div>
            
            <!-- Panneau latéral -->
            <div id="editorSidebar" style="position: absolute; top: 60px; left: 0; width: 300px; bottom: 0; background: #2a2a2a; border-right: 2px solid #555; overflow-y: auto; z-index: 2001;">
                <div style="padding: 20px; color: white;">
                    <!-- Propriétés de la carte -->
                    <div class="editor-section">
                        <h4 style="color: #FFD700; margin-bottom: 10px;">📋 Propriétés de la carte</h4>
                        <label>Nom de la carte:</label>
                        <input type="text" id="mapNameInput" value="Nouvelle Carte" style="width: 100%; padding: 8px; margin: 5px 0; border-radius: 4px; border: 1px solid #555; background: #444; color: white;">
                        
                        <label>Taille:</label>
                        <div style="display: flex; gap: 10px; margin: 5px 0;">
                            <input type="number" id="mapWidthInput" value="2400" min="800" max="4000" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #555; background: #444; color: white;">
                            <span style="color: #ccc;">×</span>
                            <input type="number" id="mapHeightInput" value="1600" min="600" max="3000" style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #555; background: #444; color: white;">
                        </div>
                        
                        <label>Couleur de fond:</label>
                        <input type="color" id="mapBackgroundInput" value="#2c2c2c" style="width: 100%; padding: 8px; margin: 5px 0; border-radius: 4px; border: 1px solid #555; background: #444;">
                    </div>
                    
                    <!-- Outils de dessin -->
                    <div class="editor-section">
                        <h4 style="color: #FFD700; margin: 20px 0 10px 0;">🎨 Outils de dessin</h4>
                        <label>Taille du pinceau:</label>
                        <input type="range" id="brushSizeSlider" min="5" max="50" value="20" style="width: 100%; margin: 5px 0;">
                        <span id="brushSizeValue">20px</span>
                        
                        <label>Couleur:</label>
                        <input type="color" id="brushColorInput" value="#444444" style="width: 100%; padding: 8px; margin: 5px 0; border-radius: 4px; border: 1px solid #555; background: #444;">
                    </div>
                    
                    <!-- Éléments de la carte -->
                    <div class="editor-section">
                        <h4 style="color: #FFD700; margin: 20px 0 10px 0;">📊 Éléments</h4>
                        <div id="mapElementsList">
                            <div>Salles: <span id="roomCount">0</span></div>
                            <div>Couloirs: <span id="corridorCount">0</span></div>
                            <div>Spawns: <span id="spawnCount">0</span></div>
                            <div>Tâches: <span id="taskCount">0</span></div>
                            <div>Vents: <span id="ventCount">0</span></div>
                        </div>
                    </div>
                    
                    <!-- Propriétés de l'élément sélectionné -->
                    <div class="editor-section" id="selectedElementProps" style="display: none;">
                        <h4 style="color: #FFD700; margin: 20px 0 10px 0;">🔧 Propriétés</h4>
                        <div id="elementPropsContent"></div>
                    </div>
                </div>
            </div>
            
            <!-- Canvas principal -->
            <div id="editorCanvasContainer" style="position: absolute; top: 60px; left: 300px; right: 0; bottom: 0; overflow: hidden;">
                <canvas id="editorCanvas" style="cursor: crosshair;"></canvas>
            </div>
            
            <!-- Contrôles de navigation -->
            <div id="editorNavigation" style="position: absolute; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 2001;">
                <button id="zoomInBtn" style="width: 50px; height: 50px; border-radius: 50%; background: #333; color: white; border: 2px solid #555; font-size: 24px;">+</button>
                <button id="zoomOutBtn" style="width: 50px; height: 50px; border-radius: 50%; background: #333; color: white; border: 2px solid #555; font-size: 24px;">−</button>
                <button id="centerBtn" style="width: 50px; height: 50px; border-radius: 50%; background: #333; color: white; border: 2px solid #555; font-size: 16px;">🎯</button>
            </div>
        `;
        
        document.body.appendChild(editorUI);
        this.setupEventListeners();
        this.setupCanvas();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Ajuster la taille du canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = document.getElementById('editorCanvasContainer');
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.render();
    }
    
    setupEventListeners() {
        // Boutons d'outils
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTool(e.target.dataset.tool);
            });
        });
        
        // Actions
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearMap());
        document.getElementById('saveMapBtn').addEventListener('click', () => this.saveMap());
        document.getElementById('loadMapBtn').addEventListener('click', () => this.loadMap());
        document.getElementById('exportMapBtn').addEventListener('click', () => this.exportMap());
        document.getElementById('testMapBtn').addEventListener('click', () => this.testMap());
        document.getElementById('closeEditorBtn').addEventListener('click', () => this.close());
        
        // Navigation
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('centerBtn').addEventListener('click', () => this.centerView());
        
        // Propriétés de carte
        document.getElementById('mapNameInput').addEventListener('input', (e) => {
            this.currentMap.name = e.target.value;
        });
        
        document.getElementById('mapWidthInput').addEventListener('input', (e) => {
            this.currentMap.width = parseInt(e.target.value);
            this.render();
        });
        
        document.getElementById('mapHeightInput').addEventListener('input', (e) => {
            this.currentMap.height = parseInt(e.target.value);
            this.render();
        });
        
        document.getElementById('mapBackgroundInput').addEventListener('input', (e) => {
            this.currentMap.background = e.target.value;
            this.render();
        });
        
        // Outils de dessin
        document.getElementById('brushSizeSlider').addEventListener('input', (e) => {
            this.brush.size = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = e.target.value + 'px';
        });
        
        document.getElementById('brushColorInput').addEventListener('input', (e) => {
            this.brush.color = e.target.value;
        });
        
        // Événements canvas
        this.setupCanvasEvents();
    }
    
    setupCanvasEvents() {
        // Dessin et interaction
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Navigation avec molette
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });
        
        // Déplacement de la caméra
        let isPanning = false;
        let lastPanPoint = { x: 0, y: 0 };
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Molette ou Ctrl+clic
                isPanning = true;
                lastPanPoint = { x: e.clientX, y: e.clientY };
                this.canvas.style.cursor = 'move';
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const deltaX = e.clientX - lastPanPoint.x;
                const deltaY = e.clientY - lastPanPoint.y;
                
                this.camera.x -= deltaX / this.zoom;
                this.camera.y -= deltaY / this.zoom;
                
                lastPanPoint = { x: e.clientX, y: e.clientY };
                this.render();
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (isPanning) {
                isPanning = false;
                this.canvas.style.cursor = 'crosshair';
            }
        });
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveMap();
            } else if (e.key === 'Delete' && this.selectedElement) {
                this.deleteElement(this.selectedElement);
            }
        });
    }
    
    onMouseDown(e) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom + this.camera.x;
        const y = (e.clientY - rect.top) / this.zoom + this.camera.y;
        
        this.isDrawing = true;
        
        switch (this.selectedTool) {
            case 'room':
                this.startDrawingRoom(x, y);
                break;
            case 'corridor':
                this.startDrawingCorridor(x, y);
                break;
            case 'spawn':
                this.addSpawnPoint(x, y);
                break;
            case 'task':
                this.addTaskPosition(x, y);
                break;
            case 'vent':
                this.addVent(x, y);
                break;
            case 'eraser':
                this.eraseAt(x, y);
                break;
        }
    }
    
    onMouseMove(e) {
        if (!this.isActive || !this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom + this.camera.x;
        const y = (e.clientY - rect.top) / this.zoom + this.camera.y;
        
        switch (this.selectedTool) {
            case 'room':
                this.updateDrawingRoom(x, y);
                break;
            case 'corridor':
                this.updateDrawingCorridor(x, y);
                break;
            case 'eraser':
                this.eraseAt(x, y);
                break;
        }
    }
    
    onMouseUp(e) {
        if (!this.isActive) return;
        
        this.isDrawing = false;
        
        if (this.selectedTool === 'room' || this.selectedTool === 'corridor') {
            this.finalizeDrawing();
        }
        
        this.updateElementCounts();
        this.render();
    }
    
    selectTool(tool) {
        this.selectedTool = tool;
        
        // Mettre à jour l'interface
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Changer le curseur
        switch (tool) {
            case 'eraser':
                this.canvas.style.cursor = 'crosshair';
                break;
            default:
                this.canvas.style.cursor = 'crosshair';
        }
    }
    
    startDrawingRoom(x, y) {
        this.currentDrawing = {
            type: 'room',
            startX: x,
            startY: y,
            x: x,
            y: y,
            width: 0,
            height: 0
        };
    }
    
    updateDrawingRoom(x, y) {
        if (this.currentDrawing && this.currentDrawing.type === 'room') {
            this.currentDrawing.width = Math.abs(x - this.currentDrawing.startX);
            this.currentDrawing.height = Math.abs(y - this.currentDrawing.startY);
            this.currentDrawing.x = Math.min(x, this.currentDrawing.startX);
            this.currentDrawing.y = Math.min(y, this.currentDrawing.startY);
            this.render();
        }
    }
    
    startDrawingCorridor(x, y) {
        this.currentDrawing = {
            type: 'corridor',
            points: [{ x, y }]
        };
    }
    
    updateDrawingCorridor(x, y) {
        if (this.currentDrawing && this.currentDrawing.type === 'corridor') {
            // Mettre à jour le dernier point
            if (this.currentDrawing.points.length > 0) {
                this.currentDrawing.points[this.currentDrawing.points.length - 1] = { x, y };
                this.render();
            }
        }
    }
    
    addSpawnPoint(x, y) {
        this.saveState();
        this.currentMap.spawnPoints.push({
            id: Date.now(),
            x: x,
            y: y,
            name: `Spawn ${this.currentMap.spawnPoints.length + 1}`
        });
        this.render();
    }
    
    addTaskPosition(x, y) {
        this.saveState();
        this.currentMap.taskPositions.push({
            id: Date.now(),
            x: x,
            y: y,
            type: 'generic',
            name: `Tâche ${this.currentMap.taskPositions.length + 1}`
        });
        this.render();
    }
    
    addVent(x, y) {
        this.saveState();
        this.currentMap.vents.push({
            id: Date.now(),
            x: x,
            y: y,
            connections: [],
            name: `Vent ${this.currentMap.vents.length + 1}`
        });
        this.render();
    }
    
    eraseAt(x, y) {
        // Supprimer les éléments à cette position
        const eraseRadius = this.brush.size / 2;
        let changed = false;
        
        // Supprimer salles
        this.currentMap.rooms = this.currentMap.rooms.filter(room => {
            const inRoom = x >= room.x && x <= room.x + room.width && 
                          y >= room.y && y <= room.y + room.height;
            if (inRoom) changed = true;
            return !inRoom;
        });
        
        // Supprimer couloirs
        this.currentMap.corridors = this.currentMap.corridors.filter(corridor => {
            const inCorridor = corridor.points.some(point => {
                const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
                return distance <= eraseRadius;
            });
            if (inCorridor) changed = true;
            return !inCorridor;
        });
        
        // Supprimer points de spawn
        this.currentMap.spawnPoints = this.currentMap.spawnPoints.filter(spawn => {
            const distance = Math.sqrt(Math.pow(x - spawn.x, 2) + Math.pow(y - spawn.y, 2));
            const inSpawn = distance <= eraseRadius;
            if (inSpawn) changed = true;
            return !inSpawn;
        });
        
        // Supprimer positions de tâches
        this.currentMap.taskPositions = this.currentMap.taskPositions.filter(task => {
            const distance = Math.sqrt(Math.pow(x - task.x, 2) + Math.pow(y - task.y, 2));
            const inTask = distance <= eraseRadius;
            if (inTask) changed = true;
            return !inTask;
        });
        
        // Supprimer vents
        this.currentMap.vents = this.currentMap.vents.filter(vent => {
            const distance = Math.sqrt(Math.pow(x - vent.x, 2) + Math.pow(y - vent.y, 2));
            const inVent = distance <= eraseRadius;
            if (inVent) changed = true;
            return !inVent;
        });
        
        if (changed) {
            this.render();
        }
    }
    
    finalizeDrawing() {
        if (!this.currentDrawing) return;
        
        this.saveState();
        
        if (this.currentDrawing.type === 'room' && this.currentDrawing.width > 10 && this.currentDrawing.height > 10) {
            this.currentMap.rooms.push({
                id: Date.now(),
                x: this.currentDrawing.x,
                y: this.currentDrawing.y,
                width: this.currentDrawing.width,
                height: this.currentDrawing.height,
                color: this.brush.color,
                name: `Salle ${this.currentMap.rooms.length + 1}`
            });
        } else if (this.currentDrawing.type === 'corridor' && this.currentDrawing.points.length > 1) {
            this.currentMap.corridors.push({
                id: Date.now(),
                points: [...this.currentDrawing.points],
                width: this.brush.size,
                color: this.brush.color,
                name: `Couloir ${this.currentMap.corridors.length + 1}`
            });
        }
        
        this.currentDrawing = null;
    }
    
    render() {
        if (!this.ctx) return;
        
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Appliquer la transformation de caméra
        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Fond de la carte
        this.ctx.fillStyle = this.currentMap.background;
        this.ctx.fillRect(0, 0, this.currentMap.width, this.currentMap.height);
        
        // Bordures de la carte
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.currentMap.width, this.currentMap.height);
        
        // Grille
        this.drawGrid();
        
        // Éléments de la carte
        this.drawRooms();
        this.drawCorridors();
        this.drawSpawnPoints();
        this.drawTaskPositions();
        this.drawVents();
        
        // Élément en cours de dessin
        this.drawCurrentDrawing();
        
        this.ctx.restore();
        
        // Interface par-dessus
        this.drawUI();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        // Lignes verticales
        for (let x = 0; x <= this.currentMap.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.currentMap.height);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 0; y <= this.currentMap.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.currentMap.width, y);
            this.ctx.stroke();
        }
    }
    
    drawRooms() {
        this.currentMap.rooms.forEach(room => {
            this.ctx.fillStyle = room.color;
            this.ctx.fillRect(room.x, room.y, room.width, room.height);
            
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(room.x, room.y, room.width, room.height);
            
            // Nom de la salle
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(room.name, room.x + room.width / 2, room.y + room.height / 2);
        });
    }
    
    drawCorridors() {
        this.currentMap.corridors.forEach(corridor => {
            if (corridor.points.length < 2) return;
            
            this.ctx.strokeStyle = corridor.color;
            this.ctx.lineWidth = corridor.width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(corridor.points[0].x, corridor.points[0].y);
            
            for (let i = 1; i < corridor.points.length; i++) {
                this.ctx.lineTo(corridor.points[i].x, corridor.points[i].y);
            }
            
            this.ctx.stroke();
        });
    }
    
    drawSpawnPoints() {
        this.currentMap.spawnPoints.forEach(spawn => {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.beginPath();
            this.ctx.arc(spawn.x, spawn.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Icône
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🚀', spawn.x, spawn.y + 5);
        });
    }
    
    drawTaskPositions() {
        this.currentMap.taskPositions.forEach(task => {
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.beginPath();
            this.ctx.arc(task.x, task.y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Icône
            this.ctx.fillStyle = '#000';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚡', task.x, task.y + 4);
        });
    }
    
    drawVents() {
        this.currentMap.vents.forEach(vent => {
            this.ctx.fillStyle = '#666';
            this.ctx.beginPath();
            this.ctx.arc(vent.x, vent.y, 18, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Icône
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🌪️', vent.x, vent.y + 5);
        });
    }
    
    drawCurrentDrawing() {
        if (!this.currentDrawing) return;
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        if (this.currentDrawing.type === 'room') {
            this.ctx.strokeRect(
                this.currentDrawing.x,
                this.currentDrawing.y,
                this.currentDrawing.width,
                this.currentDrawing.height
            );
        } else if (this.currentDrawing.type === 'corridor') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentDrawing.points[0].x, this.currentDrawing.points[0].y);
            for (let i = 1; i < this.currentDrawing.points.length; i++) {
                this.ctx.lineTo(this.currentDrawing.points[i].x, this.currentDrawing.points[i].y);
            }
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawUI() {
        // Coordonnées de la souris, zoom, etc.
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 60, 200, 50);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Zoom: ${(this.zoom * 100).toFixed(0)}%`, 20, this.canvas.height - 35);
        this.ctx.fillText(`Outil: ${this.selectedTool}`, 20, this.canvas.height - 15);
    }
    
    updateElementCounts() {
        document.getElementById('roomCount').textContent = this.currentMap.rooms.length;
        document.getElementById('corridorCount').textContent = this.currentMap.corridors.length;
        document.getElementById('spawnCount').textContent = this.currentMap.spawnPoints.length;
        document.getElementById('taskCount').textContent = this.currentMap.taskPositions.length;
        document.getElementById('ventCount').textContent = this.currentMap.vents.length;
    }
    
    zoomIn() {
        this.zoom = Math.min(3, this.zoom * 1.2);
        this.render();
    }
    
    zoomOut() {
        this.zoom = Math.max(0.2, this.zoom / 1.2);
        this.render();
    }
    
    centerView() {
        this.camera.x = this.currentMap.width / 2 - this.canvas.width / (2 * this.zoom);
        this.camera.y = this.currentMap.height / 2 - this.canvas.height / (2 * this.zoom);
        this.render();
    }
    
    saveState() {
        // Sauvegarder l'état pour undo/redo
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(this.currentMap)));
        this.historyIndex++;
        
        // Limiter l'historique
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentMap = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.updateElementCounts();
            this.render();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentMap = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.updateElementCounts();
            this.render();
        }
    }
    
    clearMap() {
        if (confirm('Voulez-vous vraiment effacer toute la carte ?')) {
            this.saveState();
            this.currentMap.rooms = [];
            this.currentMap.corridors = [];
            this.currentMap.spawnPoints = [];
            this.currentMap.taskPositions = [];
            this.currentMap.vents = [];
            this.updateElementCounts();
            this.render();
        }
    }
    
    saveMap() {
        const mapData = JSON.stringify(this.currentMap, null, 2);
        const blob = new Blob([mapData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentMap.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        // Sauvegarder aussi en localStorage
        const savedMaps = JSON.parse(localStorage.getItem('amongus_custom_maps') || '[]');
        const existingIndex = savedMaps.findIndex(map => map.id === this.currentMap.id);
        
        if (existingIndex >= 0) {
            savedMaps[existingIndex] = this.currentMap;
        } else {
            savedMaps.push(this.currentMap);
        }
        
        localStorage.setItem('amongus_custom_maps', JSON.stringify(savedMaps));
        alert('Carte sauvegardée !');
    }
    
    loadMap() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const mapData = JSON.parse(e.target.result);
                        this.currentMap = mapData;
                        this.updateElementCounts();
                        this.render();
                        
                        // Mettre à jour l'interface
                        document.getElementById('mapNameInput').value = this.currentMap.name;
                        document.getElementById('mapWidthInput').value = this.currentMap.width;
                        document.getElementById('mapHeightInput').value = this.currentMap.height;
                        document.getElementById('mapBackgroundInput').value = this.currentMap.background;
                        
                        alert('Carte chargée !');
                    } catch (error) {
                        alert('Erreur lors du chargement de la carte !');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    exportMap() {
        // Exporter au format compatible avec le jeu
        const gameMap = {
            id: this.currentMap.id,
            name: this.currentMap.name,
            width: this.currentMap.width,
            height: this.currentMap.height,
            rooms: this.currentMap.rooms.map(room => ({
                name: room.name,
                x: room.x,
                y: room.y,
                width: room.width,
                height: room.height,
                color: room.color
            })),
            spawnPoint: this.currentMap.spawnPoints.length > 0 ? 
                { x: this.currentMap.spawnPoints[0].x, y: this.currentMap.spawnPoints[0].y } :
                { x: this.currentMap.width / 2, y: this.currentMap.height / 2 },
            tasks: this.currentMap.taskPositions.map(task => ({
                name: task.name,
                x: task.x,
                y: task.y,
                type: task.type
            })),
            vents: this.currentMap.vents.map(vent => ({
                x: vent.x,
                y: vent.y,
                connections: vent.connections
            }))
        };
        
        const mapData = `// Carte personnalisée: ${this.currentMap.name}
const ${this.currentMap.id} = ${JSON.stringify(gameMap, null, 2)};

// Ajouter à la liste des cartes disponibles
if (typeof AVAILABLE_MAPS !== 'undefined') {
    AVAILABLE_MAPS.push(${this.currentMap.id});
}`;
        
        const blob = new Blob([mapData], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `map_${this.currentMap.id}.js`;
        a.click();
        
        URL.revokeObjectURL(url);
        alert('Carte exportée pour le jeu !');
    }
    
    testMap() {
        // Tester la carte dans le jeu
        if (this.currentMap.spawnPoints.length === 0) {
            alert('Ajoutez au moins un point de spawn pour tester la carte !');
            return;
        }
        
        if (this.currentMap.rooms.length === 0) {
            alert('Ajoutez au moins une salle pour tester la carte !');
            return;
        }
        
        // Fermer l'éditeur et charger la carte dans le jeu
        this.close();
        
        // Intégrer temporairement la carte dans le jeu
        if (typeof game !== 'undefined') {
            game.loadCustomMap(this.currentMap);
        }
    }
    
    open() {
        this.isActive = true;
        document.getElementById('mapEditor').style.display = 'block';
        this.resizeCanvas();
        this.updateElementCounts();
        this.render();
        
        // Sauvegarder l'état initial
        this.history = [JSON.parse(JSON.stringify(this.currentMap))];
        this.historyIndex = 0;
    }
    
    close() {
        this.isActive = false;
        document.getElementById('mapEditor').style.display = 'none';
    }
}

// Créer une instance globale de l'éditeur
const mapEditor = new MapEditor();

// Ajouter le bouton pour ouvrir l'éditeur dans le menu principal
document.addEventListener('DOMContentLoaded', () => {
    // Créer le bouton d'éditeur de cartes
    const editorButton = document.createElement('button');
    editorButton.id = 'openMapEditorBtn';
    editorButton.textContent = '🗺️ Éditeur de Cartes';
    editorButton.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background: linear-gradient(145deg, #9C27B0, #7B1FA2);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        margin: 10px;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
    `;
    
    editorButton.addEventListener('click', () => {
        mapEditor.open();
    });
    
    editorButton.addEventListener('mouseenter', () => {
        editorButton.style.transform = 'translateY(-2px)';
        editorButton.style.boxShadow = '0 6px 20px rgba(156, 39, 176, 0.4)';
    });
    
    editorButton.addEventListener('mouseleave', () => {
        editorButton.style.transform = 'translateY(0)';
        editorButton.style.boxShadow = '0 4px 15px rgba(156, 39, 176, 0.3)';
    });
    
    // Ajouter le bouton au menu principal
    const startScreen = document.getElementById('startScreen');
    if (startScreen) {
        const menu = startScreen.querySelector('.menu');
        if (menu) {
            menu.appendChild(editorButton);
        }
    }
});

// CSS pour l'éditeur
const editorCSS = `
.tool-btn {
    padding: 10px 15px;
    background: #444;
    color: white;
    border: 2px solid #666;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
}

.tool-btn:hover {
    background: #555;
    border-color: #FFD700;
}

.tool-btn.active {
    background: #FFD700;
    color: black;
    border-color: #FFF;
}

.editor-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #444;
}

.editor-section:last-child {
    border-bottom: none;
}

.editor-section label {
    display: block;
    margin: 10px 0 5px 0;
    color: #ccc;
    font-size: 14px;
}

#editorNavigation button {
    transition: all 0.3s;
}

#editorNavigation button:hover {
    background: #444 !important;
    transform: scale(1.1);
}
`;

// Ajouter le CSS à la page
const styleSheet = document.createElement('style');
styleSheet.textContent = editorCSS;
document.head.appendChild(styleSheet);