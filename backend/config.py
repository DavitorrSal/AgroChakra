"""
Configuration settings for the Agricultural Analysis Game backend
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'agricultural-game-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Server settings
    HOST = os.getenv('HOST', '127.0.0.1')
    PORT = int(os.getenv('PORT', 5000))
    
    # API Keys
    NASA_API_KEY = os.getenv('NASA_API_KEY')
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
    EARTHENGINE_API_KEY = os.getenv('EARTHENGINE_API_KEY')
    
    # API URLs
    NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
    OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5"
    EARTHENGINE_URL = "https://earthengine.googleapis.com/v1alpha"
    
    # Data processing settings
    MAX_ANALYSIS_DAYS = 90  # Maximum days of historical data
    DEFAULT_ANALYSIS_DAYS = 30  # Default days for analysis
    MAX_FARM_SIZE_HECTARES = 10000  # Maximum farm size for analysis
    MIN_FARM_SIZE_HECTARES = 0.1  # Minimum farm size for analysis
    
    # LAI calculation settings
    LAI_CALCULATION_METHOD = 'combined'  # Default LAI calculation method
    LAI_CONFIDENCE_THRESHOLD = 50  # Minimum confidence for LAI calculations
    
    # Weather data settings
    WEATHER_API_TIMEOUT = 30  # Seconds
    WEATHER_CACHE_DURATION = 3600  # Seconds (1 hour)
    
    # Satellite data settings
    SATELLITE_API_TIMEOUT = 60  # Seconds
    SATELLITE_CACHE_DURATION = 7200  # Seconds (2 hours)
    MAX_CLOUD_COVER = 80  # Maximum acceptable cloud cover percentage
    
    # Fertilizer recommendation settings
    FERTILIZER_CONFIDENCE_THRESHOLD = 60  # Minimum confidence for recommendations
    
    # Logging settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # CORS settings
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'file://'
    ]
    
    # Rate limiting (requests per minute)
    RATE_LIMIT_ANALYSIS = 10  # Analysis requests per minute
    RATE_LIMIT_DATA = 60  # Data requests per minute
    
    # Cache settings
    CACHE_TYPE = 'simple'  # 'simple', 'redis', 'filesystem'
    CACHE_DEFAULT_TIMEOUT = 3600  # 1 hour
    
    # Database settings (if using database)
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///agricultural_game.db')
    
    @classmethod
    def validate_config(cls):
        """Validate configuration settings"""
        warnings = []
        errors = []
        
        # Check API keys
        if not cls.NASA_API_KEY:
            warnings.append("NASA_API_KEY not set - using demo data")
        
        if not cls.OPENWEATHER_API_KEY:
            warnings.append("OPENWEATHER_API_KEY not set - using demo weather data")
        
        if not cls.EARTHENGINE_API_KEY:
            warnings.append("EARTHENGINE_API_KEY not set - using demo satellite data")
        
        # Check numeric settings
        if cls.PORT < 1 or cls.PORT > 65535:
            errors.append(f"Invalid PORT: {cls.PORT}")
        
        if cls.MAX_ANALYSIS_DAYS < 1:
            errors.append(f"Invalid MAX_ANALYSIS_DAYS: {cls.MAX_ANALYSIS_DAYS}")
        
        if cls.MAX_FARM_SIZE_HECTARES <= cls.MIN_FARM_SIZE_HECTARES:
            errors.append("MAX_FARM_SIZE_HECTARES must be greater than MIN_FARM_SIZE_HECTARES")
        
        return warnings, errors

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    
    # Enhanced security for production
    SECRET_KEY = os.getenv('SECRET_KEY')  # Must be set in production
    
    # Production API limits
    RATE_LIMIT_ANALYSIS = 5  # Stricter rate limiting
    RATE_LIMIT_DATA = 30
    
    @classmethod
    def validate_config(cls):
        """Additional validation for production"""
        warnings, errors = super().validate_config()
        
        if not cls.SECRET_KEY or cls.SECRET_KEY == Config.SECRET_KEY:
            errors.append("SECRET_KEY must be set to a secure value in production")
        
        return warnings, errors

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use in-memory database for testing
    DATABASE_URL = 'sqlite:///:memory:'
    
    # Disable rate limiting for tests
    RATE_LIMIT_ANALYSIS = 1000
    RATE_LIMIT_DATA = 1000
    
    # Shorter timeouts for faster tests
    WEATHER_API_TIMEOUT = 5
    SATELLITE_API_TIMEOUT = 10

# Configuration mapping
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name=None):
    """Get configuration class based on environment"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    return config_map.get(config_name, DevelopmentConfig)

# Crop-specific configurations
CROP_CONFIGS = {
    'corn': {
        'lai_thresholds': {'poor': 1.5, 'moderate': 3.0, 'good': 5.0, 'excellent': 7.0},
        'optimal_temperature': (18, 30),
        'optimal_rainfall_monthly': (75, 125),
        'fertilizer_rates': {'nitrogen': 150, 'phosphorus': 60, 'potassium': 80}
    },
    'wheat': {
        'lai_thresholds': {'poor': 1.0, 'moderate': 2.0, 'good': 3.5, 'excellent': 5.0},
        'optimal_temperature': (15, 25),
        'optimal_rainfall_monthly': (50, 100),
        'fertilizer_rates': {'nitrogen': 120, 'phosphorus': 40, 'potassium': 60}
    },
    'soybean': {
        'lai_thresholds': {'poor': 1.2, 'moderate': 2.8, 'good': 4.5, 'excellent': 6.5},
        'optimal_temperature': (20, 30),
        'optimal_rainfall_monthly': (60, 110),
        'fertilizer_rates': {'nitrogen': 50, 'phosphorus': 50, 'potassium': 70}
    },
    'rice': {
        'lai_thresholds': {'poor': 1.5, 'moderate': 3.5, 'good': 5.5, 'excellent': 8.0},
        'optimal_temperature': (22, 32),
        'optimal_rainfall_monthly': (100, 200),
        'fertilizer_rates': {'nitrogen': 100, 'phosphorus': 30, 'potassium': 50}
    },
    'general': {
        'lai_thresholds': {'poor': 1.0, 'moderate': 2.5, 'good': 4.0, 'excellent': 6.0},
        'optimal_temperature': (15, 30),
        'optimal_rainfall_monthly': (50, 150),
        'fertilizer_rates': {'nitrogen': 100, 'phosphorus': 50, 'potassium': 60}
    }
}

# Regional climate adjustments
CLIMATE_ADJUSTMENTS = {
    'tropical': {
        'temperature_adjustment': 5,
        'rainfall_multiplier': 1.5,
        'humidity_adjustment': 15
    },
    'subtropical': {
        'temperature_adjustment': 2,
        'rainfall_multiplier': 1.2,
        'humidity_adjustment': 5
    },
    'temperate': {
        'temperature_adjustment': 0,
        'rainfall_multiplier': 1.0,
        'humidity_adjustment': 0
    },
    'arid': {
        'temperature_adjustment': 3,
        'rainfall_multiplier': 0.5,
        'humidity_adjustment': -20
    },
    'cold': {
        'temperature_adjustment': -10,
        'rainfall_multiplier': 0.8,
        'humidity_adjustment': 10
    }
}

def get_climate_zone(latitude):
    """Determine climate zone based on latitude"""
    abs_lat = abs(latitude)
    
    if abs_lat < 23.5:
        return 'tropical'
    elif abs_lat < 35:
        return 'subtropical'
    elif abs_lat < 50:
        return 'temperate'
    elif abs_lat < 66.5:
        return 'cold'
    else:
        return 'polar'