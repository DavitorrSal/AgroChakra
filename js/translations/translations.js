/**
 * Translation System for Agricultural Analysis Platform
 * Supports: English, Spanish (Español), Quechua
 */

const translations = {
    en: {
        // Language Selector
        languageSelector: {
            title: "Select Your Language",
            subtitle: "Choose your preferred language to continue",
            english: "English",
            spanish: "Español",
            quechua: "Quechua",
            continue: "Continue"
        },
        
        // Navigation
        nav: {
            title: "AgroChakra",
            tutorial: "Tutorial"
        },
        
        // Map Controls
        mapControls: {
            selectFarm: "Select Farm Area",
            satellite: "Toggle Satellite View",
            clear: "Clear Selection",
            location: "Go to My Location"
        },
        
        // Analysis Buttons
        analysis: {
            weather: "Weather",
            vegetation: "Vegetation", 
            soil: "Soil",
            fertilization: "Fertilization Decision",
            irrigation: "Irrigation Decision"
        },
        
        // Selection Info
        selection: {
            title: "Selected Farm Area",
            area: "Area",
            coordinates: "Coordinates",
            hectares: "hectares",
            analyze: "Analyze Farm"
        },
        
        // Welcome Screen
        welcome: {
            title: "Welcome to AgroChakra!",
            description: "Select a farm area on the map to analyze soil conditions, weather patterns, and vegetation health using satellite data.",
            howToUse: "How to Use:",
            steps: [
                "Navigate the map to find an agricultural area",
                "Click the crop icon and draw a rectangle over a farm", 
                "Click \"Analyze Farm\" to fetch satellite and weather data",
                "Review the LAI analysis and make informed fertilizer recommendations",
                "Get AI-powered insights for better agricultural decisions!"
            ],
            aiAssistant: "AI Assistant available to help you understand your analysis results. Look for the chatbot icon in the bottom right corner!"
        },
        
        // Loading Screen
        loading: {
            title: "Analyzing Farm Data...",
            description: "Fetching satellite imagery and weather data",
            status: "Initializing analysis..."
        },
        
        // Analysis Results
        results: {
            weather: "Weather Analysis",
            vegetation: "Vegetation Health (LAI)",
            soil: "Soil Conditions",
            currentLAI: "Current LAI",
            trend: "30-day Trend",
            nextFarm: "Next Farm",
            askAI: "Ask AI Assistant"
        },
        
        // Tutorial
        tutorial: {
            title: "AgroChakra Tutorial",
            laiTitle: "Understanding LAI (Leaf Area Index)",
            laiDescription: "LAI measures the total leaf area per unit ground area. Higher values indicate healthier, denser vegetation.",
            laiRanges: [
                "LAI 0-1: Sparse vegetation",
                "LAI 1-3: Moderate vegetation", 
                "LAI 3-6: Dense, healthy crops",
                "LAI >6: Very dense vegetation"
            ],
            fertilizerTitle: "Fertilizer Decision Factors",
            fertilizerDescription: "Consider these factors when making recommendations:",
            fertilizerFactors: [
                "Current LAI vs. optimal range for crop type",
                "Soil moisture and nutrient levels",
                "Recent weather patterns",
                "Growth stage of the crop",
                "Historical yield data"
            ],
            aiTitle: "AI Assistant Features",
            aiDescription: "The new AI Assistant can help you:",
            aiFeatures: [
                "Interpret LAI values and trends",
                "Understand fertilizer recommendations",
                "Analyze weather impact on crops",
                "Learn agricultural best practices",
                "Get personalized advice based on your data"
            ],
            gotIt: "Got it!"
        },
        
        // Decision Modals
        decisions: {
            fertilizer: {
                title: "Fertilizer Decision",
                aiAnalysis: "AI Analysis:",
                confidence: "Confidence",
                apply: "Apply Fertilizer",
                skip: "Skip Fertilizer"
            },
            irrigation: {
                title: "Smart Irrigation Decision",
                aiAnalysis: "AI Analysis:",
                confidence: "Confidence"
            }
        },
        
        // Common
        common: {
            close: "Close",
            next: "Next",
            previous: "Previous",
            skip: "Skip",
            continue: "Continue",
            cancel: "Cancel",
            confirm: "Confirm"
        }
    },
    
    es: {
        // Language Selector
        languageSelector: {
            title: "Selecciona tu Idioma",
            subtitle: "Elige tu idioma preferido para continuar",
            english: "English",
            spanish: "Español", 
            quechua: "Quechua",
            continue: "Continuar"
        },
        
        // Navigation
        nav: {
            title: "AgroChakra",
            tutorial: "Tutorial"
        },
        
        // Map Controls
        mapControls: {
            selectFarm: "Seleccionar Área de Cultivo",
            satellite: "Alternar Vista Satelital",
            clear: "Limpiar Selección",
            location: "Ir a Mi Ubicación"
        },
        
        // Analysis Buttons
        analysis: {
            weather: "Clima",
            vegetation: "Vegetación",
            soil: "Suelo", 
            fertilization: "Decisión de Fertilización",
            irrigation: "Decisión de Riego"
        },
        
        // Selection Info
        selection: {
            title: "Área de Cultivo Seleccionada",
            area: "Área",
            coordinates: "Coordenadas",
            hectares: "hectáreas",
            analyze: "Analizar Cultivo"
        },
        
        // Welcome Screen
        welcome: {
            title: "¡Bienvenido a AgroChakra!",
            description: "Selecciona un área de cultivo en el mapa para analizar las condiciones del suelo, patrones climáticos y salud de la vegetación usando datos satelitales.",
            howToUse: "Cómo Usar:",
            steps: [
                "Navega el mapa para encontrar un área agrícola",
                "Haz clic en el ícono de cultivo y dibuja un área personalizada sobre una granja",
                "Haz clic en \"Analizar Cultivo\" para obtener datos satelitales y climáticos",
                "Revisa el análisis LAI y haz recomendaciones informadas de fertilizantes",
                "¡Obtén insights agrícolas impulsados por IA!"
            ],
            aiAssistant: "¡Asistente de IA disponible para ayudarte a entender los resultados del análisis. Busca el ícono del chatbot en la esquina inferior derecha!"
        },
        
        // Loading Screen
        loading: {
            title: "Analizando Datos del Cultivo...",
            description: "Obteniendo imágenes satelitales y datos climáticos",
            status: "Inicializando análisis..."
        },
        
        // Analysis Results
        results: {
            weather: "Análisis Climático",
            vegetation: "Salud de la Vegetación (LAI)",
            soil: "Condiciones del Suelo",
            currentLAI: "LAI Actual",
            trend: "Tendencia de 30 días",
            nextFarm: "Siguiente Cultivo",
            askAI: "Preguntar a IA"
        },
        
        // Tutorial
        tutorial: {
            title: "Tutorial de AgroChakra",
            laiTitle: "Entendiendo LAI (Índice de Área Foliar)",
            laiDescription: "LAI mide el área total de hojas por unidad de área del suelo. Valores más altos indican vegetación más saludable y densa.",
            laiRanges: [
                "LAI 0-1: Vegetación escasa",
                "LAI 1-3: Vegetación moderada",
                "LAI 3-6: Cultivos densos y saludables",
                "LAI >6: Vegetación muy densa"
            ],
            fertilizerTitle: "Factores de Decisión de Fertilizantes",
            fertilizerDescription: "Considera estos factores al hacer recomendaciones:",
            fertilizerFactors: [
                "LAI actual vs. rango óptimo para el tipo de cultivo",
                "Humedad del suelo y niveles de nutrientes",
                "Patrones climáticos recientes",
                "Etapa de crecimiento del cultivo",
                "Datos históricos de rendimiento"
            ],
            aiTitle: "Características del Asistente de IA",
            aiDescription: "El nuevo Asistente de IA puede ayudarte a:",
            aiFeatures: [
                "Interpretar valores y tendencias LAI",
                "Entender recomendaciones de fertilizantes",
                "Analizar el impacto del clima en los cultivos",
                "Aprender mejores prácticas agrícolas",
                "Obtener consejos personalizados basados en tus datos"
            ],
            gotIt: "¡Entendido!"
        },
        
        // Decision Modals
        decisions: {
            fertilizer: {
                title: "Decisión de Fertilizante",
                aiAnalysis: "Análisis de IA:",
                confidence: "Confianza",
                apply: "Aplicar Fertilizante",
                skip: "Omitir Fertilizante"
            },
            irrigation: {
                title: "Decisión de Riego Inteligente",
                aiAnalysis: "Análisis de IA:",
                confidence: "Confianza"
            }
        },
        
        // Common
        common: {
            close: "Cerrar",
            next: "Siguiente",
            previous: "Anterior",
            skip: "Omitir",
            continue: "Continuar",
            cancel: "Cancelar",
            confirm: "Confirmar"
        }
    },
    
    qu: {
        // Language Selector
        languageSelector: {
            title: "Simiykita Akllay",
            subtitle: "Purinaykipaq munasqayki simita akllay",
            english: "English",
            spanish: "Español",
            quechua: "Quechua",
            continue: "Purichiy"
        },
        
        // Navigation
        nav: {
            title: "AgroChakra",
            tutorial: "Yachachiy"
        },
        
        // Map Controls
        mapControls: {
            selectFarm: "Chakra Sitio Akllay",
            satellite: "Satelite Rikuy Tikray",
            clear: "Ch'usaqchay",
            location: "Maypi Kani Riy"
        },
        
        // Analysis Buttons
        analysis: {
            weather: "Pacha",
            vegetation: "Yura",
            soil: "Allpa",
            fertilization: "Wiñarichiq Tanteay",
            irrigation: "Yakuchay Tanteay"
        },
        
        // Selection Info
        selection: {
            title: "Akllasqa Chakra Sitio",
            area: "Sitio",
            coordinates: "Maypi Kachkan",
            hectares: "hectáreas",
            analyze: "Chakrata Qhaway"
        },
        
        // Welcome Screen
        welcome: {
            title: "¡Allin Hamusqayki AgroChakra-pi!",
            description: "Mapapi chakra sitiota akllay allpa, pacha, yura qhesachana kaqkunata satelite willaykunawan qhawanapaq.",
            howToUse: "Imayna Llamk'ana:",
            steps: [
                "Mapapi chakra sitiota maskay",
                "Tarpuy rikch'aqta ñit'iy hinaspa chakrapi sapalla sitiota ruway",
                "\"Chakrata Qhaway\" ñit'iy satelite, pacha willaykunata hurqunapaq",
                "LAI qhawaykunata qhaway hinaspa yuyaysapa wiñarichiq yuyaykunata quy",
                "¡IA-wan yanapasqa chakra yuyaykunata chasquiy!"
            ],
            aiAssistant: "¡IA Yanapaq kachkan qhaway ruwaykunata hamut'anaykipaq! Chatbot rikch'aqta kunan uray paña k'uchupim maskay!"
        },
        
        // Loading Screen
        loading: {
            title: "Chakra Willaykunata Qhawachkan...",
            description: "Satelite siq'ikunata, pacha willaykunata hurquchkan",
            status: "Qhawaykunata qallarichkan..."
        },
        
        // Analysis Results
        results: {
            weather: "Pacha Qhaway",
            vegetation: "Yura Qhesay (LAI)",
            soil: "Allpa Kaqnin",
            currentLAI: "Kunan LAI",
            trend: "30 p'unchay Puririy",
            nextFarm: "Qatiq Chakra",
            askAI: "IA-ta Tapuy"
        },
        
        // Tutorial
        tutorial: {
            title: "AgroChakra Yachachiy",
            laiTitle: "LAI Hamut'ay (Raphikuna Sitio Yupay)",
            laiDescription: "LAI allpa sitio paqariynin raphikuna sitio tupun. Hatun chanakuna aswan qhesasqa, ch'uyasqa yurakunata rikuchin.",
            laiRanges: [
                "LAI 0-1: Pisi yura",
                "LAI 1-3: Chawpi yura",
                "LAI 3-6: Ch'uya, qhesasqa tarpukuna",
                "LAI >6: Ancha ch'uya yura"
            ],
            fertilizerTitle: "Wiñarichiq Tanteay Kaqkuna",
            fertilizerDescription: "Kay kaqkunata qhaway yuyaykunata quspa:",
            fertilizerFactors: [
                "Kunan LAI vs. tarpuy laya allin kaq",
                "Allpa yakuy, mikhuy kaqnin",
                "Ñaqha pacha ruwaykuna",
                "Tarpuy wiñay kaq",
                "Ñawpaq mit'a ruwaykunapa willayninkunata"
            ],
            aiTitle: "IA Yanapaq Ruwaykuna",
            aiDescription: "Musuq IA Yanapaq yanapasunki:",
            aiFeatures: [
                "LAI chanakuna, puririykunata t'aqwiy",
                "Wiñarichiq yuyaykunata hamut'ay",
                "Pacha tarpukunapi rurayninkunata qhaway",
                "Allin chakra ruwaykunata yachay",
                "Willayniykiman hina sapalla yuyaykunata chasquiy"
            ],
            gotIt: "¡Hamut'ani!"
        },
        
        // Decision Modals
        decisions: {
            fertilizer: {
                title: "Wiñarichiq Tanteay",
                aiAnalysis: "IA Qhaway:",
                confidence: "Chiqap Kay",
                apply: "Wiñarichiqta Churay",
                skip: "Wiñarichiqta Saqiy"
            },
            irrigation: {
                title: "Yuyaysapa Yakuchay Tanteay",
                aiAnalysis: "IA Qhaway:",
                confidence: "Chiqap Kay"
            }
        },
        
        // Common
        common: {
            close: "Wichqay",
            next: "Qatiq",
            previous: "Ñawpaq",
            skip: "Saqiy",
            continue: "Purichiy",
            cancel: "Hark'ay",
            confirm: "Takyachiy"
        }
    }
};

