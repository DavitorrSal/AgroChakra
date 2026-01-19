# Agricultural Analysis Game - Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the Agricultural Analysis Game on your local machine.

## 📋 Prerequisites

### Required Software
- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **Node.js 14+** (optional, for development tools) - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

### API Keys (Optional but Recommended)
The game works with demo data, but for real satellite and weather data, you'll need:

1. **NASA Earthdata Account** (Free)
   - Register at: https://urs.earthdata.nasa.gov/
   - Get API access for NASA POWER and Earthdata services

2. **OpenWeatherMap API Key** (Free tier available)
   - Register at: https://openweathermap.org/api
   - Get your free API key

3. **Google Earth Engine Account** (Free for research/education)
   - Register at: https://earthengine.google.com/
   - Get API credentials

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agricultural-analysis-game
```

### 2. Set Up Python Environment

Create a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your API keys:

```bash
# Required for production, optional for demo
NASA_API_KEY=your-nasa-api-key-here
OPENWEATHER_API_KEY=your-openweather-api-key-here
EARTHENGINE_API_KEY=your-earthengine-api-key-here

# Flask configuration
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=your-secret-key-here

# Server configuration
HOST=127.0.0.1
PORT=5000
```

### 5. Start the Backend Server

```bash
cd backend
python app.py
```

You should see:
```
Starting Agricultural Analysis Game API server...
Debug mode: True
Server will run on 127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

### 6. Open the Game

Open your web browser and navigate to:
```
http://localhost:5000
```

## 🎮 How to Use

### Basic Gameplay

1. **Navigate the Map**
   - Use mouse to pan and zoom
   - Find agricultural areas (look for green/brown patterns)

2. **Select a Farm**
   - Click the crop icon (🌾) in the map controls
   - Click and drag to draw a rectangle over a farm area
   - Click "Analyze Farm" when satisfied with selection

3. **Review Analysis**
   - Wait for satellite and weather data to load
   - Review the LAI charts and weather patterns
   - Examine soil condition graphs

4. **Make Decision**
   - Based on the data, decide if fertilizer is needed
   - Click "Yes, Apply Fertilizer" or "No, Skip Fertilizer"
   - See your score and the AI's recommendation

5. **Continue Playing**
   - Click "Next Farm" to analyze another area
   - Try different regions and farm types
   - Build your score and level up!

### Keyboard Shortcuts

- **H** - Show help/tutorial
- **S** - Toggle satellite view
- **C** - Clear current selection
- **A** - Start analysis (if farm selected)
- **Ctrl+S** - Save progress

## 🔧 Configuration Options

### Backend Configuration

Edit `backend/config.py` to customize:

- **Data Sources**: Switch between real APIs and demo data
- **Analysis Parameters**: Adjust LAI thresholds, confidence levels
- **Rate Limiting**: Modify API request limits
- **Crop Types**: Add new crop configurations

### Frontend Configuration

Edit `frontend/js/main.js` to customize:

- **Map Settings**: Default location, zoom levels
- **Game Mechanics**: Scoring system, difficulty progression
- **UI Preferences**: Themes, animations, tooltips

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Test analysis (requires server running)
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"bounds":{"north":40.76,"south":40.75,"east":-73.97,"west":-73.98}}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### 2. Port already in use
```bash
# Change port in .env file
PORT=5001
```

#### 3. API key errors
- The game works without API keys using demo data
- Check that your API keys are correctly set in `.env`
- Verify API key validity on respective service websites

#### 4. Slow loading
- Demo data loads instantly
- Real API calls may take 10-30 seconds
- Check your internet connection

#### 5. Map not loading
- Ensure you have internet connection for map tiles
- Try refreshing the page
- Check browser console for JavaScript errors

### Debug Mode

Enable debug mode for detailed logging:

```bash
# In .env file
FLASK_DEBUG=true
LOG_LEVEL=DEBUG
```

### Performance Issues

If the game runs slowly:

1. **Reduce Analysis Days**
   ```python
   # In config.py
   DEFAULT_ANALYSIS_DAYS = 15  # Instead of 30
   ```

2. **Use Demo Data**
   - Comment out API keys in `.env` to force demo mode
   - Demo data is much faster

3. **Check System Resources**
   - Close other applications
   - Ensure sufficient RAM (4GB+ recommended)

## 🌐 Deployment

### Local Network Access

To access from other devices on your network:

```bash
# In .env file
HOST=0.0.0.0
PORT=5000
```

Then access via: `http://your-ip-address:5000`

### Production Deployment

For production deployment:

1. **Set Production Environment**
   ```bash
   FLASK_ENV=production
   FLASK_DEBUG=false
   SECRET_KEY=secure-random-key-here
   ```

2. **Use Production Server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Set Up Reverse Proxy** (nginx/Apache)
4. **Configure SSL/HTTPS**
5. **Set Up Database** (if using persistent storage)

## 📚 Additional Resources

### Learning Materials

- **NASA POWER API**: https://power.larc.nasa.gov/docs/
- **Sentinel-2 Data**: https://sentinel.esa.int/web/sentinel/missions/sentinel-2
- **LAI Calculation**: https://en.wikipedia.org/wiki/Leaf_area_index
- **Precision Agriculture**: https://www.fao.org/precision-agriculture/

### Development Tools

- **API Testing**: [Postman](https://postman.com/) or [Insomnia](https://insomnia.rest/)
- **Code Editor**: [VS Code](https://code.visualstudio.com/) with Python extension
- **Database Browser**: [DB Browser for SQLite](https://sqlitebrowser.org/)

### Sample Data

The game includes sample farm locations:
- **Central Park, NYC** (40.7589, -73.9851) - Urban agriculture demo
- **Iowa Corn Belt** (42.0, -93.5) - Large-scale agriculture
- **California Central Valley** (36.5, -120.0) - Diverse crops
- **Netherlands Polders** (52.5, 5.0) - Intensive farming

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

### Code Style

- **Python**: Follow PEP 8, use `black` for formatting
- **JavaScript**: Use ES6+, follow Airbnb style guide
- **Documentation**: Update docs for any API changes

## 📞 Support

### Getting Help

1. **Check Documentation**: Review this guide and API docs
2. **Search Issues**: Look for similar problems in project issues
3. **Create Issue**: Report bugs or request features
4. **Community**: Join discussions in project forums

### Reporting Bugs

Include in your bug report:
- Operating system and version
- Python version
- Browser version (for frontend issues)
- Steps to reproduce
- Error messages or logs
- Screenshots (if applicable)

## 🎯 Next Steps

Once you have the game running:

1. **Try Different Locations**: Explore various agricultural regions
2. **Experiment with Settings**: Modify configuration parameters
3. **Add New Features**: Extend the game with new crop types or analysis methods
4. **Integrate Real Data**: Connect to additional satellite or IoT data sources
5. **Share Your Results**: Document interesting findings or improvements

Happy farming! 🚜🌾