/**
 * Optimized Button Interactions for App-like Experience
 */

class OptimizedButtons {
    constructor() {
        this.analysisMenuOpen = false;
        this.init();
    }

    init() {
        this.setupAnalysisMenu();
        this.setupButtonAnimations();
        this.setupAccessibility();
        this.setupTouchFeedback();
    }

    /**
     * Setup the floating action button for analysis menu
     */
    setupAnalysisMenu() {
        const fab = document.getElementById('analysisMenuFab');
        const menuItems = document.getElementById('analysisMenuItems');
        
        if (!fab || !menuItems) return;

        fab.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAnalysisMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.analysis-menu-container') && this.analysisMenuOpen) {
                this.closeAnalysisMenu();
            }
        });

        // Close menu when pressing escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.analysisMenuOpen) {
                this.closeAnalysisMenu();
            }
        });

        // Setup menu item click handlers
        const menuButtons = menuItems.querySelectorAll('.analysis-menu-btn');
        menuButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeAnalysisMenu();
                // Add a small delay to allow the close animation to start
                setTimeout(() => {
                    // Trigger the original click handler
                    button.click();
                }, 100);
            });
        });
    }

    /**
     * Toggle the analysis menu
     */
    toggleAnalysisMenu() {
        if (this.analysisMenuOpen) {
            this.closeAnalysisMenu();
        } else {
            this.openAnalysisMenu();
        }
    }

    /**
     * Open the analysis menu
     */
    openAnalysisMenu() {
        const fab = document.getElementById('analysisMenuFab');
        const menuItems = document.getElementById('analysisMenuItems');
        
        if (!fab || !menuItems) return;

        this.analysisMenuOpen = true;
        fab.classList.add('active');
        menuItems.classList.add('show');
        
        // Update accessibility
        fab.setAttribute('aria-expanded', 'true');
        fab.setAttribute('aria-label', 'Close analysis menu');
        
        // Animate menu items
        const buttons = menuItems.querySelectorAll('.analysis-menu-btn');
        buttons.forEach((button, index) => {
            button.style.animationDelay = `${(index + 1) * 0.1}s`;
        });
    }

    /**
     * Close the analysis menu
     */
    closeAnalysisMenu() {
        const fab = document.getElementById('analysisMenuFab');
        const menuItems = document.getElementById('analysisMenuItems');
        
        if (!fab || !menuItems) return;

        this.analysisMenuOpen = false;
        fab.classList.remove('active');
        menuItems.classList.remove('show');
        
        // Update accessibility
        fab.setAttribute('aria-expanded', 'false');
        fab.setAttribute('aria-label', 'Open analysis menu');
    }

    /**
     * Setup button animations and interactions
     */
    setupButtonAnimations() {
        // Add ripple effect to all buttons
        const buttons = document.querySelectorAll('.btn, .analysis-menu-btn, .decision-action-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });

        // Add hover sound effect (optional)
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
    }

    /**
     * Create ripple effect on button click
     */
    createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add ripple styles
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels and roles
        const fab = document.getElementById('analysisMenuFab');
        if (fab) {
            fab.setAttribute('role', 'button');
            fab.setAttribute('aria-expanded', 'false');
            fab.setAttribute('aria-label', 'Open analysis menu');
            fab.setAttribute('aria-haspopup', 'true');
        }

        // Add keyboard navigation
        const menuItems = document.querySelectorAll('.analysis-menu-btn');
        menuItems.forEach((item, index) => {
            item.setAttribute('tabindex', '-1');
            item.addEventListener('keydown', (e) => {
                this.handleMenuKeyNavigation(e, index, menuItems);
            });
        });

        // Focus management
        if (fab) {
            fab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAnalysisMenu();
                    
                    if (this.analysisMenuOpen && menuItems.length > 0) {
                        setTimeout(() => {
                            menuItems[0].focus();
                        }, 300);
                    }
                }
            });
        }
    }

    /**
     * Handle keyboard navigation in menu
     */
    handleMenuKeyNavigation(event, currentIndex, menuItems) {
        let nextIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                nextIndex = (currentIndex + 1) % menuItems.length;
                break;
            case 'ArrowUp':
                event.preventDefault();
                nextIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                menuItems[currentIndex].click();
                return;
            case 'Escape':
                event.preventDefault();
                this.closeAnalysisMenu();
                document.getElementById('analysisMenuFab').focus();
                return;
        }
        
        if (nextIndex !== currentIndex) {
            menuItems[nextIndex].focus();
        }
    }

    /**
     * Setup touch feedback for mobile devices
     */
    setupTouchFeedback() {
        if ('vibrate' in navigator) {
            const buttons = document.querySelectorAll('.btn, .analysis-menu-btn, .decision-action-btn');
            
            buttons.forEach(button => {
                button.addEventListener('touchstart', () => {
                    // Light vibration feedback
                    navigator.vibrate(10);
                });
            });
        }

        // Add touch class for better touch interactions
        document.addEventListener('touchstart', () => {
            document.body.classList.add('touch-device');
        });
    }

    /**
     * Play hover sound effect (optional)
     */
    playHoverSound() {
        // This is optional and can be enabled if audio feedback is desired
        // const audio = new Audio('path/to/hover-sound.mp3');
        // audio.volume = 0.1;
        // audio.play().catch(() => {}); // Ignore errors
    }

    /**
     * Update button states based on game state
     */
    updateButtonStates(gameState) {
        const decisionButtons = document.querySelector('.decision-action-container');
        const analysisMenu = document.querySelector('.analysis-menu-container');
        
        if (gameState.analysisComplete) {
            if (decisionButtons) {
                decisionButtons.style.display = 'flex';
            }
            if (analysisMenu) {
                analysisMenu.style.display = 'flex';
            }
        } else {
            if (decisionButtons) {
                decisionButtons.style.display = 'none';
            }
            if (analysisMenu) {
                analysisMenu.style.display = 'none';
            }
        }
    }

    /**
     * Show notification badge on buttons
     */
    showNotificationBadge(buttonId, count = 1) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        let badge = button.querySelector('.notification-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            button.appendChild(badge);
        }

        badge.textContent = count;
        badge.style.display = 'flex';
    }

    /**
     * Hide notification badge
     */
    hideNotificationBadge(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const badge = button.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    /**
     * Animate button appearance
     */
    animateButtonAppearance(buttonSelector, delay = 0) {
        const button = document.querySelector(buttonSelector);
        if (!button) return;

        button.style.opacity = '0';
        button.style.transform = 'translateY(20px) scale(0.8)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0) scale(1)';
        }, delay);
    }

    /**
     * Pulse animation for important buttons
     */
    pulseButton(buttonSelector, duration = 2000) {
        const button = document.querySelector(buttonSelector);
        if (!button) return;

        button.classList.add('pulse-animation');
        
        setTimeout(() => {
            button.classList.remove('pulse-animation');
        }, duration);
    }
}

// Add CSS for ripple animation
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.pulse-animation {
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    animation: pulse 2s infinite;
}

.touch-device .btn:hover {
    transform: none;
}

.touch-device .btn:active {
    transform: scale(0.95);
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.optimizedButtons = new OptimizedButtons();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedButtons;
}