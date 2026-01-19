#!/usr/bin/env python3
"""
Agricultural Analysis Game - Backend API Server
NASA Apps Challenge 2025

This Flask application provides the backend services for the agricultural analysis game,
including satellite data processing, LAI calculations, and fertilizer recommendations.
"""

import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_restful import Api, Resource
import numpy as np
import pandas as pd
from dotenv import load_dotenv

# Import our custom services
from services.satellite_service import SatelliteDataService
from services.weather_service import WeatherDataService
from services.lai_calculator import LAICalculator
from services.fertilizer_advisor import FertilizerAdvisor
from models.farm_analysis import FarmAnalysis

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'agricultural-game-secret-key')

# Enable CORS for frontend communication
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'])

# Initialize Flask-RESTful
api = Api(app)

# Initialize services
satellite_service = SatelliteDataService()
weather_service = WeatherDataService()
lai_calculator = LAICalculator()
fertilizer_advisor = FertilizerAdvisor()

class HealthCheck(Resource):
    """Health check endpoint to verify API is running"""
    
    def get(self):
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'services': {
                'satellite': satellite_service.is_available(),
                'weather': weather_service.is_available(),
                'lai_calculator': True,
                'fertilizer_advisor': True
            }
        }

class FarmAnalysisAPI(Resource):
    """Main API endpoint for farm analysis"""
    
    def post(self):
        """Analyze a farm area and provide fertilizer recommendations"""
        try:
            data = request.get_json()
            
            # Validate input data
            if not self._validate_input(data):
                return {'error': 'Invalid input data'}, 400
            
            # Extract coordinates
            bounds = data['bounds']
            north = bounds['north']
            south = bounds['south']
            east = bounds['east']
            west = bounds['west']
            
            logger.info(f"Analyzing farm area: {north}, {south}, {east}, {west}")
            
            # Create farm analysis object
            farm_analysis = FarmAnalysis(
                north=north, south=south, east=east, west=west,
                analysis_date=datetime.utcnow()
            )
            
            # Fetch satellite data
            satellite_data = satellite_service.get_satellite_data(
                bounds, start_date=datetime.utcnow() - timedelta(days=30)
            )
            
            # Fetch weather data
            weather_data = weather_service.get_weather_data(
                lat=(north + south) / 2,
                lon=(east + west) / 2,
                days=30
            )
            
            # Calculate LAI
            lai_data = lai_calculator.calculate_lai_timeseries(
                satellite_data, bounds
            )
            
            # Generate fertilizer recommendation
            recommendation = fertilizer_advisor.analyze_and_recommend(
                lai_data=lai_data,
                weather_data=weather_data,
                satellite_data=satellite_data,
                farm_bounds=bounds
            )
            
            # Prepare response
            response = {
                'analysis_id': farm_analysis.id,
                'timestamp': farm_analysis.analysis_date.isoformat(),
                'bounds': bounds,
                'area_hectares': farm_analysis.calculate_area(),
                'weather_data': weather_data,
                'lai_data': lai_data,
                'satellite_data': {
                    'ndvi': satellite_data.get('ndvi', []),
                    'evi': satellite_data.get('evi', []),
                    'imagery_dates': satellite_data.get('dates', [])
                },
                'recommendation': recommendation,
                'confidence': recommendation.get('confidence', 0),
                'reasoning': recommendation.get('reasoning', '')
            }
            
            logger.info(f"Analysis completed for farm {farm_analysis.id}")
            return response, 200
            
        except Exception as e:
            logger.error(f"Error in farm analysis: {str(e)}")
            return {'error': 'Internal server error'}, 500
    
    def _validate_input(self, data):
        """Validate input data structure"""
        if not data or 'bounds' not in data:
            return False
        
        bounds = data['bounds']
        required_keys = ['north', 'south', 'east', 'west']
        
        for key in required_keys:
            if key not in bounds:
                return False
            if not isinstance(bounds[key], (int, float)):
                return False
        
        # Validate coordinate ranges
        if not (-90 <= bounds['south'] <= bounds['north'] <= 90):
            return False
        if not (-180 <= bounds['west'] <= bounds['east'] <= 180):
            return False
        
        return True

