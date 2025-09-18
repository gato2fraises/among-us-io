// ===== CARTES AMONG US =====

class AmongUsMaps {
    
    // ===== THE SKELD =====
    static getTheSkeld() {
        return {
            name: "The Skeld",
            width: 2400,
            height: 1600,
            spawn: { x: 550, y: 650 }, // Cafétéria
            
            rooms: [
                // Zone Cafétéria - Centre du vaisseau
                { 
                    id: 'cafeteria', 
                    x: 400, y: 600, width: 300, height: 200, 
                    name: 'Cafétéria', 
                    color: '#8B4513',
                    description: 'Zone de spawn principale' 
                },
                
                // Zone Upper Engine
                { 
                    id: 'upperEngine', 
                    x: 100, y: 400, width: 200, height: 180, 
                    name: 'Upper Engine', 
                    color: '#FF6347',
                    description: 'Moteur supérieur du vaisseau'
                },
                
                // Zone Reactor - Zone dangereuse
                { 
                    id: 'reactor', 
                    x: 50, y: 700, width: 150, height: 150, 
                    name: 'Reactor', 
                    color: '#FF4500',
                    description: 'Réacteur principal - Zone critique'
                },
                
                // Zone Security - Surveillance
                { 
                    id: 'security', 
                    x: 300, y: 350, width: 120, height: 100, 
                    name: 'Security', 
                    color: '#4169E1',
                    description: 'Centre de surveillance'
                },
                
                // Zone Médbay - Soins médicaux
                { 
                    id: 'medbay', 
                    x: 550, y: 350, width: 200, height: 150, 
                    name: 'Médbay', 
                    color: '#00CED1',
                    description: 'Centre médical'
                },
                
                // Zone Electrical - Systèmes électriques
                { 
                    id: 'electrical', 
                    x: 600, y: 950, width: 180, height: 150, 
                    name: 'Electrical', 
                    color: '#FFD700',
                    description: 'Systèmes électriques - Zone isolée'
                },
                
                // Zone Storage - Stockage
                { 
                    id: 'storage', 
                    x: 900, y: 900, width: 200, height: 180, 
                    name: 'Storage', 
                    color: '#32CD32',
                    description: 'Zone de stockage'
                },
                
                // Zone Admin - Administration
                { 
                    id: 'admin', 
                    x: 1200, y: 600, width: 180, height: 150, 
                    name: 'Admin', 
                    color: '#9932CC',
                    description: 'Centre administratif'
                },
                
                // Zone Communications
                { 
                    id: 'communications', 
                    x: 1400, y: 900, width: 200, height: 150, 
                    name: 'Communications', 
                    color: '#7B68EE',
                    description: 'Centre de communications'
                },
                
                // Zone O2 - Oxygène
                { 
                    id: 'o2', 
                    x: 1600, y: 600, width: 200, height: 180, 
                    name: 'O2', 
                    color: '#00FA9A',
                    description: 'Système d\'oxygène'
                },
                
                // Zone Navigation
                { 
                    id: 'navigation', 
                    x: 1800, y: 400, width: 200, height: 200, 
                    name: 'Navigation', 
                    color: '#1E90FF',
                    description: 'Poste de pilotage'
                },
                
                // Zone Weapons - Armement
                { 
                    id: 'weapons', 
                    x: 1600, y: 200, width: 250, height: 150, 
                    name: 'Weapons', 
                    color: '#DC143C',
                    description: 'Système d\'armement'
                },
                
                // Zone Shields - Boucliers
                { 
                    id: 'shields', 
                    x: 1900, y: 700, width: 180, height: 180, 
                    name: 'Shields', 
                    color: '#FF1493',
                    description: 'Système de défense'
                },
                
                // Zone Lower Engine
                { 
                    id: 'lowerEngine', 
                    x: 100, y: 1000, width: 200, height: 180, 
                    name: 'Lower Engine', 
                    color: '#FF6347',
                    description: 'Moteur inférieur'
                }
            ],
            
            corridors: [
                // Couloirs principaux
                { id: 'cafe_upper', x: 350, y: 500, width: 200, height: 100, connects: ['cafeteria', 'upperEngine'] },
                { id: 'cafe_electrical', x: 700, y: 650, width: 100, height: 150, connects: ['cafeteria', 'electrical'] },
                { id: 'electrical_storage', x: 800, y: 700, width: 150, height: 100, connects: ['electrical', 'storage'] },
                { id: 'storage_admin', x: 1000, y: 650, width: 200, height: 100, connects: ['storage', 'admin'] },
                { id: 'admin_o2', x: 1380, y: 650, width: 220, height: 100, connects: ['admin', 'o2'] },
                { id: 'o2_navigation', x: 1700, y: 600, width: 100, height: 100, connects: ['o2', 'navigation'] },
                { id: 'navigation_weapons', x: 1600, y: 350, width: 100, height: 100, connects: ['navigation', 'weapons'] },
                { id: 'navigation_shields', x: 1800, y: 600, width: 100, height: 100, connects: ['navigation', 'shields'] },
                { id: 'o2_communications', x: 1400, y: 750, width: 100, height: 150, connects: ['o2', 'communications'] },
                { id: 'reactor_connections', x: 300, y: 800, width: 300, height: 100, connects: ['reactor', 'cafeteria'] },
                { id: 'security_connections', x: 450, y: 500, width: 100, height: 100, connects: ['security', 'medbay'] },
                { id: 'upper_connections', x: 200, y: 580, width: 100, height: 120, connects: ['upperEngine', 'reactor'] },
                { id: 'lower_connections', x: 200, y: 850, width: 100, height: 150, connects: ['lowerEngine', 'electrical'] }
            ],
            
            vents: [
                { id: 'vent_upper_security', x: 150, y: 500, room: 'upperEngine', connectedTo: ['vent_medbay', 'vent_cafe'] },
                { id: 'vent_medbay', x: 650, y: 400, room: 'medbay', connectedTo: ['vent_upper_security', 'vent_electrical'] },
                { id: 'vent_cafe', x: 500, y: 650, room: 'cafeteria', connectedTo: ['vent_upper_security', 'vent_admin'] },
                { id: 'vent_electrical', x: 650, y: 1000, room: 'electrical', connectedTo: ['vent_medbay', 'vent_storage'] },
                { id: 'vent_storage', x: 1000, y: 950, room: 'storage', connectedTo: ['vent_electrical', 'vent_admin'] },
                { id: 'vent_admin', x: 1250, y: 650, room: 'admin', connectedTo: ['vent_cafe', 'vent_storage', 'vent_navigation'] },
                { id: 'vent_navigation', x: 1850, y: 450, room: 'navigation', connectedTo: ['vent_admin', 'vent_shields'] },
                { id: 'vent_shields', x: 1950, y: 750, room: 'shields', connectedTo: ['vent_navigation', 'vent_weapons'] },
                { id: 'vent_weapons', x: 1700, y: 250, room: 'weapons', connectedTo: ['vent_shields', 'vent_navigation'] }
            ]
        };
    }
    
