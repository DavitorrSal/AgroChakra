/**
 * Control Farm - Main Application Entry Point
 * Simplified version that lets GameEngine handle all transitions
 */

class ControlFarmApp {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.systems = {};
        
        this.init();
    }
    
    init() {
        console.log(`🚀 Control Farm v${this.version} - Initializing...`);
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeSystems();
            });
        } else {
            this.initializeSystems();
        }
    }
    
    initializeSystems() {
        try {
            // Initialize game engine (it will handle everything else)
            this.initializeGameEngine();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Control Farm - All systems initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Control Farm:', error);
            this.handleInitializationError(error);
        }
    }
    
    initializeGameEngine() {
        if (window.GameEngine) {
            this.systems.gameEngine = window.GameEngine;
            console.log('✅ Game Engine initialized and taking control');
        } else {
            throw new Error('GameEngine not found');
        }
    }
    
    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
        
        // Error events
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
    
    handleKeyboardInput(event) {
        // Global keyboard shortcuts
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.toggleDebugMode();
                break;
                
            case 'F11':
                event.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    toggleDebugMode() {
        console.log('🔧 Debug mode toggled');
        // Simple debug info
        console.log('Game Engine:', this.systems.gameEngine);
        console.log('Current scene:', this.systems.gameEngine?.currentScene);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Could not enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    handleInitializationError(error) {
        // Show user-friendly error message
        const errorMessage = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
            ">
                <h3>🚨 Initialization Error</h3>
                <p>Control Farm failed to start properly.</p>
                <p>Error: ${error.message}</p>
                <button onclick="window.location.reload()" style="
                    background: white;
                    color: red;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Refresh Page</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorMessage);
    }
    
    // Public API methods
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            systems: Object.keys(this.systems),
            gameEngine: !!this.systems.gameEngine
        };
    }
    
    restartGame() {
        console.log('🔄 Restarting game...');
        window.location.reload();
    }
}

// Initialize the application
let controlFarmApp;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        controlFarmApp = new ControlFarmApp();
        
        // Make it globally accessible for debugging
        window.ControlFarm = controlFarmApp;
    });
} else {
    controlFarmApp = new ControlFarmApp();
    window.ControlFarm = controlFarmApp;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ControlFarmApp;
}