class SatelliteImageryAPI(Resource):
    """API endpoint for satellite imagery requests"""
    
    def get(self):
        """Get satellite imagery for a specific area and date"""
        try:
            lat = float(request.args.get('lat'))
            lon = float(request.args.get('lon'))
            date = request.args.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
            image_type = request.args.get('type', 'rgb')  # rgb, ndvi, evi
            
            imagery_data = satellite_service.get_imagery(
                lat=lat, lon=lon, date=date, image_type=image_type
            )
            
            return {
                'imagery_url': imagery_data.get('url'),
                'metadata': imagery_data.get('metadata', {}),
                'date': date,
                'type': image_type
            }
            
        except Exception as e:
            logger.error(f"Error fetching satellite imagery: {str(e)}")
            return {'error': 'Failed to fetch satellite imagery'}, 500

class WeatherDataAPI(Resource):
    """API endpoint for weather data requests"""
    
    def get(self):
        """Get weather data for a specific location"""
        try:
            lat = float(request.args.get('lat'))
            lon = float(request.args.get('lon'))
            days = int(request.args.get('days', 30))
            
            weather_data = weather_service.get_weather_data(lat, lon, days)
            
            return {
                'location': {'lat': lat, 'lon': lon},
                'data': weather_data,
                'days': days
            }
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            return {'error': 'Failed to fetch weather data'}, 500

class LAICalculationAPI(Resource):
    """API endpoint for LAI calculations"""
    
    def post(self):
        """Calculate LAI from provided satellite data"""
        try:
            data = request.get_json()
            
            if 'satellite_data' not in data or 'bounds' not in data:
                return {'error': 'Missing required data'}, 400
            
            lai_values = lai_calculator.calculate_lai_timeseries(
                data['satellite_data'], data['bounds']
            )
            
            return {
                'lai_data': lai_values,
                'calculation_method': lai_calculator.get_method_info(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating LAI: {str(e)}")
            return {'error': 'Failed to calculate LAI'}, 500

class FertilizerRecommendationAPI(Resource):
    """API endpoint for fertilizer recommendations"""
    
    def post(self):
        """Generate fertilizer recommendation based on analysis data"""
        try:
            data = request.get_json()
            
            required_fields = ['lai_data', 'weather_data', 'farm_bounds']
            if not all(field in data for field in required_fields):
                return {'error': 'Missing required analysis data'}, 400
            
            recommendation = fertilizer_advisor.analyze_and_recommend(
                lai_data=data['lai_data'],
                weather_data=data['weather_data'],
                satellite_data=data.get('satellite_data', {}),
                farm_bounds=data['farm_bounds']
            )
            
            return recommendation
            
        except Exception as e:
            logger.error(f"Error generating fertilizer recommendation: {str(e)}")
            return {'error': 'Failed to generate recommendation'}, 500

# Register API endpoints
api.add_resource(HealthCheck, '/api/health')
api.add_resource(FarmAnalysisAPI, '/api/analyze')
api.add_resource(SatelliteImageryAPI, '/api/satellite/imagery')
api.add_resource(WeatherDataAPI, '/api/weather')
api.add_resource(LAICalculationAPI, '/api/lai/calculate')
api.add_resource(FertilizerRecommendationAPI, '/api/fertilizer/recommend')

@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('../frontend', filename)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Configuration
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '127.0.0.1')
    
    logger.info(f"Starting Agricultural Analysis Game API server...")
    logger.info(f"Debug mode: {debug_mode}")
    logger.info(f"Server will run on {host}:{port}")
    
    # Start the Flask development server
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        threaded=True
    )