    // ===== MIRA HQ =====
    static getMiraHQ() {
        return {
            name: "Mira HQ",
            width: 2000,
            height: 1400,
            spawn: { x: 400, y: 600 },
            
            rooms: [
                { id: 'cafeteria', x: 300, y: 500, width: 200, height: 150, name: 'Cafétéria', color: '#8B4513' },
                { id: 'reactor', x: 100, y: 400, width: 150, height: 120, name: 'Reactor', color: '#FF4500' },
                { id: 'laboratory', x: 600, y: 300, width: 180, height: 140, name: 'Laboratory', color: '#00CED1' },
                { id: 'office', x: 900, y: 500, width: 160, height: 130, name: 'Office', color: '#9932CC' },
                { id: 'admin', x: 1200, y: 400, width: 140, height: 120, name: 'Admin', color: '#FFD700' },
                { id: 'greenhouse', x: 1400, y: 600, width: 200, height: 180, name: 'Greenhouse', color: '#32CD32' },
                { id: 'decontamination', x: 800, y: 800, width: 100, height: 80, name: 'Decontamination', color: '#FF6347' },
                { id: 'locker_room', x: 500, y: 900, width: 150, height: 100, name: 'Locker Room', color: '#4169E1' },
                { id: 'communications', x: 1000, y: 1000, width: 180, height: 120, name: 'Communications', color: '#7B68EE' },
                { id: 'storage', x: 200, y: 800, width: 160, height: 140, name: 'Storage', color: '#FF1493' }
            ],
            
            corridors: [
                { id: 'main_hall', x: 500, y: 600, width: 400, height: 100, connects: ['cafeteria', 'office'] },
                { id: 'north_corridor', x: 400, y: 400, width: 300, height: 80, connects: ['reactor', 'laboratory'] },
                { id: 'south_corridor', x: 400, y: 850, width: 500, height: 80, connects: ['storage', 'communications'] }
            ],
            
            vents: [
                { id: 'vent_reactor', x: 150, y: 450, room: 'reactor', connectedTo: ['vent_lab', 'vent_cafe'] },
                { id: 'vent_lab', x: 650, y: 350, room: 'laboratory', connectedTo: ['vent_reactor', 'vent_office'] },
                { id: 'vent_cafe', x: 350, y: 550, room: 'cafeteria', connectedTo: ['vent_reactor', 'vent_storage'] },
                { id: 'vent_office', x: 950, y: 550, room: 'office', connectedTo: ['vent_lab', 'vent_admin'] },
                { id: 'vent_admin', x: 1250, y: 450, room: 'admin', connectedTo: ['vent_office', 'vent_greenhouse'] },
                { id: 'vent_greenhouse', x: 1450, y: 650, room: 'greenhouse', connectedTo: ['vent_admin', 'vent_comms'] },
                { id: 'vent_storage', x: 250, y: 850, room: 'storage', connectedTo: ['vent_cafe', 'vent_locker'] },
                { id: 'vent_locker', x: 550, y: 950, room: 'locker_room', connectedTo: ['vent_storage', 'vent_comms'] },
                { id: 'vent_comms', x: 1050, y: 1050, room: 'communications', connectedTo: ['vent_greenhouse', 'vent_locker'] }
            ]
        };
    }
    
