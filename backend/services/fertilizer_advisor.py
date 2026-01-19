"""
Fertilizer Advisor Service
Provides intelligent fertilizer recommendations based on LAI, weather, and soil data
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class FertilizerRecommendation:
    """Data class for fertilizer recommendations"""
    needs_fertilizer: bool
    confidence: float
    reasoning: str
    fertilizer_type: Optional[str] = None
    application_rate: Optional[float] = None
    timing: Optional[str] = None
    expected_benefit: Optional[str] = None

class FertilizerAdvisor:
    """Service for generating fertilizer recommendations"""
    
    def __init__(self):
        self.lai_thresholds = {
            'critical': 1.5,
            'low': 2.5,
            'optimal': 4.0,
            'high': 6.0
        }
        
        self.soil_nutrient_thresholds = {
            'nitrogen': {'low': 50, 'optimal': 80, 'high': 120},
            'phosphorus': {'low': 30, 'optimal': 50, 'high': 80},
            'potassium': {'low': 40, 'optimal': 70, 'high': 100}
        }
    
    def analyze_and_recommend(self, lai_data: List[Dict], weather_data: List[Dict],
                            satellite_data: Dict, farm_bounds: Dict) -> Dict:
        """
        Generate comprehensive fertilizer recommendation
        
        Args:
            lai_data: Time series LAI data
            weather_data: Weather history and forecast
            satellite_data: Satellite imagery analysis
            farm_bounds: Farm boundary coordinates
            
        Returns:
            Dictionary with fertilizer recommendation
        """
        logger.info("Generating fertilizer recommendation")
        
        try:
            # Analyze current vegetation status
            vegetation_analysis = self._analyze_vegetation_status(lai_data)
            
            # Analyze weather conditions
            weather_analysis = self._analyze_weather_conditions(weather_data)
            
            # Analyze soil conditions (simulated from satellite data)
            soil_analysis = self._analyze_soil_conditions(satellite_data, weather_data)
            
            # Generate recommendation
            recommendation = self._generate_recommendation(
                vegetation_analysis, weather_analysis, soil_analysis
            )
            
            return {
                'needs_fertilizer': recommendation.needs_fertilizer,
                'confidence': recommendation.confidence,
                'reasoning': recommendation.reasoning,
                'fertilizer_type': recommendation.fertilizer_type,
                'application_rate': recommendation.application_rate,
                'timing': recommendation.timing,
                'expected_benefit': recommendation.expected_benefit,
                'analysis_details': {
                    'vegetation': vegetation_analysis,
                    'weather': weather_analysis,
                    'soil': soil_analysis
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating fertilizer recommendation: {str(e)}")
            return self._get_fallback_recommendation()
    
    def _analyze_vegetation_status(self, lai_data: List[Dict]) -> Dict:
        """Analyze vegetation health from LAI data"""
        if not lai_data:
            return {'status': 'no_data', 'current_lai': 0, 'trend': 'unknown'}
        
        # Get current and recent LAI values
        current_lai = lai_data[-1]['lai']
        recent_lai = [item['lai'] for item in lai_data[-7:]]  # Last 7 measurements
        mean_recent_lai = np.mean(recent_lai)
        
        # Calculate trend
        if len(lai_data) >= 3:
            recent_values = [item['lai'] for item in lai_data[-3:]]
            trend_slope = np.polyfit(range(len(recent_values)), recent_values, 1)[0]
            
            if trend_slope > 0.1:
                trend = 'increasing'
            elif trend_slope < -0.1:
                trend = 'decreasing'
            else:
                trend = 'stable'
        else:
            trend = 'unknown'
        
        # Classify vegetation health
        if current_lai < self.lai_thresholds['critical']:
            health_status = 'critical'
            health_score = 20
        elif current_lai < self.lai_thresholds['low']:
            health_status = 'poor'
            health_score = 40
        elif current_lai < self.lai_thresholds['optimal']:
            health_status = 'moderate'
            health_score = 60
        elif current_lai < self.lai_thresholds['high']:
            health_status = 'good'
            health_score = 80
        else:
            health_status = 'excellent'
            health_score = 95
        
        return {
            'status': health_status,
            'health_score': health_score,
            'current_lai': round(current_lai, 3),
            'mean_recent_lai': round(mean_recent_lai, 3),
            'trend': trend,
            'variability': round(np.std(recent_lai), 3),
            'needs_attention': current_lai < self.lai_thresholds['low']
        }
    
    def _analyze_weather_conditions(self, weather_data: List[Dict]) -> Dict:
        """Analyze weather conditions for fertilizer application"""
        if not weather_data:
            return {'status': 'no_data'}
        
        # Recent weather (last 7 days)
        recent_weather = weather_data[-7:]
        
        # Calculate weather metrics
        recent_rainfall = sum(day.get('rainfall', 0) for day in recent_weather)
        avg_temperature = np.mean([day.get('temperature', 20) for day in recent_weather])
        avg_humidity = np.mean([day.get('humidity', 50) for day in recent_weather])
        
        # Forecast conditions (simulate next 7 days)
        forecast_rainfall = self._simulate_weather_forecast(weather_data)
        
        # Assess fertilizer application conditions
        application_conditions = self._assess_application_conditions(
            recent_rainfall, forecast_rainfall, avg_temperature, avg_humidity
        )
        
        return {
            'recent_rainfall': round(recent_rainfall, 1),
            'forecast_rainfall': round(forecast_rainfall, 1),
            'avg_temperature': round(avg_temperature, 1),
            'avg_humidity': round(avg_humidity, 1),
            'application_conditions': application_conditions,
            'optimal_timing': self._get_optimal_timing(application_conditions)
        }
    
    def _analyze_soil_conditions(self, satellite_data: Dict, weather_data: List[Dict]) -> Dict:
        """Analyze soil conditions from satellite and weather data"""
        
        # Simulate soil analysis from available data
        # In production, this would use actual soil sensor data or soil maps
        
        # Estimate soil moisture from recent rainfall and temperature
        recent_rainfall = sum(day.get('rainfall', 0) for day in weather_data[-7:])
        avg_temp = np.mean([day.get('temperature', 20) for day in weather_data[-7:]])
        
        # Soil moisture estimation
        base_moisture = min(80, recent_rainfall * 3)
        temp_adjustment = max(0, (25 - avg_temp) * 2)
        soil_moisture = max(10, base_moisture + temp_adjustment + np.random.normal(0, 5))
        
        # Simulate nutrient levels based on vegetation health
        current_ndvi = np.mean(satellite_data.get('ndvi', [0.5]))
        
        # Lower NDVI might indicate nutrient deficiency
        nitrogen_level = 40 + current_ndvi * 60 + np.random.normal(0, 10)
        phosphorus_level = 25 + current_ndvi * 45 + np.random.normal(0, 8)
        potassium_level = 35 + current_ndvi * 50 + np.random.normal(0, 12)
        
        return {
            'moisture': round(max(0, min(100, soil_moisture)), 1),
            'nitrogen': round(max(0, nitrogen_level), 1),
            'phosphorus': round(max(0, phosphorus_level), 1),
            'potassium': round(max(0, potassium_level), 1),
            'ph': round(6.0 + np.random.normal(0, 0.5), 1),
            'organic_matter': round(2.0 + np.random.normal(0, 0.8), 1)
        }
    
    def _generate_recommendation(self, vegetation_analysis: Dict, 
                               weather_analysis: Dict, soil_analysis: Dict) -> FertilizerRecommendation:
        """Generate final fertilizer recommendation"""
        
        # Decision factors
        factors = []
        confidence_score = 70  # Base confidence
        needs_fertilizer = False
        
        # Vegetation health factor
        if vegetation_analysis['current_lai'] < self.lai_thresholds['low']:
            needs_fertilizer = True
            factors.append(f"Low LAI ({vegetation_analysis['current_lai']}) indicates poor vegetation health")
            confidence_score += 15
        elif vegetation_analysis['current_lai'] < self.lai_thresholds['optimal']:
            needs_fertilizer = True
            factors.append(f"Moderate LAI ({vegetation_analysis['current_lai']}) suggests room for improvement")
            confidence_score += 10
        else:
            factors.append(f"Good LAI ({vegetation_analysis['current_lai']}) indicates healthy vegetation")
            confidence_score += 5
        
        # Soil nutrient factors
        soil_factors = []
        if soil_analysis.get('nitrogen', 0) < self.soil_nutrient_thresholds['nitrogen']['low']:
            needs_fertilizer = True
            soil_factors.append("low nitrogen")
            confidence_score += 12
        
        if soil_analysis.get('phosphorus', 0) < self.soil_nutrient_thresholds['phosphorus']['low']:
            needs_fertilizer = True
            soil_factors.append("low phosphorus")
            confidence_score += 8
        
        if soil_factors:
            factors.append(f"Soil analysis shows {', '.join(soil_factors)}")
        
        # Weather factors
        if weather_analysis.get('recent_rainfall', 0) > 20:
            factors.append("Recent rainfall provides good conditions for nutrient uptake")
            confidence_score += 8
        elif weather_analysis.get('recent_rainfall', 0) < 5:
            factors.append("Low recent rainfall may reduce fertilizer effectiveness")
            confidence_score -= 5
        
        # Trend analysis
        if vegetation_analysis.get('trend') == 'decreasing':
            needs_fertilizer = True
            factors.append("Declining vegetation trend suggests intervention needed")
            confidence_score += 10
        
        # Override for excellent vegetation
        if vegetation_analysis['current_lai'] > self.lai_thresholds['high']:
            needs_fertilizer = False
            factors.append("Excellent vegetation health - fertilizer may not be necessary")
            confidence_score = max(confidence_score, 80)
        
        # Determine fertilizer type and rate
        fertilizer_type, application_rate = self._determine_fertilizer_type(soil_analysis)
        
        # Generate reasoning
        reasoning = ". ".join(factors) + "."
        
        # Determine timing
        timing = self._determine_application_timing(weather_analysis)
        
        # Expected benefit
        expected_benefit = self._calculate_expected_benefit(
            vegetation_analysis, needs_fertilizer
        )
        
        return FertilizerRecommendation(
            needs_fertilizer=needs_fertilizer,
            confidence=min(95, max(50, confidence_score)),
            reasoning=reasoning,
            fertilizer_type=fertilizer_type if needs_fertilizer else None,
            application_rate=application_rate if needs_fertilizer else None,
            timing=timing if needs_fertilizer else None,
            expected_benefit=expected_benefit
        )
    
    def _determine_fertilizer_type(self, soil_analysis: Dict) -> tuple:
        """Determine appropriate fertilizer type and application rate"""
        
        nitrogen = soil_analysis.get('nitrogen', 60)
        phosphorus = soil_analysis.get('phosphorus', 40)
        potassium = soil_analysis.get('potassium', 50)
        
        # Determine primary deficiency
        n_deficit = max(0, self.soil_nutrient_thresholds['nitrogen']['optimal'] - nitrogen)
        p_deficit = max(0, self.soil_nutrient_thresholds['phosphorus']['optimal'] - phosphorus)
        k_deficit = max(0, self.soil_nutrient_thresholds['potassium']['optimal'] - potassium)
        
        if n_deficit > p_deficit and n_deficit > k_deficit:
            fertilizer_type = "Nitrogen-rich (e.g., Urea 46-0-0)"
            rate = min(150, 50 + n_deficit * 2)
        elif p_deficit > k_deficit:
            fertilizer_type = "Phosphorus-rich (e.g., DAP 18-46-0)"
            rate = min(100, 30 + p_deficit * 1.5)
        elif k_deficit > 10:
            fertilizer_type = "Potassium-rich (e.g., MOP 0-0-60)"
            rate = min(120, 40 + k_deficit * 1.8)
        else:
            fertilizer_type = "Balanced NPK (e.g., 15-15-15)"
            rate = 75
        
        return fertilizer_type, round(rate, 0)
    
    def _determine_application_timing(self, weather_analysis: Dict) -> str:
        """Determine optimal timing for fertilizer application"""
        
        conditions = weather_analysis.get('application_conditions', {})
        
        if conditions.get('immediate_suitable', False):
            return "Apply immediately - conditions are optimal"
        elif conditions.get('suitable_in_days', 0) <= 3:
            return f"Apply in {conditions.get('suitable_in_days', 1-2)} days when conditions improve"
        else:
            return "Wait for better weather conditions (less wind, moderate rainfall expected)"
    
    def _calculate_expected_benefit(self, vegetation_analysis: Dict, needs_fertilizer: bool) -> str:
        """Calculate expected benefit from fertilizer application"""
        
        if not needs_fertilizer:
            return "No significant benefit expected - vegetation is already healthy"
        
        current_lai = vegetation_analysis.get('current_lai', 0)
        
        if current_lai < 1.5:
            return "Significant improvement expected - LAI could increase by 1.0-2.0 points"
        elif current_lai < 2.5:
            return "Moderate improvement expected - LAI could increase by 0.5-1.0 points"
        else:
            return "Minor improvement expected - LAI could increase by 0.2-0.5 points"
    
    def _assess_application_conditions(self, recent_rainfall: float, forecast_rainfall: float,
                                     avg_temperature: float, avg_humidity: float) -> Dict:
        """Assess weather conditions for fertilizer application"""
        
        # Ideal conditions: moderate rainfall, moderate temperature, good humidity
        conditions = {
            'temperature_suitable': 10 <= avg_temperature <= 30,
            'rainfall_suitable': 5 <= recent_rainfall <= 25,
            'humidity_suitable': avg_humidity >= 40,
            'forecast_favorable': 2 <= forecast_rainfall <= 15
        }
        
        suitable_count = sum(conditions.values())
        
        return {
            **conditions,
            'overall_suitability': suitable_count / len(conditions),
            'immediate_suitable': suitable_count >= 3,
            'suitable_in_days': 1 if suitable_count >= 2 else 3
        }
    
    def _simulate_weather_forecast(self, weather_data: List[Dict]) -> float:
        """Simulate weather forecast for next 7 days"""
        if not weather_data:
            return 10.0
        
        # Use recent patterns to simulate forecast
        recent_rainfall = [day.get('rainfall', 0) for day in weather_data[-7:]]
        avg_recent = np.mean(recent_rainfall)
        
        # Add some randomness for forecast
        forecast = avg_recent + np.random.normal(0, 5)
        return max(0, forecast)
    
    def _get_optimal_timing(self, conditions: Dict) -> str:
        """Get optimal timing recommendation"""
        if conditions.get('immediate_suitable', False):
            return "Immediate application recommended"
        else:
            return "Wait 1-3 days for better conditions"
    
    def _get_fallback_recommendation(self) -> Dict:
        """Provide fallback recommendation when analysis fails"""
        return {
            'needs_fertilizer': False,
            'confidence': 50,
            'reasoning': "Unable to complete full analysis. Manual inspection recommended.",
            'fertilizer_type': None,
            'application_rate': None,
            'timing': None,
            'expected_benefit': "Analysis incomplete",
            'analysis_details': {
                'vegetation': {'status': 'unknown'},
                'weather': {'status': 'no_data'},
                'soil': {'status': 'no_data'}
            }
        }