#!/usr/bin/env python3
"""
Agricultural Chatbot Service
Provides intelligent responses based on farm analysis data and agricultural knowledge
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import re

logger = logging.getLogger(__name__)

class AgriculturalChatbotService:
    """
    AI-powered chatbot service for agricultural advice and analysis interpretation
    """
    
    def __init__(self):
        self.knowledge_base = self._load_agricultural_knowledge()
        self.conversation_context = {}
        
    def _load_agricultural_knowledge(self) -> Dict[str, Any]:
        """Load agricultural knowledge base for intelligent responses"""
        return {
            'lai_ranges': {
                'sparse': {'min': 0, 'max': 1, 'description': 'Sparse vegetation, early growth or stress'},
                'moderate': {'min': 1, 'max': 3, 'description': 'Moderate vegetation density'},
                'good': {'min': 3, 'max': 6, 'description': 'Healthy, dense vegetation'},
                'very_dense': {'min': 6, 'max': 10, 'description': 'Very dense vegetation, possible over-fertilization'}
            },
            'fertilizer_factors': [
                'Current LAI vs optimal range',
                'Soil nutrient levels',
                'Weather conditions',
                'Crop growth stage',
                'Historical yield data',
                'Environmental impact'
            ],
            'crop_health_indicators': {
                'excellent': {'lai_min': 4, 'description': 'Optimal growth conditions'},
                'good': {'lai_min': 2.5, 'description': 'Healthy development'},
                'fair': {'lai_min': 1.5, 'description': 'Adequate but could improve'},
                'poor': {'lai_min': 0, 'description': 'Needs immediate attention'}
            },
            'weather_impacts': {
                'high_rainfall': 'May delay fertilizer application, increase disease risk',
                'drought': 'Stress conditions, may need irrigation before fertilization',
                'optimal_temp': 'Good conditions for nutrient uptake and growth',
                'extreme_temp': 'Stress conditions, monitor closely'
            },
            'best_practices': {
                'soil_management': [
                    'Regular soil testing (annually)',
                    'Maintain proper pH levels (6.0-7.0 for most crops)',
                    'Add organic matter consistently',
                    'Practice conservation tillage'
                ],
                'nutrient_management': [
                    'Follow 4R principles (Right source, rate, time, place)',
                    'Use precision application techniques',
                    'Consider slow-release fertilizers',
                    'Monitor plant tissue nutrient levels'
                ],
                'water_management': [
                    'Use efficient irrigation methods',
                    'Monitor soil moisture levels',
                    'Implement water conservation techniques',
                    'Consider drought-resistant varieties'
                ]
            }
        }
    
    def process_message(self, message: str, analysis_data: Optional[Dict] = None, 
                       conversation_id: str = None) -> Dict[str, Any]:
        """
        Process user message and generate intelligent response
        
        Args:
            message: User's message
            analysis_data: Current farm analysis data
            conversation_id: Unique conversation identifier
            
        Returns:
            Dictionary containing response and metadata
        """
        try:
            # Store conversation context
            if conversation_id:
                if conversation_id not in self.conversation_context:
                    self.conversation_context[conversation_id] = []
                self.conversation_context[conversation_id].append({
                    'type': 'user',
                    'message': message,
                    'timestamp': datetime.utcnow()
                })
            
            # Analyze message intent
            intent = self._analyze_intent(message)
            
            # Generate response based on intent and available data
            response = self._generate_response(intent, message, analysis_data, conversation_id)
            
            # Store bot response in context
            if conversation_id:
                self.conversation_context[conversation_id].append({
                    'type': 'bot',
                    'message': response['content'],
                    'timestamp': datetime.utcnow()
                })
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing chatbot message: {str(e)}")
            return {
                'content': "I'm sorry, I'm having trouble processing your request. Please try again.",
                'intent': 'error',
                'confidence': 0,
                'suggestions': ['Try rephrasing your question', 'Check if analysis data is available']
            }
    
    def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze user message to determine intent"""
        message_lower = message.lower()
        
        # Define intent patterns
        intent_patterns = {
            'lai_question': [
                r'\blai\b', r'leaf area', r'vegetation', r'density', r'index'
            ],
            'fertilizer_question': [
                r'fertilizer', r'nutrient', r'npk', r'nitrogen', r'phosphorus', r'potassium'
            ],
            'weather_question': [
                r'weather', r'rain', r'temperature', r'climate', r'drought', r'moisture'
            ],
            'crop_health': [
                r'health', r'crop', r'plant', r'growth', r'condition'
            ],
            'recommendation': [
                r'recommend', r'advice', r'suggest', r'should i', r'what to do'
            ],
            'analysis_interpretation': [
                r'analysis', r'result', r'data', r'interpret', r'explain', r'mean'
            ],
            'best_practices': [
                r'best practice', r'tip', r'how to', r'improve', r'optimize'
            ],
            'general_help': [
                r'help', r'what can you', r'how do you', r'what do you'
            ]
        }
        
        # Calculate intent scores
        intent_scores = {}
        for intent, patterns in intent_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    score += 1
            intent_scores[intent] = score
        
        # Determine primary intent
        primary_intent = max(intent_scores, key=intent_scores.get) if max(intent_scores.values()) > 0 else 'general'
        confidence = intent_scores[primary_intent] / len(intent_patterns[primary_intent]) if primary_intent in intent_patterns else 0
        
        return {
            'primary': primary_intent,
            'confidence': min(confidence, 1.0),
            'all_scores': intent_scores
        }
    
    def _generate_response(self, intent: Dict, message: str, analysis_data: Optional[Dict], 
                          conversation_id: str) -> Dict[str, Any]:
        """Generate response based on intent and available data"""
        
        primary_intent = intent['primary']
        
        # Route to specific response generators
        if primary_intent == 'lai_question' and analysis_data:
            return self._generate_lai_response(analysis_data)
        elif primary_intent == 'fertilizer_question' and analysis_data:
            return self._generate_fertilizer_response(analysis_data)
        elif primary_intent == 'weather_question' and analysis_data:
            return self._generate_weather_response(analysis_data)
        elif primary_intent == 'crop_health' and analysis_data:
            return self._generate_crop_health_response(analysis_data)
        elif primary_intent == 'recommendation' and analysis_data:
            return self._generate_recommendation_response(analysis_data)
        elif primary_intent == 'analysis_interpretation' and analysis_data:
            return self._generate_analysis_interpretation(analysis_data)
        elif primary_intent == 'best_practices':
            return self._generate_best_practices_response(message)
        elif primary_intent == 'general_help':
            return self._generate_help_response()
        else:
            return self._generate_contextual_response(message, analysis_data, conversation_id)
    
    def _generate_lai_response(self, analysis_data: Dict) -> Dict[str, Any]:
        """Generate LAI-specific response"""
        lai_data = analysis_data.get('lai_data', {})
        current_lai = lai_data.get('current_value', 0)
        trend = lai_data.get('trend', 'stable')
        
        # Determine LAI category
        lai_category = self._categorize_lai(current_lai)
        lai_info = self.knowledge_base['lai_ranges'][lai_category]
        
        response = f"🌱 **LAI Analysis for Your Farm:**\n\n"
        response += f"**Current LAI:** {current_lai:.2f}\n"
        response += f"**Trend:** {trend.title()}\n"
        response += f"**Category:** {lai_category.title()} ({lai_info['description']})\n\n"
        
        # Add specific advice based on LAI value
        if lai_category == 'sparse':
            response += "🔴 **Action Needed:**\n"
            response += "• Check soil moisture levels\n"
            response += "• Consider fertilizer application\n"
            response += "• Monitor for pests or diseases\n"
            response += "• Evaluate irrigation needs"
        elif lai_category == 'moderate':
            response += "🟡 **Monitoring Recommended:**\n"
            response += "• Continue current management\n"
            response += "• Monitor growth progress\n"
            response += "• Prepare for peak season"
        elif lai_category == 'good':
            response += "🟢 **Excellent Conditions:**\n"
            response += "• Maintain current practices\n"
            response += "• Monitor for harvest timing\n"
            response += "• Consider yield optimization"
        else:
            response += "🔵 **Very Dense Vegetation:**\n"
            response += "• Check for over-fertilization\n"
            response += "• Ensure proper air circulation\n"
            response += "• Monitor disease pressure"
        
        return {
            'content': response,
            'intent': 'lai_analysis',
            'confidence': 0.9,
            'data_used': ['lai_data'],
            'suggestions': ['Ask about fertilizer recommendations', 'Check weather impact']
        }
    
    def _generate_fertilizer_response(self, analysis_data: Dict) -> Dict[str, Any]:
        """Generate fertilizer recommendation response"""
        recommendation = analysis_data.get('recommendation', {})
        confidence = analysis_data.get('confidence', 0)
        
        apply_fertilizer = recommendation.get('apply_fertilizer', False)
        reasoning = recommendation.get('reasoning', 'Analysis based on current conditions')
        
        response = f"🧪 **Fertilizer Recommendation:**\n\n"
        
        if apply_fertilizer:
            response += f"✅ **Recommendation: Apply Fertilizer**\n"
            response += f"**Confidence:** {confidence}%\n\n"
            response += f"**Reasoning:** {reasoning}\n\n"
            
            # Add detailed application guidance
            response += "**Application Guidelines:**\n"
            response += f"• **Type:** {recommendation.get('fertilizer_type', 'Balanced NPK (10-10-10)')}\n"
            response += f"• **Rate:** {recommendation.get('application_rate', '150-200 kg/ha')}\n"
            response += f"• **Timing:** {recommendation.get('timing', 'Early morning or late evening')}\n"
            response += f"• **Method:** {recommendation.get('method', 'Broadcast application')}\n\n"
            
            response += "**Important Considerations:**\n"
            response += "• Conduct soil test before application\n"
            response += "• Check weather forecast (avoid before heavy rain)\n"
            response += "• Follow local environmental guidelines\n"
            response += "• Monitor crop response after application"
        else:
            response += f"❌ **Recommendation: Skip Fertilizer**\n"
            response += f"**Confidence:** {confidence}%\n\n"
            response += f"**Reasoning:** {reasoning}\n\n"
            
            response += "**Alternative Actions:**\n"
            response += "• Continue monitoring crop health\n"
            response += "• Focus on water management\n"
            response += "• Consider organic matter addition\n"
            response += "• Plan for next growing season\n"
            response += "• Evaluate other limiting factors"
        
        return {
            'content': response,
            'intent': 'fertilizer_recommendation',
            'confidence': 0.95,
            'data_used': ['recommendation', 'confidence'],
            'suggestions': ['Ask about application timing', 'Check weather conditions']
        }
    
    def _generate_weather_response(self, analysis_data: Dict) -> Dict[str, Any]:
        """Generate weather impact response"""
        weather_data = analysis_data.get('weather_data', {})
        
        response = f"🌤️ **Weather Impact Analysis:**\n\n"
        
        # Analyze recent weather patterns
        if 'recent_rainfall' in weather_data:
            rainfall = weather_data['recent_rainfall']
            response += f"**Recent Rainfall:** {rainfall}mm\n"
            
            if rainfall > 50:
                response += "**Impact:** High moisture levels detected\n"
                response += "• May delay fertilizer application\n"
                response += "• Increased disease risk\n"
                response += "• Good for nutrient uptake if applied\n\n"
            elif rainfall < 10:
                response += "**Impact:** Low moisture conditions\n"
                response += "• Consider irrigation before fertilization\n"
                response += "• Monitor for drought stress\n"
                response += "• Fertilizer efficiency may be reduced\n\n"
            else:
                response += "**Impact:** Optimal moisture conditions\n"
                response += "• Good conditions for fertilizer application\n"
                response += "• Favorable for nutrient uptake\n\n"
        
        if 'temperature_trend' in weather_data:
            temp_trend = weather_data['temperature_trend']
            response += f"**Temperature Trend:** {temp_trend}\n"
            
            if temp_trend == 'increasing':
                response += "• Favorable for crop growth\n"
                response += "• Monitor water needs\n"
                response += "• Good fertilizer uptake conditions\n\n"
            elif temp_trend == 'decreasing':
                response += "• Slower nutrient uptake expected\n"
                response += "• Adjust application timing\n"
                response += "• Monitor for stress conditions\n\n"
        
        response += "**Weather-Based Recommendations:**\n"
        response += "• Check 7-day forecast before applications\n"
        response += "• Avoid fertilizing before heavy rain\n"
        response += "��� Consider temperature for application timing\n"
        response += "• Monitor soil moisture levels\n"
        response += "• Adjust irrigation schedule accordingly"
        
        return {
            'content': response,
            'intent': 'weather_analysis',
            'confidence': 0.85,
            'data_used': ['weather_data'],
            'suggestions': ['Check fertilizer timing', 'Monitor soil moisture']
        }
    
    def _generate_crop_health_response(self, analysis_data: Dict) -> Dict[str, Any]:
        """Generate crop health assessment response"""
        lai_data = analysis_data.get('lai_data', {})
        current_lai = lai_data.get('current_value', 0)
        
        # Determine health category
        health_category = self._assess_crop_health(current_lai)
        
        response = f"🌱 **Crop Health Assessment:**\n\n"
        
        if health_category == 'excellent':
            response += "✅ **Overall Health: Excellent**\n"
            response += "Your crops show optimal vegetation density and excellent growth patterns.\n\n"
            response += "**Indicators:**\n"
            response += f"• LAI: {current_lai:.2f} (Optimal range)\n"
            response += "• Dense, healthy vegetation\n"
            response += "• Good nutrient uptake\n"
            response += "• Favorable growing conditions\n\n"
        elif health_category == 'good':
            response += "🟢 **Overall Health: Good**\n"
            response += "Your crops show healthy development with room for optimization.\n\n"
            response += "**Indicators:**\n"
            response += f"• LAI: {current_lai:.2f} (Good range)\n"
            response += "• Healthy vegetation density\n"
            response += "• Adequate nutrient levels\n"
            response += "• Stable growth patterns\n\n"
        elif health_category == 'fair':
            response += "🟡 **Overall Health: Fair**\n"
            response += "Crops are developing but could benefit from additional care.\n\n"
            response += "**Indicators:**\n"
            response += f"• LAI: {current_lai:.2f} (Below optimal)\n"
            response += "• Moderate vegetation density\n"
            response += "• Potential for improvement\n"
            response += "• May need intervention\n\n"
        else:
            response += "🔴 **Overall Health: Needs Attention**\n"
            response += "Low vegetation density indicates stress or early growth stage.\n\n"
            response += "**Indicators:**\n"
            response += f"• LAI: {current_lai:.2f} (Low)\n"
            response += "• Sparse vegetation\n"
            response += "• Possible stress conditions\n"
            response += "• Immediate attention needed\n\n"
        
        response += "**Health Monitoring Checklist:**\n"
        response += "• ✓ Regular LAI monitoring\n"
        response += "• ✓ Soil moisture assessment\n"
        response += "• ✓ Nutrient level evaluation\n"
        response += "• ✓ Pest and disease inspection\n"
        response += "• ✓ Weather impact consideration\n\n"
        
        response += "**Warning Signs to Watch:**\n"
        response += "• Yellowing leaves (nutrient deficiency)\n"
        response += "• Wilting (water stress)\n"
        response += "• Stunted growth (multiple factors)\n"
        response += "• Unusual discoloration (disease/pests)"
        
        return {
            'content': response,
            'intent': 'crop_health',
            'confidence': 0.9,
            'data_used': ['lai_data'],
            'suggestions': ['Check specific nutrients', 'Monitor pest activity']
        }
    
    def _generate_recommendation_response(self, analysis_data: Dict) -> Dict[str, Any]:
        """Generate comprehensive recommendation response"""
        response = f"📈 **Comprehensive Farm Recommendations:**\n\n"
        
        # Extract key data
        lai_data = analysis_data.get('lai_data', {})
        recommendation = analysis_data.get('recommendation', {})
        area = analysis_data.get('area_hectares', 0)
        
        response += f"**Farm Overview:**\n"
        response += f"• Area: {area:.2f} hectares\n"
        response += f"• Current LAI: {lai_data.get('current_value', 0):.2f}\n"
        response += f"• Analysis Date: {datetime.now().strftime('%Y-%m-%d')}\n\n"
        
        response += "**Priority Actions:**\n"
        
        # Fertilizer recommendation
        if recommendation.get('apply_fertilizer'):
            response += "1. 🧪 **Apply Fertilizer** (High Priority)\n"
            response += f"   • Confidence: {analysis_data.get('confidence', 0)}%\n"
            response += f"   • Reasoning: {recommendation.get('reasoning', 'Based on analysis')}\n\n"
        else:
            response += "1. ⏸️ **Skip Fertilizer Application** (Current cycle)\n"
            response += f"   • Confidence: {analysis_data.get('confidence', 0)}%\n"
            response += f"   • Reasoning: {recommendation.get('reasoning', 'Current levels adequate')}\n\n"
        
        response += "2. 📊 **Continue Monitoring**\n"
        response += "   • Weekly LAI assessments\n"
        response += "   • Soil moisture checks\n"
        response += "   • Weather pattern tracking\n\n"
        
        response += "3. 🔍 **Next Analysis**\n"
        response += "   • Schedule: 2-3 weeks\n"
        response += "   • Focus: Growth progression\n"
        response += "   • Compare: Current vs. future trends\n\n"
        
        response += "**Long-term Strategy:**\n"
        response += "• Develop seasonal fertilization plan\n"
        response += "• Implement precision agriculture techniques\n"
        response += "• Build historical data for better predictions\n"
        response += "• Consider sustainable farming practices"
        
        return {
            'content': response,
            'intent': 'comprehensive_recommendation',
            'confidence': 0.95,
            'data_used': ['lai_data', 'recommendation', 'area_hectares'],
            'suggestions': ['Schedule next analysis', 'Review fertilizer options']
        }
    
    def _generate_analysis_interpretation(self, analysis_data: Dict) -> Dict[str, Any]:
        """Generate analysis interpretation response"""
        response = f"📊 **Analysis Results Interpretation:**\n\n"
        
        # Break down each component
        response += "**Data Components Analyzed:**\n\n"
        
        # LAI Analysis
        lai_data = analysis_data.get('lai_data', {})
        if lai_data:
            response += "🌿 **Vegetation Analysis (LAI):**\n"
            response += f"• Current Value: {lai_data.get('current_value', 0):.2f}\n"
            response += f"• Trend: {lai_data.get('trend', 'Unknown')}\n"
            response += f"• Interpretation: {self._interpret_lai_value(lai_data.get('current_value', 0))}\n\n"
        
        # Weather Analysis
        weather_data = analysis_data.get('weather_data', {})
        if weather_data:
            response += "🌤️ **Weather Conditions:**\n"
            response += f"• Recent Rainfall: {weather_data.get('recent_rainfall', 'N/A')}mm\n"
            response += f"• Temperature Trend: {weather_data.get('temperature_trend', 'N/A')}\n"
            response += f"• Impact: {self._interpret_weather_impact(weather_data)}\n\n"
        
        # Satellite Data
        satellite_data = analysis_data.get('satellite_data', {})
        if satellite_data:
            response += "🛰️ **Satellite Imagery:**\n"
            response += f"• NDVI Data: {'Available' if satellite_data.get('ndvi') else 'Limited'}\n"
            response += f"• EVI Data: {'Available' if satellite_data.get('evi') else 'Limited'}\n"
            response += f"• Image Quality: {self._assess_satellite_quality(satellite_data)}\n\n"
        
        # Final Recommendation
        recommendation = analysis_data.get('recommendation', {})
        if recommendation:
            response += "🎯 **AI Recommendation:**\n"
            response += f"• Action: {'Apply Fertilizer' if recommendation.get('apply_fertilizer') else 'Skip Fertilizer'}\n"
            response += f"• Confidence: {analysis_data.get('confidence', 0)}%\n"
            response += f"• Basis: {recommendation.get('reasoning', 'Multi-factor analysis')}\n\n"
        
        response += "**How to Use This Information:**\n"
        response += "1. Review each component individually\n"
        response += "2. Consider the integrated recommendation\n"
        response += "3. Factor in local knowledge and conditions\n"
        response += "4. Make informed decisions based on confidence levels\n"
        response += "5. Plan follow-up monitoring and analysis"
        
        return {
            'content': response,
            'intent': 'analysis_interpretation',
            'confidence': 0.9,
            'data_used': ['all_available'],
            'suggestions': ['Ask about specific components', 'Request detailed explanations']
        }
    
    def _generate_best_practices_response(self, message: str) -> Dict[str, Any]:
        """Generate best practices response"""
        message_lower = message.lower()
        
        if 'soil' in message_lower:
            practices = self.knowledge_base['best_practices']['soil_management']
            title = "Soil Management"
            icon = "🌱"
        elif 'water' in message_lower or 'irrigation' in message_lower:
            practices = self.knowledge_base['best_practices']['water_management']
            title = "Water Management"
            icon = "💧"
        elif 'nutrient' in message_lower or 'fertilizer' in message_lower:
            practices = self.knowledge_base['best_practices']['nutrient_management']
            title = "Nutrient Management"
            icon = "🧪"
        else:
            # General best practices
            response = f"🌟 **Agricultural Best Practices:**\n\n"
            
            for category, practices in self.knowledge_base['best_practices'].items():
                category_title = category.replace('_', ' ').title()
                response += f"**{category_title}:**\n"
                for practice in practices:
                    response += f"• {practice}\n"
                response += "\n"
            
            response += "**Additional Tips:**\n"
            response += "• Keep detailed records of all activities\n"
            response += "• Stay updated with latest research\n"
            response += "• Network with other farmers\n"
            response += "• Consider environmental impact\n"
            response += "• Invest in continuous learning"
            
            return {
                'content': response,
                'intent': 'best_practices',
                'confidence': 0.8,
                'suggestions': ['Ask about specific practices', 'Request implementation guidance']
            }
        
        response = f"{icon} **{title} Best Practices:**\n\n"
        for i, practice in enumerate(practices, 1):
            response += f"{i}. {practice}\n"
        
        response += f"\n**Implementation Tips:**\n"
        response += "• Start with one practice at a time\n"
        response += "• Monitor results and adjust accordingly\n"
        response += "• Seek expert advice when needed\n"
        response += "• Document your experiences\n"
        response += "• Share knowledge with other farmers"
        
        return {
            'content': response,
            'intent': 'best_practices',
            'confidence': 0.85,
            'suggestions': ['Ask about implementation', 'Request specific guidance']
        }
    
    def _generate_help_response(self) -> Dict[str, Any]:
        """Generate help response"""
        response = f"🤖 **Agricultural AI Assistant Help:**\n\n"
        response += "I'm here to help you understand your farm analysis and provide expert agricultural advice!\n\n"
        
        response += "**What I Can Help With:**\n"
        response += "• 📊 Interpret LAI (Leaf Area Index) values\n"
        response += "• 🧪 Explain fertilizer recommendations\n"
        response += "• 🌤️ Analyze weather impact on crops\n"
        response += "• 🌱 Assess crop health conditions\n"
        response += "• 📈 Provide comprehensive farm analysis\n"
        response += "• 💡 Share agricultural best practices\n"
        response += "• 🎯 Give personalized recommendations\n\n"
        
        response += "**How to Get the Best Help:**\n"
        response += "1. Run a farm analysis first for data-driven advice\n"
        response += "2. Ask specific questions about your results\n"
        response += "3. Use the quick action buttons for common topics\n"
        response += "4. Provide context about your farming situation\n"
        response += "5. Ask follow-up questions for clarification\n\n"
        
        response += "**Example Questions:**\n"
        response += "• \"What does my LAI value mean?\"\n"
        response += "• \"Should I apply fertilizer to my farm?\"\n"
        response += "• \"How is the weather affecting my crops?\"\n"
        response += "• \"What are the best practices for soil management?\"\n"
        response += "• \"How can I improve my crop health?\"\n\n"
        
        response += "Ready to help! What would you like to know about your farm? 🌾"
        
        return {
            'content': response,
            'intent': 'help',
            'confidence': 1.0,
            'suggestions': ['Run farm analysis', 'Ask about LAI', 'Check fertilizer advice']
        }
    
    def _generate_contextual_response(self, message: str, analysis_data: Optional[Dict], 
                                    conversation_id: str) -> Dict[str, Any]:
        """Generate contextual response based on conversation history"""
        
        # Check if analysis data is available
        if not analysis_data:
            response = "To provide the most accurate advice, I need farm analysis data. "
            response += "Please select a farm area on the map and run an analysis first. "
            response += "Once you have analysis results, I can give you detailed, data-driven recommendations!\n\n"
            response += "In the meantime, I can help with general agricultural questions or best practices. "
            response += "What would you like to know?"
            
            return {
                'content': response,
                'intent': 'no_data_available',
                'confidence': 0.7,
                'suggestions': ['Run farm analysis', 'Ask general questions', 'Learn about LAI']
            }
        
        # Generic helpful response with analysis data
        response = "I understand you're asking about your farm. Based on your current analysis data, "
        response += f"your farm shows a LAI of {analysis_data.get('lai_data', {}).get('current_value', 0):.2f}. "
        
        if analysis_data.get('recommendation', {}).get('apply_fertilizer'):
            response += "The AI recommends applying fertilizer. "
        else:
            response += "The AI suggests skipping fertilizer for now. "
        
        response += f"The confidence level is {analysis_data.get('confidence', 0)}%.\n\n"
        response += "Could you be more specific about what aspect you'd like me to explain? "
        response += "I can help with LAI interpretation, fertilizer decisions, weather impacts, or general recommendations."
        
        return {
            'content': response,
            'intent': 'contextual',
            'confidence': 0.6,
            'suggestions': ['Ask about LAI', 'Check fertilizer advice', 'Weather impact']
        }
    
    # Helper methods
    def _categorize_lai(self, lai_value: float) -> str:
        """Categorize LAI value"""
        for category, info in self.knowledge_base['lai_ranges'].items():
            if info['min'] <= lai_value < info['max']:
                return category
        return 'very_dense' if lai_value >= 6 else 'sparse'
    
    def _assess_crop_health(self, lai_value: float) -> str:
        """Assess crop health based on LAI"""
        if lai_value >= 4:
            return 'excellent'
        elif lai_value >= 2.5:
            return 'good'
        elif lai_value >= 1.5:
            return 'fair'
        else:
            return 'poor'
    
    def _interpret_lai_value(self, lai_value: float) -> str:
        """Interpret LAI value"""
        category = self._categorize_lai(lai_value)
        return self.knowledge_base['lai_ranges'][category]['description']
    
    def _interpret_weather_impact(self, weather_data: Dict) -> str:
        """Interpret weather impact"""
        rainfall = weather_data.get('recent_rainfall', 0)
        if rainfall > 50:
            return "High moisture, may delay applications"
        elif rainfall < 10:
            return "Low moisture, consider irrigation"
        else:
            return "Optimal conditions for applications"
    
    def _assess_satellite_quality(self, satellite_data: Dict) -> str:
        """Assess satellite data quality"""
        if satellite_data.get('ndvi') and satellite_data.get('evi'):
            return "High quality, comprehensive data"
        elif satellite_data.get('ndvi') or satellite_data.get('evi'):
            return "Good quality, partial data"
        else:
            return "Limited data available"