    // ===== POLUS =====
    static getPolus() {
        return {
            name: "Polus",
            width: 2800,
            height: 1800,
            spawn: { x: 500, y: 800 },
            
            rooms: [
                { id: 'dropship', x: 400, y: 700, width: 200, height: 150, name: 'Dropship', color: '#8B4513' },
                { id: 'office', x: 700, y: 600, width: 180, height: 130, name: 'Office', color: '#9932CC' },
                { id: 'admin', x: 1000, y: 700, width: 160, height: 120, name: 'Admin', color: '#FFD700' },
                { id: 'communications', x: 1300, y: 800, width: 200, height: 140, name: 'Communications', color: '#7B68EE' },
                { id: 'weapons', x: 1600, y: 600, width: 180, height: 150, name: 'Weapons', color: '#DC143C' },
                { id: 'o2', x: 1900, y: 400, width: 160, height: 140, name: 'O2', color: '#00FA9A' },
                { id: 'electrical', x: 800, y: 1200, width: 180, height: 120, name: 'Electrical', color: '#FFD700' },
                { id: 'security', x: 1200, y: 1100, width: 140, height: 110, name: 'Security', color: '#4169E1' },
                { id: 'storage', x: 200, y: 1000, width: 160, height: 130, name: 'Storage', color: '#32CD32' },
                { id: 'laboratory', x: 1600, y: 1000, width: 200, height: 160, name: 'Laboratory', color: '#00CED1' },
                { id: 'specimen_room', x: 2000, y: 1200, width: 180, height: 140, name: 'Specimen Room', color: '#FF6347' }
            ],
            
            corridors: [
                { id: 'main_corridor', x: 600, y: 750, width: 600, height: 100, connects: ['dropship', 'communications'] },
                { id: 'north_path', x: 1400, y: 500, width: 300, height: 80, connects: ['communications', 'o2'] },
                { id: 'south_path', x: 600, y: 1000, width: 800, height: 100, connects: ['storage', 'laboratory'] }
            ],
            
            vents: [
                { id: 'vent_office', x: 750, y: 650, room: 'office', connectedTo: ['vent_admin', 'vent_dropship'] },
                { id: 'vent_admin', x: 1050, y: 750, room: 'admin', connectedTo: ['vent_office', 'vent_comms'] },
                { id: 'vent_dropship', x: 450, y: 750, room: 'dropship', connectedTo: ['vent_office', 'vent_storage'] },
                { id: 'vent_comms', x: 1350, y: 850, room: 'communications', connectedTo: ['vent_admin', 'vent_security'] },
                { id: 'vent_security', x: 1250, y: 1150, room: 'security', connectedTo: ['vent_comms', 'vent_electrical'] },
                { id: 'vent_electrical', x: 850, y: 1250, room: 'electrical', connectedTo: ['vent_security', 'vent_storage'] },
                { id: 'vent_storage', x: 250, y: 1050, room: 'storage', connectedTo: ['vent_dropship', 'vent_electrical'] },
                { id: 'vent_o2', x: 1950, y: 450, room: 'o2', connectedTo: ['vent_weapons', 'vent_lab'] },
                { id: 'vent_weapons', x: 1650, y: 650, room: 'weapons', connectedTo: ['vent_o2', 'vent_lab'] },
                { id: 'vent_lab', x: 1650, y: 1050, room: 'laboratory', connectedTo: ['vent_weapons', 'vent_specimen'] },
                { id: 'vent_specimen', x: 2050, y: 1250, room: 'specimen_room', connectedTo: ['vent_lab', 'vent_o2'] }
            ]
        };
    }
    
