/**
 * Language Selector Component
 * Displays language selection screen before launching the platform
 */

class LanguageSelector {
    constructor() {
        this.selectedLanguage = null;
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        // Check if language was previously selected
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && this.isValidLanguage(savedLanguage)) {
            // Language already selected, skip selector
            this.selectedLanguage = savedLanguage;
            this.launchPlatform();
            return;
        }
        
        // Show language selector
        this.createLanguageSelector();
        this.isInitialized = true;
    }
    
    createLanguageSelector() {
        const overlay = document.createElement('div');
        overlay.className = 'language-selector-overlay';
        overlay.id = 'languageSelectorOverlay';
        
        overlay.innerHTML = `
            <div class="language-selector-container">
                <div class="language-selector-header">
                    <h2>
                        <i class="fas fa-globe"></i>
                        <span id="selectorTitle">Select Your Language</span>
                    </h2>
                    <p id="selectorSubtitle">Choose your preferred language to continue</p>
                </div>
                
                <div class="language-selector-content">
                    <div class="language-options">
                    <div class="language-option" data-lang="en">
                        <div class="language-info">
                            <div class="language-flag flag-en"></div>
                            <div class="language-details">
                                <h3>English</h3>
                                <p>International</p>
                            </div>
                        </div>
                        <div class="language-check">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    
                    <div class="language-option" data-lang="es">
                        <div class="language-info">
                            <div class="language-flag flag-es"></div>
                            <div class="language-details">
                                <h3>Español</h3>
                                <p>Spanish</p>
                            </div>
                        </div>
                        <div class="language-check">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    
                    <div class="language-option" data-lang="qu">
                        <div class="language-info">
                            <div class="language-flag flag-qu"></div>
                            <div class="language-details">
                                <h3>Quechua</h3>
                                <p>Runasimi</p>
                            </div>
                        </div>
                        <div class="language-check">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    </div>
                    
                    <div class="language-selector-footer">
                        <button class="continue-btn" id="continueBtn" disabled>
                            <i class="fas fa-arrow-right me-2"></i>
                            <span id="continueText">Continue</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.bindEvents();
    }
    
    bindEvents() {
        const options = document.querySelectorAll('.language-option');
        const continueBtn = document.getElementById('continueBtn');
        
        // Language option selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectLanguage(option.dataset.lang);
            });
        });
        
        // Continue button
        continueBtn.addEventListener('click', () => {
            if (this.selectedLanguage) {
                this.proceedWithLanguage();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.selectedLanguage) {
                this.proceedWithLanguage();
            }
        });
    }
    
    selectLanguage(lang) {
        if (!this.isValidLanguage(lang)) return;
        
        // Remove previous selection
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-lang="${lang}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedLanguage = lang;
            
            // Enable continue button
            const continueBtn = document.getElementById('continueBtn');
            continueBtn.disabled = false;
            continueBtn.classList.add('enabled');
            
            // Update button text based on selected language
            this.updateContinueButtonText(lang);
        }
    }
    
    updateContinueButtonText(lang) {
        const continueText = document.getElementById('continueText');
        const texts = {
            en: 'Continue',
            es: 'Continuar', 
            qu: 'Purichiy'
        };
        
        if (continueText && texts[lang]) {
            continueText.textContent = texts[lang];
        }
    }
    
    proceedWithLanguage() {
        if (!this.selectedLanguage) return;
        
        // Show loading state
        const continueBtn = document.getElementById('continueBtn');
        continueBtn.classList.add('loading');
        continueBtn.disabled = true;
        
        // Save language preference
        localStorage.setItem('selectedLanguage', this.selectedLanguage);
        
        // Initialize translation manager with selected language
        if (window.translationManager) {
            window.translationManager.setLanguage(this.selectedLanguage);
        }
        
        // Dispatch language changed event for chatbot
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.selectedLanguage }
        }));
        
        // Hide language selector and launch platform
        setTimeout(() => {
            this.launchPlatform();
        }, 1000);
    }
    
    launchPlatform() {
        const overlay = document.getElementById('languageSelectorOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            setTimeout(() => {
                overlay.remove();
            }, 500);
        }
        
        // Initialize the main application
        this.initializeMainApp();
    }
    
    initializeMainApp() {
        // Ensure translation manager is initialized with correct language
        if (window.translationManager) {
            window.translationManager.setLanguage(this.selectedLanguage || 'en');
        }
        
        // Show the main application content
        document.body.classList.add('app-loaded');
        
        // Trigger any initialization events
        document.dispatchEvent(new CustomEvent('languageSelected', {
            detail: { language: this.selectedLanguage || 'en' }
        }));
        
        // Initialize other components that depend on language
        this.initializeComponents();
    }
    
    initializeComponents() {
        // Initialize tutorial with correct language
        if (window.tutorialManager) {
            window.tutorialManager.updateLanguage();
        }
        
        // Initialize chatbot with correct language
        if (window.chatbotManager) {
            window.chatbotManager.updateLanguage();
        }
        
        // Update any existing UI elements
        if (window.translationManager) {
            window.translationManager.updatePageContent();
        }
    }
    
    isValidLanguage(lang) {
        return ['en', 'es', 'qu'].includes(lang);
    }
    
    // Public method to change language after initialization
    changeLanguage(lang) {
        if (this.isValidLanguage(lang)) {
            this.selectedLanguage = lang;
            localStorage.setItem('selectedLanguage', lang);
            
            if (window.translationManager) {
                window.translationManager.setLanguage(lang);
            }
            
            // Dispatch language changed event for chatbot
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
            
            // Reload page to apply language changes
            window.location.reload();
        }
    }
    
    // Public method to show language selector again
    showLanguageSelector() {
        // Remove saved language preference
        localStorage.removeItem('selectedLanguage');
        
        // Reload page to show selector
        window.location.reload();
    }
    
    getCurrentLanguage() {
        return this.selectedLanguage || localStorage.getItem('selectedLanguage') || 'en';
    }
}

// Initialize language selector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not already done
    if (!window.languageSelector) {
        window.languageSelector = new LanguageSelector();
    }
});

// Global helper functions
function showLanguageSelector() {
    if (window.languageSelector) {
        window.languageSelector.showLanguageSelector();
    }
}

function changeLanguage(lang) {
    if (window.languageSelector) {
        window.languageSelector.changeLanguage(lang);
    }
}

function getCurrentLanguage() {
    if (window.languageSelector) {
        return window.languageSelector.getCurrentLanguage();
    }
    return 'en';
}

// Update current language display in navbar
function updateLanguageDisplay() {
    const currentLangText = document.getElementById('currentLanguageText');
    if (currentLangText) {
        const lang = getCurrentLanguage();
        const langNames = {
            en: 'English',
            es: 'Español', 
            qu: 'Quechua'
        };
        currentLangText.textContent = langNames[lang] || 'Language';
    }
}

// Update language display when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateLanguageDisplay, 100);
});

// Update language display when language changes
document.addEventListener('languageSelected', () => {
    setTimeout(updateLanguageDisplay, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSelector;
}