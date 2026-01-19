/**
 * Control Farm - Game Engine
 * Manages game state, scene transitions, and core game logic
 */

class GameEngine {
    constructor() {
        this.currentScene = 'loading-screen';
        this.gameState = {
            currentCountry: 'peru',
            completedMissions: [],
            currentMission: null,
            playerProgress: {
                peru: { completed: false, score: 0 },
                brazil: { completed: false, score: 0 },
                argentina: { completed: false, score: 0 },
                usa: { completed: false, score: 0 }
            },
            unlockedCountries: ['peru', 'brazil', 'argentina', 'usa'],
            tutorialCompleted: false
        };
        
        this.scenes = [
            'loading-screen',
            'opening-scene',
            'tiny-intro',
            'world-map-scene',
            'mission-briefing',
            'field-analysis',
            'country-selection'
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startLoadingSequence();
    }
    
    setupEventListeners() {
        // Start game button
        document.getElementById('start-game')?.addEventListener('click', () => {
            this.transitionToScene('tiny-intro');
        });
        
        // Continue Tiny dialogue button
        document.getElementById('continue-tiny-dialogue')?.addEventListener('click', () => {
            this.handleTinyDialogueProgression();
        });
        
        // Setup world map interactions
        this.setupWorldMapInteractions();
        
        // Start analysis button
        document.getElementById('start-analysis')?.addEventListener('click', () => {
            this.transitionToScene('field-analysis');
        });
        
        // Complete analysis button
        document.getElementById('complete-analysis')?.addEventListener('click', () => {
            this.completeCurrentMission();
        });
        
        // Country selection
        this.setupCountrySelection();
        
        // Field analysis points
        this.setupFieldAnalysis();
    }
    
    startLoadingSequence() {
        // Simulate loading time
        setTimeout(() => {
            this.transitionToScene('opening-scene');
        }, 3500);
    }
    
    transitionToScene(sceneName) {
        if (!this.scenes.includes(sceneName)) {
            console.error(`Scene ${sceneName} not found`);
            return;
        }
        
        console.log(`Transitioning from ${this.currentScene} to ${sceneName}`);
        
        // Hide current scene
        const currentSceneElement = document.getElementById(this.currentScene);
        if (currentSceneElement) {
            currentSceneElement.classList.remove('active');
        }
        
        // Show new scene after transition
        setTimeout(() => {
            const newSceneElement = document.getElementById(sceneName);
            if (newSceneElement) {
                newSceneElement.classList.add('active');
                this.currentScene = sceneName;
                this.onSceneEnter(sceneName);
            } else {
                console.error(`Scene element ${sceneName} not found in DOM`);
            }
        }, 800);
    }
    
    onSceneEnter(sceneName) {
        console.log(`Entering scene: ${sceneName}`);
        
        switch (sceneName) {
            case 'tiny-intro':
                this.startTinyIntroduction();
                break;
            case 'world-map-scene':
                this.initializeWorldMap();
                break;
            case 'field-analysis':
                this.initializeFieldAnalysis();
                break;
            case 'country-selection':
                this.updateCountrySelection();
                break;
        }
    }
    
    startTinyIntroduction() {
        console.log('Tiny introduction started');
        this.updateTinyDialogue();
        
        // Add entrance animation for Tiny
        const tinyDog = document.querySelector('.tiny-dog');
        if (tinyDog) {
            tinyDog.style.transform = 'translateX(-100px) scale(0.8)';
            tinyDog.style.opacity = '0';
            
            setTimeout(() => {
                tinyDog.style.transition = 'all 1s ease-out';
                tinyDog.style.transform = 'translateX(0) scale(1)';
                tinyDog.style.opacity = '1';
            }, 500);
        }
    }
    
    updateTinyDialogue() {
        const location = this.getUserLocation();
        const dialogueText = document.getElementById('tiny-dialogue-text');
        
        if (dialogueText) {
            dialogueText.textContent = `Hi friends! My name is Tiny and we are on ${location}! We have several issues with efficiency in our farms around the world. So you will help me solve these issues and make farming better for everyone!`;
        }
    }
    
    getUserLocation() {
        // For now, return Earth. In a full implementation, you could use geolocation
        return 'Earth';
    }
    
    handleTinyDialogueProgression() {
        console.log('Moving to world map scene');
        this.transitionToScene('world-map-scene');
    }
    
    initializeWorldMap() {
        console.log('World map initialized');
        this.animateWorldMap();
    }
    
    animateWorldMap() {
        // Add entrance animations for crop fields
        const cropFields = document.querySelectorAll('.crop-field');
        cropFields.forEach((field, index) => {
            // Start with hidden fields
            field.style.opacity = '0';
            field.style.transform = 'scale(0.5)';
            
            setTimeout(() => {
                field.style.transition = 'all 0.5s ease-out';
                field.style.opacity = '1';
                field.style.transform = 'scale(1)';
            }, index * 500 + 1000); // Delay for dramatic effect
        });
    }
    
    setupWorldMapInteractions() {
        // This will be called when DOM is ready
        setTimeout(() => {
            const cropFields = document.querySelectorAll('.crop-field');
            cropFields.forEach(field => {
                field.addEventListener('click', (e) => {
                    const country = e.currentTarget.getAttribute('data-country');
                    this.selectCountryFromMap(country);
                });
            });
        }, 100);
    }
    
    selectCountryFromMap(country) {
        console.log(`Selected country: ${country}`);
        
        // Update game state
        this.gameState.currentCountry = country;
        
        // Update mission briefing location
        this.updateMissionLocation(country);
        
        // Transition to mission briefing
        this.transitionToScene('mission-briefing');
    }
    
    updateMissionLocation(country) {
        const locationElement = document.getElementById('current-location');
        const titleElement = document.getElementById('analysis-title');
        const coordinatesElement = document.getElementById('analysis-coordinates');
        
        const countryData = {
            peru: {
                name: 'Majes Valley, Peru',
                title: 'Satellite Field Analysis - Majes Valley',
                coordinates: 'Lat: -16.3988, Lon: -72.1932'
            },
            brazil: {
                name: 'Cerrado Region, Brazil',
                title: 'Satellite Field Analysis - Cerrado',
                coordinates: 'Lat: -15.7801, Lon: -47.9292'
            },
            argentina: {
                name: 'Pampas, Argentina',
                title: 'Satellite Field Analysis - Pampas',
                coordinates: 'Lat: -34.6118, Lon: -58.3960'
            },
            usa: {
                name: 'Midwest, USA',
                title: 'Satellite Field Analysis - Midwest',
                coordinates: 'Lat: 41.8781, Lon: -87.6298'
            }
        };
        
        const data = countryData[country] || countryData.peru;
        
        if (locationElement) locationElement.textContent = data.name;
        if (titleElement) titleElement.textContent = data.title;
        if (coordinatesElement) coordinatesElement.textContent = data.coordinates;
    }
    
    initializeFieldAnalysis() {
        // Initialize field renderer and satellite analysis
        if (window.FieldRenderer) {
            window.FieldRenderer.init();
        }
        
        if (window.SatelliteAnalysis) {
            window.SatelliteAnalysis.init();
        }
        
        // Set current mission based on selected country
        const countryNames = {
            peru: 'Majes Valley',
            brazil: 'Cerrado Region',
            argentina: 'Pampas',
            usa: 'Midwest'
        };
        
        this.gameState.currentMission = {
            country: this.gameState.currentCountry,
            location: countryNames[this.gameState.currentCountry] || 'Unknown',
            objectives: [
                'Analyze 4 field points',
                'Calculate LAI values',
                'Assess soil conditions',
                'Provide fertilizer recommendations'
            ],
            progress: {
                analyzedPoints: 0,
                totalPoints: 4,
                completed: false
            }
        };
    }
    
    setupFieldAnalysis() {
        // This will be called when DOM is ready
        setTimeout(() => {
            const points = document.querySelectorAll('.point');
            points.forEach(point => {
                point.addEventListener('click', (e) => {
                    this.analyzeFieldPoint(e.target);
                });
            });
            
            // Analysis button
            const analysisBtn = document.getElementById('run-analysis');
            if (analysisBtn) {
                analysisBtn.addEventListener('click', () => {
                    this.runSatelliteAnalysis();
                });
            }
        }, 100);
    }
    
    analyzeFieldPoint(pointElement) {
        const fieldId = pointElement.getAttribute('data-field');
        const x = pointElement.getAttribute('data-x');
        const y = pointElement.getAttribute('data-y');
        
        // Remove previous selections
        document.querySelectorAll('.point').forEach(p => p.classList.remove('selected'));
        pointElement.classList.add('selected');
        
        // Update field info
        this.updateFieldInfo(fieldId, x, y);
        
        // Enable analysis if not already done
        const runAnalysisBtn = document.getElementById('run-analysis');
        if (runAnalysisBtn) {
            runAnalysisBtn.disabled = false;
        }
    }
    
    updateFieldInfo(fieldId, x, y) {
        const fieldInfo = document.getElementById('field-info');
        if (fieldInfo) {
            fieldInfo.innerHTML = `
                <div class="field-details">
                    <h4>Field Point ${fieldId}</h4>
                    <p><strong>Coordinates:</strong> ${x}, ${y}</p>
                    <p><strong>Crop Type:</strong> ${this.getRandomCropType()}</p>
                    <p><strong>Planting Date:</strong> ${this.getRandomPlantingDate()}</p>
                    <p><strong>Field Size:</strong> ${this.getRandomFieldSize()} hectares</p>
                </div>
            `;
        }
    }
    
    runSatelliteAnalysis() {
        const selectedPoint = document.querySelector('.point.selected');
        if (!selectedPoint) {
            alert('Please select a field point first');
            return;
        }
        
        const fieldId = selectedPoint.getAttribute('data-field');
        const analysisType = document.getElementById('analysis-type')?.value || 'ndvi';
        const timePeriod = document.getElementById('time-period')?.value || 'current';
        
        // Run analysis through SatelliteAnalysis module
        if (window.SatelliteAnalysis) {
            const results = window.SatelliteAnalysis.analyzeField(fieldId, analysisType, timePeriod);
            this.displayAnalysisResults(results);
            this.updateMissionProgress();
        }
    }
    
    displayAnalysisResults(results) {
        // Update result values
        const ndviElement = document.getElementById('ndvi-value');
        const laiElement = document.getElementById('lai-value');
        const moistureElement = document.getElementById('moisture-value');
        const tempElement = document.getElementById('temp-value');
        
        if (ndviElement) ndviElement.textContent = results.ndvi;
        if (laiElement) laiElement.textContent = results.lai;
        if (moistureElement) moistureElement.textContent = results.moisture;
        if (tempElement) tempElement.textContent = results.temperature;
        
        // Update recommendations
        const recommendationsContent = document.getElementById('recommendations-content');
        if (recommendationsContent) {
            recommendationsContent.innerHTML = this.generateRecommendations(results);
        }
        
        // Show complete button if enough points analyzed
        if (this.gameState.currentMission.progress.analyzedPoints >= 3) {
            const completeBtn = document.getElementById('complete-analysis');
            if (completeBtn) {
                completeBtn.style.display = 'block';
            }
        }
    }
    
    generateRecommendations(results) {
        let recommendations = '<ul>';
        
        const ndviValue = parseFloat(results.ndvi);
        const moistureValue = parseFloat(results.moisture.replace('%', ''));
        const laiValue = parseFloat(results.lai);
        
        if (ndviValue < 0.3) {
            recommendations += '<li>🔴 Low vegetation health detected. Consider irrigation and fertilization.</li>';
        } else if (ndviValue < 0.6) {
            recommendations += '<li>🟡 Moderate vegetation health. Monitor closely and consider targeted fertilization.</li>';
        } else {
            recommendations += '<li>🟢 Healthy vegetation detected. Maintain current practices.</li>';
        }
        
        if (moistureValue < 30) {
            recommendations += '<li>💧 Low soil moisture. Increase irrigation frequency.</li>';
        } else if (moistureValue > 80) {
            recommendations += '<li>⚠️ High soil moisture. Reduce irrigation to prevent root rot.</li>';
        }
        
        if (laiValue < 2.0) {
            recommendations += '<li>🌱 Low leaf area index. Consider nitrogen fertilization.</li>';
        } else if (laiValue > 6.0) {
            recommendations += '<li>🌿 High leaf area index. Monitor for pest issues.</li>';
        }
        
        recommendations += '</ul>';
        return recommendations;
    }
    
    updateMissionProgress() {
        if (this.gameState.currentMission) {
            this.gameState.currentMission.progress.analyzedPoints++;
        }
    }
    
    completeCurrentMission() {
        if (this.gameState.currentMission) {
            this.gameState.currentMission.progress.completed = true;
            this.gameState.completedMissions.push(this.gameState.currentMission);
            this.gameState.playerProgress[this.gameState.currentCountry].completed = true;
            this.gameState.playerProgress[this.gameState.currentCountry].score = this.calculateMissionScore();
            
            this.transitionToScene('country-selection');
        }
    }
    
    calculateMissionScore() {
        const baseScore = 100;
        const analysisBonus = this.gameState.currentMission.progress.analyzedPoints * 25;
        return baseScore + analysisBonus;
    }
    
    setupCountrySelection() {
        setTimeout(() => {
            const countries = document.querySelectorAll('.country.available');
            countries.forEach(country => {
                country.addEventListener('click', (e) => {
                    const countryId = e.target.id;
                    this.selectCountry(countryId);
                });
            });
            
            // Country hover effects
            countries.forEach(country => {
                country.addEventListener('mouseenter', (e) => {
                    this.showCountryInfo(e.target.id);
                });
            });
        }, 100);
    }
    
    selectCountry(countryId) {
        if (!this.gameState.unlockedCountries.includes(countryId)) {
            alert('This country is not yet unlocked. Complete previous missions first.');
            return;
        }
        
        this.gameState.currentCountry = countryId;
        this.updateMissionLocation(countryId);
        this.transitionToScene('mission-briefing');
    }
    
    showCountryInfo(countryId) {
        const countryDetails = document.getElementById('country-details');
        const countryInfo = this.getCountryInfo(countryId);
        
        if (countryDetails && countryInfo) {
            countryDetails.innerHTML = `
                <h3>${countryInfo.name}</h3>
                <p><strong>Climate:</strong> ${countryInfo.climate}</p>
                <p><strong>Main Crops:</strong> ${countryInfo.crops}</p>
                <p><strong>Challenges:</strong> ${countryInfo.challenges}</p>
                <p><strong>Mission Focus:</strong> ${countryInfo.focus}</p>
            `;
        }
    }
    
    getCountryInfo(countryId) {
        const countryData = {
            peru: {
                name: 'Peru - Majes Valley',
                climate: 'Arid desert with irrigation',
                crops: 'Rice, corn, quinoa, potatoes',
                challenges: 'Water scarcity, soil salinity',
                focus: 'Irrigation optimization and soil health'
            },
            brazil: {
                name: 'Brazil - Cerrado Region',
                climate: 'Tropical savanna',
                crops: 'Soybeans, corn, cotton, sugarcane',
                challenges: 'Deforestation, soil degradation',
                focus: 'Sustainable farming and forest preservation'
            },
            argentina: {
                name: 'Argentina - Pampas',
                climate: 'Temperate grassland',
                crops: 'Wheat, soybeans, corn, beef cattle',
                challenges: 'Soil erosion, climate variability',
                focus: 'Precision agriculture and climate adaptation'
            },
            usa: {
                name: 'USA - Midwest',
                climate: 'Continental with seasonal variation',
                crops: 'Corn, soybeans, wheat',
                challenges: 'Climate change, soil degradation',
                focus: 'Precision agriculture and sustainability'
            }
        };
        
        return countryData[countryId];
    }
    
    updateCountrySelection() {
        // Update progress display
        const progressItems = document.querySelectorAll('.progress-item');
        progressItems.forEach(item => {
            const flag = item.querySelector('.flag')?.textContent;
            const status = item.querySelector('.status');
            
            // Check completion status based on flag
            const flagToCountry = {
                '🇵🇪': 'peru',
                '🇧🇷': 'brazil',
                '🇦🇷': 'argentina'
            };
            
            const country = flagToCountry[flag];
            if (country && this.gameState.playerProgress[country]?.completed) {
                item.classList.add('completed');
                if (status) status.textContent = '✓ Completed';
            }
        });
        
        // Update map countries
        const countries = document.querySelectorAll('.country');
        countries.forEach(country => {
            if (this.gameState.unlockedCountries.includes(country.id)) {
                if (this.gameState.playerProgress[country.id]?.completed) {
                    country.classList.remove('available');
                    country.classList.add('completed');
                } else {
                    country.classList.add('available');
                }
            }
        });
    }
    
    // Utility functions
    getRandomCropType() {
        const cropsByCountry = {
            peru: ['Rice', 'Corn', 'Quinoa', 'Potatoes', 'Beans'],
            brazil: ['Soybeans', 'Corn', 'Cotton', 'Sugarcane', 'Coffee'],
            argentina: ['Wheat', 'Soybeans', 'Corn', 'Sunflower', 'Barley'],
            usa: ['Corn', 'Soybeans', 'Wheat', 'Cotton', 'Rice']
        };
        
        const crops = cropsByCountry[this.gameState.currentCountry] || cropsByCountry.peru;
        return crops[Math.floor(Math.random() * crops.length)];
    }
    
    getRandomPlantingDate() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June'];
        const month = months[Math.floor(Math.random() * months.length)];
        const day = Math.floor(Math.random() * 28) + 1;
        return `${month} ${day}, 2024`;
    }
    
    getRandomFieldSize() {
        return (Math.random() * 10 + 1).toFixed(1);
    }
    
    // Save/Load game state
    saveGameState() {
        localStorage.setItem('controlFarmGameState', JSON.stringify(this.gameState));
    }
    
    loadGameState() {
        const saved = localStorage.getItem('controlFarmGameState');
        if (saved) {
            this.gameState = { ...this.gameState, ...JSON.parse(saved) };
        }
    }
}

// Initialize game engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GameEngine = new GameEngine();
});