// Analysis Module - Handles data analysis and visualization
class AnalysisManager {
    constructor() {
        this.charts = {};
        this.currentData = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.startAnalysis();
        });

        // Fertilizer decision is now handled by analysis_menu.js
        // Listen for fertilizer decisions from the new system
        document.addEventListener('fertilizerDecisionMade', (e) => {
            this.handleFertilizerDecision(e.detail);
        });

        const nextFarmBtn = document.getElementById('nextFarmBtn');
        if (nextFarmBtn) {
            nextFarmBtn.addEventListener('click', () => {
                this.resetForNextFarm();
            });
        }
    }

    async startAnalysis() {
        const bounds = mapManager.getSelectionBounds();
        if (!bounds) {
            alert('Please select a farm area first!');
            return;
        }

        // Highlight the selected area during analysis
        if (mapManager.highlightCurrentSelection) {
            mapManager.highlightCurrentSelection();
        }

        // Show loading screen
        this.showLoadingScreen();

        try {
            // Simulate data fetching with progress updates
            await this.fetchAnalysisData(bounds);
            
            // Show results
            this.showAnalysisResults();
            
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to analyze farm data. Please try again.');
            this.hideLoadingScreen();
            
            // Remove highlight on error
            if (mapManager.removeSelectionHighlight) {
                mapManager.removeSelectionHighlight();
            }
        }
    }

    showLoadingScreen() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('analysisResults').style.display = 'none';
        document.getElementById('loadingScreen').style.display = 'block';
        
        // Simulate loading progress
        this.simulateLoading();
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
    }

    showAnalysisResults() {
        this.hideLoadingScreen();
        
        // Update LATAM mission progress display (panel is always visible now)
        this.updateLatamMissionDisplay();
        
        document.getElementById('analysisResults').style.display = 'block';
        document.getElementById('analysisResults').classList.add('fade-in');
        
        // Create charts in dashboard
        this.createWeatherChart();
        this.createLAIChart();
        this.createSoilChart();
        
        // Update metrics
        this.updateMetrics();
        
        // Dispatch event for analysis menu buttons
        document.dispatchEvent(new CustomEvent('analysisCompleted', {
            detail: this.currentData
        }));
    }
    
    updateLatamMissionDisplay() {
        // Update progress display
        const progressText = document.getElementById('latamProgressText');
        if (progressText && window.gameManager) {
            progressText.textContent = `${gameManager.latamMissions.completed}/${gameManager.latamMissions.target}`;
        }
        const progressBar = document.getElementById('latamProgress');
        if (progressBar && window.gameManager) {
            const percentage = (gameManager.latamMissions.completed / gameManager.latamMissions.target) * 100;
            progressBar.style.width = percentage + '%';
        }
    }

    async simulateLoading() {
        const progressBar = document.getElementById('progressBar');
        const statusText = document.getElementById('loadingStatus');
        
        const steps = [
            { progress: 20, text: 'Fetching satellite imagery...' },
            { progress: 40, text: 'Analyzing vegetation indices...' },
            { progress: 60, text: 'Processing weather data...' },
            { progress: 80, text: 'Calculating LAI values...' },
            { progress: 100, text: 'Generating recommendations...' }
        ];

        for (let step of steps) {
            await new Promise(resolve => setTimeout(resolve, 800));
            progressBar.style.width = step.progress + '%';
            statusText.textContent = step.text;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async fetchAnalysisData(bounds) {
        // In a real application, this would make API calls to NASA and weather services
        // For now, we'll generate realistic sample data
        
        const center = bounds.getCenter();
        
        this.currentData = {
            location: {
                lat: center.lat,
                lng: center.lng,
                area: mapManager.calculateArea(bounds)
            },
            weather: this.generateWeatherData(),
            vegetation: this.generateVegetationData(),
            soil: this.generateSoilData(),
            lai: this.generateLAIData(),
            recommendation: null
        };

        // Generate AI recommendation
        this.currentData.recommendation = this.generateRecommendation();
    }

    generateWeatherData() {
        // Generate 30 days of weather data
        const data = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                temperature: 15 + Math.random() * 20 + Math.sin(i * 0.2) * 5,
                humidity: 40 + Math.random() * 40,
                rainfall: Math.random() < 0.3 ? Math.random() * 15 : 0
            });
        }
        
        return data;
    }

    generateVegetationData() {
        // Generate NDVI and other vegetation indices
        return {
            ndvi: 0.3 + Math.random() * 0.5,
            evi: 0.2 + Math.random() * 0.4,
            savi: 0.25 + Math.random() * 0.45
        };
    }

    generateSoilData() {
        // Generate soil moisture and nutrient data
        const data = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                moisture: 20 + Math.random() * 60,
                nitrogen: 50 + Math.random() * 40,
                phosphorus: 30 + Math.random() * 50,
                potassium: 40 + Math.random() * 45
            });
        }
        
        return data;
    }

    generateLAIData() {
        // Generate LAI time series data
        const data = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Simulate seasonal growth pattern
            const seasonalFactor = Math.sin((i / 30) * Math.PI) * 0.5 + 0.5;
            const lai = 1 + seasonalFactor * 4 + (Math.random() - 0.5) * 0.5;
            
            data.push({
                date: date.toISOString().split('T')[0],
                lai: Math.max(0, lai)
            });
        }
        
        return data;
    }

    generateRecommendation() {
        const currentLAI = this.currentData.lai[this.currentData.lai.length - 1].lai;
        const avgSoilNitrogen = this.currentData.soil.reduce((sum, d) => sum + d.nitrogen, 0) / this.currentData.soil.length;
        const recentRainfall = this.currentData.weather.slice(-7).reduce((sum, d) => sum + d.rainfall, 0);
        
        // Simple decision algorithm
        let needsFertilizer = false;
        let confidence = 0;
        let reasoning = '';

        if (currentLAI < 2.5) {
            needsFertilizer = true;
            confidence += 30;
            reasoning += 'Low LAI indicates poor vegetation health. ';
        }

        if (avgSoilNitrogen < 60) {
            needsFertilizer = true;
            confidence += 25;
            reasoning += 'Soil nitrogen levels are below optimal. ';
        }

        if (recentRainfall > 20) {
            confidence += 20;
            reasoning += 'Recent rainfall provides good conditions for fertilizer uptake. ';
        } else if (recentRainfall < 5) {
            confidence -= 15;
            reasoning += 'Low recent rainfall may reduce fertilizer effectiveness. ';
        }

        if (!needsFertilizer && currentLAI > 4) {
            confidence += 25;
            reasoning += 'High LAI indicates healthy vegetation that may not need additional fertilizer. ';
        }

        confidence = Math.max(50, Math.min(95, confidence + 50));

        return {
            needsFertilizer,
            confidence: Math.round(confidence),
            reasoning: reasoning.trim()
        };
    }

    createWeatherChart() {
        const ctx = document.getElementById('weatherChart').getContext('2d');
        
        if (this.charts.weather) {
            this.charts.weather.destroy();
        }

        this.charts.weather = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentData.weather.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: this.currentData.weather.map(d => d.temperature),
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Humidity (%)',
                        data: this.currentData.weather.map(d => d.humidity),
                        borderColor: '#4ecdc4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Rainfall (mm)',
                        data: this.currentData.weather.map(d => d.rainfall),
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

    createLAIChart() {
        const ctx = document.getElementById('laiChart').getContext('2d');
        
        if (this.charts.lai) {
            this.charts.lai.destroy();
        }

        this.charts.lai = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentData.lai.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'LAI',
                    data: this.currentData.lai.map(d => d.lai),
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

    createSoilChart() {
        const ctx = document.getElementById('soilChart').getContext('2d');
        
        if (this.charts.soil) {
            this.charts.soil.destroy();
        }

        this.charts.soil = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.currentData.soil.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Soil Moisture (%)',
                        data: this.currentData.soil.map(d => d.moisture),
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)'
                    },
                    {
                        label: 'Nitrogen (ppm)',
                        data: this.currentData.soil.map(d => d.nitrogen),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)'
                    },
                    {
                        label: 'Phosphorus (ppm)',
                        data: this.currentData.soil.map(d => d.phosphorus),
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

    updateMetrics() {
        const currentLAI = this.currentData.lai[this.currentData.lai.length - 1].lai;
        const previousLAI = this.currentData.lai[this.currentData.lai.length - 8].lai;
        const trend = ((currentLAI - previousLAI) / previousLAI * 100);

        document.getElementById('currentLAI').textContent = currentLAI.toFixed(2);
        document.getElementById('laiTrend').textContent = 
            (trend > 0 ? '+' : '') + trend.toFixed(1) + '%';
        
        // Update trend color
        const trendElement = document.getElementById('laiTrend');
        trendElement.className = trend > 0 ? 'text-success' : 'text-danger';
    }

    handleFertilizerDecision(decision) {
        const recommendation = this.currentData.recommendation;
        const isCorrect = decision.applyFertilizer === recommendation.needsFertilizer;
        
        // Calculate score based on accuracy and confidence
        let points = 0;
        if (isCorrect) {
            points = Math.round(recommendation.confidence * 0.8 + 20);
        } else {
            points = Math.round((100 - recommendation.confidence) * 0.3);
        }

        // Check if this is a LATAM mission
        const isLatamMission = mapManager.isSelectionInLatamZone();
        
        // Remove selection highlight before marking as completed
        if (mapManager.removeSelectionHighlight) {
            mapManager.removeSelectionHighlight();
        }
        
        // Mark the area as completed on the map
        const selectionBounds = mapManager.getSelectionBounds();
        if (selectionBounds) {
            mapManager.markAreaAsCompleted(selectionBounds, isCorrect, isLatamMission);
        }
        
        // Update game score with LATAM mission flag
        if (window.gameManager) {
            gameManager.addScore(points, isLatamMission);
        }

        // Show recommendation in dashboard
        this.showRecommendation(isCorrect, points, isLatamMission);
    }

    showRecommendation(isCorrect, points, isLatamMission = false) {
        const recommendation = this.currentData.recommendation;
        const recommendationDiv = document.getElementById('recommendation');

        if (recommendationDiv) {
            recommendationDiv.style.display = 'block';
        }

        // Show points earned
        this.showPointsEarned(points, isCorrect, isLatamMission);
    }

    showPointsEarned(points, isCorrect, isLatamMission = false) {
        // Create floating points animation
        const pointsDiv = document.createElement('div');
        const alertClass = isCorrect ? 'alert-success' : 'alert-warning';
        const borderColor = isLatamMission ? (isCorrect ? '#ff6b35' : '#dc3545') : '';
        
        pointsDiv.className = `alert ${alertClass} position-fixed`;
        pointsDiv.style.cssText = `
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 3000;
            font-weight: bold;
            animation: pointsFloat 2s ease-out forwards;
            ${borderColor ? `border: 2px solid ${borderColor};` : ''}
        `;
        
        let pointsText = `${isCorrect ? '+' : '+'}${points} points!`;
        if (isLatamMission) {
            pointsText = `🚀 ${pointsText}`;
        }
        
        pointsDiv.textContent = pointsText;
        
        document.body.appendChild(pointsDiv);
        
        setTimeout(() => {
            if (pointsDiv.parentNode) {
                document.body.removeChild(pointsDiv);
            }
        }, 2000);
    }

    resetForNextFarm() {
        // Clear current selection and reset UI
        mapManager.clearSelection();
        
        // Hide analysis results
        document.getElementById('analysisResults').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'block';
        
        // Clear data
        this.currentData = null;
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
        
        // Hide analysis menu buttons
        if (window.analysisMenu) {
            window.analysisMenu.resetAnalysisMenu();
        }
    }
}

// Initialize analysis manager
let analysisManager;
document.addEventListener('DOMContentLoaded', () => {
    analysisManager = new AnalysisManager();
});

// Add CSS for points animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pointsFloat {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            transform: translate(-50%, -60%) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -70%) scale(0.8);
        }
    }
`;
document.head.appendChild(style);