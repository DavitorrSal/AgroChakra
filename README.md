# Agricultural Analysis Game

## 🌾 Overview

An interactive web-based game that combines geospatial mapping with agricultural data analysis. Players select farm areas on a map and analyze historical data to make informed fertilizer recommendations using satellite imagery, weather data, and LAI (Leaf Area Index) calculations.

## 🎯 Game Concept

### Core Gameplay
1. **Location Selection**: Browse an interactive map and select your region of interest
2. **Farm Definition**: Draw a rectangle to define the farm area you want to analyze
3. **Data Analysis**: The system fetches and analyzes:
   - Historical weather data (temperature, humidity, rainfall)
   - Soil moisture and composition data
   - Satellite imagery for vegetation analysis
   - LAI calculations from NDVI and other vegetation indices
4. **Decision Making**: Based on the analysis, determine if the farm requires fertilizer
5. **Scoring**: Earn points based on accuracy and efficiency of your recommendations

### Educational Value
- Learn about precision agriculture and remote sensing
- Understand the relationship between weather patterns and crop health
- Explore how satellite data can inform agricultural decisions
- Discover the importance of LAI in crop monitoring

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Leaflet.js**: Interactive mapping library
- **Chart.js**: Data visualization and graphing
- **Bootstrap**: Responsive UI framework

### Backend
- **Python Flask**: Web framework for API services
- **NumPy/SciPy**: Scientific computing for data analysis
- **Rasterio**: Geospatial raster data processing
- **Requests**: HTTP library for API integrations

### Data Sources
- **NASA Earthdata**: Satellite imagery and MODIS data
- **NASA POWER**: Meteorological and solar data
- **Sentinel-2**: High-resolution optical imagery
- **OpenWeatherMap**: Weather data API

## 📁 Project Structure

```
agricultural-analysis-game/
├── frontend/                 # Web application frontend
│   ├── index.html           # Main game interface
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript modules
│   └── assets/              # Images and resources
├── backend/                 # Python backend services
│   ├── app.py              # Flask application
│   ├── api/                # API endpoints
│   ├── services/           # Data processing services
│   └── models/             # Data models
├── docs/                   # Documentation
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js (for development tools)
- NASA Earthdata account (free registration)
- OpenWeatherMap API key (free tier available)

### Installation
1. Clone the repository
2. Install Python dependencies: `pip install -r requirements.txt`
3. Configure API keys in `config.py`
4. Run the backend: `python backend/app.py`
5. Open `frontend/index.html` in a web browser

## 🎮 How to Play

1. **Start the Game**: Open the web application
2. **Choose Location**: Navigate the map to find an agricultural area
3. **Select Farm Area**: Click and drag to create a rectangle over your chosen farm
4. **Analyze Data**: Wait for the system to fetch and process historical data
5. **Review Insights**: Examine the generated graphs and satellite imagery
6. **Make Decision**: Determine if fertilizer is needed based on the LAI analysis
7. **Get Feedback**: Receive your score and learn from the results

## 📊 Features

### Interactive Mapping
- Pan and zoom across global agricultural regions
- Satellite imagery overlays
- Rectangle selection tool for farm area definition
- Coordinate display and area calculation

### Data Visualization
- Time-series graphs for temperature, humidity, and rainfall
- Soil moisture heat maps
- LAI progression charts
- NDVI false-color satellite imagery
- Historical trend analysis

### Agricultural Analysis
- Automated LAI calculation from satellite data
- Soil health assessment
- Weather pattern analysis
- Fertilizer recommendation algorithm
- Confidence scoring for recommendations

### Game Mechanics
- Point-based scoring system
- Difficulty progression
- Leaderboards
- Achievement system
- Educational tutorials

## 🔬 Scientific Background

### LAI (Leaf Area Index)
LAI represents the total leaf area per unit ground area and is a key indicator of vegetation health and productivity. It's calculated using:
- NDVI (Normalized Difference Vegetation Index)
- Enhanced Vegetation Index (EVI)
- Machine learning models trained on ground truth data

### Fertilizer Decision Factors
The game considers multiple factors for fertilizer recommendations:
- Current LAI values compared to optimal ranges
- Soil nutrient levels and pH
- Weather patterns and seasonal trends
- Crop type and growth stage
- Historical yield data

## 🌍 Environmental Impact

This game promotes sustainable agriculture by:
- Encouraging precision fertilizer application
- Reducing over-fertilization and environmental runoff
- Teaching efficient resource management
- Promoting data-driven agricultural decisions

## 📈 Future Enhancements

- Multi-crop support with specific LAI thresholds
- Integration with IoT sensor data
- Machine learning model improvements
- Mobile app development
- Multiplayer collaborative features
- Real-time satellite data integration

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing free access to Earth observation data
- The open-source geospatial community
- Agricultural researchers and precision farming experts