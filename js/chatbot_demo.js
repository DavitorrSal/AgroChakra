/**
 * Chatbot Demo Script
 * Demonstrates chatbot functionality with sample data
 */

// Demo function to test chatbot with sample analysis data
function demoChatbot() {
    // Sample analysis data for demonstration
    const sampleAnalysisData = {
        analysis_id: 'demo_farm_001',
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
            wind_speed: 12,
            conditions: 'partly_cloudy'
        },
        lai_data: {
            current_value: 2.8,
            trend: 'increasing',
            historical_values: [2.1, 2.3, 2.5, 2.7, 2.8],
            dates: ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29'],
            category: 'moderate'
        },
        satellite_data: {
            ndvi: [0.6, 0.65, 0.7, 0.72, 0.75],
            evi: [0.4, 0.42, 0.45, 0.47, 0.48],
            imagery_dates: ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29'],
            quality: 'high'
        },
        recommendation: {
            apply_fertilizer: true,
            reasoning: 'LAI values indicate moderate vegetation density with positive growth trend. Fertilizer application would support continued healthy growth and optimize yield potential.',
            fertilizer_type: 'Balanced NPK (10-10-10)',
            application_rate: '150 kg/ha',
            timing: 'Early morning application recommended',
            method: 'Broadcast application',
            cost_estimate: '$45-60 per hectare'
        },
        confidence: 78,
        risk_factors: ['weather_dependent', 'soil_moisture'],
        next_analysis_date: '2024-02-12'
    };
    
    // Trigger the analysis completion event
    const event = new CustomEvent('analysisCompleted', {
        detail: sampleAnalysisData
    });
    document.dispatchEvent(event);
    
    console.log('Demo analysis data sent to chatbot:', sampleAnalysisData);
}

// Demo conversation starters
const demoQuestions = [
    "What does my LAI value mean?",
    "Should I apply fertilizer to my farm?",
    "How is the weather affecting my crops?",
    "What are the best practices for soil management?",
    "Can you explain my analysis results?",
    "How can I improve my crop health?",
    "What should I do next?",
    "Is my farm healthy?"
];

// Function to simulate a demo conversation
function startDemoConversation() {
    if (!window.agriculturalChatbot) {
        console.error('Chatbot not initialized yet. Please wait and try again.');
        return;
    }
    
    // Open the chatbot
    window.agriculturalChatbot.openChatbot();
    
    // Send demo analysis data
    demoChatbot();
    
    // Wait a bit then suggest a question
    setTimeout(() => {
        const randomQuestion = demoQuestions[Math.floor(Math.random() * demoQuestions.length)];
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.value = randomQuestion;
            input.focus();
            
            // Add a helpful message
            window.agriculturalChatbot.addMessage({
                type: 'bot',
                content: `💡 **Demo Mode Active!** I've loaded sample farm data. Try asking: "${randomQuestion}" or use the quick action buttons below!`,
                timestamp: new Date()
            });
        }
    }, 1000);
}

// Function to test different scenarios
function testChatbotScenarios() {
    const scenarios = [
        {
            name: 'High LAI Farm',
            data: {
                lai_data: { current_value: 5.2, trend: 'stable' },
                recommendation: { apply_fertilizer: false, reasoning: 'LAI values are already optimal' },
                confidence: 92
            }
        },
        {
            name: 'Low LAI Farm',
            data: {
                lai_data: { current_value: 0.8, trend: 'decreasing' },
                recommendation: { apply_fertilizer: true, reasoning: 'Low LAI indicates stress conditions' },
                confidence: 85
            }
        },
        {
            name: 'Drought Conditions',
            data: {
                weather_data: { recent_rainfall: 5, temperature_trend: 'increasing' },
                lai_data: { current_value: 1.5, trend: 'decreasing' },
                recommendation: { apply_fertilizer: false, reasoning: 'Address water stress first' },
                confidence: 70
            }
        }
    ];
    
    console.log('Available test scenarios:', scenarios.map(s => s.name));
    return scenarios;
}

// Add demo controls to the page
function addDemoControls() {
    // Only add if not already present
    if (document.getElementById('chatbotDemoControls')) {
        return;
    }
    
    const demoControls = document.createElement('div');
    demoControls.id = 'chatbotDemoControls';
    demoControls.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 250px;
    `;
    
    demoControls.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #28a745;">
            🤖 Chatbot Demo Controls
        </div>
        <button onclick="startDemoConversation()" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 5px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Start Demo Conversation</button>
        <button onclick="demoChatbot()" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 5px;
            background: #17a2b8;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Load Sample Data</button>
        <button onclick="document.getElementById('chatbotDemoControls').style.display='none'" style="
            width: 100%;
            padding: 8px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Hide Controls</button>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Use these controls to test the chatbot with sample farm data.
        </div>
    `;
    
    document.body.appendChild(demoControls);
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for chatbot to initialize
    setTimeout(() => {
        if (window.agriculturalChatbot) {
            console.log('Chatbot demo ready! Use startDemoConversation() to begin.');
            
            // Add demo controls in development mode
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                addDemoControls();
            }
        }
    }, 2000);
});

// Make functions globally available
window.demoChatbot = demoChatbot;
window.startDemoConversation = startDemoConversation;
window.testChatbotScenarios = testChatbotScenarios;

// Console helper
console.log(`
🌱 Agricultural Chatbot Demo Loaded!

Available functions:
- startDemoConversation() - Opens chatbot with sample data
- demoChatbot() - Loads sample analysis data
- testChatbotScenarios() - Shows available test scenarios

Try: startDemoConversation()
`);