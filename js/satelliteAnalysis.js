/**
 * Control Farm - Satellite Analysis Module
 * Handles satellite data simulation, LAI calculations, and agricultural analysis
 */

class SatelliteAnalysis {
    constructor() {
        this.fieldData = new Map();
        this.analysisHistory = [];
        this.currentAnalysis = null;
        
        // Simulation parameters for realistic data
        this.simulationParams = {
            peru: {
                baseNDVI: { min: 0.2, max: 0.8 },
                baseLAI: { min: 1.0, max: 5.5 },
                baseMoisture: { min: 15, max: 65 },
                baseTemp: { min: 18, max: 32 },
                seasonalVariation: 0.3,
                climateFactors: {
                    arid: true,
                    irrigation: true,
                    altitude: 1500 // meters
                }
            },
            brazil: {
                baseNDVI: { min: 0.4, max: 0.9 },
                baseLAI: { min: 2.0, max: 7.0 },
                baseMoisture: { min: 40, max: 85 },
                baseTemp: { min: 22, max: 35 },
                seasonalVariation: 0.4,
                climateFactors: {
                    tropical: true,
                    rainfall: 'high',
                    deforestation: true
                }
            },
            argentina: {
                baseNDVI: { min: 0.3, max: 0.85 },
                baseLAI: { min: 1.5, max: 6.0 },
                baseMoisture: { min: 25, max: 75 },
                baseTemp: { min: 12, max: 28 },
                seasonalVariation: 0.5,
                climateFactors: {
                    temperate: true,
                    grassland: true,
                    windErosion: true
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.generateFieldData();
        this.setupAnalysisInterface();
    }
    
    generateFieldData() {
        // Generate realistic field data for each analysis point
        const fields = ['A', 'B', 'C', 'D'];
        const country = 'peru'; // Current country
        
        fields.forEach(fieldId => {
            this.fieldData.set(fieldId, this.generateFieldParameters(fieldId, country));
        });
    }
    
    generateFieldParameters(fieldId, country) {
        const params = this.simulationParams[country];
        const baseVariation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
        
        return {
            fieldId,
            country,
            coordinates: this.generateCoordinates(fieldId),
            soilType: this.generateSoilType(),
            cropType: this.generateCropType(country),
            plantingDate: this.generatePlantingDate(),
            irrigationSystem: this.generateIrrigationSystem(country),
            baseParameters: {
                ndvi: this.randomInRange(params.baseNDVI) * baseVariation,
                lai: this.randomInRange(params.baseLAI) * baseVariation,
                moisture: this.randomInRange(params.baseMoisture) * baseVariation,
                temperature: this.randomInRange(params.baseTemp) + (Math.random() - 0.5) * 5
            },
            historicalData: this.generateHistoricalData(params, baseVariation),
            healthStatus: null // Will be calculated
        };
    }
    
    generateCoordinates(fieldId) {
        // Majes Valley coordinates with slight variations
        const baseCoords = { lat: -16.3988, lon: -72.1932 };
        const variation = 0.01;
        
        return {
            lat: baseCoords.lat + (Math.random() - 0.5) * variation,
            lon: baseCoords.lon + (Math.random() - 0.5) * variation
        };
    }
    
    generateSoilType() {
        const soilTypes = [
            'Sandy loam',
            'Clay loam', 
            'Silty clay',
            'Sandy clay loam',
            'Loam'
        ];
        return soilTypes[Math.floor(Math.random() * soilTypes.length)];
    }
    
    generateCropType(country) {
        const cropsByCountry = {
            peru: ['Rice', 'Corn', 'Quinoa', 'Potatoes', 'Beans'],
            brazil: ['Soybeans', 'Corn', 'Cotton', 'Sugarcane', 'Coffee'],
            argentina: ['Wheat', 'Soybeans', 'Corn', 'Sunflower', 'Barley']
        };
        
        const crops = cropsByCountry[country] || cropsByCountry.peru;
        return crops[Math.floor(Math.random() * crops.length)];
    }
    
    generatePlantingDate() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June'];
        const month = months[Math.floor(Math.random() * months.length)];
        const day = Math.floor(Math.random() * 28) + 1;
        return `${month} ${day}, 2024`;
    }
    
    generateIrrigationSystem(country) {
        const systems = {
            peru: ['Drip irrigation', 'Furrow irrigation', 'Sprinkler system'],
            brazil: ['Center pivot', 'Drip irrigation', 'Flood irrigation'],
            argentina: ['Rain-fed', 'Sprinkler system', 'Center pivot']
        };
        
        const countrySystem = systems[country] || systems.peru;
        return countrySystem[Math.floor(Math.random() * countrySystem.length)];
    }
    
    generateHistoricalData(params, baseVariation) {
        const periods = ['current', '1year', '2year', 'historical'];
        const historical = {};
        
        periods.forEach((period, index) => {
            const timeDecay = 1 - (index * 0.1); // Slight degradation over time
            const seasonalFactor = 1 + (Math.sin(index * Math.PI / 2) * params.seasonalVariation);
            
            historical[period] = {
                ndvi: this.randomInRange(params.baseNDVI) * baseVariation * timeDecay * seasonalFactor,
                lai: this.randomInRange(params.baseLAI) * baseVariation * timeDecay * seasonalFactor,
                moisture: this.randomInRange(params.baseMoisture) * baseVariation * (1 + (Math.random() - 0.5) * 0.3),
                temperature: this.randomInRange(params.baseTemp) + (Math.random() - 0.5) * 3,
                timestamp: this.generateTimestamp(period)
            };
        });
        
        return historical;
    }
    
    generateTimestamp(period) {
        const now = new Date();
        const timestamps = {
            current: now,
            '1year': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
            '2year': new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
            historical: new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
        };
        
        return timestamps[period] || now;
    }
    
    randomInRange(range) {
        return Math.random() * (range.max - range.min) + range.min;
    }
    
    setupAnalysisInterface() {
        // This will be called when the analysis interface is initialized
        console.log('Satellite Analysis System initialized');
    }
    
    analyzeField(fieldId, analysisType, timePeriod) {
        const fieldData = this.fieldData.get(fieldId);
        if (!fieldData) {
            console.error(`Field ${fieldId} not found`);
            return null;
        }
        
        const historicalData = fieldData.historicalData[timePeriod] || fieldData.historicalData.current;
        const results = this.calculateAnalysisResults(fieldData, analysisType, historicalData);
        
        // Store analysis in history
        this.analysisHistory.push({
            fieldId,
            analysisType,
            timePeriod,
            timestamp: new Date(),
            results
        });
        
        this.currentAnalysis = results;
        return results;
    }
    
    calculateAnalysisResults(fieldData, analysisType, historicalData) {
        // Calculate LAI using NDVI relationship
        const lai = this.calculateLAI(historicalData.ndvi);
        
        // Apply environmental factors
        const environmentalFactors = this.calculateEnvironmentalFactors(fieldData);
        
        const results = {
            fieldId: fieldData.fieldId,
            analysisType,
            ndvi: this.formatValue(historicalData.ndvi * environmentalFactors.ndviModifier, 3),
            lai: this.formatValue(lai * environmentalFactors.laiModifier, 2),
            moisture: this.formatValue(historicalData.moisture * environmentalFactors.moistureModifier, 1) + '%',
            temperature: this.formatValue(historicalData.temperature + environmentalFactors.tempModifier, 1) + '°C',
            healthStatus: this.calculateHealthStatus(historicalData.ndvi, lai, historicalData.moisture),
            recommendations: [],
            confidence: this.calculateConfidence(analysisType),
            metadata: {
                soilType: fieldData.soilType,
                cropType: fieldData.cropType,
                irrigationSystem: fieldData.irrigationSystem,
                coordinates: fieldData.coordinates
            }
        };
        
        // Generate specific recommendations
        results.recommendations = this.generateDetailedRecommendations(results);
        
        return results;
    }
    
    calculateLAI(ndvi) {
        // Empirical relationship between NDVI and LAI
        // LAI = a * ln((NDVI_max - NDVI) / (NDVI_max - NDVI_min)) where NDVI_max ≈ 0.95, NDVI_min ≈ 0.05
        const ndviMax = 0.95;
        const ndviMin = 0.05;
        const a = -2.5; // Empirical coefficient
        
        if (ndvi <= ndviMin) return 0.1;
        if (ndvi >= ndviMax) return 8.0;
        
        const lai = a * Math.log((ndviMax - ndvi) / (ndviMax - ndviMin));
        return Math.max(0.1, Math.min(8.0, lai));
    }
    
    calculateEnvironmentalFactors(fieldData) {
        const factors = {
            ndviModifier: 1.0,
            laiModifier: 1.0,
            moistureModifier: 1.0,
            tempModifier: 0.0
        };
        
        // Soil type effects
        switch (fieldData.soilType) {
            case 'Sandy loam':
                factors.moistureModifier *= 0.9; // Drains faster
                break;
            case 'Clay loam':
                factors.moistureModifier *= 1.1; // Retains more water
                break;
            case 'Silty clay':
                factors.moistureModifier *= 1.15;
                factors.ndviModifier *= 0.95; // May have drainage issues
                break;
        }
        
        // Irrigation system effects
        switch (fieldData.irrigationSystem) {
            case 'Drip irrigation':
                factors.moistureModifier *= 1.2;
                factors.ndviModifier *= 1.1;
                break;
            case 'Furrow irrigation':
                factors.moistureModifier *= 1.0;
                break;
            case 'Rain-fed':
                factors.moistureModifier *= 0.8;
                factors.ndviModifier *= 0.9;
                break;
        }
        
        // Crop type effects
        switch (fieldData.cropType) {
            case 'Rice':
                factors.moistureModifier *= 1.3;
                factors.tempModifier += 2;
                break;
            case 'Quinoa':
                factors.moistureModifier *= 0.8;
                factors.tempModifier -= 1;
                break;
            case 'Potatoes':
                factors.tempModifier -= 2;
                break;
        }
        
        return factors;
    }
    
    calculateHealthStatus(ndvi, lai, moisture) {
        let score = 0;
        
        // NDVI contribution (40%)
        if (ndvi > 0.7) score += 40;
        else if (ndvi > 0.5) score += 30;
        else if (ndvi > 0.3) score += 20;
        else score += 10;
        
        // LAI contribution (35%)
        if (lai > 4.0) score += 35;
        else if (lai > 2.5) score += 28;
        else if (lai > 1.5) score += 20;
        else score += 10;
        
        // Moisture contribution (25%)
        if (moisture >= 40 && moisture <= 70) score += 25;
        else if (moisture >= 30 && moisture <= 80) score += 20;
        else if (moisture >= 20 && moisture <= 90) score += 15;
        else score += 5;
        
        if (score >= 80) return 'Excellent';
        else if (score >= 65) return 'Good';
        else if (score >= 50) return 'Fair';
        else if (score >= 35) return 'Poor';
        else return 'Critical';
    }
    
    generateDetailedRecommendations(results) {
        const recommendations = [];
        const ndvi = parseFloat(results.ndvi);
        const lai = parseFloat(results.lai);
        const moisture = parseFloat(results.moisture.replace('%', ''));
        const temp = parseFloat(results.temperature.replace('°C', ''));
        
        // NDVI-based recommendations
        if (ndvi < 0.3) {
            recommendations.push({
                type: 'critical',
                category: 'Vegetation Health',
                message: 'Critical vegetation stress detected. Immediate intervention required.',
                actions: ['Increase irrigation', 'Apply nitrogen fertilizer', 'Check for pest damage']
            });
        } else if (ndvi < 0.5) {
            recommendations.push({
                type: 'warning',
                category: 'Vegetation Health',
                message: 'Moderate vegetation stress. Monitor closely.',
                actions: ['Adjust irrigation schedule', 'Consider fertilization', 'Monitor weather conditions']
            });
        } else if (ndvi > 0.8) {
            recommendations.push({
                type: 'success',
                category: 'Vegetation Health',
                message: 'Excellent vegetation health. Maintain current practices.',
                actions: ['Continue current management', 'Monitor for over-fertilization']
            });
        }
        
        // LAI-based recommendations
        if (lai < 1.5) {
            recommendations.push({
                type: 'warning',
                category: 'Leaf Development',
                message: 'Low leaf area index indicates poor canopy development.',
                actions: ['Apply nitrogen fertilizer', 'Improve soil conditions', 'Check planting density']
            });
        } else if (lai > 6.0) {
            recommendations.push({
                type: 'info',
                category: 'Leaf Development',
                message: 'High leaf area index. Monitor for disease and pest issues.',
                actions: ['Increase air circulation', 'Monitor for fungal diseases', 'Consider pruning if applicable']
            });
        }
        
        // Moisture-based recommendations
        if (moisture < 25) {
            recommendations.push({
                type: 'critical',
                category: 'Soil Moisture',
                message: 'Severe water stress. Immediate irrigation required.',
                actions: ['Increase irrigation frequency', 'Check irrigation system', 'Apply mulch to retain moisture']
            });
        } else if (moisture < 40) {
            recommendations.push({
                type: 'warning',
                category: 'Soil Moisture',
                message: 'Low soil moisture. Increase irrigation.',
                actions: ['Adjust irrigation schedule', 'Monitor weather forecast', 'Consider drip irrigation']
            });
        } else if (moisture > 80) {
            recommendations.push({
                type: 'warning',
                category: 'Soil Moisture',
                message: 'High soil moisture. Risk of root rot and fungal diseases.',
                actions: ['Reduce irrigation', 'Improve drainage', 'Monitor for disease symptoms']
            });
        }
        
        // Temperature-based recommendations
        if (temp > 35) {
            recommendations.push({
                type: 'warning',
                category: 'Temperature',
                message: 'High temperature stress. Protect crops from heat.',
                actions: ['Increase irrigation', 'Provide shade if possible', 'Apply cooling techniques']
            });
        } else if (temp < 10) {
            recommendations.push({
                type: 'warning',
                category: 'Temperature',
                message: 'Low temperature may affect crop growth.',
                actions: ['Monitor for frost damage', 'Consider protective measures', 'Adjust planting schedule']
            });
        }
        
        // Fertilizer recommendations based on overall health
        if (results.healthStatus === 'Poor' || results.healthStatus === 'Critical') {
            recommendations.push({
                type: 'action',
                category: 'Fertilization',
                message: 'Soil nutrient deficiency likely. Apply balanced fertilizer.',
                actions: ['Soil test recommended', 'Apply NPK fertilizer', 'Consider organic amendments']
            });
        }
        
        return recommendations;
    }
    
    calculateConfidence(analysisType) {
        // Simulate confidence based on analysis type and conditions
        const baseConfidence = {
            ndvi: 0.92,
            lai: 0.88,
            moisture: 0.85,
            temperature: 0.90
        };
        
        const confidence = baseConfidence[analysisType] || 0.85;
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        
        return Math.max(0.7, Math.min(0.98, confidence + variation));
    }
    
    formatValue(value, decimals) {
        return parseFloat(value.toFixed(decimals));
    }
    
    // Historical comparison methods
    compareWithHistorical(fieldId, parameter) {
        const fieldData = this.fieldData.get(fieldId);
        if (!fieldData) return null;
        
        const historical = fieldData.historicalData;
        const comparison = {
            current: historical.current[parameter],
            oneYearAgo: historical['1year'][parameter],
            twoYearsAgo: historical['2year'][parameter],
            historicalAverage: historical.historical[parameter],
            trend: this.calculateTrend(historical, parameter),
            recommendation: this.getTrendRecommendation(parameter, this.calculateTrend(historical, parameter))
        };
        
        return comparison;
    }
    
    calculateTrend(historical, parameter) {
        const values = [
            historical.historical[parameter],
            historical['2year'][parameter],
            historical['1year'][parameter],
            historical.current[parameter]
        ];
        
        // Simple linear trend calculation
        let trend = 0;
        for (let i = 1; i < values.length; i++) {
            trend += values[i] - values[i-1];
        }
        
        trend = trend / (values.length - 1);
        
        if (Math.abs(trend) < 0.01) return 'stable';
        return trend > 0 ? 'improving' : 'declining';
    }
    
    getTrendRecommendation(parameter, trend) {
        const recommendations = {
            ndvi: {
                improving: 'Vegetation health is improving. Continue current practices.',
                declining: 'Vegetation health is declining. Review management practices.',
                stable: 'Vegetation health is stable. Monitor for changes.'
            },
            lai: {
                improving: 'Leaf development is improving. Good canopy management.',
                declining: 'Leaf development is declining. Check nutrition and water.',
                stable: 'Leaf development is stable. Maintain current care.'
            },
            moisture: {
                improving: 'Soil moisture management is improving.',
                declining: 'Soil moisture is declining. Adjust irrigation.',
                stable: 'Soil moisture is stable. Good water management.'
            }
        };
        
        return recommendations[parameter]?.[trend] || 'Monitor parameter changes.';
    }
    
    // Export analysis results
    exportAnalysisReport(fieldId) {
        const analysis = this.analysisHistory.filter(a => a.fieldId === fieldId);
        const fieldData = this.fieldData.get(fieldId);
        
        return {
            fieldInfo: fieldData,
            analysisHistory: analysis,
            summary: this.generateAnalysisSummary(fieldId),
            exportDate: new Date().toISOString()
        };
    }
    
    generateAnalysisSummary(fieldId) {
        const analyses = this.analysisHistory.filter(a => a.fieldId === fieldId);
        if (analyses.length === 0) return null;
        
        const latest = analyses[analyses.length - 1];
        return {
            overallHealth: latest.results.healthStatus,
            keyFindings: latest.results.recommendations.slice(0, 3),
            confidenceLevel: latest.results.confidence,
            lastAnalyzed: latest.timestamp
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.SatelliteAnalysis = new SatelliteAnalysis();
});