// Translation Manager Class
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.translations = translations;
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('selectedLanguage', lang);
            this.updatePageContent();
        }
    }
    
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if translation not found
                value = this.translations['en'];
                for (const k of keys) {
                    if (value && value[k]) {
                        value = value[k];
                    } else {
                        return key; // Return key if not found
                    }
                }
                break;
            }
        }
        
        return value || key;
    }
    
    updatePageContent() {
        // Update navigation
        const navTitle = document.querySelector('.navbar-brand');
        if (navTitle) {
            navTitle.innerHTML = `<i class="fas fa-leaf me-2"></i>${this.t('nav.title')}`;
        }
        
        const tutorialBtn = document.querySelector('[onclick="restartTutorial()"]');
        if (tutorialBtn) {
            // Keep only the icon for the fixed tutorial button
            tutorialBtn.innerHTML = `<i class="fas fa-graduation-cap"></i>`;
        }
        
        // Update map controls
        this.updateMapControls();
        
        // Update analysis buttons
        this.updateAnalysisButtons();
        
        // Update selection info
        this.updateSelectionInfo();
        
        // Update welcome screen
        this.updateWelcomeScreen();
        
        // Update tutorial content
        this.updateTutorialContent();
        
        // Update decision modals
        this.updateDecisionModals();
    }
    
    updateMapControls() {
        const controls = {
            'selectFarmBtn': 'mapControls.selectFarm',
            'satelliteBtn': 'mapControls.satellite', 
            'clearBtn': 'mapControls.clear',
            'locateBtn': 'mapControls.location'
        };
        
        Object.entries(controls).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute('title', this.t(key));
            }
        });
    }
    
    updateAnalysisButtons() {
        const buttons = {
            'weatherAnalysisBtn': 'analysis.weather',
            'vegetationHealthBtn': 'analysis.vegetation',
            'soilConditionsBtn': 'analysis.soil',
            'fertilizerActionBtn': 'analysis.fertilization',
            'irrigationActionBtn': 'analysis.irrigation'
        };
        
        Object.entries(buttons).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) {
                const textSpan = element.querySelector('.btn-text');
                if (textSpan) {
                    textSpan.textContent = this.t(key);
                }
                element.setAttribute('title', this.t(key));
            }
        });
    }
    
    updateSelectionInfo() {
        const selectionTitle = document.querySelector('#selectionInfo .card-title');
        if (selectionTitle) {
            selectionTitle.innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>${this.t('selection.title')}`;
        }
        
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.innerHTML = `<i class="fas fa-chart-line me-1"></i>${this.t('selection.analyze')}`;
        }
    }
    
    updateWelcomeScreen() {
        const welcomeTitle = document.querySelector('#welcomeScreen h3');
        if (welcomeTitle) {
            welcomeTitle.textContent = this.t('welcome.title');
        }
        
        const welcomeDesc = document.querySelector('#welcomeScreen p.text-muted');
        if (welcomeDesc) {
            welcomeDesc.textContent = this.t('welcome.description');
        }
        
        const howToUseTitle = document.querySelector('#welcomeScreen h5');
        if (howToUseTitle) {
            // Try howToUse first, fallback to howToPlay for backward compatibility
            const titleText = this.t('welcome.howToUse') !== 'welcome.howToUse' ? 
                this.t('welcome.howToUse') : this.t('welcome.howToPlay');
            howToUseTitle.textContent = titleText;
        }
        
        const steps = document.querySelectorAll('#welcomeScreen ol li');
        const stepTexts = this.t('welcome.steps');
        steps.forEach((step, index) => {
            if (stepTexts[index]) {
                step.textContent = stepTexts[index];
            }
        });
    }
    
    updateTutorialContent() {
        // Tutorial modal content updates would go here
        // This is a simplified version - full implementation would update all tutorial text
    }
    
    updateDecisionModals() {
        // Decision modal content updates would go here
        // This is a simplified version - full implementation would update all modal text
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// Initialize translation manager
window.translationManager = new TranslationManager();