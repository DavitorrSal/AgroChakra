/**
 * Achievement System - Continental Progression
 * Tracks good decisions and unlocks continents with achievements
 */

class AchievementSystem {
    constructor() {
        this.continents = [
            {
                id: 1,
                name: "North America",
                description: "Master of North American Agriculture",
                requiredDecisions: 20,
                achievementImage: "images_every_achieve/achieve_1.png",
                unlocked: true, // First continent is always unlocked
                completed: false
            },
            {
                id: 2,
                name: "South America",
                description: "Expert of South American Farming",
                requiredDecisions: 20,
                achievementImage: "images_every_achieve/achieve_2.png",
                unlocked: false,
                completed: false
            },
            {
                id: 3,
                name: "Europe",
                description: "Champion of European Agriculture",
                requiredDecisions: 20,
                achievementImage: "images_every_achieve/achieve_3.png",
                unlocked: false,
                completed: false
            },
            {
                id: 4,
                name: "Asia",
                description: "Guardian of Asian Crops",
                requiredDecisions: 20,
                achievementImage: "images_every_achieve/achieve_4.png",
                unlocked: false,
                completed: false
            },
            {
                id: 5,
                name: "Africa",
                description: "Protector of African Harvests",
                requiredDecisions: 20,
                achievementImage: "images_every_achieve/achieve_5.png",
                unlocked: false,
                completed: false
            }
        ];
        
        this.currentContinent = 1;
        this.goodDecisions = 0;
        this.totalGoodDecisions = 0;
        
        this.init();
    }
    
    init() {
        this.loadProgress();
        this.updateUI();
        this.bindEvents();
        
        // Listen for good decisions
        document.addEventListener('fertilizerDecisionMade', (e) => {
            this.handleDecision(e.detail);
        });
        
        document.addEventListener('irrigationDecisionMade', (e) => {
            this.handleDecision(e.detail);
        });
    }
    
