// Game Module - Simplified for Achievement System Integration
class GameManager {
    constructor() {
        // Legacy properties for compatibility
        this.score = 0;
        this.level = 1;
        this.farmsAnalyzed = 0;
        this.correctDecisions = 0;
        this.achievements = [];
        this.gameStats = {
            totalPoints: 0,
            accuracy: 0,
            averageConfidence: 0,
            timeSpent: 0,
            startTime: Date.now()
        };
        
        this.init();
    }

    init() {
        this.loadGameState();
        this.setupEventListeners();
        
        // Wait for achievement system to be ready
        this.waitForAchievementSystem();
    }
    
    waitForAchievementSystem() {
        if (window.achievementSystem) {
            this.achievementSystem = window.achievementSystem;
            console.log('Game Manager connected to Achievement System');
        } else {
            setTimeout(() => this.waitForAchievementSystem(), 100);
        }
    }

    setupEventListeners() {
        // Listen for decisions to track good decisions
        document.addEventListener('fertilizerDecisionMade', (e) => {
            this.handleDecision(e.detail);
        });
        
        document.addEventListener('irrigationDecisionMade', (e) => {
            this.handleDecision(e.detail);
        });

        // Auto-save game state periodically
        setInterval(() => {
            this.saveGameState();
        }, 30000); // Save every 30 seconds
    }
    
    handleDecision(decisionData) {
        this.farmsAnalyzed++;
        
        // Check if decision was correct
        const isCorrect = this.isDecisionCorrect(decisionData);
        
        if (isCorrect) {
            this.correctDecisions++;
            
            // Let achievement system handle the good decision
            if (this.achievementSystem) {
                // The achievement system will handle this automatically
                console.log('Good decision tracked by achievement system');
            }
        }
        
        this.updateAccuracy();
        this.saveGameState();
    }
    
    isDecisionCorrect(decisionData) {
        // Check fertilizer decisions
        if (decisionData.analysisData && decisionData.analysisData.recommendation) {
            const aiRecommendation = decisionData.analysisData.recommendation.needsFertilizer;
            return decisionData.applyFertilizer === aiRecommendation;
        }
        
        // Check irrigation decisions
        if (decisionData.irrigationData) {
            const aiRecommendation = decisionData.irrigationData.needsIrrigation;
            return decisionData.applyIrrigation === aiRecommendation;
        }
        
        return false;
    }

    // Legacy method for compatibility - now redirects to achievement system
    addScore(points, isLatamMission = false) {
        // This method is kept for compatibility but doesn't affect the new system
        this.score += points;
        this.gameStats.totalPoints += points;
        
        // The achievement system handles progression now
        console.log('Legacy addScore called - achievement system handles progression');
    }

    updateAccuracy() {
        this.gameStats.accuracy = this.farmsAnalyzed > 0 ? 
            (this.correctDecisions / this.farmsAnalyzed * 100) : 0;
    }

    getGameStats() {
        const achievementProgress = this.achievementSystem ? this.achievementSystem.getProgress() : null;
        
        return {
            ...this.gameStats,
            score: this.score,
            level: this.level,
            farmsAnalyzed: this.farmsAnalyzed,
            correctDecisions: this.correctDecisions,
            achievements: this.achievements.length,
            timeSpent: (Date.now() - this.gameStats.startTime) / 1000 / 60, // minutes
            achievementProgress: achievementProgress
        };
    }

    saveGameState() {
        const gameState = {
            score: this.score,
            level: this.level,
            farmsAnalyzed: this.farmsAnalyzed,
            correctDecisions: this.correctDecisions,
            achievements: this.achievements,
            gameStats: this.gameStats,
            completedAreas: window.mapManager ? mapManager.completedAreas : []
        };
        
        localStorage.setItem('agriculturalGameState', JSON.stringify(gameState));
    }

    loadGameState() {
        const savedState = localStorage.getItem('agriculturalGameState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.score = state.score || 0;
                this.level = state.level || 1;
                this.farmsAnalyzed = state.farmsAnalyzed || 0;
                this.correctDecisions = state.correctDecisions || 0;
                this.achievements = state.achievements || [];
                this.gameStats = { ...this.gameStats, ...state.gameStats };
                
                // Load completed areas after map is initialized
                if (state.completedAreas && state.completedAreas.length > 0) {
                    this.pendingCompletedAreas = state.completedAreas;
                }
            } catch (error) {
                console.error('Failed to load game state:', error);
            }
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
            localStorage.removeItem('agriculturalGameState');
            
            // Reset achievement system
            if (this.achievementSystem) {
                this.achievementSystem.restartGame();
            }
            
            // Reset legacy properties
            this.score = 0;
            this.level = 1;
            this.farmsAnalyzed = 0;
            this.correctDecisions = 0;
            this.achievements = [];
            this.gameStats = {
                totalPoints: 0,
                accuracy: 0,
                averageConfidence: 0,
                timeSpent: 0,
                startTime: Date.now()
            };
            
            // Clear completed areas from map
            if (window.mapManager) {
                mapManager.clearCompletedMarkers();
            }
        }
    }

    exportStats() {
        const stats = this.getGameStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'agricultural_game_stats.json';
        link.click();
    }

    // Get hints based on player performance
    getHint() {
        const accuracy = this.gameStats.accuracy;
        
        if (accuracy < 50) {
            return "💡 Tip: Pay attention to LAI values below 2.5 - they often indicate poor vegetation health!";
        } else if (accuracy < 70) {
            return "💡 Tip: Consider soil nitrogen levels - values below 60 ppm often suggest fertilizer needs!";
        } else if (accuracy < 85) {
            return "💡 Tip: Recent rainfall affects fertilizer effectiveness - dry conditions may reduce uptake!";
        } else {
            return "�� You're doing great! Keep analyzing the complete picture of weather, soil, and vegetation data!";
        }
    }

    showHint() {
        const hint = this.getHint();
        const hintDiv = document.createElement('div');
        hintDiv.className = 'alert alert-info position-fixed';
        hintDiv.style.cssText = `
            bottom: 20px;
            right: 20px;
            z-index: 3000;
            max-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;
        hintDiv.textContent = hint;
        
        document.body.appendChild(hintDiv);
        
        setTimeout(() => {
            if (hintDiv.parentNode) {
                hintDiv.parentNode.removeChild(hintDiv);
            }
        }, 6000);
    }
}

// Initialize game manager
let gameManager;
document.addEventListener('DOMContentLoaded', () => {
    gameManager = new GameManager();
    
    // Show hint after first farm if accuracy is low
    setTimeout(() => {
        if (gameManager.farmsAnalyzed >= 1 && gameManager.gameStats.accuracy < 70) {
            gameManager.showHint();
        }
    }, 5000);
});

// Add CSS for slide animations
const gameStyle = document.createElement('style');
gameStyle.textContent = `
    @keyframes slideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(gameStyle);