"""
Water Stress Advisor Service
Provides intelligent irrigation recommendations based on hydrological modeling,
soil water content, and stress thresholds following FAO-56 methodology
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class WaterStressRecommendation:
    """Data class for water stress recommendations"""
    needs_irrigation: bool
    confidence: float
    reasoning: str
    irrigation_type: Optional[str] = None
    water_amount: Optional[float] = None  # mm
    timing: Optional[str] = None
    expected_benefit: Optional[str] = None
    stress_level: Optional[str] = None
    soil_moisture_deficit: Optional[float] = None

class WaterStressAdvisor:
    """Service for generating irrigation recommendations based on water stress analysis"""
    
    def __init__(self):
        # FAO-56 parameters for asparagus (can be extended for other crops)
        self.crop_parameters = {
            'asparagus': {
                'p': 0.65,  # Depletion fraction (corrected for climate as per FAO-56)
                'field_capacity': 0.35,  # Typical field capacity for medium soil
                'wilting_point': 0.15,   # Typical wilting point for medium soil
                'rooting_depth': 1.2,    # meters
                'kc_values': {           # Crop coefficients by growth stage
                    'initial': 0.5,
                    'development': 0.8,
                    'mid_season': 1.15,
                    'late_season': 1.0
                }
            }
        }
        
        # Soil type parameters
        self.soil_types = {
            'sandy': {
                'field_capacity': 0.25,
                'wilting_point': 0.10,
                'infiltration_rate': 25  # mm/hour
            },
            'loamy': {
                'field_capacity': 0.35,
                'wilting_point': 0.15,
                'infiltration_rate': 15  # mm/hour
            },
            'clay': {
                'field_capacity': 0.45,
                'wilting_point': 0.20,
                'infiltration_rate': 5   # mm/hour
            }
        }
        
        # Weather forecast horizon (72 hours as specified)
        self.forecast_horizon = 72  # hours
    
    def analyze_water_stress(self, lai_data: List[Dict], weather_data: List[Dict],
                           satellite_data: Dict, farm_bounds: Dict, 
                           crop_type: str = 'asparagus', soil_type: str = 'loamy') -> Dict:
        """
        Analyze water stress and generate irrigation recommendation following the specified procedure:
        1) Run hydrological model with 72h meteorological forecasts
        2) Compare forecasted soil moisture with stress threshold
        3) Trigger irrigation if needed
        
        Args:
            lai_data: Time series LAI data
            weather_data: Weather history and forecast
            satellite_data: Satellite imagery analysis
            farm_bounds: Farm boundary coordinates
            crop_type: Type of crop (default: asparagus)
            soil_type: Soil type (sandy, loamy, clay)
            
        Returns:
            Dictionary with water stress analysis and irrigation recommendation
        """
        logger.info("Analyzing water stress and irrigation needs")
        
        try:
            # Step 1: Initialize hydrological model with current conditions
            initial_conditions = self._get_initial_conditions(lai_data, weather_data, satellite_data)
            
            # Step 2: Calculate stress threshold using FAO-56 methodology
            stress_threshold = self._calculate_stress_threshold(crop_type, soil_type)
            
            # Step 3: Run hydrological model with 72h forecast
            soil_moisture_forecast = self._run_hydrological_model(
                initial_conditions, weather_data, crop_type, soil_type
            )
            
            # Step 4: Compare forecasted soil moisture with stress threshold
            stress_analysis = self._analyze_stress_conditions(
                soil_moisture_forecast, stress_threshold, crop_type, soil_type
            )
            
            # Step 5: Generate irrigation recommendation
            recommendation = self._generate_irrigation_recommendation(
                stress_analysis, initial_conditions, weather_data, crop_type, soil_type
            )
            
            return {
                'needs_irrigation': recommendation.needs_irrigation,
                'confidence': recommendation.confidence,
                'reasoning': recommendation.reasoning,
                'irrigation_type': recommendation.irrigation_type,
                'water_amount': recommendation.water_amount,
                'timing': recommendation.timing,
                'expected_benefit': recommendation.expected_benefit,
                'stress_level': recommendation.stress_level,
                'soil_moisture_deficit': recommendation.soil_moisture_deficit,
                'analysis_details': {
                    'initial_conditions': initial_conditions,
                    'stress_threshold': stress_threshold,
                    'soil_moisture_forecast': soil_moisture_forecast,
                    'stress_analysis': stress_analysis,
                    'crop_parameters': self.crop_parameters.get(crop_type, {}),
                    'soil_parameters': self.soil_types.get(soil_type, {})
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing water stress: {str(e)}")
            return self._get_fallback_recommendation()
    
    def _get_initial_conditions(self, lai_data: List[Dict], weather_data: List[Dict], 
                              satellite_data: Dict) -> Dict:
        """
        Get initial conditions for hydrological model:
        i) soil water content from previous days
        ii) vegetation and albedo parameters from LANDSAT data
        """
        if not weather_data or not lai_data:
            return self._get_default_initial_conditions()
        
        # Calculate current soil water content from recent weather
        recent_weather = weather_data[-7:]  # Last 7 days
        total_rainfall = sum(day.get('rainfall', 0) for day in recent_weather)
        avg_temperature = np.mean([day.get('temperature', 20) for day in recent_weather])
        avg_humidity = np.mean([day.get('humidity', 50) for day in recent_weather])
        
        # Estimate soil water content (simplified model)
        # In production, this would come from FEST-EWB simulation
        base_moisture = min(0.4, total_rainfall * 0.01)  # Convert mm to fraction
        evaporation_loss = max(0, (avg_temperature - 15) * 0.005)
        humidity_factor = avg_humidity / 100 * 0.1
        
        current_soil_moisture = max(0.1, base_moisture - evaporation_loss + humidity_factor)
        
        # Get vegetation parameters from LAI/NDVI data
        current_lai = lai_data[-1]['lai'] if lai_data else 2.0
        current_ndvi = np.mean(satellite_data.get('ndvi', [0.5]))
        
        # Estimate albedo from NDVI (simplified relationship)
        albedo = 0.23 - 0.15 * current_ndvi  # Typical relationship for vegetation
        
        return {
            'soil_water_content': round(current_soil_moisture, 3),
            'lai': round(current_lai, 2),
            'ndvi': round(current_ndvi, 3),
            'albedo': round(max(0.1, min(0.4, albedo)), 3),
            'root_zone_depth': 1.2,  # meters for asparagus
            'last_irrigation': None,  # Would be tracked in production
            'days_since_rain': self._calculate_days_since_rain(weather_data)
        }
    
    def _calculate_stress_threshold(self, crop_type: str, soil_type: str) -> Dict:
        """
        Calculate stress threshold using FAO-56 methodology:
        RAW = p * TAW
        θcrit = field_capacity - p * (field_capacity - wilting_point)
        """
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        
        field_capacity = soil_params['field_capacity']
        wilting_point = soil_params['wilting_point']
        p = crop_params['p']  # 0.65 for asparagus (corrected for climate)
        
        # Calculate Total Available Water (TAW)
        TAW = field_capacity - wilting_point
        
        # Calculate Readily Available Water (RAW)
        RAW = p * TAW
        
        # Calculate critical soil moisture threshold
        theta_crit = field_capacity - RAW
        
        # Surplus threshold (field capacity)
        surplus_threshold = field_capacity
        
        return {
            'theta_critical': round(theta_crit, 3),
            'field_capacity': field_capacity,
            'wilting_point': wilting_point,
            'TAW': round(TAW, 3),
            'RAW': round(RAW, 3),
            'surplus_threshold': surplus_threshold,
            'depletion_fraction_p': p
        }
    
    def _run_hydrological_model(self, initial_conditions: Dict, weather_data: List[Dict],
                              crop_type: str, soil_type: str) -> List[Dict]:
        """
        Run hydrological model with 72h meteorological forecasts
        Simulates FEST-EWB model behavior
        """
        # Generate 72-hour weather forecast
        forecast = self._generate_weather_forecast(weather_data)
        
        # Initialize model state
        current_moisture = initial_conditions['soil_water_content']
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        
        forecast_results = []
        
        for hour in range(self.forecast_horizon):
            # Get hourly weather data
            day_index = hour // 24
            if day_index < len(forecast):
                weather = forecast[day_index]
            else:
                weather = forecast[-1]  # Use last available forecast
            
            # Calculate water balance components
            precipitation = weather.get('rainfall', 0) / 24  # mm/hour
            temperature = weather.get('temperature', 20)
            humidity = weather.get('humidity', 50)
            
            # Estimate evapotranspiration (simplified Penman-Monteith)
            et0 = self._calculate_reference_et(temperature, humidity)
            crop_et = et0 * crop_params['kc_values']['mid_season']  # Simplified
            
            # Water balance equation
            infiltration = min(precipitation, soil_params['infiltration_rate'])
            runoff = max(0, precipitation - infiltration)
            
            # Update soil moisture
            moisture_change = (infiltration - crop_et) / 1000  # Convert mm to fraction
            current_moisture = max(soil_params['wilting_point'], 
                                 min(soil_params['field_capacity'], 
                                     current_moisture + moisture_change))
            
            forecast_results.append({
                'hour': hour,
                'datetime': datetime.now() + timedelta(hours=hour),
                'soil_moisture': round(current_moisture, 3),
                'precipitation': round(precipitation, 2),
                'evapotranspiration': round(crop_et, 2),
                'temperature': temperature,
                'humidity': humidity
            })
        
        return forecast_results
    
    def _analyze_stress_conditions(self, soil_moisture_forecast: List[Dict], 
                                 stress_threshold: Dict, crop_type: str, soil_type: str) -> Dict:
        """
        Compare forecasted soil moisture with stress threshold at every time step
        """
        theta_crit = stress_threshold['theta_critical']
        stress_events = []
        stress_hours = 0
        min_moisture = float('inf')
        max_deficit = 0
        
        for forecast in soil_moisture_forecast:
            soil_moisture = forecast['soil_moisture']
            min_moisture = min(min_moisture, soil_moisture)
            
            if soil_moisture < theta_crit:
                deficit = theta_crit - soil_moisture
                max_deficit = max(max_deficit, deficit)
                stress_events.append({
                    'hour': forecast['hour'],
                    'datetime': forecast['datetime'],
                    'soil_moisture': soil_moisture,
                    'deficit': round(deficit, 3),
                    'stress_severity': self._classify_stress_severity(deficit, stress_threshold)
                })
                stress_hours += 1
        
        # Calculate stress metrics
        stress_percentage = (stress_hours / len(soil_moisture_forecast)) * 100
        
        return {
            'stress_events': stress_events,
            'stress_hours': stress_hours,
            'stress_percentage': round(stress_percentage, 1),
            'min_forecasted_moisture': round(min_moisture, 3),
            'max_deficit': round(max_deficit, 3),
            'irrigation_triggered': stress_hours > 0,
            'urgency_level': self._determine_urgency_level(stress_percentage, max_deficit)
        }
    
    def _generate_irrigation_recommendation(self, stress_analysis: Dict, initial_conditions: Dict,
                                          weather_data: List[Dict], crop_type: str, 
                                          soil_type: str) -> WaterStressRecommendation:
        """Generate final irrigation recommendation"""
        
        needs_irrigation = stress_analysis['irrigation_triggered']
        confidence_score = 70  # Base confidence
        
        # Build reasoning factors
        factors = []
        
        if needs_irrigation:
            stress_hours = stress_analysis['stress_hours']
            max_deficit = stress_analysis['max_deficit']
            urgency = stress_analysis['urgency_level']
            
            factors.append(f"Water stress detected for {stress_hours} hours in 72h forecast")
            factors.append(f"Maximum soil moisture deficit: {max_deficit:.3f}")
            factors.append(f"Urgency level: {urgency}")
            
            confidence_score += 20
            
            # Determine irrigation amount
            soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
            field_capacity = soil_params['field_capacity']
            current_moisture = initial_conditions['soil_water_content']
            root_depth = initial_conditions['root_zone_depth']
            
            # Calculate water needed to reach field capacity
            moisture_deficit = field_capacity - current_moisture
            water_amount = moisture_deficit * root_depth * 1000  # Convert to mm
            
            # Adjust for efficiency and application method
            water_amount *= 1.2  # 20% extra for application efficiency
            
            irrigation_type = self._determine_irrigation_type(water_amount, soil_type)
            timing = self._determine_irrigation_timing(stress_analysis, weather_data)
            expected_benefit = self._calculate_irrigation_benefit(stress_analysis, water_amount)
            stress_level = stress_analysis['urgency_level']
            
        else:
            factors.append("No water stress detected in 72-hour forecast")
            factors.append(f"Current soil moisture ({initial_conditions['soil_water_content']:.3f}) above critical threshold")
            
            water_amount = None
            irrigation_type = None
            timing = None
            expected_benefit = "No irrigation needed - soil moisture adequate"
            stress_level = "none"
            confidence_score += 10
        
        # Weather factors
        recent_rainfall = sum(day.get('rainfall', 0) for day in weather_data[-3:])
        if recent_rainfall > 10:
            factors.append(f"Recent rainfall ({recent_rainfall:.1f}mm) provides natural irrigation")
            confidence_score += 5
        
        reasoning = ". ".join(factors) + "."
        
        return WaterStressRecommendation(
            needs_irrigation=needs_irrigation,
            confidence=min(95, max(50, confidence_score)),
            reasoning=reasoning,
            irrigation_type=irrigation_type,
            water_amount=round(water_amount, 1) if water_amount else None,
            timing=timing,
            expected_benefit=expected_benefit,
            stress_level=stress_level,
            soil_moisture_deficit=stress_analysis.get('max_deficit')
        )
    
    def _generate_weather_forecast(self, weather_data: List[Dict]) -> List[Dict]:
        """Generate 72-hour weather forecast based on recent patterns"""
        if not weather_data:
            return self._get_default_forecast()
        
        # Use recent weather patterns to generate forecast
        recent_data = weather_data[-7:]
        
        forecast = []
        for day in range(3):  # 3 days = 72 hours
            # Add some variability to recent averages
            base_temp = np.mean([d.get('temperature', 20) for d in recent_data])
            base_humidity = np.mean([d.get('humidity', 50) for d in recent_data])
            base_rainfall = np.mean([d.get('rainfall', 0) for d in recent_data])
            
            # Add daily and random variations
            temp_variation = np.random.normal(0, 3)
            humidity_variation = np.random.normal(0, 10)
            rainfall_variation = max(0, np.random.normal(base_rainfall, base_rainfall * 0.5))
            
            forecast.append({
                'date': (datetime.now() + timedelta(days=day+1)).strftime('%Y-%m-%d'),
                'temperature': round(base_temp + temp_variation, 1),
                'humidity': round(max(20, min(100, base_humidity + humidity_variation)), 1),
                'rainfall': round(rainfall_variation, 1)
            })
        
        return forecast
    
    def _calculate_reference_et(self, temperature: float, humidity: float) -> float:
        """Calculate reference evapotranspiration (simplified)"""
        # Simplified Penman-Monteith equation
        # In production, would use full equation with wind speed, radiation, etc.
        base_et = 0.0023 * (temperature + 17.8) * np.sqrt(abs(temperature - humidity)) * 0.408
        return max(0, base_et)
    
    def _classify_stress_severity(self, deficit: float, stress_threshold: Dict) -> str:
        """Classify stress severity based on deficit magnitude"""
        TAW = stress_threshold['TAW']
        
        if deficit < TAW * 0.1:
            return 'mild'
        elif deficit < TAW * 0.3:
            return 'moderate'
        elif deficit < TAW * 0.5:
            return 'severe'
        else:
            return 'critical'
    
    def _determine_urgency_level(self, stress_percentage: float, max_deficit: float) -> str:
        """Determine urgency level for irrigation"""
        if stress_percentage > 50 or max_deficit > 0.1:
            return 'high'
        elif stress_percentage > 25 or max_deficit > 0.05:
            return 'medium'
        elif stress_percentage > 0:
            return 'low'
        else:
            return 'none'
    
    def _determine_irrigation_type(self, water_amount: float, soil_type: str) -> str:
        """Determine appropriate irrigation method"""
        if water_amount < 10:
            return "Light sprinkler irrigation"
        elif water_amount < 25:
            return "Drip irrigation (recommended)"
        elif water_amount < 50:
            return "Sprinkler irrigation"
        else:
            return "Flood irrigation (if available)"
    
    def _determine_irrigation_timing(self, stress_analysis: Dict, weather_data: List[Dict]) -> str:
        """Determine optimal timing for irrigation"""
        urgency = stress_analysis['urgency_level']
        
        if urgency == 'high':
            return "Immediate irrigation required"
        elif urgency == 'medium':
            return "Irrigate within 12-24 hours"
        elif urgency == 'low':
            return "Irrigate within 24-48 hours"
        else:
            return "Monitor conditions"
    
    def _calculate_irrigation_benefit(self, stress_analysis: Dict, water_amount: float) -> str:
        """Calculate expected benefit from irrigation"""
        urgency = stress_analysis['urgency_level']
        
        if urgency == 'high':
            return f"Critical benefit - prevents crop damage. Apply {water_amount:.1f}mm to restore optimal moisture"
        elif urgency == 'medium':
            return f"Significant benefit - maintains crop health. Apply {water_amount:.1f}mm for optimal growth"
        elif urgency == 'low':
            return f"Moderate benefit - prevents stress development. Apply {water_amount:.1f}mm as preventive measure"
        else:
            return "No irrigation benefit expected"
    
    def _calculate_days_since_rain(self, weather_data: List[Dict]) -> int:
        """Calculate days since last significant rainfall"""
        days = 0
        for day in reversed(weather_data):
            if day.get('rainfall', 0) > 5:  # 5mm threshold
                break
            days += 1
        return min(days, 30)  # Cap at 30 days
    
    def _get_default_initial_conditions(self) -> Dict:
        """Provide default initial conditions when data is unavailable"""
        return {
            'soil_water_content': 0.25,
            'lai': 2.5,
            'ndvi': 0.6,
            'albedo': 0.2,
            'root_zone_depth': 1.2,
            'last_irrigation': None,
            'days_since_rain': 5
        }
    
    def _get_default_forecast(self) -> List[Dict]:
        """Provide default weather forecast"""
        return [
            {'date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'), 
             'temperature': 22, 'humidity': 60, 'rainfall': 2},
            {'date': (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'), 
             'temperature': 24, 'humidity': 55, 'rainfall': 0},
            {'date': (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'), 
             'temperature': 23, 'humidity': 65, 'rainfall': 5}
        ]
    
    def _get_fallback_recommendation(self) -> Dict:
        """Provide fallback recommendation when analysis fails"""
        return {
            'needs_irrigation': False,
            'confidence': 50,
            'reasoning': "Unable to complete water stress analysis. Manual inspection recommended.",
            'irrigation_type': None,
            'water_amount': None,
            'timing': None,
            'expected_benefit': "Analysis incomplete",
            'stress_level': 'unknown',
            'soil_moisture_deficit': None,
            'analysis_details': {
                'initial_conditions': {},
                'stress_threshold': {},
                'soil_moisture_forecast': [],
                'stress_analysis': {}
            }
        }