    // ===== THE AIRSHIP =====
    static getTheAirship() {
        return {
            name: "The Airship",
            width: 3200,
            height: 2000,
            spawn: { x: 800, y: 1000 },
            
            rooms: [
                { id: 'meeting_hall', x: 700, y: 900, width: 250, height: 200, name: 'Meeting Hall', color: '#8B4513' },
                { id: 'cockpit', x: 100, y: 400, width: 200, height: 150, name: 'Cockpit', color: '#4169E1' },
                { id: 'armory', x: 400, y: 500, width: 180, height: 130, name: 'Armory', color: '#DC143C' },
                { id: 'viewing_deck', x: 700, y: 300, width: 220, height: 160, name: 'Viewing Deck', color: '#1E90FF' },
                { id: 'security', x: 1100, y: 700, width: 160, height: 120, name: 'Security', color: '#4169E1' },
                { id: 'electrical', x: 1400, y: 800, width: 180, height: 140, name: 'Electrical', color: '#FFD700' },
                { id: 'medbay', x: 1700, y: 600, width: 200, height: 150, name: 'Medbay', color: '#00CED1' },
                { id: 'communications', x: 2000, y: 800, width: 180, height: 130, name: 'Communications', color: '#7B68EE' },
                { id: 'cargo_bay', x: 2300, y: 1000, width: 250, height: 200, name: 'Cargo Bay', color: '#32CD32' },
                { id: 'engine_room', x: 2600, y: 1400, width: 200, height: 160, name: 'Engine Room', color: '#FF4500' },
                { id: 'kitchen', x: 1000, y: 1200, width: 180, height: 140, name: 'Kitchen', color: '#FF6347' },
                { id: 'records', x: 1400, y: 1300, width: 160, height: 120, name: 'Records', color: '#9932CC' },
                { id: 'lounge', x: 1700, y: 1400, width: 200, height: 150, name: 'Lounge', color: '#FF1493' }
            ],
            
            corridors: [
                { id: 'main_hallway', x: 1000, y: 950, width: 800, height: 100, connects: ['meeting_hall', 'cargo_bay'] },
                { id: 'upper_corridor', x: 400, y: 400, width: 600, height: 80, connects: ['cockpit', 'viewing_deck'] },
                { id: 'lower_corridor', x: 1200, y: 1250, width: 600, height: 100, connects: ['kitchen', 'lounge'] }
            ],
            
            vents: [
                { id: 'vent_cockpit', x: 150, y: 450, room: 'cockpit', connectedTo: ['vent_armory', 'vent_viewing'] },
                { id: 'vent_armory', x: 450, y: 550, room: 'armory', connectedTo: ['vent_cockpit', 'vent_security'] },
                { id: 'vent_viewing', x: 750, y: 350, room: 'viewing_deck', connectedTo: ['vent_cockpit', 'vent_meeting'] },
                { id: 'vent_meeting', x: 750, y: 950, room: 'meeting_hall', connectedTo: ['vent_viewing', 'vent_kitchen'] },
                { id: 'vent_security', x: 1150, y: 750, room: 'security', connectedTo: ['vent_armory', 'vent_electrical'] },
                { id: 'vent_electrical', x: 1450, y: 850, room: 'electrical', connectedTo: ['vent_security', 'vent_medbay'] },
                { id: 'vent_medbay', x: 1750, y: 650, room: 'medbay', connectedTo: ['vent_electrical', 'vent_comms'] },
                { id: 'vent_comms', x: 2050, y: 850, room: 'communications', connectedTo: ['vent_medbay', 'vent_cargo'] },
                { id: 'vent_cargo', x: 2350, y: 1050, room: 'cargo_bay', connectedTo: ['vent_comms', 'vent_engine'] },
                { id: 'vent_engine', x: 2650, y: 1450, room: 'engine_room', connectedTo: ['vent_cargo', 'vent_lounge'] },
                { id: 'vent_kitchen', x: 1050, y: 1250, room: 'kitchen', connectedTo: ['vent_meeting', 'vent_records'] },
                { id: 'vent_records', x: 1450, y: 1350, room: 'records', connectedTo: ['vent_kitchen', 'vent_lounge'] },
                { id: 'vent_lounge', x: 1750, y: 1450, room: 'lounge', connectedTo: ['vent_records', 'vent_engine'] }
            ]
        };
    }
    
