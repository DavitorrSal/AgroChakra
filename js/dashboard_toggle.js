/**
 * Dashboard Toggle Functionality
 * Provides show/hide functionality for the analysis dashboard panel
 */

class DashboardToggle {
    constructor() {
        this.isDashboardVisible = false; // Dashboard hidden by default
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setInitialState();
    }
    
    setInitialState() {
        const dashboardPanel = document.getElementById('dashboardPanel');
        const mapPanel = document.getElementById('mapPanel');
        const toggleBtn = document.getElementById('dashboardToggle');
        const toggleText = toggleBtn?.querySelector('.toggle-text');
        const toggleIcon = toggleBtn?.querySelector('i');
        
        if (dashboardPanel && mapPanel && toggleBtn) {
            // Set initial state - dashboard hidden (CSS already handles this)
            // Button always shows "Dashboard" text
            toggleBtn.classList.add('collapsed');
            if (toggleText) toggleText.textContent = 'Dashboard';
            if (toggleIcon) toggleIcon.className = 'fas fa-chart-bar';
        }
    }
    
    bindEvents() {
        const toggleBtn = document.getElementById('dashboardToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleDashboard();
            });
        }
    }
    
    toggleDashboard() {
        const dashboardPanel = document.getElementById('dashboardPanel');
        const mapPanel = document.getElementById('mapPanel');
        const toggleBtn = document.getElementById('dashboardToggle');
        const toggleText = toggleBtn?.querySelector('.toggle-text');
        const toggleIcon = toggleBtn?.querySelector('i');
        
        if (!dashboardPanel || !mapPanel || !toggleBtn) {
            console.warn('Dashboard toggle: Required elements not found');
            return;
        }
        
        if (this.isDashboardVisible) {
            // Hide dashboard
            dashboardPanel.classList.remove('visible');
            dashboardPanel.classList.add('collapsed');
            mapPanel.classList.add('expanded');
            toggleBtn.classList.add('collapsed');
            if (toggleText) toggleText.textContent = 'Dashboard';
            if (toggleIcon) toggleIcon.className = 'fas fa-chart-bar';
            this.isDashboardVisible = false;
            
            // Store state in localStorage
            localStorage.setItem('dashboardVisible', 'false');
        } else {
            // Show dashboard
            dashboardPanel.classList.remove('collapsed');
            dashboardPanel.classList.add('visible');
            mapPanel.classList.remove('expanded');
            toggleBtn.classList.remove('collapsed');
            if (toggleText) toggleText.textContent = 'Dashboard';
            if (toggleIcon) toggleIcon.className = 'fas fa-chart-bar';
            this.isDashboardVisible = true;
            
            // Store state in localStorage
            localStorage.setItem('dashboardVisible', 'true');
        }
        
        // Trigger map resize after animation completes
        setTimeout(() => {
            this.resizeMap();
        }, 400);
        
        // Also trigger immediate resize for smoother transition
        setTimeout(() => {
            this.resizeMap();
        }, 50);
    }
    
    resizeMap() {
        // Try different ways to access the map instance
        if (window.mapInstance && window.mapInstance.map) {
            window.mapInstance.map.invalidateSize();
        } else if (window.map) {
            window.map.invalidateSize();
        } else if (window.gameMap && window.gameMap.map) {
            window.gameMap.map.invalidateSize();
        }
        
        // Dispatch a custom event for map resize
        window.dispatchEvent(new Event('resize'));
    }
    
    // Method to restore dashboard state from localStorage
    restoreState() {
        const savedState = localStorage.getItem('dashboardVisible');
        if (savedState === 'true') {
            // Dashboard should be shown (override default hidden state)
            this.toggleDashboard();
        }
        // If no saved state or savedState is 'false', keep default hidden state
    }
    
    // Method to show dashboard (public API)
    showDashboard() {
        if (!this.isDashboardVisible) {
            this.toggleDashboard();
        }
    }
    
    // Method to hide dashboard (public API)
    hideDashboard() {
        if (this.isDashboardVisible) {
            this.toggleDashboard();
        }
    }
    
    // Method to get current state (public API)
    isVisible() {
        return this.isDashboardVisible;
    }
}

// Initialize dashboard toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.dashboardToggle = new DashboardToggle();
        console.log('Dashboard Toggle initialized successfully');
        
        // Restore previous state after a short delay to ensure all elements are loaded
        setTimeout(() => {
            if (window.dashboardToggle) {
                window.dashboardToggle.restoreState();
            }
        }, 100);
        
        // Also listen for window load to ensure all resources are ready
        window.addEventListener('load', () => {
            // Trigger a map resize in case the map was initialized before the dashboard state was set
            setTimeout(() => {
                if (window.dashboardToggle) {
                    window.dashboardToggle.resizeMap();
                }
            }, 200);
        });
    } catch (error) {
        console.error('Failed to initialize Dashboard Toggle:', error);
    }
});

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardToggle;
}