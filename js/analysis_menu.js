/**
 * Analysis Menu Manager
 * Handles the separate analysis menu buttons and modals
 */

class AnalysisMenu {
    constructor() {
        this.currentAnalysisData = null;
        this.charts = {
            weather: null,
            lai: null,
            soil: null
        };
        this.init();
    }
    
    init() {
        this.bindEvents();
        // Buttons are always visible now
    }
    
    bindEvents() {
        // Analysis menu buttons
        const weatherBtn = document.getElementById('weatherAnalysisBtn');
        const vegetationBtn = document.getElementById('vegetationHealthBtn');
        const soilBtn = document.getElementById('soilConditionsBtn');
        const irrigationBtn = document.getElementById('smartIrrigationBtn');
        
        if (weatherBtn) {
            weatherBtn.addEventListener('click', () => {
                if (this.currentAnalysisData) {
                    this.toggleDashboardSection('weather');
                } else {
                    alert('Please run an analysis first by selecting a farm area and clicking "Analyze Farm".');
                }
            });
        }
        
        if (vegetationBtn) {
            vegetationBtn.addEventListener('click', () => {
                if (this.currentAnalysisData) {
                    this.toggleDashboardSection('vegetation');
                } else {
                    alert('Please run an analysis first by selecting a farm area and clicking "Analyze Farm".');
                }
            });
        }
        
        if (soilBtn) {
            soilBtn.addEventListener('click', () => {
                if (this.currentAnalysisData) {
                    this.toggleDashboardSection('soil');
                } else {
                    alert('Please run an analysis first by selecting a farm area and clicking "Analyze Farm".');
                }
            });
        }
        
        if (irrigationBtn) {
            irrigationBtn.addEventListener('click', () => {
                if (this.currentAnalysisData) {
                    this.performSmartIrrigationAnalysis();
                } else {
                    alert('Please run an analysis first by selecting a farm area and clicking "Analyze Farm".');
                }
            });
        }
        
        // Fertilizer decision button
        const fertilizerActionBtn = document.getElementById('fertilizerActionBtn');
        if (fertilizerActionBtn) {
            fertilizerActionBtn.addEventListener('click', () => {
                if (this.currentAnalysisData) {
                    this.showFertilizerDecisionModal();
                } else {
                    alert('Please run an analysis first by selecting a farm area and clicking "Analyze Farm".');
                }
            });
        }
        
        const irrigationActionBtn = document.getElementById('irrigationActionBtn');
        if (irrigationActionBtn) {
            irrigationActionBtn.addEventListener('click', () => {
                if (this.currentAnalysisData) {
                    // Ensure irrigation analysis is available
                    if (!this.currentAnalysisData.irrigation_decision) {
                        this.analyzeSoilHumidityForIrrigation();
                    }
                    this.showIrrigationDecisionModal();
                } else {
                    alert('Please run farm analysis first by selecting a farm area and clicking "Analyze Farm".');
                }
            });
        }
        
        // Modal decision buttons
        const fertilizerYesBtn = document.getElementById('fertilizerYesModal');
        const fertilizerNoBtn = document.getElementById('fertilizerNoModal');
        const closeModalBtn = document.getElementById('closeFertilizerModal');
        
        if (fertilizerYesBtn) {
            fertilizerYesBtn.addEventListener('click', () => {
                this.handleFertilizerDecision(true);
            });
        }
        
        if (fertilizerNoBtn) {
            fertilizerNoBtn.addEventListener('click', () => {
                this.handleFertilizerDecision(false);
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideFertilizerDecisionModal();
            });
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('fertilizerDecisionModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideFertilizerDecisionModal();
                }
            });
        }
        
        // Irrigation decision modal events
        const closeIrrigationModalBtn = document.getElementById('closeIrrigationModal');
        if (closeIrrigationModalBtn) {
            closeIrrigationModalBtn.addEventListener('click', () => {
                this.hideIrrigationDecisionModal();
            });
        }
        
        // Close irrigation modal when clicking outside
        const irrigationModal = document.getElementById('irrigationDecisionModal');
        if (irrigationModal) {
            irrigationModal.addEventListener('click', (e) => {
                if (e.target === irrigationModal) {
                    this.hideIrrigationDecisionModal();
                }
            });
        }
        
        // Listen for analysis completion
        document.addEventListener('analysisCompleted', (e) => {
            this.handleAnalysisCompleted(e.detail);
        });
    }
    
    handleAnalysisCompleted(analysisData) {
        console.log('Analysis completed event received:', analysisData);
        this.currentAnalysisData = analysisData;
        this.showAnalysisButtons();
        
        // Analyze soil humidity for irrigation decision
        this.analyzeSoilHumidityForIrrigation();
        
        // Show decision buttons
        this.showDecisionButtons();
        
        this.prepareChartData();
        // Reset button states
        this.resetButtonStates();
        // Don't send recommendation to chatbot immediately - wait for user to open modal
    }
    
    showDecisionButtons() {
        const fertilizerBtn = document.getElementById('fertilizerActionBtn');
        const irrigationBtn = document.getElementById('irrigationActionBtn');
        
        // Always show both buttons after analysis
        if (fertilizerBtn) {
            fertilizerBtn.style.display = 'flex';
            console.log('Fertilization Decision button shown');
        }
        
        if (irrigationBtn) {
            irrigationBtn.style.display = 'flex';
            console.log('Irrigation Decision button shown');
        }
    }
    
    hideDecisionButtons() {
        const fertilizerBtn = document.getElementById('fertilizerActionBtn');
        const irrigationBtn = document.getElementById('irrigationActionBtn');
        
        if (fertilizerBtn) {
            fertilizerBtn.style.display = 'none';
        }
        if (irrigationBtn) {
            irrigationBtn.style.display = 'none';
        }
    }
    
    // Legacy methods for compatibility
    showFertilizerButton() {
        this.showDecisionButtons();
    }
    
    hideFertilizerButton() {
        this.hideDecisionButtons();
    }
    
    showFertilizerDecisionModal() {
        if (!this.currentAnalysisData) return;
        
        // Update modal with AI recommendation
        this.updateModalRecommendation();
        
        // Show modal
        const modal = document.getElementById('fertilizerDecisionModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }
    
    hideFertilizerDecisionModal() {
        const modal = document.getElementById('fertilizerDecisionModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    updateModalRecommendation() {
        if (!this.currentAnalysisData || !this.currentAnalysisData.recommendation) return;
        
        const recommendation = this.currentAnalysisData.recommendation;
        const recommendText = recommendation.needsFertilizer ? 'Apply fertilizer' : 'Skip fertilizer';
        const confidence = recommendation.confidence || 0;
        
        const modalRecommendationElement = document.getElementById('modalAiRecommendation');
        const modalConfidenceElement = document.getElementById('modalConfidence');
        
        if (modalRecommendationElement) {
            modalRecommendationElement.textContent = recommendText;
        }
        
        if (modalConfidenceElement) {
            modalConfidenceElement.textContent = confidence;
        }
    }
    
    handleFertilizerDecision(applyFertilizer) {
        if (!this.currentAnalysisData) return;
        
        // Hide modal first
        this.hideFertilizerDecisionModal();
        
        // Process the fertilizer decision
        const decision = {
            farmId: this.currentAnalysisData.farmId || 'farm-' + Date.now(),
            applyFertilizer: applyFertilizer,
            timestamp: new Date().toISOString(),
            analysisData: this.currentAnalysisData
        };
        
        // Check if decision is correct
        const recommendation = this.currentAnalysisData.recommendation;
        const isCorrect = recommendation ? (applyFertilizer === recommendation.needsFertilizer) : true;
        
        // Check if this is a LATAM mission
        const isLatamMission = window.mapManager ? mapManager.isSelectionInLatamZone() : false;
        
        // Mark the area as completed on the map
        if (window.mapManager) {
            const selectionBounds = mapManager.getSelectionBounds();
            if (selectionBounds) {
                mapManager.markAreaAsCompleted(selectionBounds, isCorrect, isLatamMission);
            }
        }
        
        // Show feedback
        this.showFertilizerFeedback(decision, applyFertilizer, isCorrect);
        
        // Hide fertilizer button
        this.hideFertilizerButton();
        
        // Send confirmation to chatbot
        this.sendFertilizerConfirmationToChatbot(applyFertilizer);
        
        // Dispatch event for other components (achievement system will handle this)
        document.dispatchEvent(new CustomEvent('fertilizerDecisionMade', {
            detail: decision
        }));
    }
    
    sendFertilizerConfirmationToChatbot(applyFertilizer) {
        const action = applyFertilizer ? 'Applied' : 'Skipped';
        const icon = applyFertilizer ? '🌱' : '⚠️';
        const actionText = applyFertilizer ? 'treated with fertilizer' : 'left without fertilizer treatment';
        
        const message = `✅ **Fertilizer ${action} Successfully!**\n\n` +
                       `${icon} The selected farm area has been ${actionText}.\n` +
                       `📈 You've earned points for your decision!\n\n` +
                       `Ready to analyze another farm area? Select a new area on the map and click "Analyze Farm".`;
        
        // Send to chatbot
        if (window.chatbot && window.chatbot.addMessage) {
            window.chatbot.addMessage(message, 'ai');
        }
    }
    
    toggleDashboardSection(sectionType) {
        // Since dashboard is now hidden, show analysis data in modal format
        this.showAnalysisModal(sectionType);
    }
    
    showAnalysisModal(sectionType) {
        if (!this.currentAnalysisData) return;
        
        const titles = {
            'weather': 'Weather Analysis',
            'vegetation': 'Vegetation Health (LAI)',
            'soil': 'Soil Conditions',
            'irrigation': 'Smart Irrigation Analysis'
        };
        
        const icons = {
            'weather': 'fas fa-cloud-sun',
            'vegetation': 'fas fa-leaf',
            'soil': 'fas fa-mountain',
            'irrigation': 'fas fa-tint'
        };
        
        // Create modal content
        const modalContent = this.createAnalysisModalContent(sectionType, titles[sectionType], icons[sectionType]);
        
        // Show modal
        this.displayAnalysisModal(modalContent, sectionType);
    }
    
    createAnalysisModalContent(sectionType, title, icon) {
        let content = '';
        
        if (sectionType === 'weather') {
            content = this.createWeatherContent();
        } else if (sectionType === 'vegetation') {
            content = this.createVegetationContent();
        } else if (sectionType === 'soil') {
            content = this.createSoilContent();
        } else if (sectionType === 'irrigation') {
            content = this.createIrrigationContent();
        }
        
        return `
            <div class="analysis-modal" id="analysisDataModal">
                <div class="analysis-modal-content">
                    <div class="analysis-modal-header">
                        <h4>
                            <i class="${icon} me-2"></i>
                            ${title}
                        </h4>
                        <button class="btn btn-sm btn-outline-light" id="closeAnalysisModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="analysis-modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }
    
    createWeatherContent() {
        if (!this.currentAnalysisData || !this.currentAnalysisData.weather) return '<p>No weather data available.</p>';
        
        const weather = this.currentAnalysisData.weather;
        const latest = weather[weather.length - 1];
        
        return `
            <div class="weather-summary">
                <div class="row text-center mb-4">
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-primary">${latest.temperature.toFixed(1)}°C</h4>
                            <small>Temperature</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-info">${latest.humidity.toFixed(1)}%</h4>
                            <small>Humidity</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-success">${latest.rainfall.toFixed(1)}mm</h4>
                            <small>Rainfall</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-warning">${weather.length}</h4>
                            <small>Days Analyzed</small>
                        </div>
                    </div>
                </div>
                <div class="chart-container mb-3">
                    <canvas id="weatherChartModal" width="400" height="200"></canvas>
                </div>
                <p class="text-muted">Weather data shows recent conditions for the selected farm area. Temperature and humidity levels are within normal ranges for agricultural activities.</p>
            </div>
        `;
    }
    
    createVegetationContent() {
        if (!this.currentAnalysisData || !this.currentAnalysisData.lai) return '<p>No vegetation data available.</p>';
        
        const lai = this.currentAnalysisData.lai;
        const latest = lai[lai.length - 1];
        const previous = lai[lai.length - 8] || lai[0];
        const trend = ((latest.lai - previous.lai) / previous.lai * 100);
        
        return `
            <div class="vegetation-summary">
                <div class="row text-center mb-4">
                    <div class="col-md-4">
                        <div class="metric-card">
                            <h4 class="text-success">${latest.lai.toFixed(2)}</h4>
                            <small>Current LAI</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="metric-card">
                            <h4 class="${trend > 0 ? 'text-success' : 'text-danger'}">${trend > 0 ? '+' : ''}${trend.toFixed(1)}%</h4>
                            <small>30-day Trend</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="metric-card">
                            <h4 class="text-info">${lai.length}</h4>
                            <small>Days Analyzed</small>
                        </div>
                    </div>
                </div>
                <div class="chart-container mb-3">
                    <canvas id="laiChartModal" width="400" height="200"></canvas>
                </div>
                <div class="lai-interpretation">
                    <h6>LAI Interpretation:</h6>
                    <ul class="list-unstyled">
                        <li><strong>0-1:</strong> Sparse vegetation</li>
                        <li><strong>1-3:</strong> Moderate vegetation</li>
                        <li><strong>3-6:</strong> Dense, healthy crops</li>
                        <li><strong>>6:</strong> Very dense vegetation</li>
                    </ul>
                    <p class="text-muted mt-3">Current LAI of ${latest.lai.toFixed(2)} indicates ${this.interpretLAI(latest.lai)} vegetation health.</p>
                </div>
            </div>
        `;
    }
    
    createSoilContent() {
        if (!this.currentAnalysisData || !this.currentAnalysisData.soil) return '<p>No soil data available.</p>';
        
        const soil = this.currentAnalysisData.soil;
        const latest = soil[soil.length - 1];
        
        return `
            <div class="soil-summary">
                <div class="row text-center mb-4">
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-primary">${latest.moisture.toFixed(1)}%</h4>
                            <small>Soil Moisture</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-success">${latest.nitrogen.toFixed(1)}ppm</h4>
                            <small>Nitrogen</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-warning">${latest.phosphorus.toFixed(1)}ppm</h4>
                            <small>Phosphorus</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-info">${latest.potassium.toFixed(1)}ppm</h4>
                            <small>Potassium</small>
                        </div>
                    </div>
                </div>
                <div class="chart-container mb-3">
                    <canvas id="soilChartModal" width="400" height="200"></canvas>
                </div>
                <div class="soil-interpretation">
                    <h6>Soil Analysis:</h6>
                    <p class="text-muted">Soil conditions show ${this.interpretSoilMoisture(latest.moisture)} moisture levels and ${this.interpretNutrients(latest.nitrogen, latest.phosphorus, latest.potassium)} nutrient balance.</p>
                </div>
            </div>
        `;
    }
    
    interpretLAI(lai) {
        if (lai < 1) return 'sparse';
        if (lai < 3) return 'moderate';
        if (lai < 6) return 'dense and healthy';
        return 'very dense';
    }
    
    interpretSoilMoisture(moisture) {
        if (moisture < 30) return 'low';
        if (moisture < 60) return 'adequate';
        return 'high';
    }
    
    interpretNutrients(n, p, k) {
        const avg = (n + p + k) / 3;
        if (avg < 40) return 'low';
        if (avg < 70) return 'adequate';
        return 'high';
    }
    
    displayAnalysisModal(modalHTML, sectionType) {
        // Remove existing modal if any
        const existingModal = document.getElementById('analysisDataModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('analysisDataModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Add close event listener
            const closeBtn = document.getElementById('closeAnalysisModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideAnalysisModal();
                });
            }
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAnalysisModal();
                }
            });
            
            // Create chart after modal is shown
            setTimeout(() => {
                this.createModalChart(sectionType);
            }, 100);
        }
    }
    
    createModalChart(sectionType) {
        if (!this.currentAnalysisData) return;
        
        if (sectionType === 'weather') {
            this.createWeatherChartModal();
        } else if (sectionType === 'vegetation') {
            this.createLAIChartModal();
        } else if (sectionType === 'soil') {
            this.createSoilChartModal();
        }
    }
    
    createWeatherChartModal() {
        const ctx = document.getElementById('weatherChartModal');
        if (!ctx || !this.currentAnalysisData) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentAnalysisData.weather.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: this.currentAnalysisData.weather.map(d => d.temperature),
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Humidity (%)',
                        data: this.currentAnalysisData.weather.map(d => d.humidity),
                        borderColor: '#4ecdc4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Rainfall (mm)',
                        data: this.currentAnalysisData.weather.map(d => d.rainfall),
                        type: 'bar',
                        backgroundColor: 'rgba(74, 144, 226, 0.6)',
                        yAxisID: 'y2'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Temperature (°C)' }
                    },
                    y1: {
                        type: 'linear',
                        display: false,
                        position: 'right'
                    },
                    y2: {
                        type: 'linear',
                        display: false,
                        position: 'right'
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    createLAIChartModal() {
        const ctx = document.getElementById('laiChartModal');
        if (!ctx || !this.currentAnalysisData) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentAnalysisData.lai.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'LAI',
                    data: this.currentAnalysisData.lai.map(d => d.lai),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 6,
                        title: { display: true, text: 'LAI Value' }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    createSoilChartModal() {
        const ctx = document.getElementById('soilChartModal');
        if (!ctx || !this.currentAnalysisData) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentAnalysisData.soil.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Soil Moisture (%)',
                        data: this.currentAnalysisData.soil.map(d => d.moisture),
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)'
                    },
                    {
                        label: 'Nitrogen (ppm)',
                        data: this.currentAnalysisData.soil.map(d => d.nitrogen),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)'
                    },
                    {
                        label: 'Phosphorus (ppm)',
                        data: this.currentAnalysisData.soil.map(d => d.phosphorus),
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Concentration' }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    hideAnalysisModal() {
        const modal = document.getElementById('analysisDataModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    resetButtonStates() {
        const buttons = [
            document.getElementById('weatherAnalysisBtn'),
            document.getElementById('vegetationHealthBtn'),
            document.getElementById('soilConditionsBtn'),
            document.getElementById('smartIrrigationBtn')
        ];
        
        buttons.forEach(btn => {
            if (btn) {
                btn.classList.remove('active');
            }
        });
        
        // Hide all sections
        const sections = ['weatherSection', 'vegetationSection', 'soilSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }
    
    showAnalysisButtons() {
        console.log('Showing analysis buttons...');
        const buttons = [
            document.getElementById('weatherAnalysisBtn'),
            document.getElementById('vegetationHealthBtn'),
            document.getElementById('soilConditionsBtn'),
            document.getElementById('smartIrrigationBtn')
        ];
        
        buttons.forEach((btn, index) => {
            if (btn) {
                console.log(`Button ${index} found, showing...`);
                btn.style.display = 'flex';
            } else {
                console.error(`Button ${index} not found!`);
            }
        });
    }
    
    hideAnalysisButtons() {
        const buttons = [
            document.getElementById('weatherAnalysisBtn'),
            document.getElementById('vegetationHealthBtn'),
            document.getElementById('soilConditionsBtn'),
            document.getElementById('smartIrrigationBtn')
        ];
        
        buttons.forEach(btn => {
            if (btn) {
                btn.style.display = 'none';
            }
        });
    }
    
    prepareChartData() {
        if (!this.currentAnalysisData) return;
        
        // Use the same data from the main analysis
        this.chartData = {
            weather: {
                labels: this.currentAnalysisData.weather.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: this.currentAnalysisData.weather.map(d => d.temperature),
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)'
                    },
                    {
                        label: 'Humidity (%)',
                        data: this.currentAnalysisData.weather.map(d => d.humidity),
                        borderColor: '#4ecdc4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)'
                    },
                    {
                        label: 'Rainfall (mm)',
                        data: this.currentAnalysisData.weather.map(d => d.rainfall),
                        borderColor: '#4a90e2',
                        backgroundColor: 'rgba(74, 144, 226, 0.6)'
                    }
                ]
            },
            lai: {
                labels: this.currentAnalysisData.lai.map(d => new Date(d.date).toLocaleDateString()),
                data: this.currentAnalysisData.lai.map(d => d.lai)
            },
            soil: {
                labels: this.currentAnalysisData.soil.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Soil Moisture (%)',
                        data: this.currentAnalysisData.soil.map(d => d.moisture),
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)'
                    },
                    {
                        label: 'Nitrogen (ppm)',
                        data: this.currentAnalysisData.soil.map(d => d.nitrogen),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)'
                    },
                    {
                        label: 'Phosphorus (ppm)',
                        data: this.currentAnalysisData.soil.map(d => d.phosphorus),
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)'
                    }
                ]
            }
        };
    }
    
    // Modal methods removed - now using dashboard sections
    
    // Chart creation is now handled by analysis.js in the dashboard sections
    

    
    showFertilizerFeedback(decision, applyFertilizer, isCorrect) {
        let message, type;
        if (isCorrect) {
            message = applyFertilizer ? '✅ Correct! Fertilizer Applied!' : '✅ Correct! Fertilizer Skipped!';
            type = 'success';
        } else {
            message = applyFertilizer ? '❌ Incorrect! Fertilizer Applied' : '❌ Incorrect! Fertilizer Skipped';
            type = 'warning';
        }
        this.showNotification(message, type);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-popup`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            z-index: 2000;
            min-width: 250px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    

    // Soil Humidity Analysis for Irrigation Decision
    analyzeSoilHumidityForIrrigation() {
        if (!this.currentAnalysisData || !this.currentAnalysisData.soil) {
            console.log('No soil data available for irrigation analysis');
            return;
        }
        
        const soilData = this.currentAnalysisData.soil;
        
        // Get last 3 days of soil moisture data
        const lastThreeDays = soilData.slice(-3);
        
        if (lastThreeDays.length < 3) {
            console.log('Insufficient soil data for 3-day analysis');
            return;
        }
        
        // Check if any of the last 3 days has moisture below 26%
        const needsIrrigation = lastThreeDays.some(day => day.moisture < 26);
        const averageMoisture = lastThreeDays.reduce((sum, day) => sum + day.moisture, 0) / 3;
        const minMoisture = Math.min(...lastThreeDays.map(day => day.moisture));
        
        // Calculate confidence based on how far below 26% the moisture is
        let confidence = 75;
        if (needsIrrigation) {
            const deficit = 26 - minMoisture;
            confidence = Math.min(95, 75 + (deficit * 2)); // Higher confidence for lower moisture
        } else {
            const surplus = minMoisture - 26;
            confidence = Math.min(95, 75 + (surplus * 1.5)); // Higher confidence for higher moisture
        }
        
        // Generate reasoning
        let reasoning;
        if (needsIrrigation) {
            reasoning = `Soil moisture analysis shows levels below 26% in the last 3 days. ` +
                       `Minimum moisture: ${minMoisture.toFixed(1)}%, Average: ${averageMoisture.toFixed(1)}%. ` +
                       `Irrigation is recommended to maintain optimal soil moisture for crop health.`;
        } else {
            reasoning = `Soil moisture levels have remained above 26% for the last 3 days. ` +
                       `Minimum moisture: ${minMoisture.toFixed(1)}%, Average: ${averageMoisture.toFixed(1)}%. ` +
                       `Current moisture levels are adequate for crop needs.`;
        }
        
        // Calculate water amount needed if irrigation is required
        let waterAmount = 0;
        if (needsIrrigation) {
            const moistureDeficit = Math.max(0, 26 - minMoisture);
            // Estimate water needed: roughly 2mm per 1% moisture deficit
            waterAmount = moistureDeficit * 2;
        }
        
        // Store irrigation decision in analysis data
        this.currentAnalysisData.needsIrrigation = needsIrrigation;
        this.currentAnalysisData.irrigation_decision = {
            needsIrrigation: needsIrrigation,
            confidence: Math.round(confidence),
            reasoning: reasoning,
            waterAmount: Math.round(waterAmount * 10) / 10,
            averageMoisture: Math.round(averageMoisture * 10) / 10,
            minMoisture: Math.round(minMoisture * 10) / 10,
            lastThreeDays: lastThreeDays,
            irrigationMethod: 'drip',
            timing: needsIrrigation ? 'Apply irrigation within 24 hours' : 'Continue monitoring',
            threshold: 26 // The 26% threshold
        };
        
        console.log('Soil humidity analysis completed:', this.currentAnalysisData.irrigation_decision);
        console.log('Needs irrigation:', needsIrrigation);
    }
        // Smart Irrigation Analysis Methods
    async performSmartIrrigationAnalysis() {
        if (!this.currentAnalysisData) {
            alert('No analysis data available for irrigation analysis.');
            return;
        }
        
        try {
            // Show loading state
            this.showIrrigationLoadingModal();
            
            // Prepare data for smart irrigation analysis
            const irrigationData = {
                lai_data: this.currentAnalysisData.lai,
                weather_data: this.currentAnalysisData.weather,
                satellite_data: {
                    ndvi: this.currentAnalysisData.satellite_data?.ndvi || [],
                    evi: this.currentAnalysisData.satellite_data?.evi || [],
                    dates: this.currentAnalysisData.satellite_data?.imagery_dates || []
                },
                farm_bounds: this.currentAnalysisData.bounds,
                crop_type: 'asparagus',
                soil_type: 'loamy',
                irrigation_system: 'drip'
            };
            
            // Call smart irrigation API
            const response = await fetch('/api/smart-irrigation/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(irrigationData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const irrigationAnalysis = await response.json();
            
            // Store irrigation analysis
            this.currentAnalysisData.irrigation_analysis = irrigationAnalysis;
            
            // Hide loading and show results
            this.hideIrrigationLoadingModal();
            this.showAnalysisModal('irrigation');
            
            // Send results to chatbot
            this.sendIrrigationResultsToChatbot(irrigationAnalysis);
            
        } catch (error) {
            console.error('Error performing smart irrigation analysis:', error);
            this.hideIrrigationLoadingModal();
            alert('Failed to perform smart irrigation analysis. Please try again.');
        }
    }
    
    showIrrigationLoadingModal() {
        const loadingHTML = `
            <div class="analysis-modal" id="irrigationLoadingModal">
                <div class="analysis-modal-content">
                    <div class="analysis-modal-header">
                        <h4>
                            <i class="fas fa-tint me-2"></i>
                            Smart Irrigation Analysis
                        </h4>
                    </div>
                    <div class="analysis-modal-body text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h5>Analyzing Irrigation Requirements...</h5>
                        <p class="text-muted">Running hydrological model with 72h forecast</p>
                        <div class="progress mb-3">
                            <div class="progress-bar bg-info progress-bar-striped progress-bar-animated" 
                                 role="progressbar" style="width: 100%"></div>
                        </div>
                        <small>Calculating soil moisture stress thresholds...</small>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        const modal = document.getElementById('irrigationLoadingModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
        }
    }
    
    hideIrrigationLoadingModal() {
        const modal = document.getElementById('irrigationLoadingModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    createIrrigationContent() {
        const irrigation = this.currentAnalysisData?.irrigation_analysis;
        if (!irrigation) {
            return '<p>No irrigation analysis data available.</p>';
        }
        
        const recommendation = irrigation.needs_irrigation ? 'Irrigation Required' : 'No Irrigation Needed';
        const urgencyClass = this.getUrgencyClass(irrigation.irrigation_urgency || 'none');
        const waterAmount = irrigation.water_amount || 0;
        const confidence = irrigation.confidence || 0;
        
        return `
            <div class="irrigation-summary">
                <div class="row text-center mb-4">
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="${urgencyClass}">${recommendation}</h4>
                            <small>Recommendation</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-primary">${waterAmount.toFixed(1)}mm</h4>
                            <small>Water Amount</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-info">${confidence.toFixed(0)}%</h4>
                            <small>Confidence</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="metric-card">
                            <h4 class="text-warning">${irrigation.irrigation_method || 'N/A'}</h4>
                            <small>Method</small>
                        </div>
                    </div>
                </div>
                
                <div class="irrigation-details mb-4">
                    <h6>Analysis Details:</h6>
                    <div class="alert alert-info">
                        <strong>Reasoning:</strong> ${irrigation.reasoning || 'No reasoning provided'}
                    </div>
                    
                    ${irrigation.timing ? `
                        <div class="alert alert-warning">
                            <strong>Timing:</strong> ${irrigation.timing}
                        </div>
                    ` : ''}
                    
                    ${irrigation.cost_estimate ? `
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <strong>Cost Estimate:</strong> ${irrigation.cost_estimate.toFixed(2)}/ha
                            </div>
                            <div class="col-md-6">
                                <strong>Water Savings:</strong> ${irrigation.water_savings || 0}%
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${irrigation.soil_moisture_forecast && irrigation.soil_moisture_forecast.length > 0 ? `
                    <div class="chart-container mb-3">
                        <h6>72-Hour Soil Moisture Forecast:</h6>
                        <canvas id="irrigationChartModal" width="400" height="200"></canvas>
                    </div>
                ` : ''}
                
                <div class="irrigation-schedule">
                    <h6>Irrigation Schedule:</h6>
                    ${this.createIrrigationScheduleTable(irrigation.irrigation_schedule)}
                </div>
                
                <div class="environmental-impact mt-3">
                    <h6>Environmental Impact:</h6>
                    <p class="text-muted">${irrigation.environmental_impact || 'Positive water management practices'}</p>
                </div>
            </div>
        `;
    }
    
    createIrrigationScheduleTable(schedule) {
        if (!schedule || !schedule.recommended_events || schedule.recommended_events.length === 0) {
            return '<p class="text-muted">No irrigation events scheduled.</p>';
        }
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Date/Time</th>
                            <th>Water Amount</th>
                            <th>Duration</th>
                            <th>Type</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        schedule.recommended_events.forEach(event => {
            const eventDate = new Date(event.datetime).toLocaleString();
            tableHTML += `
                <tr>
                    <td>${eventDate}</td>
                    <td>${event.water_amount.toFixed(1)}mm</td>
                    <td>${event.duration.toFixed(1)}h</td>
                    <td>${event.irrigation_type}</td>
                    <td>${(event.cost || 0).toFixed(2)}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHTML;
    }
    
    getUrgencyClass(urgency) {
        switch (urgency) {
            case 'critical': return 'text-danger';
            case 'high': return 'text-warning';
            case 'medium': return 'text-info';
            case 'low': return 'text-success';
            default: return 'text-muted';
        }
    }
    
    sendIrrigationResultsToChatbot(irrigationAnalysis) {
        if (!window.chatbot || !window.chatbot.addMessage) return;
        
        const needsIrrigation = irrigationAnalysis.needs_irrigation;
        const waterAmount = irrigationAnalysis.water_amount || 0;
        const confidence = irrigationAnalysis.confidence || 0;
        const method = irrigationAnalysis.irrigation_method || 'N/A';
        
        const icon = needsIrrigation ? '💧' : '✅';
        const status = needsIrrigation ? 'Irrigation Required' : 'No Irrigation Needed';
        
        let message = `${icon} **Smart Irrigation Analysis Complete!**\n\n`;
        message += `**Status:** ${status}\n`;
        message += `**Confidence:** ${confidence.toFixed(0)}%\n`;
        
        if (needsIrrigation) {
            message += `**Water Amount:** ${waterAmount.toFixed(1)}mm\n`;
            message += `**Method:** ${method}\n`;
            message += `**Timing:** ${irrigationAnalysis.timing || 'As recommended'}\n\n`;
            message += `💡 **Key Insights:**\n${irrigationAnalysis.reasoning}\n\n`;
            
            if (irrigationAnalysis.cost_estimate) {
                message += `💰 **Cost:** ${irrigationAnalysis.cost_estimate.toFixed(2)}/ha\n`;
            }
            if (irrigationAnalysis.water_savings) {
                message += `🌱 **Water Savings:** ${irrigationAnalysis.water_savings}% vs traditional methods\n`;
            }
        } else {
            message += `\n✨ Current soil moisture levels are adequate. Continue monitoring conditions.\n`;
        }
        
        message += `\nWould you like me to explain any aspect of this irrigation analysis?`;
        
        window.chatbot.addMessage(message, 'ai');
    }
    
    createModalChart(sectionType) {
        if (!this.currentAnalysisData) return;
        
        if (sectionType === 'weather') {
            this.createWeatherChartModal();
        } else if (sectionType === 'vegetation') {
            this.createLAIChartModal();
        } else if (sectionType === 'soil') {
            this.createSoilChartModal();
        } else if (sectionType === 'irrigation') {
            this.createIrrigationChartModal();
        }
    }
    
    createIrrigationChartModal() {
        const ctx = document.getElementById('irrigationChartModal');
        if (!ctx || !this.currentAnalysisData?.irrigation_analysis) return;
        
        const irrigation = this.currentAnalysisData.irrigation_analysis;
        const forecast = irrigation.soil_moisture_forecast || [];
        
        if (forecast.length === 0) return;
        
        const labels = forecast.map(f => new Date(f.datetime).toLocaleDateString());
        const moistureData = forecast.map(f => f.soil_moisture);
        const thresholdData = forecast.map(f => f.stress_threshold);
        const fieldCapacityData = forecast.map(f => f.field_capacity);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Soil Moisture',
                        data: moistureData,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Stress Threshold',
                        data: thresholdData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderDash: [5, 5],
                        fill: false
                    },
                    {
                        label: 'Field Capacity',
                        data: fieldCapacityData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderDash: [10, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 0.5,
                        title: { display: true, text: 'Volumetric Water Content' }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    

    // Irrigation Decision Modal Methods
    showIrrigationDecisionModal() {
        if (!this.currentAnalysisData?.irrigation_decision) {
            alert('No irrigation analysis available.');
            return;
        }
        
        // Update modal with irrigation recommendation
        this.updateIrrigationModalRecommendation();
        
        // Show modal
        const modal = document.getElementById('irrigationDecisionModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }
    
    hideIrrigationDecisionModal() {
        const modal = document.getElementById('irrigationDecisionModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    updateIrrigationModalRecommendation() {
        const irrigation = this.currentAnalysisData.irrigation_decision;
        if (!irrigation) return;
        
        const needsIrrigation = irrigation.needsIrrigation;
        const waterAmount = irrigation.waterAmount || 0;
        const confidence = irrigation.confidence || 0;
        const method = irrigation.irrigationMethod || 'drip';
        const timing = irrigation.timing || 'Monitor conditions';
        const averageMoisture = irrigation.averageMoisture || 0;
        const minMoisture = irrigation.minMoisture || 0;
        const threshold = irrigation.threshold || 26;
        
        // Update recommendation text
        const recommendationElement = document.getElementById('modalIrrigationRecommendation');
        const confidenceElement = document.getElementById('modalIrrigationConfidence');
        const detailsElement = document.getElementById('irrigationModalDetails');
        const buttonsElement = document.getElementById('irrigationDecisionButtons');
        
        if (recommendationElement) {
            const recommendText = needsIrrigation ? 
                `Apply ${waterAmount.toFixed(1)}mm irrigation` : 
                'No irrigation needed';
            recommendationElement.textContent = recommendText;
        }
        
        if (confidenceElement) {
            confidenceElement.textContent = confidence.toFixed(0);
        }
        
        if (detailsElement) {
            // Hide details section for simplified view
            detailsElement.innerHTML = '';
        }
        
        if (buttonsElement) {
            let buttonsHTML = '';
            
            if (needsIrrigation) {
                buttonsHTML = `
                    <button class="btn btn-success btn-lg me-3" onclick="window.analysisMenu.handleIrrigationDecision(true)">
                        <i class="fas fa-tint me-2"></i>
                        Apply Irrigation
                    </button>
                    <button class="btn btn-outline-danger btn-lg" onclick="window.analysisMenu.handleIrrigationDecision(false)">
                        <i class="fas fa-times me-2"></i>
                        Skip Irrigation
                    </button>
                `;
            } else {
                buttonsHTML = `
                    <button class="btn btn-outline-success btn-lg" onclick="window.analysisMenu.handleIrrigationDecision(false)">
                        <i class="fas fa-check me-2"></i>
                        Continue Monitoring
                    </button>
                `;
            }
            
            buttonsElement.innerHTML = buttonsHTML;
        }
    }
    
    handleIrrigationDecision(applyIrrigation) {
        if (!this.currentAnalysisData?.irrigation_decision) return;
        
        const irrigation = this.currentAnalysisData.irrigation_decision;
        const waterAmount = irrigation.waterAmount || 0;
        const method = irrigation.irrigationMethod || 'drip';
        
        // Hide modal first
        this.hideIrrigationDecisionModal();
        
        // Process the irrigation decision
        const decision = {
            farmId: this.currentAnalysisData.farmId || 'farm-' + Date.now(),
            applyIrrigation: applyIrrigation,
            waterAmount: waterAmount,
            method: method,
            timestamp: new Date().toISOString(),
            irrigationData: irrigation
        };
        
        // Check if decision is correct
        const aiRecommendation = irrigation.needsIrrigation;
        const isCorrect = applyIrrigation === aiRecommendation;
        
        // Check if this is a LATAM mission
        const isLatamMission = window.mapManager ? mapManager.isSelectionInLatamZone() : false;
        
        // Mark the area as completed on the map
        if (window.mapManager) {
            const selectionBounds = mapManager.getSelectionBounds();
            if (selectionBounds) {
                mapManager.markAreaAsCompleted(selectionBounds, isCorrect, isLatamMission);
            }
        }
        
        // Show feedback
        this.showIrrigationFeedback(decision, applyIrrigation, isCorrect);
        
        // Send confirmation to chatbot
        this.sendIrrigationDecisionToChatbot(applyIrrigation, decision);
        
        // Dispatch event for other components (achievement system will handle this)
        document.dispatchEvent(new CustomEvent('irrigationDecisionMade', {
            detail: decision
        }));
    }
    

    
    showIrrigationFeedback(decision, applyIrrigation, isCorrect) {
        const waterAmount = decision.waterAmount || 0;
        const method = decision.method || 'irrigation';
        
        let message, type;
        if (isCorrect) {
            if (applyIrrigation) {
                message = `✅ Correct! Irrigation Applied! ${waterAmount.toFixed(1)}mm using ${method} system`;
            } else {
                message = '✅ Correct! Irrigation Skipped - Conditions adequate';
            }
            type = 'success';
        } else {
            if (applyIrrigation) {
                message = `❌ Incorrect! Irrigation Applied ${waterAmount.toFixed(1)}mm`;
            } else {
                message = '❌ Incorrect! Irrigation Skipped';
            }
            type = 'warning';
        }
        
        this.showNotification(message, type);
    }
    
    sendIrrigationDecisionToChatbot(applyIrrigation, decision) {
        if (!window.chatbot || !window.chatbot.addMessage) return;
        
        const waterAmount = decision.waterAmount || 0;
        const method = decision.method || 'irrigation';
        const action = applyIrrigation ? 'Applied' : 'Skipped';
        const icon = applyIrrigation ? '💧' : '👁️';
        
        let message = `${icon} **Irrigation ${action} Successfully!**\n\n`;
        
        if (applyIrrigation) {
            message += `💧 Applied ${waterAmount.toFixed(1)}mm of water using ${method} irrigation.\n`;
            message += `🌱 Your crops will benefit from this smart irrigation decision!\n`;
            if (decision.irrigationData?.cost_estimate) {
                message += `💰 Cost: $${decision.irrigationData.cost_estimate.toFixed(2)}/ha\n`;
            }
        } else {
            message += `👁️ Continuing to monitor soil moisture conditions.\n`;
            message += `💡 Smart water management helps conserve resources!\n`;
        }
        
        message += `\n📈 You've earned points for your irrigation decision!\n`;
        message += `Ready to analyze another farm area? Select a new area on the map and click "Analyze Farm".`;
        
        window.chatbot.addMessage(message, 'ai');
    }

        // Public API methods
    resetAnalysisMenu() {
        this.currentAnalysisData = null;
        this.resetButtonStates();
        this.hideDecisionButtons();
    }
    
    getCurrentAnalysis() {
        return this.currentAnalysisData;
    }
}

// Initialize analysis menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.analysisMenu = new AnalysisMenu();
        console.log('Analysis Menu initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Analysis Menu:', error);
    }
});

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalysisMenu;
}