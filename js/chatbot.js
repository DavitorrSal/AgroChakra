/**
 * Agricultural Analysis Chatbot
 * Provides intelligent advice based on farm analysis data
 */

class AgriculturalChatbot {
    constructor() {
        this.isOpen = false;
        this.currentAnalysisData = null;
        this.conversationHistory = [];
        this.isTyping = false;
        this.currentLanguage = 'en';
        
        this.init();
    }
    
    init() {
        this.loadLanguage();
        this.createChatbotUI();
        this.bindEvents();
        this.loadWelcomeMessage();
        this.setupLanguageListener();
    }
    
    loadLanguage() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    }
    
    setupLanguageListener() {
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateChatbotLanguage();
        });
    }
    
    updateChatbotLanguage() {
        // Update chatbot UI text
        this.updateChatbotUI();
        
        // Add language change message
        this.addMessage({
            type: 'bot',
            content: this.getTranslation('languageChanged'),
            timestamp: new Date()
        });
    }
    
    getTranslation(key) {
        const translations = {
            en: {
                title: 'Agricultural AI Assistant',
                typing: 'AI Assistant is typing...',
                placeholder: 'Ask me about your farm analysis...',
                quickActions: {
                    analyze: 'Analyze Current Farm',
                    fertilizer: 'Fertilizer Advice',
                    weather: 'Weather Impact',
                    lai: 'LAI Explanation'
                },
                welcome: `🌱 Hello! I'm your Agricultural AI Assistant.\n\nI can help you with:\n• Farm analysis insights\n• Fertilizer recommendations\n• Crop health guidance\n\nSelect a farm area and run an analysis to get started!`,
                languageChanged: '🌍 Language updated! I can now assist you in your preferred language.',
                error: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if the issue persists."
            },
            es: {
                title: 'Asistente de IA Agrícola',
                typing: 'El Asistente de IA está escribiendo...',
                placeholder: 'Pregúntame sobre tu análisis de cultivo...',
                quickActions: {
                    analyze: 'Analizar Cultivo Actual',
                    fertilizer: 'Consejo de Fertilizante',
                    weather: 'Impacto del Clima',
                    lai: 'Explicación LAI'
                },
                welcome: `🌱 ¡Hola! Soy tu Asistente de IA Agrícola.\n\nPuedo ayudarte con:\n• Análisis de cultivos\n• Recomendaciones de fertilizantes\n• Guía de salud de plantas\n\n¡Selecciona un área de cultivo para comenzar!`,
                languageChanged: '🌍 ¡Idioma actualizado! Ahora puedo asistirte en tu idioma preferido.',
                error: 'Lo siento, tengo problemas para procesar tu solicitud en este momento. Por favor intenta de nuevo más tarde o contacta soporte si el problema persiste.'
            },
            qu: {
                title: 'Chakra IA Yanapaq',
                typing: 'IA Yanapaq qillqachkan...',
                placeholder: 'Chakra qhawayniykimanta tapuway...',
                quickActions: {
                    analyze: 'Kunan Chakrata Qhaway',
                    fertilizer: 'Wiñarichiq Yuyay',
                    weather: 'Pacha Ruway',
                    lai: 'LAI Riqsichiy'
                },
                welcome: `🌱 ¡Allin p\'unchay! Chakra IA Yanapaqniyki kani.\n\nYanapasaykiman:\n• Chakra qhaway\n• Wiñarichiq yuyaykuna\n• Yura qhesay yachay\n\n¡Chakra sitiota akllay qallariykunaykipaq!`,
                languageChanged: '🌍 ¡Simi musuqyachisqa! Kunan munasqayki simipim yanapasayki.',
                error: 'Pampachakuway, mañakuyniykita ruwayta atinispa sasachakuni. Ama hina kaspa, qhipaman kutimuy utaq yanapakuy taripaypi willakuy sichus sasachakuy purin.'
            }
        };
        
        return translations[this.currentLanguage]?.[key] || translations['en'][key] || key;
    }
    
    createChatbotUI() {
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <div id="chatbotToggle" class="chatbot-toggle">
                <i class="fas fa-robot"></i>
                <span class="notification-badge" id="chatNotification" style="display: none;">1</span>
            </div>
            
            <!-- Chatbot Container -->
            <div id="chatbotContainer" class="chatbot-container">
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <i class="fas fa-leaf me-2"></i>
                        ${this.getTranslation('title')}
                    </div>
                    <div class="chatbot-controls">
                        <button id="chatbotClose" class="btn-control">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chatbot-messages" id="chatbotMessages">
                    <!-- Messages will be dynamically added here -->
                </div>
                
                <div class="chatbot-typing" id="chatbotTyping" style="display: none;">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">${this.getTranslation('typing')}</span>
                </div>
                
                <div class="chatbot-input-container">
                    <div class="quick-actions" id="quickActions" style="display: none;">
                        <button class="quick-action-btn" data-action="analyze">
                            <i class="fas fa-chart-line"></i>
                            ${this.getTranslation('quickActions').analyze}
                        </button>
                        <button class="quick-action-btn" data-action="fertilizer">
                            <i class="fas fa-flask"></i>
                            ${this.getTranslation('quickActions').fertilizer}
                        </button>
                    </div>
                    
                    <div class="input-group">
                        <input type="text" 
                               id="chatbotInput" 
                               class="form-control" 
                               placeholder="${this.getTranslation('placeholder')}"
                               maxlength="500">
                        <button id="chatbotSend" class="btn btn-success">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    updateChatbotUI() {
        // Update title
        const title = document.querySelector('.chatbot-title');
        if (title) {
            title.innerHTML = `<i class="fas fa-leaf me-2"></i>${this.getTranslation('title')}`;
        }
        
        // Update typing text
        const typingText = document.querySelector('.typing-text');
        if (typingText) {
            typingText.textContent = this.getTranslation('typing');
        }
        
        // Update placeholder
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.placeholder = this.getTranslation('placeholder');
        }
        
        // Update quick action buttons
        const quickActions = this.getTranslation('quickActions');
        const analyzeBtn = document.querySelector('[data-action="analyze"]');
        const fertilizerBtn = document.querySelector('[data-action="fertilizer"]');
        
        if (analyzeBtn) analyzeBtn.innerHTML = `<i class="fas fa-chart-line"></i>${quickActions.analyze}`;
        if (fertilizerBtn) fertilizerBtn.innerHTML = `<i class="fas fa-flask"></i>${quickActions.fertilizer}`;
    }
    
    bindEvents() {
        // Toggle chatbot
        document.getElementById('chatbotToggle').addEventListener('click', () => {
            this.toggleChatbot();
        });
        
        // Close chatbot
        document.getElementById('chatbotClose').addEventListener('click', () => {
            this.closeChatbot();
        });
        
        // Send message
        document.getElementById('chatbotSend').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send
        document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Quick actions
        document.getElementById('quickActions').addEventListener('click', (e) => {
            if (e.target.closest('.quick-action-btn')) {
                const action = e.target.closest('.quick-action-btn').dataset.action;
                this.handleQuickAction(action);
            }
        });
        
        // Listen for analysis updates
        document.addEventListener('analysisCompleted', (e) => {
            this.updateAnalysisData(e.detail);
            this.showAnalysisNotification();
        });
    }
    
    loadWelcomeMessage() {
        const welcomeMessage = {
            type: 'bot',
            content: this.getTranslation('welcome'),
            timestamp: new Date()
        };
        
        this.addMessage(welcomeMessage);
    }
    
    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    openChatbot() {
        const container = document.getElementById('chatbotContainer');
        const toggle = document.getElementById('chatbotToggle');
        
        container.classList.add('open');
        toggle.classList.add('hidden');
        this.isOpen = true;
        
        // Add body class for mobile to prevent scrolling
        if (window.innerWidth <= 768) {
            document.body.classList.add('chatbot-open');
        }
        
        // Hide notification
        document.getElementById('chatNotification').style.display = 'none';
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chatbotInput').focus();
        }, 300);
    }
    
    closeChatbot() {
        const container = document.getElementById('chatbotContainer');
        const toggle = document.getElementById('chatbotToggle');
        
        container.classList.remove('open');
        toggle.classList.remove('hidden');
        this.isOpen = false;
        
        // Remove body class for mobile
        document.body.classList.remove('chatbot-open');
    }
    
    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Clear input
        input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.hideTyping();
            
            // Add bot response
            this.addMessage({
                type: 'bot',
                content: response,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTyping();
            
            this.addMessage({
                type: 'bot',
                content: this.getTranslation('error'),
                timestamp: new Date(),
                isError: true
            });
        }
    }
    
    async getAIResponse(userMessage) {
        // Simulate API call to AI service
        // In a real implementation, this would call your AI API
        
        const response = await this.processMessageWithContext(userMessage);
        return response;
    }
    
    async processMessageWithContext(message) {
        const lowerMessage = message.toLowerCase();
        
        // Context-aware responses based on current analysis data
        if (this.currentAnalysisData) {
            // LAI-related questions
            if (lowerMessage.includes('lai') || lowerMessage.includes('leaf area')) {
                return this.generateLAIResponse();
            }
            
            // Fertilizer questions
            if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
                return this.generateFertilizerResponse();
            }
            
            // Weather questions
            if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('temperature')) {
                return this.generateWeatherResponse();
            }
            
            // General analysis questions
            if (lowerMessage.includes('analysis') || lowerMessage.includes('recommend') || lowerMessage.includes('advice')) {
                return this.generateGeneralAnalysisResponse();
            }
            
            // Crop health questions
            if (lowerMessage.includes('health') || lowerMessage.includes('crop') || lowerMessage.includes('plant')) {
                return this.generateCropHealthResponse();
            }
        }
        
        // General agricultural knowledge
        if (lowerMessage.includes('how') && lowerMessage.includes('improve')) {
            return this.generateImprovementAdvice();
        }
        
        if (lowerMessage.includes('best practice') || lowerMessage.includes('tip')) {
            return this.generateBestPractices();
        }
        
        // Default response
        return this.generateDefaultResponse(message);
    }
    
    generateLAIResponse() {
        const lai = this.currentAnalysisData.lai_data;
        const currentLAI = lai.current_value || 0;
        const trend = lai.trend || 'stable';
        
        let response = `📊 **LAI Analysis for Your Farm:**\n\n`;
        response += `Current LAI: **${currentLAI.toFixed(2)}**\n`;
        response += `Trend: **${trend}**\n\n`;
        
        if (currentLAI < 1) {
            response += `🔴 **Low LAI Alert:** Your crops show sparse vegetation. This could indicate:\n`;
            response += `• Early growth stage\n• Stress conditions\n• Need for irrigation or nutrients\n\n`;
            response += `**Recommendations:**\n• Check soil moisture\n• Consider fertilizer application\n• Monitor for pests or diseases`;
        } else if (currentLAI < 3) {
            response += `🟡 **Moderate LAI:** Your crops show moderate vegetation density.\n\n`;
            response += `**Recommendations:**\n• Continue current management practices\n• Monitor growth progress\n• Prepare for peak growing season`;
        } else if (currentLAI < 6) {
            response += `🟢 **Good LAI:** Your crops show healthy, dense vegetation!\n\n`;
            response += `**Recommendations:**\n• Maintain current practices\n• Monitor for optimal harvest timing\n• Consider yield optimization strategies`;
        } else {
            response += `🔵 **Very High LAI:** Extremely dense vegetation detected.\n\n`;
            response += `**Considerations:**\n• May indicate over-fertilization\n• Check for proper air circulation\n• Monitor for disease pressure`;
        }
        
        return response;
    }
    
    generateFertilizerResponse() {
        const recommendation = this.currentAnalysisData.recommendation;
        const confidence = this.currentAnalysisData.confidence;
        
        let response = `🧪 **Fertilizer Recommendation:**\n\n`;
        
        if (recommendation.apply_fertilizer) {
            response += `✅ **Recommendation: Apply Fertilizer**\n`;
            response += `Confidence: ${confidence}%\n\n`;
            response += `**Reasoning:** ${recommendation.reasoning}\n\n`;
            response += `**Suggested Application:**\n`;
            response += `• Type: ${recommendation.fertilizer_type || 'Balanced NPK'}\n`;
            response += `• Rate: ${recommendation.application_rate || 'Follow soil test recommendations'}\n`;
            response += `• Timing: ${recommendation.timing || 'Apply during active growth period'}\n\n`;
            response += `**Important Notes:**\n`;
            response += `• Always conduct soil tests before application\n`;
            response += `• Consider weather conditions\n`;
            response += `• Follow local environmental guidelines`;
        } else {
            response += `❌ **Recommendation: Skip Fertilizer**\n`;
            response += `Confidence: ${confidence}%\n\n`;
            response += `**Reasoning:** ${recommendation.reasoning}\n\n`;
            response += `**Alternative Actions:**\n`;
            response += `• Continue monitoring crop health\n`;
            response += `• Focus on water management\n`;
            response += `• Consider organic matter addition\n`;
            response += `• Plan for next growing season`;
        }
        
        return response;
    }
    
    generateWeatherResponse() {
        const weather = this.currentAnalysisData.weather_data;
        
        let response = `🌤️ **Weather Impact Analysis:**\n\n`;
        
        if (weather.recent_rainfall) {
            response += `**Recent Rainfall:** ${weather.recent_rainfall}mm\n`;
            response += `**Impact:** ${weather.recent_rainfall > 50 ? 'High moisture levels may delay fertilizer application' : 'Good conditions for nutrient uptake'}\n\n`;
        }
        
        if (weather.temperature_trend) {
            response += `**Temperature Trend:** ${weather.temperature_trend}\n`;
            response += `**Growing Conditions:** ${weather.temperature_trend === 'increasing' ? 'Favorable for crop growth' : 'Monitor for stress conditions'}\n\n`;
        }
        
        response += `**Recommendations Based on Weather:**\n`;
        response += `• Monitor soil moisture levels\n`;
        response += `• Adjust irrigation schedule if needed\n`;
        response += `• Consider weather timing for any applications\n`;
        response += `• Watch for pest/disease pressure changes`;
        
        return response;
    }
    
    generateGeneralAnalysisResponse() {
        const analysis = this.currentAnalysisData;
        
        let response = `📈 **Complete Farm Analysis Summary:**\n\n`;
        response += `**Farm Area:** ${analysis.area_hectares.toFixed(2)} hectares\n`;
        response += `**Analysis Date:** ${new Date(analysis.timestamp).toLocaleDateString()}\n\n`;
        
        response += `**Key Findings:**\n`;
        response += `• LAI: ${analysis.lai_data.current_value?.toFixed(2) || 'N/A'}\n`;
        response += `• Fertilizer Needed: ${analysis.recommendation.apply_fertilizer ? 'Yes' : 'No'}\n`;
        response += `• Confidence: ${analysis.confidence}%\n\n`;
        
        response += `**Next Steps:**\n`;
        response += `1. Review detailed LAI trends\n`;
        response += `2. Consider fertilizer recommendation\n`;
        response += `3. Monitor weather conditions\n`;
        response += `4. Plan follow-up analysis in 2-3 weeks\n\n`;
        
        response += `💡 **Pro Tip:** Regular monitoring helps optimize crop yields and resource efficiency!`;
        
        return response;
    }
    
    generateCropHealthResponse() {
        let response = `🌱 **Crop Health Assessment:**\n\n`;
        
        if (this.currentAnalysisData) {
            const lai = this.currentAnalysisData.lai_data.current_value || 0;
            
            if (lai > 3) {
                response += `✅ **Overall Health: Good**\n`;
                response += `Your crops show healthy vegetation density and good growth patterns.\n\n`;
            } else if (lai > 1) {
                response += `⚠️ **Overall Health: Moderate**\n`;
                response += `Crops are developing but may benefit from additional care.\n\n`;
            } else {
                response += `🔴 **Overall Health: Needs Attention**\n`;
                response += `Low vegetation density indicates potential stress or early growth stage.\n\n`;
            }
        }
        
        response += `**Health Monitoring Checklist:**\n`;
        response += `• ✓ Regular LAI monitoring\n`;
        response += `• ✓ Soil moisture assessment\n`;
        response += `• ✓ Nutrient level evaluation\n`;
        response += `• ✓ Pest and disease inspection\n`;
        response += `• ✓ Weather impact consideration\n\n`;
        
        response += `**Signs to Watch For:**\n`;
        response += `• Yellowing leaves (nutrient deficiency)\n`;
        response += `• Wilting (water stress)\n`;
        response += `• Stunted growth (multiple factors)\n`;
        response += `• Unusual discoloration (disease/pests)`;
        
        return response;
    }
    
    generateImprovementAdvice() {
        return `🚀 **Farm Improvement Strategies:**\n\n` +
               `**Short-term (1-3 months):**\n` +
               `• Optimize irrigation scheduling\n` +
               `• Apply targeted fertilizers based on soil tests\n` +
               `• Implement pest monitoring programs\n` +
               `• Adjust planting density if needed\n\n` +
               `**Medium-term (3-12 months):**\n` +
               `• Improve soil organic matter\n` +
               `• Install precision agriculture tools\n` +
               `• Develop crop rotation plans\n` +
               `• Enhance drainage systems\n\n` +
               `**Long-term (1+ years):**\n` +
               `• Invest in soil health programs\n` +
               `• Consider climate-adapted varieties\n` +
               `• Implement sustainable practices\n` +
               `• Build data-driven decision systems`;
    }
    
    generateBestPractices() {
        return `💡 **Agricultural Best Practices:**\n\n` +
               `**Soil Management:**\n` +
               `• Test soil regularly (at least annually)\n` +
               `• Maintain proper pH levels\n` +
               `• Add organic matter consistently\n` +
               `• Practice conservation tillage\n\n` +
               `**Water Management:**\n` +
               `• Use efficient irrigation methods\n` +
               `• Monitor soil moisture levels\n` +
               `• Implement water conservation techniques\n` +
               `• Consider drought-resistant varieties\n\n` +
               `**Nutrient Management:**\n` +
               `• Follow 4R principles (Right source, rate, time, place)\n` +
               `• Use precision application techniques\n` +
               `• Consider slow-release fertilizers\n` +
               `• Monitor plant tissue nutrient levels`;
    }
    
    generateDefaultResponse(message) {
        const responses = [
            `I'd be happy to help! Could you be more specific about what aspect of your farm analysis you'd like to discuss?`,
            `That's an interesting question! To provide the best advice, could you tell me more about your specific farming situation?`,
            `I can help with that! Are you looking for information about LAI, fertilizer recommendations, weather impacts, or general farming advice?`,
            `Great question! Let me know if you'd like me to focus on your current analysis data or provide general agricultural guidance.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)] + 
               `\n\n💡 **Quick tip:** Try using the quick action buttons below for common questions!`;
    }
    
    handleQuickAction(action) {
        const actions = {
            'analyze': 'Can you explain my current farm analysis results?',
            'fertilizer': 'Should I apply fertilizer to my farm?',
            'weather': 'How is the weather affecting my crops?',
            'lai': 'What does my LAI value mean?'
        };
        
        const message = actions[action];
        if (message) {
            document.getElementById('chatbotInput').value = message;
            this.sendMessage();
        }
    }
    
    addMessage(message) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}-message ${message.isError ? 'error-message' : ''}`;
        
        const time = message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageElement.innerHTML = `
            <div class="message-content">
                ${this.formatMessageContent(message.content)}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push(message);
    }
    
    formatMessageContent(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&bull; ');
    }
    
    showTyping() {
        document.getElementById('chatbotTyping').style.display = 'flex';
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.isTyping = true;
    }
    
    hideTyping() {
        document.getElementById('chatbotTyping').style.display = 'none';
        this.isTyping = false;
    }
    
    updateAnalysisData(data) {
        this.currentAnalysisData = data;
        
        // Update quick actions based on available data
        this.updateQuickActions();
    }
    
    updateQuickActions() {
        const quickActions = document.getElementById('quickActions');
        if (this.currentAnalysisData) {
            quickActions.style.display = 'flex';
        } else {
            quickActions.style.display = 'none';
        }
    }
    
    showAnalysisNotification() {
        if (!this.isOpen) {
            const notification = document.getElementById('chatNotification');
            notification.style.display = 'block';
            
            // Auto-suggest analysis discussion
            setTimeout(() => {
                if (!this.isOpen) {
                    this.addMessage({
                        type: 'bot',
                        content: `🎉 New analysis completed! I can help you understand the results and provide personalized recommendations. Click to open the chat!`,
                        timestamp: new Date()
                    });
                }
            }, 2000);
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agriculturalChatbot = new AgriculturalChatbot();
});