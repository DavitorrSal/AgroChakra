"""
Weather Data Service
Handles fetching and processing weather data for agricultural analysis
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
import numpy as np

logger = logging.getLogger(__name__)

class WeatherDataService:
    """Service for fetching and processing weather data"""
    
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.nasa_power_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        self.openweather_url = "https://api.openweathermap.org/data/2.5"
        
    def is_available(self) -> bool:
        """Check if weather data services are available"""
        try:
            # Check NASA POWER API
            response = requests.get(
                "https://power.larc.nasa.gov/api/",
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def get_weather_data(self, lat: float, lon: float, days: int = 30) -> List[Dict]:
        """
        Get weather data for specified location and time period
        
        Args:
            lat: Latitude
            lon: Longitude
            days: Number of days of historical data
            
        Returns:
            List of daily weather data dictionaries
        """
        logger.info(f"Fetching weather data for {lat}, {lon} for {days} days")
        
        try:
            # Try NASA POWER API first
            weather_data = self._fetch_nasa_power_data(lat, lon, days)
            if weather_data:
                return weather_data
        except Exception as e:
            logger.warning(f"NASA POWER API failed: {str(e)}")
        
        try:
            # Fallback to OpenWeatherMap if available
            if self.api_key:
                weather_data = self._fetch_openweather_data(lat, lon, days)
                if weather_data:
                    return weather_data
        except Exception as e:
            logger.warning(f"OpenWeatherMap API failed: {str(e)}")
        
        # Generate demo data as final fallback
        logger.info("Using demo weather data")
        return self._generate_demo_weather_data(lat, lon, days)
    
    def _fetch_nasa_power_data(self, lat: float, lon: float, days: int) -> List[Dict]:
        """Fetch weather data from NASA POWER API"""
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        params = {
            'parameters': 'T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN',
            'community': 'AG',
            'longitude': lon,
            'latitude': lat,
            'start': start_date.strftime('%Y%m%d'),
            'end': end_date.strftime('%Y%m%d'),
            'format': 'JSON'
        }
        
        response = requests.get(self.nasa_power_url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return self._process_nasa_power_data(data)
        else:
            logger.error(f"NASA POWER API error: {response.status_code}")
            return []
    
    def _fetch_openweather_data(self, lat: float, lon: float, days: int) -> List[Dict]:
        """Fetch weather data from OpenWeatherMap API"""
        
        weather_data = []
        
        # Get current weather
        current_url = f"{self.openweather_url}/weather"
        current_params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        response = requests.get(current_url, params=current_params, timeout=10)
        
        if response.status_code == 200:
            current_data = response.json()
            
            # For historical data, we'll simulate based on current conditions
            # In production, you'd use the historical weather API
            base_temp = current_data['main']['temp']
            base_humidity = current_data['main']['humidity']
            
            for i in range(days):
                date = datetime.utcnow() - timedelta(days=days-i-1)
                
                # Add seasonal and random variation
                temp_variation = np.sin(i * 0.1) * 5 + np.random.normal(0, 3)
                humidity_variation = np.random.normal(0, 10)
                
                weather_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'temperature': round(base_temp + temp_variation, 1),
                    'humidity': round(max(0, min(100, base_humidity + humidity_variation)), 1),
                    'rainfall': max(0, np.random.exponential(2) if np.random.random() < 0.3 else 0),
                    'wind_speed': round(max(0, np.random.normal(5, 2)), 1),
                    'solar_radiation': round(max(0, np.random.normal(20, 5)), 1)
                })
        
        return weather_data
    
    def _generate_demo_weather_data(self, lat: float, lon: float, days: int) -> List[Dict]:
        """Generate realistic demo weather data"""
        
        weather_data = []
        
        # Base conditions based on latitude (rough climate estimation)
        if abs(lat) < 23.5:  # Tropical
            base_temp = 28
            base_humidity = 75
            rainfall_prob = 0.4
        elif abs(lat) < 40:  # Subtropical
            base_temp = 22
            base_humidity = 65
            rainfall_prob = 0.3
        elif abs(lat) < 60:  # Temperate
            base_temp = 15
            base_humidity = 60
            rainfall_prob = 0.25
        else:  # Cold
            base_temp = 5
            base_humidity = 70
            rainfall_prob = 0.2
        
        # Seasonal adjustment
        current_day = datetime.utcnow().timetuple().tm_yday
        seasonal_factor = np.sin(2 * np.pi * current_day / 365)
        
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days-i-1)
            day_of_year = date.timetuple().tm_yday
            
            # Seasonal temperature variation
            seasonal_temp = seasonal_factor * 10 if lat > 0 else -seasonal_factor * 10
            daily_temp = base_temp + seasonal_temp + np.random.normal(0, 4)
            
            # Humidity variation
            humidity = base_humidity + np.random.normal(0, 15)
            humidity = max(20, min(95, humidity))
            
            # Rainfall (exponential distribution for realistic patterns)
            rainfall = 0
            if np.random.random() < rainfall_prob:
                rainfall = np.random.exponential(8)
            
            # Wind speed
            wind_speed = max(0, np.random.normal(8, 4))
            
            # Solar radiation (affected by season and weather)
            base_solar = 20 + seasonal_factor * 10
            cloud_factor = 1 - (rainfall / 20)  # Reduce solar on rainy days
            solar_radiation = max(0, base_solar * cloud_factor + np.random.normal(0, 3))
            
            weather_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'temperature': round(daily_temp, 1),
                'humidity': round(humidity, 1),
                'rainfall': round(rainfall, 1),
                'wind_speed': round(wind_speed, 1),
                'solar_radiation': round(solar_radiation, 1)
            })
        
        return weather_data
    
    def _process_nasa_power_data(self, data: Dict) -> List[Dict]:
        """Process NASA POWER API response data"""
        
        weather_data = []
        
        try:
            parameters = data.get('properties', {}).get('parameter', {})
            
            # Extract parameter data
            temperatures = parameters.get('T2M', {})
            precipitation = parameters.get('PRECTOTCORR', {})
            humidity = parameters.get('RH2M', {})
            wind_speed = parameters.get('WS2M', {})
            solar_radiation = parameters.get('ALLSKY_SFC_SW_DWN', {})
            
            # Get all available dates
            dates = set()
            for param_data in [temperatures, precipitation, humidity, wind_speed, solar_radiation]:
                dates.update(param_data.keys())
            
            # Process each date
            for date_str in sorted(dates):
                try:
                    # Convert date format from YYYYMMDD to YYYY-MM-DD
                    date_obj = datetime.strptime(date_str, '%Y%m%d')
                    formatted_date = date_obj.strftime('%Y-%m-%d')
                    
                    weather_data.append({
                        'date': formatted_date,
                        'temperature': round(temperatures.get(date_str, 20), 1),
                        'humidity': round(humidity.get(date_str, 60), 1),
                        'rainfall': round(precipitation.get(date_str, 0), 1),
                        'wind_speed': round(wind_speed.get(date_str, 5), 1),
                        'solar_radiation': round(solar_radiation.get(date_str, 20), 1)
                    })
                except Exception as e:
                    logger.warning(f"Error processing date {date_str}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error processing NASA POWER data: {str(e)}")
            return []
        
        return weather_data
    
    def get_weather_forecast(self, lat: float, lon: float, days: int = 7) -> List[Dict]:
        """
        Get weather forecast for specified location
        
        Args:
            lat: Latitude
            lon: Longitude
            days: Number of days to forecast
            
        Returns:
            List of forecast data dictionaries
        """
        try:
            if self.api_key:
                return self._fetch_openweather_forecast(lat, lon, days)
        except Exception as e:
            logger.warning(f"Forecast API failed: {str(e)}")
        
        # Generate demo forecast
        return self._generate_demo_forecast(lat, lon, days)
    
    def _fetch_openweather_forecast(self, lat: float, lon: float, days: int) -> List[Dict]:
        """Fetch weather forecast from OpenWeatherMap"""
        
        forecast_url = f"{self.openweather_url}/forecast"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric',
            'cnt': min(40, days * 8)  # 3-hour intervals, max 5 days
        }
        
        response = requests.get(forecast_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return self._process_openweather_forecast(data)
        else:
            return []
    
    def _process_openweather_forecast(self, data: Dict) -> List[Dict]:
        """Process OpenWeatherMap forecast data"""
        
        forecast_data = []
        daily_data = {}
        
        for item in data.get('list', []):
            date_str = item['dt_txt'].split(' ')[0]
            
            if date_str not in daily_data:
                daily_data[date_str] = {
                    'temperatures': [],
                    'humidity': [],
                    'rainfall': 0,
                    'wind_speed': []
                }
            
            daily_data[date_str]['temperatures'].append(item['main']['temp'])
            daily_data[date_str]['humidity'].append(item['main']['humidity'])
            daily_data[date_str]['wind_speed'].append(item['wind']['speed'])
            
            # Accumulate rainfall
            rain = item.get('rain', {}).get('3h', 0)
            daily_data[date_str]['rainfall'] += rain
        
        # Convert to daily summaries
        for date_str, day_data in daily_data.items():
            forecast_data.append({
                'date': date_str,
                'temperature': round(np.mean(day_data['temperatures']), 1),
                'humidity': round(np.mean(day_data['humidity']), 1),
                'rainfall': round(day_data['rainfall'], 1),
                'wind_speed': round(np.mean(day_data['wind_speed']), 1),
                'solar_radiation': round(np.random.normal(20, 5), 1)  # Estimated
            })
        
        return forecast_data
    
    def _generate_demo_forecast(self, lat: float, lon: float, days: int) -> List[Dict]:
        """Generate demo weather forecast"""
        
        # Use similar logic to historical data but for future dates
        forecast_data = []
        
        # Base conditions
        if abs(lat) < 23.5:
            base_temp = 28
            base_humidity = 75
        elif abs(lat) < 40:
            base_temp = 22
            base_humidity = 65
        else:
            base_temp = 15
            base_humidity = 60
        
        for i in range(days):
            date = datetime.utcnow() + timedelta(days=i+1)
            
            # Add some trend and randomness
            temp_trend = np.random.normal(0, 2)
            humidity_trend = np.random.normal(0, 5)
            
            forecast_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'temperature': round(base_temp + temp_trend, 1),
                'humidity': round(max(20, min(95, base_humidity + humidity_trend)), 1),
                'rainfall': round(max(0, np.random.exponential(3) if np.random.random() < 0.3 else 0), 1),
                'wind_speed': round(max(0, np.random.normal(8, 3)), 1),
                'solar_radiation': round(max(0, np.random.normal(20, 4)), 1)
            })
        
        return forecast_data
    
    def analyze_weather_patterns(self, weather_data: List[Dict]) -> Dict:
        """
        Analyze weather patterns for agricultural insights
        
        Args:
            weather_data: List of weather data dictionaries
            
        Returns:
            Dictionary with weather pattern analysis
        """
        if not weather_data:
            return {'status': 'no_data'}
        
        # Extract metrics
        temperatures = [day['temperature'] for day in weather_data]
        humidity = [day['humidity'] for day in weather_data]
        rainfall = [day['rainfall'] for day in weather_data]
        
        # Calculate statistics
        avg_temp = np.mean(temperatures)
        temp_range = max(temperatures) - min(temperatures)
        total_rainfall = sum(rainfall)
        rainy_days = sum(1 for r in rainfall if r > 1)
        avg_humidity = np.mean(humidity)
        
        # Analyze trends
        temp_trend = np.polyfit(range(len(temperatures)), temperatures, 1)[0]
        rainfall_trend = np.polyfit(range(len(rainfall)), rainfall, 1)[0]
        
        # Agricultural insights
        growing_conditions = self._assess_growing_conditions(
            avg_temp, total_rainfall, avg_humidity, len(weather_data)
        )
        
        return {
            'temperature': {
                'average': round(avg_temp, 1),
                'range': round(temp_range, 1),
                'trend': 'warming' if temp_trend > 0.1 else 'cooling' if temp_trend < -0.1 else 'stable'
            },
            'rainfall': {
                'total': round(total_rainfall, 1),
                'rainy_days': rainy_days,
                'average_per_day': round(total_rainfall / len(weather_data), 1),
                'trend': 'increasing' if rainfall_trend > 0.1 else 'decreasing' if rainfall_trend < -0.1 else 'stable'
            },
            'humidity': {
                'average': round(avg_humidity, 1),
                'suitable': 40 <= avg_humidity <= 80
            },
            'growing_conditions': growing_conditions,
            'data_period_days': len(weather_data)
        }
    
    def _assess_growing_conditions(self, avg_temp: float, total_rainfall: float, 
                                 avg_humidity: float, days: int) -> Dict:
        """Assess growing conditions based on weather data"""
        
        # Optimal ranges for general crops
        optimal_temp_range = (15, 30)
        optimal_rainfall_range = (50, 150)  # mm per month
        optimal_humidity_range = (50, 80)
        
        # Scale rainfall to monthly equivalent
        monthly_rainfall = total_rainfall * (30 / days)
        
        # Score each factor
        temp_score = 100 if optimal_temp_range[0] <= avg_temp <= optimal_temp_range[1] else max(0, 100 - abs(avg_temp - 22.5) * 4)
        rainfall_score = 100 if optimal_rainfall_range[0] <= monthly_rainfall <= optimal_rainfall_range[1] else max(0, 100 - abs(monthly_rainfall - 100) * 0.5)
        humidity_score = 100 if optimal_humidity_range[0] <= avg_humidity <= optimal_humidity_range[1] else max(0, 100 - abs(avg_humidity - 65) * 2)
        
        overall_score = (temp_score + rainfall_score + humidity_score) / 3
        
        if overall_score >= 80:
            condition = 'excellent'
        elif overall_score >= 60:
            condition = 'good'
        elif overall_score >= 40:
            condition = 'moderate'
        else:
            condition = 'poor'
        
        return {
            'overall_score': round(overall_score, 1),
            'condition': condition,
            'temperature_score': round(temp_score, 1),
            'rainfall_score': round(rainfall_score, 1),
            'humidity_score': round(humidity_score, 1),
            'monthly_rainfall_equivalent': round(monthly_rainfall, 1)
        }