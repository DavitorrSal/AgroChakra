// Main Application Controller
class AgroChakraApp {
    constructor() {
        this.isInitialized = false;
        this.config = {
            apiEndpoints: {
                nasa: 'https://power.larc.nasa.gov/api/',
                weather: 'https://api.openweathermap.org/data/2.5/',
                satellite: 'https://earthengine.googleapis.com/'
            },
            platformSettings: {
                maxFarmSize: 1000, // hectares
                minFarmSize: 1,    // hectares
                analysisTimeout: 30000, // 30 seconds
                autoSaveInterval: 30000 // 30 seconds
            }
        };
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage('Failed to initialize the platform. Please refresh the page.');
        }
    }

    initializeApp() {
        console.log('🌾 Initializing AgroChakra Platform...');
        
        // Initialize components in order
        this.setupGlobalErrorHandling();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
        this.checkBrowserCompatibility();
        this.loadUserPreferences();
        
        // Mark as initialized
        this.isInitialized = true;
        console.log('✅ Platform initialized successfully!');
        
        // Show welcome message for new users
        this.checkFirstTimeUser();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showErrorMessage('An unexpected error occurred. The platform will continue to function.');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showErrorMessage('A network or data processing error occurred.');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Prevent shortcuts when typing in inputs
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(event.key.toLowerCase()) {
                case 'h':
                    event.preventDefault();
                    this.showHelp();
                    break;
                case 's':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.saveProgress();
                    } else {
                        event.preventDefault();
                        this.toggleSatelliteView();
                    }
                    break;
                case 'c':
                    event.preventDefault();
                    this.clearSelection();
                    break;
                case 'a':
                    event.preventDefault();
                    this.startAnalysis();
                    break;
                case 'r':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.resetPlatform();
                    }
                    break;
                case 'escape':
                    event.preventDefault();
                    this.cancelCurrentAction();
                    break;
            }
        });
    }

    setupTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    checkBrowserCompatibility() {
        const requiredFeatures = [
            'localStorage',
            'fetch',
            'Promise',
            'Map',
            'Set'
        ];

        const missingFeatures = requiredFeatures.filter(feature => {
            return !(feature in window);
        });

        if (missingFeatures.length > 0) {
            this.showErrorMessage(
                `Your browser is missing required features: ${missingFeatures.join(', ')}. ` +
                'Please update your browser for the best experience.'
            );
        }

        // Check for WebGL support (needed for advanced map features)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.warn('WebGL not supported - some advanced features may be disabled');
        }
    }

    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('agroChakraPreferences');
            if (preferences) {
                const prefs = JSON.parse(preferences);
                this.applyPreferences(prefs);
            }
        } catch (error) {
            console.error('Failed to load user preferences:', error);
        }
    }

    applyPreferences(preferences) {
        // Apply saved user preferences
        if (preferences.theme) {
            document.body.setAttribute('data-theme', preferences.theme);
        }
        
        if (preferences.mapStyle) {
            // Apply preferred map style when map is ready
            setTimeout(() => {
                if (window.mapManager && preferences.mapStyle === 'satellite') {
                    mapManager.toggleSatelliteView();
                }
            }, 1000);
        }
    }

    checkFirstTimeUser() {
        const hasVisited = localStorage.getItem('agroChakraVisited');
        if (!hasVisited) {
            localStorage.setItem('agroChakraVisited', 'true');
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 2000);
        }
    }

    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'modal fade';
        welcome.id = 'welcomeModal';
        welcome.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-leaf me-2"></i>
                            Welcome to AgroChakra!
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h6>🎯 Your Mission</h6>
                                <p>Help farmers make informed decisions about fertilizer application using satellite data and AI analysis!</p>
                                
                                <h6>🌱 How to Use</h6>
                                <ol>
                                    <li>Select a farm area on the map</li>
                                    <li>Analyze satellite and weather data</li>
                                    <li>Make informed fertilizer recommendations</li>
                                    <li>Get AI-powered agricultural insights!</li>
                                </ol>
                                
                                <h6>⌨️ Keyboard Shortcuts</h6>
                                <ul class="list-unstyled">
                                    <li><kbd>H</kbd> - Show help</li>
                                    <li><kbd>S</kbd> - Toggle satellite view</li>
                                    <li><kbd>C</kbd> - Clear selection</li>
                                    <li><kbd>A</kbd> - Start analysis</li>
                                </ul>
                            </div>
                            <div class="col-md-4 text-center">
                                <i class="fas fa-tractor fa-4x text-success mb-3"></i>
                                <p class="text-muted">Ready to optimize agricultural decisions?</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                            Let's Start! 🚀
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(welcome);
        const modal = new bootstrap.Modal(welcome);
        modal.show();
        
        // Remove modal from DOM after it's hidden
        welcome.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(welcome);
        });
    }

    // Utility methods that can be called from keyboard shortcuts
    showHelp() {
        if (window.gameManager) {
            gameManager.showTutorial();
        }
    }

    saveProgress() {
        if (window.gameManager) {
            gameManager.saveGameState();
            this.showNotification('Progress saved!', 'success');
        }
    }

    toggleSatelliteView() {
        if (window.mapManager) {
            mapManager.toggleSatelliteView();
        }
    }

    clearSelection() {
        if (window.mapManager) {
            mapManager.clearSelection();
        }
    }

    startAnalysis() {
        if (window.analysisManager) {
            analysisManager.startAnalysis();
        }
    }

    resetPlatform() {
        if (window.gameManager) {
            gameManager.resetGame();
        }
    }

    cancelCurrentAction() {
        // Cancel any ongoing actions
        if (window.mapManager && mapManager.selectionMode) {
            mapManager.toggleSelectionMode();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 3000;
            min-width: 250px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }

    showErrorMessage(message) {
        this.showNotification(message, 'danger', 5000);
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        if ('performance' in window) {
            // Monitor page load time
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page loaded in ${loadTime}ms`);
                
                if (loadTime > 5000) {
                    this.showNotification('The platform loaded slowly. Consider refreshing if you experience issues.', 'warning');
                }
            });
        }
    }

    // Export platform data
    exportPlatformData() {
        if (window.gameManager) {
            gameManager.exportStats();
        }
    }

    // Debug mode
    enableDebugMode() {
        window.debugMode = true;
        console.log('🐛 Debug mode enabled');
        
        // Add debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 4000;
        `;
        debugPanel.innerHTML = `
            <div>Debug Mode Active</div>
            <div>FPS: <span id="fps">--</span></div>
            <div>Memory: <span id="memory">--</span></div>
        `;
        document.body.appendChild(debugPanel);
        
        // Update debug info
        setInterval(() => {
            if (performance.memory) {
                document.getElementById('memory').textContent = 
                    Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB';
            }
        }, 1000);
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.isInitialized,
            components: {
                mapManager: !!window.mapManager,
                analysisManager: !!window.analysisManager,
                gameManager: !!window.gameManager
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A'
            }
        };
    }
}

// Initialize the application
const app = new AgroChakraApp();

// Make app globally available for debugging
window.agroChakraApp = app;

// Add slide out animation CSS
const mainStyle = document.createElement('style');
mainStyle.textContent = `
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(mainStyle);

// Console welcome message
console.log(`
🌾 AgroChakra Platform
🚀 Version 1.0.0
🎯 Smart Agricultural Analysis

Type 'app.getStatus()' to check system status
Type 'app.enableDebugMode()' to enable debug mode
Type 'help' for keyboard shortcuts

Happy farming! 🌱
`);