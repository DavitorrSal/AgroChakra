"""
Farm Analysis Data Models
Defines data structures for farm analysis and recommendations
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, field
import math

@dataclass
class FarmBounds:
    """Represents farm boundary coordinates"""
    north: float
    south: float
    east: float
    west: float
    
    def __post_init__(self):
        """Validate coordinates"""
        if not (-90 <= self.south <= self.north <= 90):
            raise ValueError("Invalid latitude values")
        if not (-180 <= self.west <= self.east <= 180):
            raise ValueError("Invalid longitude values")
    
    @property
    def center_lat(self) -> float:
        """Get center latitude"""
        return (self.north + self.south) / 2
    
    @property
    def center_lon(self) -> float:
        """Get center longitude"""
        return (self.east + self.west) / 2
    
    def calculate_area_hectares(self) -> float:
        """Calculate area in hectares using approximate formula"""
        # Convert to meters (approximate)
        lat_diff = abs(self.north - self.south)
        lon_diff = abs(self.east - self.west)
        
        # Approximate conversion (varies by latitude)
        lat_meters = lat_diff * 111000  # ~111km per degree latitude
        lon_meters = lon_diff * 111000 * math.cos(math.radians(self.center_lat))
        
        area_m2 = lat_meters * lon_meters
        area_hectares = area_m2 / 10000  # Convert to hectares
        
        return round(area_hectares, 2)

@dataclass
class WeatherData:
    """Weather data for a specific date"""
    date: str
    temperature: float  # Celsius
    humidity: float     # Percentage
    rainfall: float     # mm
    wind_speed: float   # m/s
    solar_radiation: float  # MJ/m²/day
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'date': self.date,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'rainfall': self.rainfall,
            'wind_speed': self.wind_speed,
            'solar_radiation': self.solar_radiation
        }

@dataclass
class SatelliteData:
    """Satellite data for vegetation analysis"""
    date: str
    ndvi: float
    evi: float
    cloud_cover: Optional[float] = None
    satellite_source: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'date': self.date,
            'ndvi': self.ndvi,
            'evi': self.evi,
            'cloud_cover': self.cloud_cover,
            'satellite_source': self.satellite_source
        }

@dataclass
class LAIData:
    """LAI calculation results"""
    date: str
    lai_value: float
    confidence: float
    calculation_method: str
    ndvi_input: Optional[float] = None
    evi_input: Optional[float] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'date': self.date,
            'lai': self.lai_value,
            'confidence': self.confidence,
            'method': self.calculation_method,
            'ndvi': self.ndvi_input,
            'evi': self.evi_input
        }

@dataclass
class SoilData:
    """Soil analysis data"""
    moisture: float         # Percentage
    nitrogen: float         # ppm
    phosphorus: float       # ppm
    potassium: float        # ppm
    ph: float              # pH scale
    organic_matter: float   # Percentage
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'moisture': self.moisture,
            'nitrogen': self.nitrogen,
            'phosphorus': self.phosphorus,
            'potassium': self.potassium,
            'ph': self.ph,
            'organic_matter': self.organic_matter
        }

@dataclass
class FertilizerRecommendation:
    """Fertilizer recommendation results"""
    needs_fertilizer: bool
    confidence: float
    reasoning: str
    fertilizer_type: Optional[str] = None
    application_rate: Optional[float] = None  # kg/ha
    timing: Optional[str] = None
    expected_benefit: Optional[str] = None
    cost_estimate: Optional[float] = None  # USD/ha
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'needs_fertilizer': self.needs_fertilizer,
            'confidence': self.confidence,
            'reasoning': self.reasoning,
            'fertilizer_type': self.fertilizer_type,
            'application_rate': self.application_rate,
            'timing': self.timing,
            'expected_benefit': self.expected_benefit,
            'cost_estimate': self.cost_estimate
        }

@dataclass
class VegetationAnalysis:
    """Vegetation health analysis results"""
    current_lai: float
    mean_lai: float
    lai_trend: str  # 'increasing', 'decreasing', 'stable'
    health_status: str  # 'poor', 'moderate', 'good', 'excellent'
    health_score: float  # 0-100
    variability: float
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'current_lai': self.current_lai,
            'mean_lai': self.mean_lai,
            'lai_trend': self.lai_trend,
            'health_status': self.health_status,
            'health_score': self.health_score,
            'variability': self.variability
        }

@dataclass
class SoilMoistureData:
    """Detailed soil moisture data for irrigation analysis"""
    datetime: str
    soil_moisture: float  # Volumetric water content (0-1)
    field_capacity: float
    wilting_point: float
    stress_threshold: float
    deficit: float  # Moisture deficit from field capacity
    depth_cm: float  # Measurement depth
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'datetime': self.datetime,
            'soil_moisture': self.soil_moisture,
            'field_capacity': self.field_capacity,
            'wilting_point': self.wilting_point,
            'stress_threshold': self.stress_threshold,
            'deficit': self.deficit,
            'depth_cm': self.depth_cm
        }

@dataclass
class IrrigationEvent:
    """Individual irrigation event data"""
    datetime: str
    water_amount: float  # mm
    irrigation_type: str  # drip, sprinkler, flood
    duration: float  # hours
    efficiency: float  # 0-1
    cost: Optional[float] = None  # USD
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'datetime': self.datetime,
            'water_amount': self.water_amount,
            'irrigation_type': self.irrigation_type,
            'duration': self.duration,
            'efficiency': self.efficiency,
            'cost': self.cost
        }

@dataclass
class IrrigationSchedule:
    """Irrigation schedule and planning data"""
    schedule_date: str
    recommended_events: List[IrrigationEvent]
    total_water_needed: float  # mm
    urgency_level: str  # low, medium, high, critical
    next_irrigation_time: Optional[str] = None
    monitoring_frequency: str = "daily"  # daily, hourly
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'schedule_date': self.schedule_date,
            'recommended_events': [event.to_dict() for event in self.recommended_events],
            'total_water_needed': self.total_water_needed,
            'urgency_level': self.urgency_level,
            'next_irrigation_time': self.next_irrigation_time,
            'monitoring_frequency': self.monitoring_frequency
        }

@dataclass
class IrrigationRecommendation:
    """Smart irrigation recommendation results"""
    needs_irrigation: bool
    confidence: float
    reasoning: str
    water_amount: Optional[float] = None  # mm
    irrigation_method: Optional[str] = None
    timing: Optional[str] = None
    schedule: Optional[IrrigationSchedule] = None
    cost_estimate: Optional[float] = None  # USD/ha
    water_savings: Optional[float] = None  # % compared to traditional
    yield_impact: Optional[str] = None
    environmental_impact: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'needs_irrigation': self.needs_irrigation,
            'confidence': self.confidence,
            'reasoning': self.reasoning,
            'water_amount': self.water_amount,
            'irrigation_method': self.irrigation_method,
            'timing': self.timing,
            'schedule': self.schedule.to_dict() if self.schedule else None,
            'cost_estimate': self.cost_estimate,
            'water_savings': self.water_savings,
            'yield_impact': self.yield_impact,
            'environmental_impact': self.environmental_impact
        }

@dataclass
class IrrigationAnalysis:
    """Complete smart irrigation analysis results"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    analysis_date: datetime = field(default_factory=datetime.utcnow)
    bounds: Optional[FarmBounds] = None
    crop_type: str = "asparagus"
    soil_type: str = "loamy"
    
    # Hydrological model data
    soil_moisture_forecast: List[SoilMoistureData] = field(default_factory=list)
    stress_threshold_data: Optional[Dict] = None
    
    # Weather and satellite inputs
    weather_forecast: List[WeatherData] = field(default_factory=list)
    vegetation_parameters: Optional[Dict] = None
    
    # Analysis results
    irrigation_recommendation: Optional[IrrigationRecommendation] = None
    water_stress_events: List[Dict] = field(default_factory=list)
    
    # Metadata
    processing_time: Optional[float] = None
    model_accuracy: Optional[float] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'analysis_date': self.analysis_date.isoformat(),
            'bounds': {
                'north': self.bounds.north,
                'south': self.bounds.south,
                'east': self.bounds.east,
                'west': self.bounds.west
            } if self.bounds else None,
            'crop_type': self.crop_type,
            'soil_type': self.soil_type,
            'soil_moisture_forecast': [smd.to_dict() for smd in self.soil_moisture_forecast],
            'stress_threshold_data': self.stress_threshold_data,
            'weather_forecast': [wd.to_dict() for wd in self.weather_forecast],
            'vegetation_parameters': self.vegetation_parameters,
            'irrigation_recommendation': self.irrigation_recommendation.to_dict() if self.irrigation_recommendation else None,
            'water_stress_events': self.water_stress_events,
            'processing_time': self.processing_time,
            'model_accuracy': self.model_accuracy
        }