    // ===== FUNKIN' =====
    static getFunkin() {
        return {
            name: "Funkin'",
            width: 2200,
            height: 1600,
            spawn: { x: 600, y: 800 },
            
            rooms: [
                { id: 'stage', x: 500, y: 700, width: 300, height: 200, name: 'Stage', color: '#FF1493' },
                { id: 'backstage', x: 200, y: 600, width: 180, height: 140, name: 'Backstage', color: '#9932CC' },
                { id: 'sound_booth', x: 900, y: 500, width: 160, height: 120, name: 'Sound Booth', color: '#4169E1' },
                { id: 'dressing_room', x: 1200, y: 600, width: 180, height: 130, name: 'Dressing Room', color: '#FF6347' },
                { id: 'recording_studio', x: 1500, y: 400, width: 200, height: 160, name: 'Recording Studio', color: '#00CED1' },
                { id: 'vip_lounge', x: 1800, y: 700, width: 180, height: 150, name: 'VIP Lounge', color: '#FFD700' },
                { id: 'bar', x: 800, y: 1000, width: 200, height: 140, name: 'Bar', color: '#32CD32' },
                { id: 'dance_floor', x: 400, y: 1100, width: 250, height: 180, name: 'Dance Floor', color: '#FF4500' },
                { id: 'storage', x: 1100, y: 1200, width: 160, height: 120, name: 'Storage', color: '#7B68EE' },
                { id: 'office', x: 1400, y: 1000, width: 150, height: 110, name: 'Office', color: '#1E90FF' }
            ],
            
            corridors: [
                { id: 'main_corridor', x: 600, y: 850, width: 400, height: 100, connects: ['stage', 'bar'] },
                { id: 'artist_corridor', x: 1000, y: 600, width: 300, height: 80, connects: ['sound_booth', 'dressing_room'] },
                { id: 'backstage_corridor', x: 350, y: 750, width: 200, height: 80, connects: ['backstage', 'stage'] }
            ],
            
            vents: [
                { id: 'vent_stage', x: 650, y: 800, room: 'stage', connectedTo: ['vent_backstage', 'vent_sound'] },
                { id: 'vent_backstage', x: 280, y: 670, room: 'backstage', connectedTo: ['vent_stage', 'vent_dance'] },
                { id: 'vent_sound', x: 980, y: 560, room: 'sound_booth', connectedTo: ['vent_stage', 'vent_dressing'] },
                { id: 'vent_dressing', x: 1280, y: 665, room: 'dressing_room', connectedTo: ['vent_sound', 'vent_recording'] },
                { id: 'vent_recording', x: 1600, y: 480, room: 'recording_studio', connectedTo: ['vent_dressing', 'vent_vip'] },
                { id: 'vent_vip', x: 1880, y: 775, room: 'vip_lounge', connectedTo: ['vent_recording', 'vent_office'] },
                { id: 'vent_bar', x: 900, y: 1070, room: 'bar', connectedTo: ['vent_dance', 'vent_storage'] },
                { id: 'vent_dance', x: 525, y: 1190, room: 'dance_floor', connectedTo: ['vent_backstage', 'vent_bar'] },
                { id: 'vent_storage', x: 1180, y: 1260, room: 'storage', connectedTo: ['vent_bar', 'vent_office'] },
                { id: 'vent_office', x: 1475, y: 1055, room: 'office', connectedTo: ['vent_vip', 'vent_storage'] }
            ]
        };
    }
    
    // ===== MÉTHODE POUR OBTENIR TOUTES LES CARTES =====
    static getAllMaps() {
        return {
            'the_skeld': this.getTheSkeld(),
            'mira_hq': this.getMiraHQ(),
            'polus': this.getPolus(),
            'the_airship': this.getTheAirship(),
            'funkin': this.getFunkin()
        };
    }
    
    // ===== MÉTHODE POUR OBTENIR UNE CARTE PAR SON ID =====
    static getMapById(mapId) {
        const maps = this.getAllMaps();
        return maps[mapId] || maps['the_skeld']; // The Skeld par défaut
    }
    
    // ===== MÉTHODE POUR OBTENIR UNE CARTE ALÉATOIRE =====
    static getRandomMap() {
        const mapIds = Object.keys(this.getAllMaps());
        const randomId = mapIds[Math.floor(Math.random() * mapIds.length)];
        return this.getMapById(randomId);
    }
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmongUsMaps;
}