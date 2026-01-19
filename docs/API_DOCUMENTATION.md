# Agricultural Analysis Game - API Documentation

## Overview

The Agricultural Analysis Game API provides endpoints for analyzing farm areas using satellite data, weather information, and machine learning algorithms to generate fertilizer recommendations.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication for demo purposes. In production, API keys would be required.

## Rate Limiting

- Analysis endpoints: 10 requests per minute
- Data endpoints: 60 requests per minute

## Endpoints

### Health Check

Check if the API is running and all services are available.

**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "satellite": true,
    "weather": true,
    "lai_calculator": true,
    "fertilizer_advisor": true
  }
}
```

### Farm Analysis

Perform complete analysis of a farm area including satellite data, weather analysis, LAI calculation, and fertilizer recommendation.

**POST** `/analyze`

**Request Body:**
```json
{
  "bounds": {
    "north": 40.7589,
    "south": 40.7489,
    "east": -73.9751,
    "west": -73.9851
  }
}
```

**Response:**
```json
{
  "analysis_id": "uuid-string",
  "timestamp": "2024-01-15T10:30:00Z",
  "bounds": {
    "north": 40.7589,
    "south": 40.7489,
    "east": -73.9751,
    "west": -73.9851
  },
  "area_hectares": 12.5,
  "weather_data": [
    {
      "date": "2024-01-14",
      "temperature": 22.5,
      "humidity": 65.0,
      "rainfall": 2.3,
      "wind_speed": 8.2,
      "solar_radiation": 18.5
    }
  ],
  "lai_data": [
    {
      "date": "2024-01-14",
      "lai": 3.2,
      "confidence": 85.0,
      "method": "combined",
      "ndvi": 0.65,
      "evi": 0.45
    }
  ],
  "satellite_data": {
    "ndvi": [0.65, 0.62, 0.68],
    "evi": [0.45, 0.43, 0.47],
    "imagery_dates": ["2024-01-14", "2024-01-12", "2024-01-10"]
  },
  "recommendation": {
    "needs_fertilizer": true,
    "confidence": 78.5,
    "reasoning": "Low LAI (3.2) indicates moderate vegetation health. Soil analysis shows low nitrogen. Recent rainfall provides good conditions for nutrient uptake.",
    "fertilizer_type": "Nitrogen-rich (e.g., Urea 46-0-0)",
    "application_rate": 85.0,
    "timing": "Apply immediately - conditions are optimal",
    "expected_benefit": "Moderate improvement expected - LAI could increase by 0.5-1.0 points"
  }
}
```

### Satellite Imagery

Get satellite imagery for a specific location and date.

**GET** `/satellite/imagery`

**Parameters:**
- `lat` (float): Latitude
- `lon` (float): Longitude
- `date` (string): Date in YYYY-MM-DD format (optional, defaults to today)
- `type` (string): Image type - 'rgb', 'ndvi', 'evi' (optional, defaults to 'rgb')

**Response:**
```json
{
  "imagery_url": "https://earthengine.googleapis.com/v1alpha/projects/...",
  "metadata": {
    "acquisition_date": "2024-01-14",
    "cloud_cover": 15.2,
    "resolution": "10m",
    "satellite": "Sentinel-2",
    "processing_level": "L2A",
    "coordinate_system": "EPSG:4326"
  },
  "date": "2024-01-14",
  "type": "rgb"
}
```

### Weather Data

Get weather data for a specific location.

**GET** `/weather`

**Parameters:**
- `lat` (float): Latitude
- `lon` (float): Longitude
- `days` (int): Number of days of historical data (optional, defaults to 30)

**Response:**
```json
{
  "location": {
    "lat": 40.7589,
    "lon": -73.9851
  },
  "data": [
    {
      "date": "2024-01-14",
      "temperature": 22.5,
      "humidity": 65.0,
      "rainfall": 2.3,
      "wind_speed": 8.2,
      "solar_radiation": 18.5
    }
  ],
  "days": 30
}
```

### LAI Calculation

Calculate LAI from provided satellite data.

**POST** `/lai/calculate`

**Request Body:**
```json
{
  "satellite_data": {
    "dates": ["2024-01-14", "2024-01-12"],
    "ndvi": [0.65, 0.62],
    "evi": [0.45, 0.43]
  },
  "bounds": {
    "north": 40.7589,
    "south": 40.7489,
    "east": -73.9751,
    "west": -73.9851
  }
}
```

**Response:**
```json
{
  "lai_data": [
    {
      "date": "2024-01-14",
      "lai": 3.2,
      "confidence": 85.0,
      "method": "combined",
      "ndvi": 0.65,
      "evi": 0.45
    }
  ],
  "calculation_method": {
    "available_methods": ["ndvi_exponential", "ndvi_linear", "evi_based", "combined"],
    "default_method": "combined"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Fertilizer Recommendation

Generate fertilizer recommendation based on analysis data.

**POST** `/fertilizer/recommend`

**Request Body:**
```json
{
  "lai_data": [
    {
      "date": "2024-01-14",
      "lai": 3.2,
      "confidence": 85.0,
      "method": "combined"
    }
  ],
  "weather_data": [
    {
      "date": "2024-01-14",
      "temperature": 22.5,
      "humidity": 65.0,
      "rainfall": 2.3
    }
  ],
  "farm_bounds": {
    "north": 40.7589,
    "south": 40.7489,
    "east": -73.9751,
    "west": -73.9851
  }
}
```

**Response:**
```json
{
  "needs_fertilizer": true,
  "confidence": 78.5,
  "reasoning": "Low LAI (3.2) indicates moderate vegetation health. Soil analysis shows low nitrogen.",
  "fertilizer_type": "Nitrogen-rich (e.g., Urea 46-0-0)",
  "application_rate": 85.0,
  "timing": "Apply immediately - conditions are optimal",
  "expected_benefit": "Moderate improvement expected - LAI could increase by 0.5-1.0 points",
  "analysis_details": {
    "vegetation": {
      "status": "moderate",
      "health_score": 65.0,
      "current_lai": 3.2
    },
    "weather": {
      "recent_rainfall": 15.2,
      "avg_temperature": 22.5,
      "application_conditions": {
        "overall_suitability": 0.8,
        "immediate_suitable": true
      }
    },
    "soil": {
      "moisture": 45.2,
      "nitrogen": 55.0,
      "phosphorus": 42.0,
      "potassium": 58.0
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Data Models

### Farm Bounds
```json
{
  "north": 40.7589,  // Northern latitude boundary
  "south": 40.7489,  // Southern latitude boundary
  "east": -73.9751,  // Eastern longitude boundary
  "west": -73.9851   // Western longitude boundary
}
```

### Weather Data Point
```json
{
  "date": "2024-01-14",        // Date in YYYY-MM-DD format
  "temperature": 22.5,         // Temperature in Celsius
  "humidity": 65.0,            // Relative humidity percentage
  "rainfall": 2.3,             // Rainfall in mm
  "wind_speed": 8.2,           // Wind speed in m/s
  "solar_radiation": 18.5      // Solar radiation in MJ/m²/day
}
```

### LAI Data Point
```json
{
  "date": "2024-01-14",        // Date in YYYY-MM-DD format
  "lai": 3.2,                  // LAI value
  "confidence": 85.0,          // Confidence percentage (0-100)
  "method": "combined",        // Calculation method used
  "ndvi": 0.65,               // Input NDVI value
  "evi": 0.45                 // Input EVI value
}
```

### Fertilizer Recommendation
```json
{
  "needs_fertilizer": true,                           // Boolean recommendation
  "confidence": 78.5,                                 // Confidence percentage
  "reasoning": "Detailed explanation...",             // Human-readable reasoning
  "fertilizer_type": "Nitrogen-rich (e.g., Urea)",  // Recommended fertilizer type
  "application_rate": 85.0,                          // Application rate in kg/ha
  "timing": "Apply immediately",                      // Timing recommendation
  "expected_benefit": "Moderate improvement..."       // Expected outcome
}
```

## Usage Examples

### Python Example
```python
import requests

# Analyze a farm area
response = requests.post('http://localhost:5000/api/analyze', json={
    'bounds': {
        'north': 40.7589,
        'south': 40.7489,
        'east': -73.9751,
        'west': -73.9851
    }
})

if response.status_code == 200:
    analysis = response.json()
    print(f"Fertilizer needed: {analysis['recommendation']['needs_fertilizer']}")
    print(f"Confidence: {analysis['recommendation']['confidence']}%")
else:
    print(f"Error: {response.json()['error']}")
```

### JavaScript Example
```javascript
// Analyze a farm area
fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        bounds: {
            north: 40.7589,
            south: 40.7489,
            east: -73.9751,
            west: -73.9851
        }
    })
})
.then(response => response.json())
.then(data => {
    console.log('Fertilizer needed:', data.recommendation.needs_fertilizer);
    console.log('Confidence:', data.recommendation.confidence + '%');
})
.catch(error => console.error('Error:', error));
```

## Notes

- All coordinates are in WGS84 (EPSG:4326) coordinate system
- Dates are in ISO 8601 format (YYYY-MM-DD)
- LAI values typically range from 0 to 8
- NDVI and EVI values range from -1 to 1
- Temperature is in Celsius
- Rainfall is in millimeters
- Wind speed is in meters per second
- Application rates are in kilograms per hectare

## Support

For API support and questions, please refer to the project documentation or create an issue in the project repository.