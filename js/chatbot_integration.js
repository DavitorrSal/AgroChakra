/**
 * Chatbot Integration Script
 * Connects the chatbot with the existing analysis system
 */

// Wait for both the main application and chatbot to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Function to trigger analysis completion event for chatbot
    function notifyChatbotOfAnalysis(analysisData) {
        const event = new CustomEvent('analysisCompleted', {
            detail: analysisData
        });
        document.dispatchEvent(event);
    }
    
    // Override or extend the existing analysis completion handler
    // This assumes there's an existing function that handles analysis results
    const originalAnalysisHandler = window.handleAnalysisResults || function() {};
    
    window.handleAnalysisResults = function(data) {
        // Call the original handler
        originalAnalysisHandler(data);
        
        // Notify the chatbot
        notifyChatbotOfAnalysis(data);
    };
    
    // If there's an existing analysis button, enhance it
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            // Simulate analysis completion after a delay
            // In a real implementation, this would be triggered by the actual analysis completion
            setTimeout(() => {
                // Mock analysis data for demonstration
                const mockAnalysisData = {
                    analysis_id: 'farm_' + Date.now(),
                    timestamp: new Date().toISOString(),
                    bounds: {
                        north: 40.7128,
                        south: 40.7000,
                        east: -74.0000,
                        west: -74.0200
                    },
                    area_hectares: 25.5,
                    weather_data: {
                        recent_rainfall: 35,
                        temperature_trend: 'increasing',
                        humidity: 65,
                        wind_speed: 12
                    },
                    lai_data: {
                        current_value: 2.8,
                        trend: 'increasing',
                        historical_values: [2.1, 2.3, 2.5, 2.7, 2.8],
                        dates: ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29']
                    },
                    satellite_data: {
                        ndvi: [0.6, 0.65, 0.7, 0.72, 0.75],
                        evi: [0.4, 0.42, 0.45, 0.47, 0.48],
                        imagery_dates: ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29']
                    },
                    recommendation: {
                        apply_fertilizer: true,
                        reasoning: 'LAI values indicate moderate vegetation density with positive growth trend. Fertilizer application would support continued healthy growth.',
                        fertilizer_type: 'Balanced NPK (10-10-10)',
                        application_rate: '150 kg/ha',
                        timing: 'Early morning application recommended',
                        method: 'Broadcast application'
                    },
                    confidence: 78
                };
                
                // Trigger the analysis completion
                notifyChatbotOfAnalysis(mockAnalysisData);
            }, 3000); // Simulate 3-second analysis time
        });
    }
    
    // Add chatbot integration to existing UI elements
    const recommendationDiv = document.getElementById('recommendation');
    if (recommendationDiv) {
        // Add the "Ask AI Assistant" button if it doesn't exist
        if (!document.getElementById('askChatbotBtn')) {
            const askChatbotBtn = document.createElement('button');
            askChatbotBtn.id = 'askChatbotBtn';
            askChatbotBtn.className = 'btn btn-info btn-sm mt-2';
            askChatbotBtn.innerHTML = '<i class="fas fa-robot me-1"></i>Ask AI Assistant';
            
            // Find the button container and add the new button
            const buttonContainer = recommendationDiv.querySelector('.d-grid');
            if (buttonContainer) {
                buttonContainer.appendChild(askChatbotBtn);
            }
        }
    }
    
    // Add chatbot notification to welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !welcomeScreen.querySelector('.chatbot-intro')) {
        const chatbotIntro = document.createElement('div');
        chatbotIntro.className = 'mt-4 chatbot-intro';
        chatbotIntro.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-robot me-2"></i>
                <strong>New!</strong> AI Assistant available to help you understand your analysis results. 
                Look for the chatbot icon in the bottom right corner!
            </div>
        `;
        welcomeScreen.appendChild(chatbotIntro);
    }
    
    // Enhance the tutorial modal with chatbot information
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal && !tutorialModal.querySelector('.chatbot-tutorial')) {
        const modalBody = tutorialModal.querySelector('.modal-body');
        if (modalBody) {
            const chatbotSection = document.createElement('div');
            chatbotSection.className = 'row mt-3 chatbot-tutorial';
            chatbotSection.innerHTML = `
                <div class="col-12">
                    <h6>AI Assistant Features</h6>
                    <p>The new AI Assistant can help you:</p>
                    <ul>
                        <li>Interpret LAI values and trends</li>
                        <li>Understand fertilizer recommendations</li>
                        <li>Analyze weather impact on crops</li>
                        <li>Learn agricultural best practices</li>
                        <li>Get personalized advice based on your data</li>
                    </ul>
                </div>
            `;
            modalBody.appendChild(chatbotSection);
        }
    }
    
    // Add keyboard shortcut to open chatbot (Ctrl/Cmd + /)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            if (window.agriculturalChatbot) {
                window.agriculturalChatbot.openChatbot();
            }
        }
    });
    
    // Add help tooltip for chatbot
    const chatbotToggle = document.getElementById('chatbotToggle');
    if (chatbotToggle) {
        chatbotToggle.title = 'Open AI Assistant (Ctrl+/)';
    }
    
    console.log('Chatbot integration initialized successfully!');
});