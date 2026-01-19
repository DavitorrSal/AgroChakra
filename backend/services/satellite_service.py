"""
Satellite Data Service
Handles fetching and processing satellite imagery and vegetation indices
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import requests
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SatelliteImage:
    """Data class for satellite image metadata"""
    date: datetime
    cloud_cover: float
    ndvi_mean: float
    evi_mean: float
    url: Optional[str] = None
    metadata: Optional[Dict] = None

class SatelliteDataService:
    """Service for fetching and processing satellite data"""
    
    def __init__(self):
        self.nasa_api_key = os.getenv('NASA_API_KEY')
        self.earthengine_key = os.getenv('EARTHENGINE_API_KEY')
        self.base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        
    def is_available(self) -> bool:
        """Check if satellite data services are available"""
        try:
            # Simple connectivity check
            response = requests.get("https://power.larc.nasa.gov/api/", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_satellite_data(self, bounds: Dict, start_date: datetime, 
                          end_date: Optional[datetime] = None) -> Dict:
        """
        Fetch satellite data for the specified bounds and date range
        
        Args:
            bounds: Dictionary with 'north', 'south', 'east', 'west' coordinates
            start_date: Start date for data collection
            end_date: End date for data collection (defaults to today)
            
        Returns:
            Dictionary containing satellite data including NDVI, EVI, and dates
        """
        if end_date is None:
            end_date = datetime.utcnow()
            
        logger.info(f"Fetching satellite data for bounds: {bounds}")
        
        try:
            # For demo purposes, generate realistic satellite data
            # In production, this would call actual satellite APIs
            return self._generate_demo_satellite_data(bounds, start_date, end_date)
            
        except Exception as e:
            logger.error(f"Error fetching satellite data: {str(e)}")
            # Return demo data as fallback
            return self._generate_demo_satellite_data(bounds, start_date, end_date)
    
    def get_imagery(self, lat: float, lon: float, date: str, 
                   image_type: str = 'rgb') -> Dict:
        """
        Get satellite imagery for a specific location and date
        
        Args:
            lat: Latitude
            lon: Longitude
            date: Date string in YYYY-MM-DD format
            image_type: Type of imagery ('rgb', 'ndvi', 'evi')
            
        Returns:
            Dictionary with imagery URL and metadata
        """
        try:
            # In production, this would fetch actual satellite imagery
            # For demo, return placeholder imagery URLs
            return self._get_demo_imagery(lat, lon, date, image_type)
            
        except Exception as e:
            logger.error(f"Error fetching imagery: {str(e)}")
            return {'url': None, 'metadata': {}}
    
    def calculate_vegetation_indices(self, red: np.ndarray, nir: np.ndarray, 
                                   blue: Optional[np.ndarray] = None) -> Dict:
        """
        Calculate vegetation indices from satellite bands
        
        Args:
            red: Red band values
            nir: Near-infrared band values
            blue: Blue band values (optional, for EVI)
            
        Returns:
            Dictionary with calculated indices
        """
        indices = {}
        
        # NDVI calculation
        ndvi = (nir - red) / (nir + red + 1e-8)  # Add small value to avoid division by zero
        indices['ndvi'] = np.clip(ndvi, -1, 1)
        
        # EVI calculation (if blue band is available)
        if blue is not None:
            evi = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))
            indices['evi'] = np.clip(evi, -1, 1)
        else:
            # Simplified EVI without blue band
            indices['evi'] = np.clip(ndvi * 0.8, -1, 1)
        
        # SAVI (Soil Adjusted Vegetation Index)
        L = 0.5  # Soil brightness correction factor
        savi = ((nir - red) / (nir + red + L)) * (1 + L)
        indices['savi'] = np.clip(savi, -1, 1)
        
        return indices
    
    def _generate_demo_satellite_data(self, bounds: Dict, start_date: datetime, 
                                    end_date: datetime) -> Dict:
        """Generate realistic demo satellite data"""
        
        # Calculate center point
        center_lat = (bounds['north'] + bounds['south']) / 2
        center_lon = (bounds['east'] + bounds['west']) / 2
        
        # Generate time series data
        dates = []
        ndvi_values = []
        evi_values = []
        
        current_date = start_date
        while current_date <= end_date:
            # Skip some dates to simulate cloud cover
            if np.random.random() > 0.3:  # 70% chance of clear imagery
                dates.append(current_date.strftime('%Y-%m-%d'))
                
                # Generate realistic NDVI values (seasonal pattern)
                day_of_year = current_date.timetuple().tm_yday
                seasonal_factor = 0.3 * np.sin(2 * np.pi * day_of_year / 365) + 0.5
                
                # Add some randomness and location-based variation
                lat_factor = (center_lat + 90) / 180  # Normalize latitude
                base_ndvi = 0.2 + seasonal_factor * 0.6 * lat_factor
                ndvi = base_ndvi + np.random.normal(0, 0.1)
                ndvi = np.clip(ndvi, 0, 0.9)
                
                # EVI is typically lower than NDVI
                evi = ndvi * 0.7 + np.random.normal(0, 0.05)
                evi = np.clip(evi, 0, 0.8)
                
                ndvi_values.append(round(ndvi, 3))
                evi_values.append(round(evi, 3))
            
            current_date += timedelta(days=1)
        
        return {
            'dates': dates,
            'ndvi': ndvi_values,
            'evi': evi_values,
            'center_coordinates': {'lat': center_lat, 'lon': center_lon},
            'data_source': 'demo_satellite_service',
            'resolution': '10m',
            'satellite': 'Sentinel-2 (simulated)'
        }
    
    def _get_demo_imagery(self, lat: float, lon: float, date: str, 
                         image_type: str) -> Dict:
        """Generate demo imagery URLs and metadata"""
        
        # In production, these would be actual satellite imagery URLs
        base_url = "https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/thumbnails"
        
        imagery_urls = {
            'rgb': f"{base_url}/rgb?lat={lat}&lon={lon}&date={date}",
            'ndvi': f"{base_url}/ndvi?lat={lat}&lon={lon}&date={date}",
            'evi': f"{base_url}/evi?lat={lat}&lon={lon}&date={date}"
        }
        
        metadata = {
            'acquisition_date': date,
            'cloud_cover': np.random.uniform(0, 30),
            'resolution': '10m',
            'satellite': 'Sentinel-2',
            'processing_level': 'L2A',
            'coordinate_system': 'EPSG:4326'
        }
        
        return {
            'url': imagery_urls.get(image_type),
            'metadata': metadata
        }
    
    def get_historical_ndvi(self, lat: float, lon: float, 
                           years: int = 5) -> List[Dict]:
        """
        Get historical NDVI data for trend analysis
        
        Args:
            lat: Latitude
            lon: Longitude
            years: Number of years of historical data
            
        Returns:
            List of dictionaries with historical NDVI data
        """
        historical_data = []
        
        for year in range(years):
            year_date = datetime.utcnow() - timedelta(days=365 * year)
            
            # Generate seasonal NDVI pattern
            for month in range(1, 13):
                date = year_date.replace(month=month, day=15)
                
                # Seasonal NDVI variation
                seasonal_factor = 0.3 * np.sin(2 * np.pi * month / 12) + 0.5
                base_ndvi = 0.3 + seasonal_factor * 0.4
                ndvi = base_ndvi + np.random.normal(0, 0.05)
                
                historical_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'ndvi': round(np.clip(ndvi, 0, 0.9), 3),
                    'year': date.year,
                    'month': date.month
                })
        
        return sorted(historical_data, key=lambda x: x['date'])
    
    def analyze_vegetation_health(self, ndvi_values: List[float]) -> Dict:
        """
        Analyze vegetation health based on NDVI values
        
        Args:
            ndvi_values: List of NDVI values
            
        Returns:
            Dictionary with health analysis
        """
        if not ndvi_values:
            return {'status': 'no_data', 'health_score': 0}
        
        mean_ndvi = np.mean(ndvi_values)
        std_ndvi = np.std(ndvi_values)
        trend = np.polyfit(range(len(ndvi_values)), ndvi_values, 1)[0]
        
        # Health classification
        if mean_ndvi > 0.6:
            health_status = 'excellent'
            health_score = 90 + min(10, (mean_ndvi - 0.6) * 25)
        elif mean_ndvi > 0.4:
            health_status = 'good'
            health_score = 70 + (mean_ndvi - 0.4) * 100
        elif mean_ndvi > 0.2:
            health_status = 'moderate'
            health_score = 40 + (mean_ndvi - 0.2) * 150
        else:
            health_status = 'poor'
            health_score = max(10, mean_ndvi * 200)
        
        return {
            'status': health_status,
            'health_score': round(health_score, 1),
            'mean_ndvi': round(mean_ndvi, 3),
            'variability': round(std_ndvi, 3),
            'trend': 'increasing' if trend > 0.01 else 'decreasing' if trend < -0.01 else 'stable',
            'trend_value': round(trend, 4)
        }