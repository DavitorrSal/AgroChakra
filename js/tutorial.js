/**
 * Interactive Tutorial System
 * Comprehensive guide showing all buttons and their functions
 */

class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 8;
        this.tutorialSteps = this.createTutorialSteps();
        this.init();
    }
    
    init() {
        // Check if user has seen tutorial before
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        
        if (!hasSeenTutorial) {
            this.showTutorial();
        } else {
            this.hideTutorial();
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        const nextBtn = document.getElementById('nextTutorialBtn');
        const prevBtn = document.getElementById('prevTutorialBtn');
        const skipBtn = document.getElementById('skipTutorial');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipTutorial());
        }
        
        // Close button functionality
        const closeTutorialBtn = document.getElementById('closeTutorialBtn');
        if (closeTutorialBtn) {
            closeTutorialBtn.addEventListener('click', () => this.skipTutorial());
        }
        
        // Close tutorial on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isTutorialVisible()) {
                this.skipTutorial();
            }
        });
        
        // Close tutorial when clicking outside modal
        const tutorialOverlay = document.getElementById('tutorialOverlay');
        if (tutorialOverlay) {
            tutorialOverlay.addEventListener('click', (e) => {
                if (e.target === tutorialOverlay) {
                    this.skipTutorial();
                }
            });
        }
    }
    
    createTutorialSteps() {
        return [
            {
                title: "Welcome to Agricultural Analysis Game!",
                content: `
                    <div class="text-center mb-4">
                        <i class="fas fa-tractor fa-4x text-success mb-3"></i>
                        <h4>Welcome to Agricultural Analysis Game!</h4>
                        <p class="lead">Learn how to analyze farm areas using satellite data and make smart agricultural decisions.</p>
                    </div>
                    
                    <div class="feature-grid">
                        <div class="feature-card">
                            <i class="fas fa-satellite"></i>
                            <h6>Satellite Analysis</h6>
                            <p>Use real satellite data to analyze vegetation health</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-cloud-sun"></i>
                            <h6>Weather Data</h6>
                            <p>Access weather patterns and forecasts</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-seedling"></i>
                            <h6>Smart Decisions</h6>
                            <p>Make fertilizer and irrigation decisions</p>
                        </div>
                        <div class="feature-card">
                            <i class="fas fa-trophy"></i>
                            <h6>Earn Points</h6>
                            <p>Get scored on accuracy and efficiency</p>
                        </div>
                    </div>
                    
                    <div class="alert alert-info mt-3">
                        <i class="fas fa-info-circle me-2"></i>
                        This tutorial will show you all the buttons and how to use them effectively.
                    </div>
                `
            },
            {
                title: "Map Controls - Navigation & Selection",
                content: `
                    <h4><i class="fas fa-map me-2"></i>Map Controls</h4>
                    <p>These buttons help you navigate the map and select farm areas for analysis.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Control Buttons (Top Left):</h6>
                            <div class="mb-3">
                                <div class="button-demo map-control">
                                    <i class="fas fa-crop-alt"></i>
                                </div>
                                <strong>Select Farm Area</strong>
                                <p class="small text-muted">Click this button, then draw a rectangle on the map to select a farm area for analysis.</p>
                            </div>
                            
                            <div class="mb-3">
                                <div class="button-demo map-control">
                                    <i class="fas fa-satellite"></i>
                                </div>
                                <strong>Toggle Satellite View</strong>
                                <p class="small text-muted">Switch between map view and satellite imagery to better see agricultural areas.</p>
                            </div>
                            
                            <div class="mb-3">
                                <div class="button-demo map-control">
                                    <i class="fas fa-eraser"></i>
                                </div>
                                <strong>Clear Selection</strong>
                                <p class="small text-muted">Remove the current farm area selection and start over.</p>
                            </div>
                            
                            <div class="mb-3">
                                <div class="button-demo map-control">
                                    <i class="fas fa-location-arrow"></i>
                                </div>
                                <strong>Go to My Location</strong>
                                <p class="small text-muted">Center the map on your current location.</p>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="example-box">
                                <h6>How to Select a Farm:</h6>
                                <ol class="step-list">
                                    <li><span class="step-number">1</span>Click the crop icon button</li>
                                    <li><span class="step-number">2</span>Navigate to an agricultural area</li>
                                    <li><span class="step-number">3</span>Click and drag to draw a rectangle</li>
                                    <li><span class="step-number">4</span>Release to complete selection</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "Analyze Farm Button - Start Your Analysis",
                content: `
                    <h4><i class="fas fa-chart-line me-2"></i>Analyze Farm Button</h4>
                    <p>After selecting a farm area, this button appears to start the analysis process.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="text-center mb-3">
                                <button class="btn btn-success btn-lg">
                                    <i class="fas fa-chart-line me-2"></i>
                                    Analyze Farm
                                </button>
                            </div>
                            
                            <div class="example-box">
                                <h6>What happens when you click:</h6>
                                <ul class="step-list">
                                    <li><span class="step-number">1</span>Fetches satellite imagery data</li>
                                    <li><span class="step-number">2</span>Downloads weather information</li>
                                    <li><span class="step-number">3</span>Calculates vegetation health (LAI)</li>
                                    <li><span class="step-number">4</span>Analyzes soil conditions</li>
                                    <li><span class="step-number">5</span>Generates AI recommendations</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="alert alert-warning">
                                <i class="fas fa-clock me-2"></i>
                                <strong>Analysis Time:</strong> The process takes 10-30 seconds depending on the area size and data availability.
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-lightbulb me-2"></i>
                                <strong>Tip:</strong> Select agricultural areas (farms, fields, crops) for best results. Urban or water areas won't provide useful agricultural data.
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "Analysis Menu - View Detailed Data",
                content: `
                    <h4><i class="fas fa-chart-bar me-2"></i>Analysis Menu Buttons</h4>
                    <p>After analysis completes, these buttons appear on the right side to view detailed data.</p>
                    
                    <div class="row">
                        <div class="col-md-8">
                            <div class="mb-4">
                                <div class="button-demo analysis-btn">
                                    <i class="fas fa-cloud-sun"></i>
                                    <span class="btn-text">Weather</span>
                                </div>
                                <strong>Weather Analysis</strong>
                                <p class="small text-muted">View temperature, humidity, rainfall data and weather charts for the selected area.</p>
                            </div>
                            
                            <div class="mb-4">
                                <div class="button-demo analysis-btn">
                                    <i class="fas fa-leaf"></i>
                                    <span class="btn-text">Vegetation</span>
                                </div>
                                <strong>Vegetation Health (LAI)</strong>
                                <p class="small text-muted">See Leaf Area Index data, vegetation trends, and crop health indicators.</p>
                            </div>
                            
                            <div class="mb-4">
                                <div class="button-demo analysis-btn">
                                    <i class="fas fa-mountain"></i>
                                    <span class="btn-text">Soil</span>
                                </div>
                                <strong>Soil Conditions</strong>
                                <p class="small text-muted">Analyze soil moisture, nitrogen, phosphorus, and potassium levels.</p>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="example-box">
                                <h6>Usage Example:</h6>
                                <ol class="step-list">
                                    <li><span class="step-number">1</span>Complete farm analysis</li>
                                    <li><span class="step-number">2</span>Click any analysis button</li>
                                    <li><span class="step-number">3</span>View detailed charts and data</li>
                                    <li><span class="step-number">4</span>Close modal to return to map</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "Decision Buttons - Make Smart Choices",
                content: `
                    <h4><i class="fas fa-lightbulb me-2"></i>Decision Buttons</h4>
                    <p>These buttons appear at the bottom center after analysis, allowing you to make agricultural decisions.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="text-center mb-4">
                                <div class="button-demo decision-btn fertilizer">
                                    <i class="fas fa-flask"></i>
                                    <span class="btn-text">Fertilizer</span>
                                </div>
                                <h6>Fertilizer Decision</h6>
                                <p class="small text-muted">Always appears after analysis. Make decisions about fertilizer application based on vegetation health and soil nutrients.</p>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="text-center mb-4">
                                <div class="button-demo decision-btn irrigation">
                                    <i class="fas fa-tint"></i>
                                    <span class="btn-text">Irrigation</span>
                                </div>
                                <h6>Irrigation Decision</h6>
                                <p class="small text-muted">Appears only when needed. Shows when soil moisture drops below 26% in the last 3 days.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-success">
                        <i class="fas fa-trophy me-2"></i>
                        <strong>Scoring:</strong> You earn points based on how well your decisions match the AI recommendations. Higher accuracy = more points!
                    </div>
                `
            },
            {
                title: "Fertilizer Decision Process",
                content: `
                    <h4><i class="fas fa-flask me-2 text-success"></i>Fertilizer Decision</h4>
                    <p>Learn how to make informed fertilizer decisions based on analysis data.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="example-box">
                                <h6>Decision Process:</h6>
                                <ol class="step-list">
                                    <li><span class="step-number">1</span>Click the green Fertilizer button</li>
                                    <li><span class="step-number">2</span>Review AI recommendation</li>
                                    <li><span class="step-number">3</span>Check confidence level</li>
                                    <li><span class="step-number">4</span>Choose: Apply or Skip fertilizer</li>
                                    <li><span class="step-number">5</span>Earn points for your decision</li>
                                </ol>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="example-box">
                                <h6>Factors to Consider:</h6>
                                <ul>
                                    <li><strong>LAI Values:</strong> Low LAI may need fertilizer</li>
                                    <li><strong>Soil Nutrients:</strong> Check N, P, K levels</li>
                                    <li><strong>Growth Stage:</strong> Consider crop development</li>
                                    <li><strong>Weather:</strong> Recent rainfall affects uptake</li>
                                    <li><strong>AI Confidence:</strong> Higher confidence = more reliable</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-brain me-2"></i>
                        <strong>AI Assistant:</strong> The AI provides recommendations with confidence levels. Use this as guidance, but consider all factors!
                    </div>
                `
            },
            {
                title: "Irrigation Decision Process",
                content: `
                    <h4><i class="fas fa-tint me-2 text-primary"></i>Smart Irrigation Decision</h4>
                    <p>Understand when and how to make irrigation decisions based on soil moisture analysis.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="example-box">
                                <h6>When Irrigation Button Appears:</h6>
                                <ul class="step-list">
                                    <li><span class="step-number">✓</span>Any of last 3 days < 26% soil moisture</li>
                                    <li><span class="step-number">✗</span>All days above 26% = no button</li>
                                </ul>
                            </div>
                            
                            <div class="example-box">
                                <h6>Decision Process:</h6>
                                <ol class="step-list">
                                    <li><span class="step-number">1</span>Click blue Irrigation button (if visible)</li>
                                    <li><span class="step-number">2</span>Review 3-day moisture analysis</li>
                                    <li><span class="step-number">3</span>Check water amount needed</li>
                                    <li><span class="step-number">4</span>Choose: Apply or Skip irrigation</li>
                                    <li><span class="step-number">5</span>Get feedback and points</li>
                                </ol>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="alert alert-warning">
                                <i class="fas fa-droplet me-2"></i>
                                <strong>26% Threshold:</strong> This is the critical soil moisture level. Below this, crops may experience water stress.
                            </div>
                            
                            <div class="example-box">
                                <h6>Example Scenarios:</h6>
                                <p><strong>Scenario 1:</strong> 35%, 32%, 28%<br>
                                <span class="text-success">✅ No irrigation needed</span></p>
                                
                                <p><strong>Scenario 2:</strong> 30%, 24%, 27%<br>
                                <span class="text-danger">💧 Irrigation needed (4mm)</span></p>
                                
                                <p><strong>Scenario 3:</strong> 22%, 18%, 20%<br>
                                <span class="text-danger">🚨 Critical irrigation (16mm)</span></p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "AI Assistant & Scoring System",
                content: `
                    <h4><i class="fas fa-robot me-2"></i>AI Assistant & Scoring</h4>
                    <p>Learn about the AI assistant and how the scoring system works.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="example-box">
                                <h6>AI Assistant Features:</h6>
                                <ul>
                                    <li><strong>Chatbot:</strong> Ask questions about your analysis</li>
                                    <li><strong>Recommendations:</strong> Get AI-powered suggestions</li>
                                    <li><strong>Explanations:</strong> Understand why decisions are recommended</li>
                                    <li><strong>Learning:</strong> Get tips on agricultural best practices</li>
                                </ul>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-comment me-2"></i>
                                Look for the chatbot icon in the bottom right corner!
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="example-box">
                                <h6>Scoring System:</h6>
                                <ul>
                                    <li><strong>Correct Decisions:</strong> 20-50 points</li>
                                    <li><strong>Incorrect Decisions:</strong> 5-20 points</li>
                                    <li><strong>High Confidence Match:</strong> Bonus points</li>
                                    <li><strong>Analysis Completion:</strong> Base points</li>
                                </ul>
                            </div>
                            
                            <div class="alert alert-success">
                                <i class="fas fa-trophy me-2"></i>
                                <strong>Goal:</strong> Make accurate decisions to maximize your score and level up!
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center mt-4">
                        <h5>🎉 You're Ready to Start!</h5>
                        <p>Now you know how to use all the buttons and features. Start by selecting a farm area and analyzing it!</p>
                    </div>
                `
            }
        ];
    }
    
    showTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            this.updateTutorialContent();
        }
    }
    
    hideTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    isTutorialVisible() {
        const overlay = document.getElementById('tutorialOverlay');
        return overlay && overlay.style.display === 'flex';
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateTutorialContent();
        } else {
            this.completeTutorial();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateTutorialContent();
        }
    }
    
    skipTutorial() {
        this.completeTutorial();
    }
    
    completeTutorial() {
        // Mark tutorial as seen
        localStorage.setItem('hasSeenTutorial', 'true');
        
        // Hide tutorial
        this.hideTutorial();
        
        // Show completion message
        this.showCompletionMessage();
    }
    
    updateTutorialContent() {
        const stepElement = document.getElementById('tutorialStep');
        const totalElement = document.getElementById('tutorialTotal');
        const contentElement = document.getElementById('tutorialContent');
        const nextBtn = document.getElementById('nextTutorialBtn');
        const prevBtn = document.getElementById('prevTutorialBtn');
        
        if (stepElement) stepElement.textContent = this.currentStep + 1;
        if (totalElement) totalElement.textContent = this.totalSteps;
        
        if (contentElement) {
            const step = this.tutorialSteps[this.currentStep];
            contentElement.innerHTML = `
                <div class="tutorial-step active">
                    ${step.content}
                </div>
            `;
        }
        
        // Update navigation buttons
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps - 1) {
                nextBtn.innerHTML = '<i class="fas fa-check me-2"></i>Start Playing!';
                nextBtn.className = 'btn btn-success';
            } else {
                nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right ms-2"></i>';
                nextBtn.className = 'btn btn-primary';
            }
        }
    }
    
    showCompletionMessage() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success notification-popup';
        notification.innerHTML = `
            <i class="fas fa-graduation-cap me-2"></i>
            <strong>Tutorial Complete!</strong> You're ready to start analyzing farms. Good luck!
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            z-index: 2000;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Public method to restart tutorial
    restartTutorial() {
        this.currentStep = 0;
        localStorage.removeItem('hasSeenTutorial');
        this.showTutorial();
    }
}

// Initialize tutorial when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.tutorialManager = new TutorialManager();
        console.log('Tutorial Manager initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Tutorial Manager:', error);
    }
});

// Add restart tutorial function to global scope
window.restartTutorial = function() {
    if (window.tutorialManager) {
        window.tutorialManager.restartTutorial();
    }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialManager;
}