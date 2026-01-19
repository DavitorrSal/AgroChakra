/**
 * Mission Management System
 * Handles mission messages, progress tracking, and objectives
 */

class MissionManager {
    constructor() {
        this.currentMission = {
            id: 1,
            title: "Help to 10 farmers to evaluate their crop",
            description: "Welcome to your first agricultural mission! Your task is to help farmers make informed decisions about their crops using satellite data and AI analysis.",
            target: 10,
            completed: 0,
            objectives: [
                "Analyze 10 different farm areas",
                "Make fertilization and irrigation decisions", 
                "Use AI recommendations to guide your choices",
                "Help farmers optimize their crop yields"
            ]
        };
        
        this.init();
    }
    
    init() {
        // Check if mission message should be shown
        const hasSeenMission = localStorage.getItem('hasSeenMission1');
        
        if (!hasSeenMission) {
            // Show mission message after tutorial is completed or skipped
            this.waitForTutorialCompletion();
        } else {
            this.hideMissionMessage();
            this.loadMissionProgress();
        }
        
        this.bindEvents();
        this.updateNavigationIndicator();
    }
    
    waitForTutorialCompletion() {
        // Check if tutorial overlay is visible
        const tutorialOverlay = document.getElementById('tutorialOverlay');
        
        if (tutorialOverlay && tutorialOverlay.style.display === 'flex') {
            // Wait for tutorial to complete
            const checkTutorial = setInterval(() => {
                if (tutorialOverlay.style.display === 'none' || tutorialOverlay.style.display === '') {
                    clearInterval(checkTutorial);
                    setTimeout(() => {
                        this.showMissionMessage();
                    }, 500); // Small delay after tutorial
                }
            }, 500);
        } else {
            // Tutorial not visible, show mission immediately
            this.showMissionMessage();
        }
    }
    
