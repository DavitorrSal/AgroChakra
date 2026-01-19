"""
LAI (Leaf Area Index) Calculator Service
Calculates LAI from satellite vegetation indices using various algorithms
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class LAIResult:
    """Data class for LAI calculation results"""
    date: str
    lai_value: float
    confidence: float
    method: str
    ndvi_input: Optional[float] = None
    evi_input: Optional[float] = None

class LAICalculator:
    """Service for calculating Leaf Area Index from satellite data"""
    
    def __init__(self):
        self.calculation_methods = {
            'ndvi_exponential': self._calculate_lai_from_ndvi_exponential,
            'ndvi_linear': self._calculate_lai_from_ndvi_linear,
            'evi_based': self._calculate_lai_from_evi,
            'combined': self._calculate_lai_combined
        }
        self.default_method = 'combined'
        
    def calculate_lai_timeseries(self, satellite_data: Dict, bounds: Dict, 
                               method: str = None) -> List[Dict]:
        """
        Calculate LAI time series from satellite data
        
        Args:
            satellite_data: Dictionary containing NDVI, EVI, and dates
            bounds: Farm boundary coordinates
            method: Calculation method to use
            
        Returns:
            List of dictionaries with LAI values and metadata
        """
        if method is None:
            method = self.default_method
            
        if method not in self.calculation_methods:
            logger.warning(f"Unknown method {method}, using {self.default_method}")
            method = self.default_method
            
        logger.info(f"Calculating LAI using method: {method}")
        
        dates = satellite_data.get('dates', [])
        ndvi_values = satellite_data.get('ndvi', [])
        evi_values = satellite_data.get('evi', [])
        
        if not dates or not ndvi_values:
            logger.error("Insufficient satellite data for LAI calculation")
            return []
        
        lai_results = []
        calculation_func = self.calculation_methods[method]
        
        for i, date in enumerate(dates):
            try:
                ndvi = ndvi_values[i] if i < len(ndvi_values) else None
                evi = evi_values[i] if i < len(evi_values) else None
                
                if ndvi is not None:
                    lai_result = calculation_func(ndvi, evi)
                    
                    lai_results.append({
                        'date': date,
                        'lai': round(lai_result.lai_value, 3),
                        'confidence': round(lai_result.confidence, 2),
                        'method': lai_result.method,
                        'ndvi': ndvi,
                        'evi': evi
                    })
                    
            except Exception as e:
                logger.error(f"Error calculating LAI for date {date}: {str(e)}")
                continue
        
        return lai_results
    
    def _calculate_lai_from_ndvi_exponential(self, ndvi: float, 
                                           evi: Optional[float] = None) -> LAIResult:
        """
        Calculate LAI using exponential relationship with NDVI
        Based on: LAI = -ln(1-NDVI)/k where k is extinction coefficient
        """
        if ndvi <= 0:
            return LAIResult(
                date="", lai_value=0.0, confidence=0.0, 
                method="ndvi_exponential", ndvi_input=ndvi
            )
        
        # Extinction coefficient (varies by crop type, using general value)
        k = 0.5
        
        # Exponential relationship
        lai = -np.log(1 - min(ndvi, 0.95)) / k
        
        # Confidence based on NDVI quality
        confidence = self._calculate_confidence(ndvi, method="exponential")
        
        return LAIResult(
            date="", lai_value=max(0, lai), confidence=confidence,
            method="ndvi_exponential", ndvi_input=ndvi
        )
    
    def _calculate_lai_from_ndvi_linear(self, ndvi: float, 
                                      evi: Optional[float] = None) -> LAIResult:
        """
        Calculate LAI using linear relationship with NDVI
        Based on empirical relationships from literature
        """
        # Linear relationship: LAI = a * NDVI + b
        # Coefficients based on general crop studies
        a = 6.0
        b = -1.2
        
        lai = a * ndvi + b
        lai = max(0, min(lai, 8))  # Clamp to reasonable LAI range
        
        # Confidence based on NDVI range
        confidence = self._calculate_confidence(ndvi, method="linear")
        
        return LAIResult(
            date="", lai_value=lai, confidence=confidence,
            method="ndvi_linear", ndvi_input=ndvi
        )
    
    def _calculate_lai_from_evi(self, ndvi: float, evi: Optional[float] = None) -> LAIResult:
        """
        Calculate LAI using Enhanced Vegetation Index (EVI)
        EVI is less sensitive to atmospheric effects and soil background
        """
        if evi is None:
            # Estimate EVI from NDVI if not available
            evi = ndvi * 0.7
        
        # EVI-based LAI relationship
        # Based on: LAI = a * EVI^b
        a = 3.618
        b = 2.0
        
        lai = a * (evi ** b)
        lai = max(0, min(lai, 8))
        
        # Higher confidence for EVI-based calculations
        confidence = self._calculate_confidence(evi, method="evi") * 1.1
        confidence = min(confidence, 100)
        
        return LAIResult(
            date="", lai_value=lai, confidence=confidence,
            method="evi_based", ndvi_input=ndvi, evi_input=evi
        )
    
    def _calculate_lai_combined(self, ndvi: float, evi: Optional[float] = None) -> LAIResult:
        """
        Calculate LAI using combined approach with multiple indices
        Provides more robust estimates by averaging different methods
        """
        # Get results from different methods
        lai_exp = self._calculate_lai_from_ndvi_exponential(ndvi, evi)
        lai_lin = self._calculate_lai_from_ndvi_linear(ndvi, evi)
        
        if evi is not None:
            lai_evi = self._calculate_lai_from_evi(ndvi, evi)
            
            # Weighted average based on confidence
            weights = [lai_exp.confidence, lai_lin.confidence, lai_evi.confidence]
            values = [lai_exp.lai_value, lai_lin.lai_value, lai_evi.lai_value]
            
            total_weight = sum(weights)
            if total_weight > 0:
                lai_combined = sum(w * v for w, v in zip(weights, values)) / total_weight
                confidence_combined = np.mean(weights)
            else:
                lai_combined = np.mean(values)
                confidence_combined = 50
        else:
            # Average of NDVI-based methods only
            lai_combined = (lai_exp.lai_value + lai_lin.lai_value) / 2
            confidence_combined = (lai_exp.confidence + lai_lin.confidence) / 2
        
        return LAIResult(
            date="", lai_value=lai_combined, confidence=confidence_combined,
            method="combined", ndvi_input=ndvi, evi_input=evi
        )
    
    def _calculate_confidence(self, index_value: float, method: str) -> float:
        """
        Calculate confidence score for LAI estimation
        
        Args:
            index_value: NDVI or EVI value
            method: Calculation method used
            
        Returns:
            Confidence score (0-100)
        """
        base_confidence = 70
        
        # Confidence decreases at extreme values
        if index_value < 0.1:
            confidence = 30  # Very low vegetation
        elif index_value < 0.2:
            confidence = 50
        elif index_value < 0.8:
            confidence = base_confidence + (index_value - 0.2) * 30
        else:
            confidence = base_confidence - (index_value - 0.8) * 50
        
        # Method-specific adjustments
        if method == "exponential":
            confidence *= 0.9  # Slightly less confident in exponential
        elif method == "evi":
            confidence *= 1.1  # More confident in EVI-based
        
        return max(20, min(95, confidence))
    
    def analyze_lai_trends(self, lai_data: List[Dict]) -> Dict:
        """
        Analyze LAI trends over time
        
        Args:
            lai_data: List of LAI measurements with dates
            
        Returns:
            Dictionary with trend analysis
        """
        if len(lai_data) < 2:
            return {'trend': 'insufficient_data', 'slope': 0, 'r_squared': 0}
        
        # Extract LAI values and create time indices
        lai_values = [item['lai'] for item in lai_data]
        time_indices = list(range(len(lai_values)))
        
        # Calculate linear trend
        coeffs = np.polyfit(time_indices, lai_values, 1)
        slope = coeffs[0]
        
        # Calculate R-squared
        lai_pred = np.polyval(coeffs, time_indices)
        ss_res = np.sum((lai_values - lai_pred) ** 2)
        ss_tot = np.sum((lai_values - np.mean(lai_values)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Classify trend
        if abs(slope) < 0.01:
            trend = 'stable'
        elif slope > 0.05:
            trend = 'strongly_increasing'
        elif slope > 0.01:
            trend = 'increasing'
        elif slope < -0.05:
            trend = 'strongly_decreasing'
        else:
            trend = 'decreasing'
        
        # Calculate statistics
        current_lai = lai_values[-1] if lai_values else 0
        max_lai = max(lai_values) if lai_values else 0
        min_lai = min(lai_values) if lai_values else 0
        mean_lai = np.mean(lai_values) if lai_values else 0
        
        return {
            'trend': trend,
            'slope': round(slope, 4),
            'r_squared': round(r_squared, 3),
            'current_lai': round(current_lai, 3),
            'max_lai': round(max_lai, 3),
            'min_lai': round(min_lai, 3),
            'mean_lai': round(mean_lai, 3),
            'variability': round(np.std(lai_values), 3) if lai_values else 0,
            'data_points': len(lai_values)
        }
    
    def get_lai_thresholds(self, crop_type: str = 'general') -> Dict:
        """
        Get LAI thresholds for different crop health categories
        
        Args:
            crop_type: Type of crop (general, corn, wheat, soybean, etc.)
            
        Returns:
            Dictionary with LAI thresholds
        """
        thresholds = {
            'general': {
                'poor': 1.0,
                'moderate': 2.5,
                'good': 4.0,
                'excellent': 6.0
            },
            'corn': {
                'poor': 1.5,
                'moderate': 3.0,
                'good': 5.0,
                'excellent': 7.0
            },
            'wheat': {
                'poor': 1.0,
                'moderate': 2.0,
                'good': 3.5,
                'excellent': 5.0
            },
            'soybean': {
                'poor': 1.2,
                'moderate': 2.8,
                'good': 4.5,
                'excellent': 6.5
            }
        }
        
        return thresholds.get(crop_type, thresholds['general'])
    
    def classify_lai_health(self, lai_value: float, crop_type: str = 'general') -> Dict:
        """
        Classify vegetation health based on LAI value
        
        Args:
            lai_value: LAI value to classify
            crop_type: Type of crop for appropriate thresholds
            
        Returns:
            Dictionary with health classification
        """
        thresholds = self.get_lai_thresholds(crop_type)
        
        if lai_value < thresholds['poor']:
            category = 'poor'
            score = max(0, (lai_value / thresholds['poor']) * 25)
        elif lai_value < thresholds['moderate']:
            category = 'moderate'
            score = 25 + ((lai_value - thresholds['poor']) / 
                         (thresholds['moderate'] - thresholds['poor'])) * 25
        elif lai_value < thresholds['good']:
            category = 'good'
            score = 50 + ((lai_value - thresholds['moderate']) / 
                         (thresholds['good'] - thresholds['moderate'])) * 25
        elif lai_value < thresholds['excellent']:
            category = 'excellent'
            score = 75 + ((lai_value - thresholds['good']) / 
                         (thresholds['excellent'] - thresholds['good'])) * 25
        else:
            category = 'exceptional'
            score = min(100, 90 + (lai_value - thresholds['excellent']) * 2)
        
        return {
            'category': category,
            'score': round(score, 1),
            'lai_value': round(lai_value, 3),
            'thresholds': thresholds
        }
    
    def get_method_info(self) -> Dict:
        """Get information about available calculation methods"""
        return {
            'available_methods': list(self.calculation_methods.keys()),
            'default_method': self.default_method,
            'method_descriptions': {
                'ndvi_exponential': 'Exponential relationship between NDVI and LAI',
                'ndvi_linear': 'Linear relationship between NDVI and LAI',
                'evi_based': 'Enhanced Vegetation Index based calculation',
                'combined': 'Weighted average of multiple methods'
            }
        }