    bindEvents() {
        // Close achievement modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('achievement-overlay')) {
                this.closeAchievementModal();
            }
        });
        
        // Escape key to close achievement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAchievementModal();
            }
        });
    }
    
    handleDecision(decisionData) {
        // Check if decision was correct by looking at map marking
        // We'll get this information from the analysis system
        const isCorrect = this.isDecisionCorrect(decisionData);
        
        if (isCorrect) {
            this.addGoodDecision();
        }
    }
    
    isDecisionCorrect(decisionData) {
        // This will be determined by the analysis system
        // For now, we'll check if the decision matches AI recommendation
        if (decisionData.analysisData && decisionData.analysisData.recommendation) {
            const aiRecommendation = decisionData.analysisData.recommendation.needsFertilizer;
            return decisionData.applyFertilizer === aiRecommendation;
        }
        
        if (decisionData.irrigationData) {
            const aiRecommendation = decisionData.irrigationData.needsIrrigation;
            return decisionData.applyIrrigation === aiRecommendation;
        }
        
        return false;
    }
    
    addGoodDecision() {
        this.goodDecisions++;
        this.totalGoodDecisions++;
        
        console.log(`Good decision added! Current: ${this.goodDecisions}/${this.getCurrentContinent().requiredDecisions}`);
        
        this.saveProgress();
        this.updateUI();
        
        // Check for achievement
        if (this.goodDecisions >= this.getCurrentContinent().requiredDecisions) {
            this.unlockAchievement();
        } else {
            this.showProgressNotification();
        }
    }
    
    unlockAchievement() {
        // Achievement system disabled - just save progress
        this.saveProgress();
        this.updateUI();
    }
    
    showAchievementModal(continent) {
        // Achievement modal disabled
        return;
        const modalHTML = `
            <div class="achievement-overlay" id="achievementOverlay">
                <div class="achievement-modal">
                    <div class="achievement-content">
                        <div class="achievement-header">
                            <h2>🏆 Achievement Unlocked!</h2>
                            <button class="achievement-close" onclick="window.achievementSystem.closeAchievementModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="achievement-image-container">
                            <img src="${continent.achievementImage}" alt="${continent.name} Achievement" class="achievement-image">
                        </div>
                        
                        <div class="achievement-details">
                            <h3>${continent.name}</h3>
                            <p class="achievement-description">${continent.description}</p>
                            <div class="achievement-stats">
                                <div class="stat">
                                    <span class="stat-number">${continent.requiredDecisions}</span>
                                    <span class="stat-label">Good Decisions</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">${continent.id}</span>
                                    <span class="stat-label">Continent ${continent.id}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="achievement-footer">
                            <button class="btn btn-success btn-lg" onclick="window.achievementSystem.closeAchievementModal()">
                                <i class="fas fa-check me-2"></i>
                                Continue Journey
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Trigger animation
        setTimeout(() => {
            const modal = document.getElementById('achievementOverlay');
            if (modal) {
                modal.classList.add('show');
            }
        }, 100);
    }
    
    closeAchievementModal() {
        const modal = document.getElementById('achievementOverlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    showContinentUnlockedNotification(continent) {
        // Continent notifications disabled
    }
    
    showProgressNotification() {
        // Progress notifications disabled
    }
    
    showGameCompletionModal() {
        // Game completion modal disabled
        return;
        const modalHTML = `
            <div class="achievement-overlay game-completion" id="gameCompletionOverlay">
                <div class="achievement-modal completion-modal">
                    <div class="achievement-content">
                        <div class="achievement-header">
                            <h2>🌍 Congratulations!</h2>
                        </div>
                        
                        <div class="completion-content">
                            <div class="completion-icon">
                                <i class="fas fa-trophy fa-4x text-warning"></i>
                            </div>
                            
                            <h3>Master of Global Agriculture!</h3>
                            <p class="completion-description">
                                You have successfully completed all continents and made 
                                <strong>${this.totalGoodDecisions} excellent agricultural decisions!</strong>
                            </p>
                            
                            <div class="completion-stats">
                                <div class="completion-grid">
                                    ${this.continents.map(continent => `
                                        <div class="completion-continent">
                                            <img src="${continent.achievementImage}" alt="${continent.name}">
                                            <span>${continent.name}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="completion-message">
                                <p>You are now a certified global agricultural expert!</p>
                                <p>Thank you for helping farmers around the world! 🌱</p>
                            </div>
                        </div>
                        
                        <div class="achievement-footer">
                            <button class="btn btn-warning btn-lg" onclick="window.achievementSystem.restartGame()">
                                <i class="fas fa-redo me-2"></i>
                                Start New Journey
                            </button>
                            <button class="btn btn-success btn-lg" onclick="window.achievementSystem.closeAchievementModal()">
                                <i class="fas fa-check me-2"></i>
                                Continue Exploring
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('gameCompletionOverlay');
            if (modal) {
                modal.classList.add('show');
            }
        }, 100);
    }
    
    showNotification(notification, duration = 3000) {
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            z-index: 2000;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    updateUI() {
        this.updateNavigationDisplay();
        this.updateContinentProgress();
    }
    
    updateNavigationDisplay() {
        // Navigation display updates disabled
    }
    
    updateContinentProgress() {
        // Continent progress indicator disabled - remove if exists
        const progressIndicator = document.getElementById('continentProgress');
        if (progressIndicator) {
            progressIndicator.remove();
        }
    }
    
    getCurrentContinent() {
        return this.continents.find(c => c.id === this.currentContinent) || this.continents[0];
    }
    
    saveProgress() {
        const progress = {
            currentContinent: this.currentContinent,
            goodDecisions: this.goodDecisions,
            totalGoodDecisions: this.totalGoodDecisions,
            continents: this.continents
        };
        
        localStorage.setItem('achievementProgress', JSON.stringify(progress));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('achievementProgress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                this.currentContinent = progress.currentContinent || 1;
                this.goodDecisions = progress.goodDecisions || 0;
                this.totalGoodDecisions = progress.totalGoodDecisions || 0;
                
                if (progress.continents) {
                    // Merge saved progress with default continents
                    progress.continents.forEach((savedContinent, index) => {
                        if (this.continents[index]) {
                            this.continents[index].unlocked = savedContinent.unlocked;
                            this.continents[index].completed = savedContinent.completed;
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading achievement progress:', error);
            }
        }
    }
    
    restartGame() {
        // Reset all progress
        this.currentContinent = 1;
        this.goodDecisions = 0;
        this.totalGoodDecisions = 0;
        
        this.continents.forEach((continent, index) => {
            continent.unlocked = index === 0; // Only first continent unlocked
            continent.completed = false;
        });
        
        this.saveProgress();
        this.updateUI();
        this.closeAchievementModal();
        
        // Clear map markers if available
        if (window.mapManager && window.mapManager.clearCompletedMarkers) {
            window.mapManager.clearCompletedMarkers();
        }
        
        this.showNotification(this.createNotification('info', 'Game Reset!', 'Starting fresh journey. Good luck!'));
    }
    
    createNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-popup`;
        notification.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            <strong>${title}</strong> ${message}
        `;
        return notification;
    }
    
    // Public methods
    getProgress() {
        return {
            currentContinent: this.getCurrentContinent(),
            goodDecisions: this.goodDecisions,
            totalGoodDecisions: this.totalGoodDecisions,
            completedContinents: this.continents.filter(c => c.completed).length,
            allContinents: this.continents
        };
    }
    
    // Method to manually add good decision (for testing)
    addGoodDecisionManual() {
        this.addGoodDecision();
    }
}

// Initialize achievement system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.achievementSystem = new AchievementSystem();
        console.log('Achievement System initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Achievement System:', error);
    }
});

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}