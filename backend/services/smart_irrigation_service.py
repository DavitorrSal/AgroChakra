"""
Smart Irrigation Service
Implements intelligent irrigation management based on hydrological modeling,
satellite data, and meteorological forecasts following the PREGI system methodology.

This service provides:
- Real-time soil moisture monitoring simulation
- 72-hour irrigation forecasting
- FAO-56 based stress threshold calculations
- Irrigation scheduling and optimization
- Water usage efficiency analysis
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
from dataclasses import dataclass
import math

from models.farm_analysis import (
    IrrigationAnalysis, IrrigationRecommendation, IrrigationSchedule, 
    IrrigationEvent, SoilMoistureData, WeatherData, FarmBounds
)

logger = logging.getLogger(__name__)

class SmartIrrigationService:
    """
    Smart Irrigation Service implementing the PREGI system methodology
    with improvements using remote sensing data for irrigation management.
    """
    
    def __init__(self):
        # FAO-56 crop parameters (extensible for multiple crops)
        self.crop_parameters = {
            'asparagus': {
                'p': 0.65,  # Depletion fraction (corrected for climate)
                'field_capacity': 0.35,  # Typical for medium soil
                'wilting_point': 0.15,
                'rooting_depth': 1.2,  # meters
                'kc_values': {
                    'initial': 0.5,
                    'development': 0.8,
                    'mid_season': 1.15,
                    'late_season': 1.0
                },
                'growth_stages': {
                    'initial': 30,      # days
                    'development': 40,
                    'mid_season': 50,
                    'late_season': 30
                }
            },
            'tomato': {
                'p': 0.40,
                'field_capacity': 0.35,
                'wilting_point': 0.15,
                'rooting_depth': 1.0,
                'kc_values': {
                    'initial': 0.6,
                    'development': 1.15,
                    'mid_season': 1.15,
                    'late_season': 0.8
                },
                'growth_stages': {
                    'initial': 25,
                    'development': 35,
                    'mid_season': 40,
                    'late_season': 30
                }
            },
            'wheat': {
                'p': 0.55,
                'field_capacity': 0.35,
                'wilting_point': 0.15,
                'rooting_depth': 1.5,
                'kc_values': {
                    'initial': 0.4,
                    'development': 0.7,
                    'mid_season': 1.15,
                    'late_season': 0.4
                },
                'growth_stages': {
                    'initial': 15,
                    'development': 25,
                    'mid_season': 50,
                    'late_season': 30
                }
            }
        }
        
        # Enhanced soil type parameters
        self.soil_types = {
            'sandy': {
                'field_capacity': 0.25,
                'wilting_point': 0.10,
                'infiltration_rate': 25,  # mm/hour
                'hydraulic_conductivity': 5.0,  # cm/day
                'bulk_density': 1.6,  # g/cm³
                'porosity': 0.40
            },
            'loamy': {
                'field_capacity': 0.35,
                'wilting_point': 0.15,
                'infiltration_rate': 15,
                'hydraulic_conductivity': 2.5,
                'bulk_density': 1.4,
                'porosity': 0.45
            },
            'clay': {
                'field_capacity': 0.45,
                'wilting_point': 0.20,
                'infiltration_rate': 5,
                'hydraulic_conductivity': 0.5,
                'bulk_density': 1.3,
                'porosity': 0.50
            }
        }
        
        # Irrigation system parameters
        self.irrigation_systems = {
            'drip': {
                'efficiency': 0.90,
                'cost_per_mm': 0.15,  # USD/mm/ha
                'application_rate': 5,  # mm/hour
                'uniformity': 0.95
            },
            'sprinkler': {
                'efficiency': 0.75,
                'cost_per_mm': 0.10,
                'application_rate': 15,
                'uniformity': 0.85
            },
            'flood': {
                'efficiency': 0.60,
                'cost_per_mm': 0.05,
                'application_rate': 25,
                'uniformity': 0.70
            },
            'micro_sprinkler': {
                'efficiency': 0.85,
                'cost_per_mm': 0.12,
                'application_rate': 8,
                'uniformity': 0.90
            }
        }
        
        # PREGI system parameters
        self.forecast_horizon = 72  # hours
        self.monitoring_frequency = 24  # hours (daily monitoring)
        self.model_update_frequency = 24  # hours
    
    def analyze_smart_irrigation(self, lai_data: List[Dict], weather_data: List[Dict],
                               satellite_data: Dict, farm_bounds: Dict,
                               crop_type: str = 'asparagus', soil_type: str = 'loamy',
                               irrigation_system: str = 'drip') -> Dict:
        """
        Perform comprehensive smart irrigation analysis following PREGI system methodology.
        
        Procedure:
        1) Run hydrological model daily with 72h meteorological forecasts
        2) Use initial conditions from FEST-EWB simulation (simulated)
        3) Use vegetation and albedo parameters from LANDSAT data
        4) Compare forecasted soil moisture with stress threshold at every time step
        5) Trigger irrigation when needed
        6) Generate optimized irrigation schedule
        
        Args:
            lai_data: Time series LAI data
            weather_data: Historical weather data
            satellite_data: Satellite imagery analysis
            farm_bounds: Farm boundary coordinates
            crop_type: Type of crop
            soil_type: Soil type classification
            irrigation_system: Irrigation method to use
            
        Returns:
            Complete irrigation analysis with recommendations
        """
        logger.info(f"Starting smart irrigation analysis for {crop_type} on {soil_type} soil")
        
        start_time = datetime.now()
        
        try:
            # Step 1: Initialize hydrological model with current conditions
            initial_conditions = self._get_initial_conditions_fest_ewb(
                lai_data, weather_data, satellite_data, crop_type, soil_type
            )
            
            # Step 2: Get vegetation and albedo parameters from LANDSAT data
            vegetation_params = self._extract_vegetation_parameters(
                satellite_data, lai_data, crop_type
            )
            
            # Step 3: Calculate stress threshold using FAO-56 methodology
            stress_threshold_data = self._calculate_stress_threshold_fao56(
                crop_type, soil_type, vegetation_params
            )
            
            # Step 4: Generate 72-hour meteorological forecast
            weather_forecast = self._generate_meteorological_forecast(weather_data)
            
            # Step 5: Run hydrological model with forecast data
            soil_moisture_forecast = self._run_hydrological_model_fest_ewb(
                initial_conditions, weather_forecast, vegetation_params,
                crop_type, soil_type
            )
            
            # Step 6: Compare forecasted soil moisture with stress threshold
            stress_analysis = self._analyze_stress_conditions_pregi(
                soil_moisture_forecast, stress_threshold_data
            )
            
            # Step 7: Generate irrigation schedule and recommendations
            irrigation_recommendation = self._generate_irrigation_schedule(
                stress_analysis, initial_conditions, weather_forecast,
                crop_type, soil_type, irrigation_system
            )
            
            # Step 8: Calculate water usage efficiency and environmental impact
            efficiency_analysis = self._analyze_water_efficiency(
                irrigation_recommendation, stress_analysis, crop_type, soil_type
            )
            
            # Create irrigation analysis object
            irrigation_analysis = IrrigationAnalysis(
                bounds=FarmBounds(**farm_bounds),
                crop_type=crop_type,
                soil_type=soil_type,
                soil_moisture_forecast=soil_moisture_forecast,
                stress_threshold_data=stress_threshold_data,
                weather_forecast=weather_forecast,
                vegetation_parameters=vegetation_params,
                irrigation_recommendation=irrigation_recommendation,
                water_stress_events=stress_analysis['stress_events'],
                processing_time=(datetime.now() - start_time).total_seconds(),
                model_accuracy=self._calculate_model_accuracy(stress_analysis)
            )
            
            # Prepare comprehensive response
            response = {
                'analysis_id': irrigation_analysis.id,
                'timestamp': irrigation_analysis.analysis_date.isoformat(),
                'crop_type': crop_type,
                'soil_type': soil_type,
                'irrigation_system': irrigation_system,
                
                # Core recommendation
                'needs_irrigation': irrigation_recommendation.needs_irrigation,
                'confidence': irrigation_recommendation.confidence,
                'reasoning': irrigation_recommendation.reasoning,
                'water_amount': irrigation_recommendation.water_amount,
                'irrigation_method': irrigation_recommendation.irrigation_method,
                'timing': irrigation_recommendation.timing,
                
                # Detailed analysis
                'soil_moisture_forecast': [smd.to_dict() for smd in soil_moisture_forecast],
                'stress_threshold': stress_threshold_data,
                'vegetation_parameters': vegetation_params,
                'weather_forecast': [wd.to_dict() for wd in weather_forecast],
                'stress_events': stress_analysis['stress_events'],
                
                # Schedule and planning
                'irrigation_schedule': irrigation_recommendation.schedule.to_dict() if irrigation_recommendation.schedule else None,
                'next_irrigation': irrigation_recommendation.schedule.next_irrigation_time if irrigation_recommendation.schedule else None,
                
                # Economic and environmental analysis
                'cost_estimate': irrigation_recommendation.cost_estimate,
                'water_savings': irrigation_recommendation.water_savings,
                'yield_impact': irrigation_recommendation.yield_impact,
                'environmental_impact': irrigation_recommendation.environmental_impact,
                'efficiency_analysis': efficiency_analysis,
                
                # Model performance
                'processing_time': irrigation_analysis.processing_time,
                'model_accuracy': irrigation_analysis.model_accuracy,
                'data_quality': self._assess_data_quality(lai_data, weather_data, satellite_data)
            }
            
            logger.info(f"Smart irrigation analysis completed in {irrigation_analysis.processing_time:.2f} seconds")
            return response
            
        except Exception as e:
            logger.error(f"Error in smart irrigation analysis: {str(e)}")
            return self._get_fallback_irrigation_recommendation()
    
    def _get_initial_conditions_fest_ewb(self, lai_data: List[Dict], weather_data: List[Dict],
                                       satellite_data: Dict, crop_type: str, soil_type: str) -> Dict:
        """
        Simulate FEST-EWB initial conditions using available data.
        In production, this would interface with actual FEST-EWB model.
        """
        if not weather_data or not lai_data:
            return self._get_default_initial_conditions(crop_type, soil_type)
        
        # Analyze recent weather patterns (last 14 days)
        recent_weather = weather_data[-14:]
        total_rainfall = sum(day.get('rainfall', 0) for day in recent_weather)
        avg_temperature = np.mean([day.get('temperature', 20) for day in recent_weather])
        avg_humidity = np.mean([day.get('humidity', 50) for day in recent_weather])
        avg_solar_radiation = np.mean([day.get('solar_radiation', 20) for day in recent_weather])
        
        # Get soil and crop parameters
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        
        # Estimate current soil water content using water balance
        field_capacity = soil_params['field_capacity']
        wilting_point = soil_params['wilting_point']
        
        # Calculate evapotranspiration losses
        et0_daily = self._calculate_reference_et_penman_monteith(
            avg_temperature, avg_humidity, avg_solar_radiation
        )
        total_et = et0_daily * len(recent_weather) * crop_params['kc_values']['mid_season']
        
        # Water balance calculation
        water_input = total_rainfall  # mm
        water_loss = total_et  # mm
        net_water = water_input - water_loss
        
        # Convert to volumetric water content
        root_depth_mm = crop_params['rooting_depth'] * 1000
        moisture_change = net_water / root_depth_mm
        
        # Estimate current moisture (bounded by field capacity and wilting point)
        base_moisture = field_capacity * 0.8  # Start at 80% of field capacity
        current_moisture = max(wilting_point, min(field_capacity, base_moisture + moisture_change))
        
        # Get vegetation parameters
        current_lai = lai_data[-1]['lai'] if lai_data else 2.5
        current_ndvi = np.mean(satellite_data.get('ndvi', [0.6]))
        
        # Calculate albedo from NDVI (improved relationship)
        albedo = 0.23 - 0.15 * current_ndvi + 0.05 * (current_ndvi ** 2)
        albedo = max(0.1, min(0.4, albedo))
        
        return {
            'soil_water_content': round(current_moisture, 4),
            'field_capacity': field_capacity,
            'wilting_point': wilting_point,
            'lai': round(current_lai, 2),
            'ndvi': round(current_ndvi, 3),
            'albedo': round(albedo, 3),
            'root_zone_depth': crop_params['rooting_depth'],
            'canopy_cover': min(1.0, current_lai / 3.0),  # Simplified relationship
            'days_since_rain': self._calculate_days_since_rain(weather_data),
            'growing_degree_days': self._calculate_growing_degree_days(recent_weather),
            'water_balance': round(net_water, 2),
            'last_irrigation': None,  # Would be tracked in production
            'soil_temperature': avg_temperature - 2  # Approximate soil temperature
        }
    
    def _extract_vegetation_parameters(self, satellite_data: Dict, lai_data: List[Dict], 
                                     crop_type: str) -> Dict:
        """
        Extract vegetation and albedo parameters from LANDSAT data.
        """
        # Get current vegetation indices
        ndvi_values = satellite_data.get('ndvi', [0.6])
        evi_values = satellite_data.get('evi', [0.4])
        current_ndvi = np.mean(ndvi_values[-5:]) if len(ndvi_values) >= 5 else np.mean(ndvi_values)
        current_evi = np.mean(evi_values[-5:]) if len(evi_values) >= 5 else np.mean(evi_values)
        
        # Calculate LAI from satellite data
        current_lai = lai_data[-1]['lai'] if lai_data else self._estimate_lai_from_ndvi(current_ndvi)
        
        # Calculate vegetation parameters
        albedo = self._calculate_albedo_from_ndvi(current_ndvi)
        canopy_cover = self._calculate_canopy_cover(current_lai)
        vegetation_height = self._estimate_vegetation_height(crop_type, current_lai)
        
        # Calculate vegetation stress indicators
        ndvi_trend = self._calculate_ndvi_trend(ndvi_values)
        vegetation_health = self._assess_vegetation_health(current_ndvi, current_evi, current_lai)
        
        return {
            'ndvi': round(current_ndvi, 3),
            'evi': round(current_evi, 3),
            'lai': round(current_lai, 2),
            'albedo': round(albedo, 3),
            'canopy_cover': round(canopy_cover, 3),
            'vegetation_height': round(vegetation_height, 2),
            'ndvi_trend': ndvi_trend,
            'vegetation_health': vegetation_health,
            'leaf_area_density': round(current_lai / vegetation_height if vegetation_height > 0 else 0, 2),
            'green_vegetation_fraction': round(min(1.0, current_ndvi / 0.8), 3)
        }
    
    def _calculate_stress_threshold_fao56(self, crop_type: str, soil_type: str, 
                                        vegetation_params: Dict) -> Dict:
        """
        Calculate stress threshold using enhanced FAO-56 methodology.
        """
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        
        field_capacity = soil_params['field_capacity']
        wilting_point = soil_params['wilting_point']
        p = crop_params['p']  # Depletion fraction
        
        # Calculate Total Available Water (TAW)
        TAW = field_capacity - wilting_point
        
        # Calculate Readily Available Water (RAW)
        RAW = p * TAW
        
        # Calculate critical soil moisture threshold
        theta_crit = field_capacity - RAW
        
        # Adjust for vegetation development stage
        lai = vegetation_params.get('lai', 2.5)
        vegetation_adjustment = self._calculate_vegetation_adjustment(lai, crop_type)
        theta_crit_adjusted = theta_crit * vegetation_adjustment
        
        # Calculate management allowed depletion (MAD)
        mad = RAW / TAW * 100  # Percentage
        
        # Surplus threshold (field capacity)
        surplus_threshold = field_capacity
        
        # Calculate irrigation trigger points for different urgency levels
        trigger_points = {
            'low': theta_crit_adjusted + 0.02,      # Early warning
            'medium': theta_crit_adjusted,           # Standard threshold
            'high': theta_crit_adjusted - 0.01,     # Urgent irrigation
            'critical': wilting_point + 0.02        # Emergency irrigation
        }
        
        return {
            'theta_critical': round(theta_crit_adjusted, 4),
            'theta_critical_base': round(theta_crit, 4),
            'field_capacity': field_capacity,
            'wilting_point': wilting_point,
            'TAW': round(TAW, 4),
            'RAW': round(RAW, 4),
            'surplus_threshold': surplus_threshold,
            'depletion_fraction_p': p,
            'mad_percentage': round(mad, 1),
            'vegetation_adjustment': round(vegetation_adjustment, 3),
            'trigger_points': {k: round(v, 4) for k, v in trigger_points.items()}
        }
    
    def _generate_meteorological_forecast(self, weather_data: List[Dict]) -> List[WeatherData]:
        """
        Generate 72-hour meteorological forecast using advanced pattern analysis.
        """
        if not weather_data:
            return self._get_default_weather_forecast()
        
        # Analyze recent patterns (last 14 days)
        recent_data = weather_data[-14:]
        
        # Calculate seasonal trends and patterns
        seasonal_trends = self._analyze_seasonal_patterns(weather_data)
        daily_patterns = self._analyze_daily_patterns(recent_data)
        
        forecast = []
        base_date = datetime.now()
        
        for day in range(3):  # 3 days = 72 hours
            forecast_date = base_date + timedelta(days=day+1)
            
            # Base values from recent averages
            base_temp = np.mean([d.get('temperature', 20) for d in recent_data])
            base_humidity = np.mean([d.get('humidity', 50) for d in recent_data])
            base_rainfall = np.mean([d.get('rainfall', 0) for d in recent_data])
            base_wind = np.mean([d.get('wind_speed', 2) for d in recent_data])
            base_solar = np.mean([d.get('solar_radiation', 20) for d in recent_data])
            
            # Apply seasonal adjustments
            temp_adjustment = seasonal_trends.get('temperature_trend', 0) * day
            humidity_adjustment = seasonal_trends.get('humidity_trend', 0) * day
            
            # Add weather variability
            temp_variation = np.random.normal(0, 2.5)
            humidity_variation = np.random.normal(0, 8)
            rainfall_variation = max(0, np.random.exponential(base_rainfall * 0.8))
            wind_variation = max(0.5, np.random.normal(base_wind, base_wind * 0.3))
            solar_variation = max(5, np.random.normal(base_solar, base_solar * 0.2))
            
            # Create forecast entry
            forecast_weather = WeatherData(
                date=forecast_date.strftime('%Y-%m-%d'),
                temperature=round(base_temp + temp_adjustment + temp_variation, 1),
                humidity=round(max(20, min(100, base_humidity + humidity_adjustment + humidity_variation)), 1),
                rainfall=round(rainfall_variation, 1),
                wind_speed=round(wind_variation, 1),
                solar_radiation=round(solar_variation, 1)
            )
            
            forecast.append(forecast_weather)
        
        return forecast
    
    def _run_hydrological_model_fest_ewb(self, initial_conditions: Dict, 
                                       weather_forecast: List[WeatherData],
                                       vegetation_params: Dict, crop_type: str, 
                                       soil_type: str) -> List[SoilMoistureData]:
        """
        Simulate FEST-EWB hydrological model for 72-hour forecast.
        """
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        
        # Initialize model state
        current_moisture = initial_conditions['soil_water_content']
        field_capacity = soil_params['field_capacity']
        wilting_point = soil_params['wilting_point']
        root_depth = crop_params['rooting_depth']
        
        forecast_results = []
        
        for hour in range(self.forecast_horizon):
            # Get hourly weather data
            day_index = hour // 24
            if day_index < len(weather_forecast):
                weather = weather_forecast[day_index]
            else:
                weather = weather_forecast[-1]
            
            # Calculate hourly weather components
            hourly_temp = weather.temperature + 5 * math.sin(2 * math.pi * (hour % 24) / 24)  # Daily temperature cycle
            hourly_humidity = weather.humidity
            hourly_precipitation = weather.rainfall / 24  # mm/hour
            hourly_wind = weather.wind_speed
            hourly_solar = weather.solar_radiation * max(0, math.sin(math.pi * (hour % 24) / 12))  # Solar cycle
            
            # Calculate evapotranspiration using Penman-Monteith
            et0_hourly = self._calculate_hourly_et0(
                hourly_temp, hourly_humidity, hourly_wind, hourly_solar
            )
            
            # Apply crop coefficient
            kc = self._get_crop_coefficient(crop_type, vegetation_params['lai'])
            crop_et = et0_hourly * kc
            
            # Calculate water balance components
            infiltration = min(hourly_precipitation, soil_params['infiltration_rate'])
            runoff = max(0, hourly_precipitation - infiltration)
            deep_percolation = self._calculate_deep_percolation(
                current_moisture, field_capacity, soil_params['hydraulic_conductivity']
            )
            
            # Update soil moisture using water balance equation
            moisture_change = (infiltration - crop_et - deep_percolation) / (root_depth * 1000)
            new_moisture = max(wilting_point, min(field_capacity, current_moisture + moisture_change))
            
            # Calculate stress threshold for this time step
            stress_threshold = initial_conditions.get('stress_threshold', 
                                                    field_capacity - crop_params['p'] * (field_capacity - wilting_point))
            
            # Calculate deficit
            deficit = max(0, field_capacity - new_moisture)
            
            # Create soil moisture data point
            soil_moisture_data = SoilMoistureData(
                datetime=(datetime.now() + timedelta(hours=hour)).isoformat(),
                soil_moisture=round(new_moisture, 4),
                field_capacity=field_capacity,
                wilting_point=wilting_point,
                stress_threshold=stress_threshold,
                deficit=round(deficit, 4),
                depth_cm=root_depth * 100
            )
            
            forecast_results.append(soil_moisture_data)
            current_moisture = new_moisture
        
        return forecast_results
    
    def _analyze_stress_conditions_pregi(self, soil_moisture_forecast: List[SoilMoistureData],
                                       stress_threshold_data: Dict) -> Dict:
        """
        Analyze stress conditions following PREGI system methodology.
        """
        stress_events = []
        stress_hours = 0
        min_moisture = float('inf')
        max_deficit = 0
        critical_periods = []
        
        trigger_points = stress_threshold_data['trigger_points']
        
        for i, forecast in enumerate(soil_moisture_forecast):
            soil_moisture = forecast.soil_moisture
            min_moisture = min(min_moisture, soil_moisture)
            deficit = forecast.deficit
            max_deficit = max(max_deficit, deficit)
            
            # Determine stress level
            stress_level = 'none'
            if soil_moisture < trigger_points['critical']:
                stress_level = 'critical'
                stress_hours += 1
            elif soil_moisture < trigger_points['high']:
                stress_level = 'high'
                stress_hours += 1
            elif soil_moisture < trigger_points['medium']:
                stress_level = 'medium'
                stress_hours += 1
            elif soil_moisture < trigger_points['low']:
                stress_level = 'low'
                stress_hours += 0.5  # Partial stress counting
            
            if stress_level != 'none':
                stress_event = {
                    'hour': i,
                    'datetime': forecast.datetime,
                    'soil_moisture': soil_moisture,
                    'deficit': deficit,
                    'stress_level': stress_level,
                    'urgency_score': self._calculate_urgency_score(soil_moisture, trigger_points)
                }
                stress_events.append(stress_event)
                
                # Track critical periods
                if stress_level in ['high', 'critical']:
                    critical_periods.append(i)
        
        # Calculate stress metrics
        stress_percentage = (stress_hours / len(soil_moisture_forecast)) * 100
        irrigation_urgency = self._determine_irrigation_urgency(stress_events, critical_periods)
        
        return {
            'stress_events': stress_events,
            'stress_hours': stress_hours,
            'stress_percentage': round(stress_percentage, 1),
            'min_forecasted_moisture': round(min_moisture, 4),
            'max_deficit': round(max_deficit, 4),
            'critical_periods': critical_periods,
            'irrigation_triggered': len(stress_events) > 0,
            'irrigation_urgency': irrigation_urgency,
            'stress_severity': self._classify_overall_stress_severity(stress_events)
        }
    
    def _generate_irrigation_schedule(self, stress_analysis: Dict, initial_conditions: Dict,
                                    weather_forecast: List[WeatherData], crop_type: str,
                                    soil_type: str, irrigation_system: str) -> IrrigationRecommendation:
        """
        Generate comprehensive irrigation schedule and recommendations.
        """
        needs_irrigation = stress_analysis['irrigation_triggered']
        confidence_base = 75
        
        if not needs_irrigation:
            return IrrigationRecommendation(
                needs_irrigation=False,
                confidence=confidence_base + 15,
                reasoning="No water stress detected in 72-hour forecast. Current soil moisture levels are adequate.",
                water_amount=0,
                irrigation_method="None required",
                timing="Monitor conditions",
                cost_estimate=0,
                water_savings=100,  # 100% savings by not irrigating
                yield_impact="No impact expected",
                environmental_impact="Positive - water conservation"
            )
        
        # Calculate irrigation requirements
        irrigation_requirements = self._calculate_irrigation_requirements(
            stress_analysis, initial_conditions, crop_type, soil_type
        )
        
        # Generate irrigation events
        irrigation_events = self._plan_irrigation_events(
            stress_analysis, irrigation_requirements, irrigation_system, weather_forecast
        )
        
        # Create irrigation schedule
        schedule = IrrigationSchedule(
            schedule_date=datetime.now().strftime('%Y-%m-%d'),
            recommended_events=irrigation_events,
            total_water_needed=irrigation_requirements['total_water'],
            urgency_level=stress_analysis['irrigation_urgency'],
            next_irrigation_time=irrigation_events[0].datetime if irrigation_events else None,
            monitoring_frequency="hourly" if stress_analysis['irrigation_urgency'] in ['high', 'critical'] else "daily"
        )
        
        # Calculate costs and benefits
        cost_analysis = self._calculate_irrigation_costs(irrigation_events, irrigation_system)
        efficiency_analysis = self._calculate_water_efficiency_savings(
            irrigation_requirements, irrigation_system, crop_type
        )
        
        # Generate reasoning
        reasoning_factors = [
            f"Water stress detected for {stress_analysis['stress_hours']:.1f} hours in 72h forecast",
            f"Maximum soil moisture deficit: {stress_analysis['max_deficit']:.3f}",
            f"Irrigation urgency: {stress_analysis['irrigation_urgency']}",
            f"Recommended method: {irrigation_system} irrigation"
        ]
        
        # Adjust confidence based on data quality and stress severity
        confidence = confidence_base
        if stress_analysis['stress_severity'] == 'critical':
            confidence += 15
        elif stress_analysis['stress_severity'] == 'high':
            confidence += 10
        elif stress_analysis['stress_severity'] == 'moderate':
            confidence += 5
        
        return IrrigationRecommendation(
            needs_irrigation=True,
            confidence=min(95, confidence),
            reasoning=". ".join(reasoning_factors) + ".",
            water_amount=irrigation_requirements['total_water'],
            irrigation_method=irrigation_system,
            timing=self._determine_optimal_timing(stress_analysis, weather_forecast),
            schedule=schedule,
            cost_estimate=cost_analysis['total_cost'],
            water_savings=efficiency_analysis['water_savings_percent'],
            yield_impact=efficiency_analysis['yield_impact'],
            environmental_impact=efficiency_analysis['environmental_impact']
        )
    
    def _calculate_irrigation_requirements(self, stress_analysis: Dict, initial_conditions: Dict,
                                         crop_type: str, soil_type: str) -> Dict:
        """
        Calculate detailed irrigation water requirements.
        """
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        
        field_capacity = soil_params['field_capacity']
        current_moisture = initial_conditions['soil_water_content']
        root_depth = crop_params['rooting_depth']
        
        # Calculate water needed to reach field capacity
        moisture_deficit = field_capacity - current_moisture
        water_needed_mm = moisture_deficit * root_depth * 1000  # Convert to mm
        
        # Adjust for application efficiency and losses
        application_efficiency = 0.85  # Default efficiency
        water_needed_gross = water_needed_mm / application_efficiency
        
        # Consider stress severity for additional water
        stress_severity = stress_analysis.get('stress_severity', 'low')
        if stress_severity == 'critical':
            water_needed_gross *= 1.2  # 20% extra for recovery
        elif stress_severity == 'high':
            water_needed_gross *= 1.1  # 10% extra
        
        return {
            'net_water_needed': round(water_needed_mm, 1),
            'gross_water_needed': round(water_needed_gross, 1),
            'total_water': round(water_needed_gross, 1),
            'moisture_deficit': round(moisture_deficit, 4),
            'application_efficiency': application_efficiency
        }
    
    def _plan_irrigation_events(self, stress_analysis: Dict, irrigation_requirements: Dict,
                              irrigation_system: str, weather_forecast: List[WeatherData]) -> List[IrrigationEvent]:
        """
        Plan specific irrigation events based on stress analysis and system capabilities.
        """
        system_params = self.irrigation_systems.get(irrigation_system, self.irrigation_systems['drip'])
        total_water = irrigation_requirements['total_water']
        urgency = stress_analysis['irrigation_urgency']
        
        events = []
        
        if urgency == 'critical':
            # Immediate irrigation required
            event = IrrigationEvent(
                datetime=(datetime.now() + timedelta(hours=1)).isoformat(),
                water_amount=total_water,
                irrigation_type=irrigation_system,
                duration=total_water / system_params['application_rate'],
                efficiency=system_params['efficiency'],
                cost=total_water * system_params['cost_per_mm']
            )
            events.append(event)
            
        elif urgency == 'high':
            # Split into two applications
            first_amount = total_water * 0.6
            second_amount = total_water * 0.4
            
            events.append(IrrigationEvent(
                datetime=(datetime.now() + timedelta(hours=2)).isoformat(),
                water_amount=first_amount,
                irrigation_type=irrigation_system,
                duration=first_amount / system_params['application_rate'],
                efficiency=system_params['efficiency'],
                cost=first_amount * system_params['cost_per_mm']
            ))
            
            events.append(IrrigationEvent(
                datetime=(datetime.now() + timedelta(hours=24)).isoformat(),
                water_amount=second_amount,
                irrigation_type=irrigation_system,
                duration=second_amount / system_params['application_rate'],
                efficiency=system_params['efficiency'],
                cost=second_amount * system_params['cost_per_mm']
            ))
            
        elif urgency == 'medium':
            # Schedule for optimal timing (early morning)
            optimal_time = datetime.now().replace(hour=6, minute=0, second=0) + timedelta(days=1)
            if optimal_time < datetime.now():
                optimal_time += timedelta(days=1)
            
            event = IrrigationEvent(
                datetime=optimal_time.isoformat(),
                water_amount=total_water,
                irrigation_type=irrigation_system,
                duration=total_water / system_params['application_rate'],
                efficiency=system_params['efficiency'],
                cost=total_water * system_params['cost_per_mm']
            )
            events.append(event)
            
        else:  # low urgency
            # Schedule for next available optimal window
            optimal_time = datetime.now().replace(hour=6, minute=0, second=0) + timedelta(days=2)
            
            event = IrrigationEvent(
                datetime=optimal_time.isoformat(),
                water_amount=total_water,
                irrigation_type=irrigation_system,
                duration=total_water / system_params['application_rate'],
                efficiency=system_params['efficiency'],
                cost=total_water * system_params['cost_per_mm']
            )
            events.append(event)
        
        return events
    
    # Helper methods for calculations
    
    def _calculate_reference_et_penman_monteith(self, temperature: float, humidity: float, 
                                              solar_radiation: float) -> float:
        """Calculate reference evapotranspiration using simplified Penman-Monteith equation."""
        # Simplified calculation - in production would use full equation
        delta = 4098 * (0.6108 * math.exp(17.27 * temperature / (temperature + 237.3))) / ((temperature + 237.3) ** 2)
        gamma = 0.665  # Psychrometric constant
        
        et0 = (0.408 * delta * solar_radiation + gamma * 900 / (temperature + 273) * 2 * (0.01 * (100 - humidity))) / (delta + gamma * (1 + 0.34 * 2))
        return max(0, et0)
    
    def _calculate_hourly_et0(self, temp: float, humidity: float, wind: float, solar: float) -> float:
        """Calculate hourly reference evapotranspiration."""
        daily_et0 = self._calculate_reference_et_penman_monteith(temp, humidity, solar)
        return daily_et0 / 24  # Convert to hourly
    
    def _get_crop_coefficient(self, crop_type: str, lai: float) -> float:
        """Get crop coefficient based on LAI and growth stage."""
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        
        # Estimate growth stage from LAI
        if lai < 1.0:
            return crop_params['kc_values']['initial']
        elif lai < 2.5:
            return crop_params['kc_values']['development']
        elif lai < 4.0:
            return crop_params['kc_values']['mid_season']
        else:
            return crop_params['kc_values']['late_season']
    
    def _calculate_deep_percolation(self, moisture: float, field_capacity: float, 
                                  hydraulic_conductivity: float) -> float:
        """Calculate deep percolation losses."""
        if moisture <= field_capacity:
            return 0
        excess_water = moisture - field_capacity
        return min(excess_water * 1000, hydraulic_conductivity / 24)  # mm/hour
    
    def _calculate_urgency_score(self, soil_moisture: float, trigger_points: Dict) -> float:
        """Calculate urgency score based on soil moisture level."""
        if soil_moisture < trigger_points['critical']:
            return 1.0
        elif soil_moisture < trigger_points['high']:
            return 0.8
        elif soil_moisture < trigger_points['medium']:
            return 0.6
        elif soil_moisture < trigger_points['low']:
            return 0.4
        else:
            return 0.0
    
    def _determine_irrigation_urgency(self, stress_events: List[Dict], critical_periods: List[int]) -> str:
        """Determine overall irrigation urgency level."""
        if len(critical_periods) > 12:  # More than 12 hours critical
            return 'critical'
        elif len(critical_periods) > 0:
            return 'high'
        elif len(stress_events) > 24:  # More than 24 hours of any stress
            return 'medium'
        elif len(stress_events) > 0:
            return 'low'
        else:
            return 'none'
    
    def _classify_overall_stress_severity(self, stress_events: List[Dict]) -> str:
        """Classify overall stress severity."""
        if not stress_events:
            return 'none'
        
        critical_count = sum(1 for event in stress_events if event['stress_level'] == 'critical')
        high_count = sum(1 for event in stress_events if event['stress_level'] == 'high')
        
        if critical_count > 6:
            return 'critical'
        elif critical_count > 0 or high_count > 12:
            return 'high'
        elif high_count > 0:
            return 'moderate'
        else:
            return 'low'
    
    def _calculate_irrigation_costs(self, irrigation_events: List[IrrigationEvent], 
                                  irrigation_system: str) -> Dict:
        """Calculate irrigation costs and economic analysis."""
        total_cost = sum(event.cost or 0 for event in irrigation_events)
        total_water = sum(event.water_amount for event in irrigation_events)
        
        system_params = self.irrigation_systems.get(irrigation_system, self.irrigation_systems['drip'])
        
        return {
            'total_cost': round(total_cost, 2),
            'cost_per_mm': round(total_cost / total_water if total_water > 0 else 0, 3),
            'system_efficiency': system_params['efficiency'],
            'water_cost_savings': round((1 - system_params['efficiency']) * total_cost, 2)
        }
    
    def _calculate_water_efficiency_savings(self, irrigation_requirements: Dict, 
                                          irrigation_system: str, crop_type: str) -> Dict:
        """Calculate water efficiency and environmental benefits."""
        system_params = self.irrigation_systems.get(irrigation_system, self.irrigation_systems['drip'])
        
        # Compare with flood irrigation baseline
        flood_efficiency = self.irrigation_systems['flood']['efficiency']
        current_efficiency = system_params['efficiency']
        
        water_savings_percent = ((current_efficiency - flood_efficiency) / flood_efficiency) * 100
        
        yield_impact = "Positive - optimized water application maintains crop health"
        if water_savings_percent > 20:
            environmental_impact = "Highly positive - significant water conservation and reduced runoff"
        elif water_savings_percent > 10:
            environmental_impact = "Positive - moderate water conservation"
        else:
            environmental_impact = "Neutral - standard water usage"
        
        return {
            'water_savings_percent': round(max(0, water_savings_percent), 1),
            'yield_impact': yield_impact,
            'environmental_impact': environmental_impact
        }
    
    def _determine_optimal_timing(self, stress_analysis: Dict, weather_forecast: List[WeatherData]) -> str:
        """Determine optimal irrigation timing."""
        urgency = stress_analysis['irrigation_urgency']
        
        if urgency == 'critical':
            return "Immediate irrigation required"
        elif urgency == 'high':
            return "Irrigate within 2-4 hours"
        elif urgency == 'medium':
            return "Irrigate within 12-24 hours (preferably early morning)"
        else:
            return "Irrigate within 24-48 hours during optimal conditions"
    
    def _analyze_water_efficiency(self, irrigation_recommendation: IrrigationRecommendation,
                                stress_analysis: Dict, crop_type: str, soil_type: str) -> Dict:
        """Analyze overall water use efficiency and optimization opportunities."""
        if not irrigation_recommendation.needs_irrigation:
            return {
                'efficiency_score': 100,
                'optimization_opportunities': ['Continue monitoring', 'Maintain current practices'],
                'water_use_index': 0,
                'sustainability_rating': 'Excellent'
            }
        
        # Calculate efficiency metrics
        water_amount = irrigation_recommendation.water_amount or 0
        stress_severity = stress_analysis.get('stress_severity', 'low')
        
        # Efficiency score based on precision of application
        base_efficiency = 75
        if stress_severity == 'low':
            base_efficiency += 15  # Preventive irrigation is efficient
        elif stress_severity == 'critical':
            base_efficiency -= 10  # Emergency irrigation is less efficient
        
        optimization_opportunities = []
        if water_amount > 30:
            optimization_opportunities.append("Consider split applications to improve efficiency")
        if stress_severity in ['high', 'critical']:
            optimization_opportunities.append("Implement more frequent monitoring to prevent stress")
        
        sustainability_rating = 'Good'
        if base_efficiency > 85:
            sustainability_rating = 'Excellent'
        elif base_efficiency < 70:
            sustainability_rating = 'Needs improvement'
        
        return {
            'efficiency_score': base_efficiency,
            'optimization_opportunities': optimization_opportunities,
            'water_use_index': round(water_amount / 25, 1),  # Normalized index
            'sustainability_rating': sustainability_rating
        }
    
    def _calculate_model_accuracy(self, stress_analysis: Dict) -> float:
        """Calculate model accuracy based on data quality and consistency."""
        # Simplified accuracy calculation
        base_accuracy = 85
        
        stress_events = stress_analysis.get('stress_events', [])
        if len(stress_events) > 0:
            # More stress events indicate more detailed analysis
            base_accuracy += min(10, len(stress_events) / 5)
        
        return min(95, base_accuracy)
    
    def _assess_data_quality(self, lai_data: List[Dict], weather_data: List[Dict], 
                           satellite_data: Dict) -> Dict:
        """Assess quality of input data for analysis."""
        quality_scores = []
        
        # LAI data quality
        if lai_data:
            lai_quality = min(100, len(lai_data) * 5)  # 20 measurements = 100%
            quality_scores.append(lai_quality)
        
        # Weather data quality
        if weather_data:
            weather_quality = min(100, len(weather_data) * 3.33)  # 30 days = 100%
            quality_scores.append(weather_quality)
        
        # Satellite data quality
        if satellite_data and satellite_data.get('ndvi'):
            satellite_quality = min(100, len(satellite_data['ndvi']) * 5)  # 20 images = 100%
            quality_scores.append(satellite_quality)
        
        overall_quality = np.mean(quality_scores) if quality_scores else 50
        
        return {
            'overall_quality': round(overall_quality, 1),
            'lai_data_points': len(lai_data) if lai_data else 0,
            'weather_data_points': len(weather_data) if weather_data else 0,
            'satellite_images': len(satellite_data.get('ndvi', [])) if satellite_data else 0,
            'quality_rating': 'Excellent' if overall_quality > 85 else 'Good' if overall_quality > 70 else 'Adequate'
        }
    
    # Additional helper methods
    
    def _estimate_lai_from_ndvi(self, ndvi: float) -> float:
        """Estimate LAI from NDVI using empirical relationship."""
        return max(0, min(6, 3.618 * ndvi - 0.118))
    
    def _calculate_albedo_from_ndvi(self, ndvi: float) -> float:
        """Calculate surface albedo from NDVI."""
        return max(0.1, min(0.4, 0.23 - 0.15 * ndvi + 0.05 * (ndvi ** 2)))
    
    def _calculate_canopy_cover(self, lai: float) -> float:
        """Calculate canopy cover from LAI."""
        return min(1.0, 1 - math.exp(-0.5 * lai))
    
    def _estimate_vegetation_height(self, crop_type: str, lai: float) -> float:
        """Estimate vegetation height based on crop type and LAI."""
        height_factors = {
            'asparagus': 1.5,
            'tomato': 1.2,
            'wheat': 0.8
        }
        base_height = height_factors.get(crop_type, 1.0)
        return base_height * min(1.0, lai / 3.0)
    
    def _calculate_ndvi_trend(self, ndvi_values: List[float]) -> str:
        """Calculate NDVI trend over time."""
        if len(ndvi_values) < 2:
            return 'stable'
        
        recent_avg = np.mean(ndvi_values[-3:])
        older_avg = np.mean(ndvi_values[:3])
        
        change = (recent_avg - older_avg) / older_avg * 100
        
        if change > 5:
            return 'increasing'
        elif change < -5:
            return 'decreasing'
        else:
            return 'stable'
    
    def _assess_vegetation_health(self, ndvi: float, evi: float, lai: float) -> str:
        """Assess overall vegetation health."""
        health_score = (ndvi * 40 + evi * 30 + min(lai/4, 1) * 30)
        
        if health_score > 80:
            return 'excellent'
        elif health_score > 65:
            return 'good'
        elif health_score > 50:
            return 'moderate'
        else:
            return 'poor'
    
    def _calculate_vegetation_adjustment(self, lai: float, crop_type: str) -> float:
        """Calculate vegetation-based adjustment for stress threshold."""
        # Adjust stress threshold based on vegetation development
        if lai < 1.0:
            return 1.1  # Young plants need more water
        elif lai > 4.0:
            return 0.95  # Mature plants are more efficient
        else:
            return 1.0  # Standard threshold
    
    def _analyze_seasonal_patterns(self, weather_data: List[Dict]) -> Dict:
        """Analyze seasonal weather patterns for forecasting."""
        if len(weather_data) < 30:
            return {'temperature_trend': 0, 'humidity_trend': 0}
        
        # Simple linear trend analysis
        temperatures = [d.get('temperature', 20) for d in weather_data[-30:]]
        temp_trend = (temperatures[-1] - temperatures[0]) / 30
        
        humidities = [d.get('humidity', 50) for d in weather_data[-30:]]
        humidity_trend = (humidities[-1] - humidities[0]) / 30
        
        return {
            'temperature_trend': temp_trend,
            'humidity_trend': humidity_trend
        }
    
    def _analyze_daily_patterns(self, weather_data: List[Dict]) -> Dict:
        """Analyze daily weather patterns."""
        # Simplified daily pattern analysis
        return {
            'avg_daily_temp_range': 8,  # Typical daily temperature range
            'peak_humidity_time': 6,    # Hour of peak humidity (early morning)
            'min_humidity_time': 14     # Hour of minimum humidity (afternoon)
        }
    
    def _calculate_days_since_rain(self, weather_data: List[Dict]) -> int:
        """Calculate days since last significant rainfall."""
        days = 0
        for day in reversed(weather_data):
            if day.get('rainfall', 0) > 5:  # 5mm threshold
                break
            days += 1
        return min(days, 30)
    
    def _calculate_growing_degree_days(self, weather_data: List[Dict]) -> float:
        """Calculate growing degree days for crop development assessment."""
        base_temp = 10  # Base temperature for most crops
        gdd = 0
        for day in weather_data:
            daily_temp = day.get('temperature', 20)
            if daily_temp > base_temp:
                gdd += daily_temp - base_temp
        return gdd
    
    def _get_default_initial_conditions(self, crop_type: str, soil_type: str) -> Dict:
        """Provide default initial conditions when data is unavailable."""
        crop_params = self.crop_parameters.get(crop_type, self.crop_parameters['asparagus'])
        soil_params = self.soil_types.get(soil_type, self.soil_types['loamy'])
        
        return {
            'soil_water_content': soil_params['field_capacity'] * 0.7,
            'field_capacity': soil_params['field_capacity'],
            'wilting_point': soil_params['wilting_point'],
            'lai': 2.5,
            'ndvi': 0.6,
            'albedo': 0.2,
            'root_zone_depth': crop_params['rooting_depth'],
            'canopy_cover': 0.6,
            'days_since_rain': 3,
            'growing_degree_days': 150,
            'water_balance': 0,
            'last_irrigation': None,
            'soil_temperature': 18
        }
    
    def _get_default_weather_forecast(self) -> List[WeatherData]:
        """Provide default weather forecast."""
        forecast = []
        base_date = datetime.now()
        
        for day in range(3):
            forecast_date = base_date + timedelta(days=day+1)
            weather = WeatherData(
                date=forecast_date.strftime('%Y-%m-%d'),
                temperature=22 + day,
                humidity=60 - day * 5,
                rainfall=2 if day == 1 else 0,
                wind_speed=2,
                solar_radiation=20
            )
            forecast.append(weather)
        
        return forecast
    
    def _get_fallback_irrigation_recommendation(self) -> Dict:
        """Provide fallback recommendation when analysis fails."""
        return {
            'analysis_id': 'fallback-' + str(int(datetime.now().timestamp())),
            'timestamp': datetime.now().isoformat(),
            'needs_irrigation': False,
            'confidence': 50,
            'reasoning': "Unable to complete smart irrigation analysis. Manual inspection recommended.",
            'water_amount': None,
            'irrigation_method': None,
            'timing': None,
            'cost_estimate': None,
            'water_savings': None,
            'yield_impact': "Analysis incomplete",
            'environmental_impact': "Unknown",
            'processing_time': 0,
            'model_accuracy': 0,
            'error': "Analysis failed - insufficient data or system error"
        }