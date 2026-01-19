/**
 * Game Controller - Main access control for the game
 * Handles skipping all overlays and direct game access
 */

class GameController {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkOverlayVisibility();
    }
    
    bindEvents() {
        // Skip All button functionality
        const skipAllBtn = document.getElementById('skipAllBtn');
        if (skipAllBtn) {
            skipAllBtn.addEventListener('click', () => {
                this.skipAllOverlays();
            });
        }
        
        // Global escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
        
        // Check overlay visibility periodically
        setInterval(() => {
            this.checkOverlayVisibility();
        }, 1000);
    }
    
    skipAllOverlays() {
        // Hide tutorial overlay
        const tutorialOverlay = document.getElementById('tutorialOverlay');
        if (tutorialOverlay) {
            tutorialOverlay.style.display = 'none';
            localStorage.setItem('hasSeenTutorial', 'true');
        }
        
        // Hide mission overlay
        const missionOverlay = document.getElementById('missionMessageOverlay');
        if (missionOverlay) {
            missionOverlay.style.display = 'none';
            localStorage.setItem('hasSeenMission1', 'true');
        }
        
        // Hide any other modals
        this.hideAllModals();
        
        // Hide skip all button
        this.hideSkipAllButton();
        
        // Show success notification
        this.showGameAccessNotification();
        
        // Update mission manager if available
        if (window.missionManager) {
            window.missionManager.updateNavigationIndicator();
        }
    }
    
    hideAllModals() {
        // List of modal IDs to hide
        const modalIds = [
            'tutorialOverlay',
            'missionMessageOverlay',
            'fertilizerDecisionModal',
            'irrigationDecisionModal',
            'quickAccessOverlay'
        ];
        
        modalIds.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    handleEscapeKey() {
        // Check if any overlay is visible and close the topmost one
        const overlays = [
            { id: 'quickAccessOverlay', priority: 5 },
            { id: 'fertilizerDecisionModal', priority: 4 },
            { id: 'irrigationDecisionModal', priority: 4 },
            { id: 'missionMessageOverlay', priority: 3 },
            { id: 'tutorialOverlay', priority: 2 }
        ];
        
        // Sort by priority (highest first)
        overlays.sort((a, b) => b.priority - a.priority);
        
        for (let overlay of overlays) {
            const element = document.getElementById(overlay.id);
            if (element && element.style.display === 'flex') {
                if (overlay.id === 'tutorialOverlay' && window.tutorialManager) {
                    window.tutorialManager.skipTutorial();
                } else if (overlay.id === 'missionMessageOverlay' && window.missionManager) {
                    window.missionManager.closeMissionDirectly();
                } else {
                    element.style.display = 'none';
                }
                break;
            }
        }
    }
    
    checkOverlayVisibility() {
        const skipAllBtn = document.getElementById('skipAllBtn');
        if (!skipAllBtn) return;
        
        // Check if any overlay is visible
        const overlays = [
            'tutorialOverlay',
            'missionMessageOverlay'
        ];
        
        let anyVisible = false;
        for (let overlayId of overlays) {
            const overlay = document.getElementById(overlayId);
            if (overlay && overlay.style.display === 'flex') {
                anyVisible = true;
                break;
            }
        }
        
        // Show/hide skip all button based on overlay visibility
        if (anyVisible) {
            skipAllBtn.style.display = 'block';
        } else {
            skipAllBtn.style.display = 'none';
        }
    }
    
    hideSkipAllButton() {
        const skipAllBtn = document.getElementById('skipAllBtn');
        if (skipAllBtn) {
            skipAllBtn.style.display = 'none';
        }
    }
    
    showGameAccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success notification-popup';
        notification.innerHTML = `
            <i class="fas fa-gamepad me-2"></i>
            <strong>Game Ready!</strong> All overlays skipped. Start by selecting a farm area on the map!
        `;
        
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
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    // Public method to force game access
    forceGameAccess() {
        this.skipAllOverlays();
    }
    
    // Check if game is accessible (no blocking overlays)
    isGameAccessible() {
        const blockingOverlays = [
            'tutorialOverlay',
            'missionMessageOverlay'
        ];
        
        for (let overlayId of blockingOverlays) {
            const overlay = document.getElementById(overlayId);
            if (overlay && overlay.style.display === 'flex') {
                return false;
            }
        }
        
        return true;
    }
    
    // Get current blocking overlay
    getCurrentBlockingOverlay() {
        const overlays = [
            { id: 'tutorialOverlay', name: 'Tutorial' },
            { id: 'missionMessageOverlay', name: 'Mission Message' }
        ];
        
        for (let overlay of overlays) {
            const element = document.getElementById(overlay.id);
            if (element && element.style.display === 'flex') {
                return overlay.name;
            }
        }
        
        return null;
    }
}

// Initialize game controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.gameController = new GameController();
        console.log('Game Controller initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Game Controller:', error);
    }
});

// Global function for external access
window.skipToGame = function() {
    if (window.gameController) {
        window.gameController.forceGameAccess();
    }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
}