    bindEvents() {
        const startMissionBtn = document.getElementById('startMissionBtn');
        if (startMissionBtn) {
            startMissionBtn.addEventListener('click', () => {
                this.startMission();
            });
        }
        
        // Close mission button functionality
        const closeMissionBtn = document.getElementById('closeMissionBtn');
        if (closeMissionBtn) {
            closeMissionBtn.addEventListener('click', () => {
                this.closeMissionDirectly();
            });
        }
        
        // Access game directly button
        const accessGameBtn = document.getElementById('accessGameBtn');
        if (accessGameBtn) {
            accessGameBtn.addEventListener('click', () => {
                this.accessGameDirectly();
            });
        }
        
        // Close mission on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMissionVisible()) {
                this.closeMissionDirectly();
            }
        });
        
        // Close mission when clicking outside modal
        const missionOverlay = document.getElementById('missionMessageOverlay');
        if (missionOverlay) {
            missionOverlay.addEventListener('click', (e) => {
                if (e.target === missionOverlay) {
                    this.closeMissionDirectly();
                }
            });
        }
        
        // Listen for analysis completions to track progress
        document.addEventListener('fertilizerDecisionMade', () => {
            this.updateMissionProgress();
        });
        
        document.addEventListener('irrigationDecisionMade', () => {
            this.updateMissionProgress();
        });
    }
    
    showMissionMessage() {
        const overlay = document.getElementById('missionMessageOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            this.updateMissionDisplay();
        }
    }
    
    hideMissionMessage() {
        const overlay = document.getElementById('missionMessageOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    startMission() {
        // Mark mission as seen
        localStorage.setItem('hasSeenMission1', 'true');
        
        // Hide mission message
        this.hideMissionMessage();
        
        // Show start notification
        this.showMissionStartNotification();
        
        // Update navigation indicator
        this.updateNavigationIndicator();
    }
    
    updateMissionDisplay() {
        // Update progress display in mission modal
        const progressElement = document.getElementById('missionProgress');
        const progressBarElement = document.getElementById('missionProgressBar');
        
        if (progressElement) {
            progressElement.textContent = this.currentMission.completed;
        }
        
        if (progressBarElement) {
            const percentage = (this.currentMission.completed / this.currentMission.target) * 100;
            progressBarElement.style.width = percentage + '%';
        }
    }
    
    updateMissionProgress() {
        // Increment completed count
        this.currentMission.completed++;
        
        // Save progress
        this.saveMissionProgress();
        
        // Update displays
        this.updateNavigationIndicator();
        this.updateMissionDisplay();
        
        // Check if mission is complete
        if (this.currentMission.completed >= this.currentMission.target) {
            this.completeMission();
        } else {
            // Show progress notification
            this.showProgressNotification();
        }
    }
    
    completeMission() {
        // Show mission completion notification
        this.showMissionCompleteNotification();
        
        // Mark mission as completed
        localStorage.setItem('mission1Completed', 'true');
        
        // Update navigation
        this.updateNavigationIndicator();
    }
    
    showMissionStartNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success notification-popup';
        notification.innerHTML = `
            <i class="fas fa-rocket me-2"></i>
            <strong>Mission Started!</strong> Help 10 farmers evaluate their crops. Good luck!
        `;
        
        this.showNotification(notification);
    }
    
    showProgressNotification() {
        const remaining = this.currentMission.target - this.currentMission.completed;
        const notification = document.createElement('div');
        notification.className = 'alert alert-info notification-popup';
        notification.innerHTML = `
            <i class="fas fa-chart-line me-2"></i>
            <strong>Progress Update!</strong> ${this.currentMission.completed}/${this.currentMission.target} farmers helped. ${remaining} more to go!
        `;
        
        this.showNotification(notification);
    }
    
    showMissionCompleteNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success notification-popup mission-complete-animation';
        notification.innerHTML = `
            <i class="fas fa-trophy me-2"></i>
            <strong>Mission Complete!</strong> You've successfully helped 10 farmers! 🎉
        `;
        
        this.showNotification(notification, 5000); // Show longer for completion
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
        
        // Remove after specified duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    updateNavigationIndicator() {
        // Add mission progress to navigation
        const navbar = document.querySelector('.navbar-nav.ms-auto');
        
        if (navbar) {
            // Remove existing indicator
            const existingIndicator = document.getElementById('missionNavIndicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            // Create new indicator
            const indicator = document.createElement('span');
            indicator.id = 'missionNavIndicator';
            indicator.className = 'navbar-text mission-nav-indicator';
            
            const isCompleted = this.currentMission.completed >= this.currentMission.target;
            const icon = isCompleted ? 'fas fa-trophy' : 'fas fa-rocket';
            const text = isCompleted ? 'Mission Complete!' : `Mission: ${this.currentMission.completed}/${this.currentMission.target}`;
            
            indicator.innerHTML = `
                <i class="${icon} me-1"></i>
                ${text}
            `;
            
            // Insert before tutorial button
            const tutorialBtn = navbar.querySelector('button');
            if (tutorialBtn) {
                navbar.insertBefore(indicator, tutorialBtn);
            } else {
                navbar.insertBefore(indicator, navbar.firstChild);
            }
        }
    }
    
    saveMissionProgress() {
        localStorage.setItem('mission1Progress', this.currentMission.completed.toString());
    }
    
    loadMissionProgress() {
        const savedProgress = localStorage.getItem('mission1Progress');
        if (savedProgress) {
            this.currentMission.completed = parseInt(savedProgress) || 0;
        }
    }
    

    isMissionVisible() {
        const overlay = document.getElementById('missionMessageOverlay');
        return overlay && overlay.style.display === 'flex';
    }
    
    closeMissionDirectly() {
        // Mark mission as seen but don't start it
        localStorage.setItem('hasSeenMission1', 'true');
        
        // Hide mission message
        this.hideMissionMessage();
        
        // Show access notification
        this.showDirectAccessNotification();
        
        // Update navigation indicator
        this.updateNavigationIndicator();
    }
    
    accessGameDirectly() {
        // Show confirmation dialog
        this.showAccessGameConfirmation();
    }
    
    showDirectAccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-info notification-popup';
        notification.innerHTML = `
            <i class="fas fa-gamepad me-2"></i>
            <strong>Game Access Granted!</strong> You can start analyzing farms immediately. Mission tracking is available anytime.
        `;
        
        this.showNotification(notification);
    }
    
    showAccessGameConfirmation() {
        // Create confirmation overlay
        const confirmationHTML = `
            <div class="quick-access-overlay" id="quickAccessOverlay">
                <div class="quick-access-modal">
                    <h4><i class="fas fa-gamepad me-2"></i>Access Game Directly</h4>
                    <p>Skip the mission introduction and go straight to the game?</p>
                    <div class="quick-access-buttons">
                        <button class="btn btn-success" id="confirmAccessBtn">
                            <i class="fas fa-check me-2"></i>Yes, Start Game
                        </button>
                        <button class="btn btn-outline-secondary" id="cancelAccessBtn">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        
        // Add event listeners
        const confirmBtn = document.getElementById('confirmAccessBtn');
        const cancelBtn = document.getElementById('cancelAccessBtn');
        const overlay = document.getElementById('quickAccessOverlay');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmDirectAccess();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelDirectAccess();
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.cancelDirectAccess();
                }
            });
        }
    }
    
    confirmDirectAccess() {
        // Remove confirmation overlay
        const overlay = document.getElementById('quickAccessOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Mark mission as seen and close mission modal
        localStorage.setItem('hasSeenMission1', 'true');
        this.hideMissionMessage();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success notification-popup';
        notification.innerHTML = `
            <i class="fas fa-rocket me-2"></i>
            <strong>Welcome to the Game!</strong> Start by selecting a farm area on the map and clicking "Analyze Farm".
        `;
        
        this.showNotification(notification, 4000);
        
        // Update navigation
        this.updateNavigationIndicator();
    }
    
    cancelDirectAccess() {
        // Remove confirmation overlay
        const overlay = document.getElementById('quickAccessOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
        // Public methods for external access
    getMissionProgress() {
        return {
            completed: this.currentMission.completed,
            target: this.currentMission.target,
            percentage: (this.currentMission.completed / this.currentMission.target) * 100,
            isComplete: this.currentMission.completed >= this.currentMission.target
        };
    }
    
    resetMission() {
        this.currentMission.completed = 0;
        localStorage.removeItem('hasSeenMission1');
        localStorage.removeItem('mission1Progress');
        localStorage.removeItem('mission1Completed');
        this.updateNavigationIndicator();
        this.updateMissionDisplay();
    }
    
    // Method to manually show mission message (for testing or replay)
    showMissionMessageManual() {
        this.showMissionMessage();
    }
}

// Initialize mission manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.missionManager = new MissionManager();
        console.log('Mission Manager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Mission Manager:', error);
    }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionManager;
}