@dataclass
class FarmAnalysis:
    """Complete farm analysis results"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    analysis_date: datetime = field(default_factory=datetime.utcnow)
    bounds: Optional[FarmBounds] = None
    weather_data: List[WeatherData] = field(default_factory=list)
    satellite_data: List[SatelliteData] = field(default_factory=list)
    lai_data: List[LAIData] = field(default_factory=list)
    soil_data: Optional[SoilData] = None
    vegetation_analysis: Optional[VegetationAnalysis] = None
    fertilizer_recommendation: Optional[FertilizerRecommendation] = None
    irrigation_analysis: Optional[IrrigationAnalysis] = None  # New field
    
    # Analysis metadata
    processing_time: Optional[float] = None  # seconds
    data_quality_score: Optional[float] = None  # 0-100
    
    def __init__(self, north: float, south: float, east: float, west: float, 
                 analysis_date: Optional[datetime] = None):
        """Initialize with farm bounds"""
        self.id = str(uuid.uuid4())
        self.analysis_date = analysis_date or datetime.utcnow()
        self.bounds = FarmBounds(north=north, south=south, east=east, west=west)
        self.weather_data = []
        self.satellite_data = []
        self.lai_data = []
        self.soil_data = None
        self.vegetation_analysis = None
        self.fertilizer_recommendation = None
        self.processing_time = None
        self.data_quality_score = None
    
    def calculate_area(self) -> float:
        """Calculate farm area in hectares"""
        if self.bounds:
            return self.bounds.calculate_area_hectares()
        return 0.0
    
    def add_weather_data(self, weather_list: List[Dict]):
        """Add weather data from list of dictionaries"""
        for weather_dict in weather_list:
            weather = WeatherData(
                date=weather_dict['date'],
                temperature=weather_dict['temperature'],
                humidity=weather_dict['humidity'],
                rainfall=weather_dict['rainfall'],
                wind_speed=weather_dict.get('wind_speed', 0),
                solar_radiation=weather_dict.get('solar_radiation', 0)
            )
            self.weather_data.append(weather)
    
    def add_satellite_data(self, satellite_dict: Dict):
        """Add satellite data from dictionary"""
        dates = satellite_dict.get('dates', [])
        ndvi_values = satellite_dict.get('ndvi', [])
        evi_values = satellite_dict.get('evi', [])
        
        for i, date in enumerate(dates):
            if i < len(ndvi_values):
                satellite = SatelliteData(
                    date=date,
                    ndvi=ndvi_values[i],
                    evi=evi_values[i] if i < len(evi_values) else ndvi_values[i] * 0.7,
                    satellite_source=satellite_dict.get('satellite', 'Unknown')
                )
                self.satellite_data.append(satellite)
    
    def add_lai_data(self, lai_list: List[Dict]):
        """Add LAI data from list of dictionaries"""
        for lai_dict in lai_list:
            lai = LAIData(
                date=lai_dict['date'],
                lai_value=lai_dict['lai'],
                confidence=lai_dict['confidence'],
                calculation_method=lai_dict['method'],
                ndvi_input=lai_dict.get('ndvi'),
                evi_input=lai_dict.get('evi')
            )
            self.lai_data.append(lai)
    
    def set_soil_data(self, soil_dict: Dict):
        """Set soil data from dictionary"""
        self.soil_data = SoilData(
            moisture=soil_dict['moisture'],
            nitrogen=soil_dict['nitrogen'],
            phosphorus=soil_dict['phosphorus'],
            potassium=soil_dict['potassium'],
            ph=soil_dict['ph'],
            organic_matter=soil_dict['organic_matter']
        )
    
    def set_fertilizer_recommendation(self, recommendation_dict: Dict):
        """Set fertilizer recommendation from dictionary"""
        self.fertilizer_recommendation = FertilizerRecommendation(
            needs_fertilizer=recommendation_dict['needs_fertilizer'],
            confidence=recommendation_dict['confidence'],
            reasoning=recommendation_dict['reasoning'],
            fertilizer_type=recommendation_dict.get('fertilizer_type'),
            application_rate=recommendation_dict.get('application_rate'),
            timing=recommendation_dict.get('timing'),
            expected_benefit=recommendation_dict.get('expected_benefit'),
            cost_estimate=recommendation_dict.get('cost_estimate')
        )
    
    def calculate_data_quality_score(self) -> float:
        """Calculate overall data quality score"""
        scores = []
        
        # Weather data quality
        if self.weather_data:
            weather_score = min(100, len(self.weather_data) * 3.33)  # 30 days = 100%
            scores.append(weather_score)
        
        # Satellite data quality
        if self.satellite_data:
            satellite_score = min(100, len(self.satellite_data) * 5)  # 20 images = 100%
            # Reduce score for high cloud cover
            avg_cloud_cover = sum(s.cloud_cover or 0 for s in self.satellite_data) / len(self.satellite_data)
            satellite_score *= (1 - avg_cloud_cover / 100)
            scores.append(satellite_score)
        
        # LAI data quality
        if self.lai_data:
            lai_score = min(100, len(self.lai_data) * 5)  # 20 measurements = 100%
            # Weight by confidence
            avg_confidence = sum(l.confidence for l in self.lai_data) / len(self.lai_data)
            lai_score *= (avg_confidence / 100)
            scores.append(lai_score)
        
        # Overall score
        if scores:
            self.data_quality_score = sum(scores) / len(scores)
        else:
            self.data_quality_score = 0
        
        return self.data_quality_score
    
    def to_dict(self) -> Dict:
        """Convert complete analysis to dictionary"""
        return {
            'id': self.id,
            'analysis_date': self.analysis_date.isoformat(),
            'bounds': {
                'north': self.bounds.north,
                'south': self.bounds.south,
                'east': self.bounds.east,
                'west': self.bounds.west
            } if self.bounds else None,
            'area_hectares': self.calculate_area(),
            'weather_data': [w.to_dict() for w in self.weather_data],
            'satellite_data': [s.to_dict() for s in self.satellite_data],
            'lai_data': [l.to_dict() for l in self.lai_data],
            'soil_data': self.soil_data.to_dict() if self.soil_data else None,
            'vegetation_analysis': self.vegetation_analysis.to_dict() if self.vegetation_analysis else None,
            'fertilizer_recommendation': self.fertilizer_recommendation.to_dict() if self.fertilizer_recommendation else None,
            'irrigation_analysis': self.irrigation_analysis.to_dict() if self.irrigation_analysis else None,
            'processing_time': self.processing_time,
            'data_quality_score': self.data_quality_score or self.calculate_data_quality_score()
        }
    
    def get_summary(self) -> Dict:
        """Get summary of analysis results"""
        summary = {
            'id': self.id,
            'analysis_date': self.analysis_date.isoformat(),
            'area_hectares': self.calculate_area(),
            'data_points': {
                'weather_days': len(self.weather_data),
                'satellite_images': len(self.satellite_data),
                'lai_measurements': len(self.lai_data)
            }
        }
        
        if self.vegetation_analysis:
            summary['vegetation_health'] = {
                'status': self.vegetation_analysis.health_status,
                'score': self.vegetation_analysis.health_score,
                'current_lai': self.vegetation_analysis.current_lai
            }
        
        if self.fertilizer_recommendation:
            summary['recommendation'] = {
                'needs_fertilizer': self.fertilizer_recommendation.needs_fertilizer,
                'confidence': self.fertilizer_recommendation.confidence,
                'fertilizer_type': self.fertilizer_recommendation.fertilizer_type
            }
        
        return summary