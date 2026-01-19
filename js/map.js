// Map Module - Handles all map-related functionality
class MapManager {
    constructor() {
        this.map = null;
        this.currentSelection = null;
        this.selectionMode = false;
        this.satelliteLayer = null;
        this.baseLayer = null;
        this.userLocationMarker = null;
        this.userLocationCircle = null;
        this.latamZone = null;
        this.latamBounds = {
            north: 32.7,
            south: -55.0,
            west: -117.0,
            east: -34.0
        };
        // Track completed areas
        this.completedAreas = [];
        this.completedMarkers = [];
        this.init();
    }

    init() {
        try {
            // Initialize the map
            this.map = L.map('map').setView([40.7128, -74.0060], 10); // Default to New York area

            // Base layer (OpenStreetMap)
            this.baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            });

            // Satellite layer (Esri World Imagery) - Set as default
            this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18
            }).addTo(this.map); // Add satellite as default

            this.setupEventListeners();
            this.addLatamZone();
            this.addSampleFarmAreas();
            
            // Set satellite button as active by default
            const satelliteBtn = document.getElementById('satelliteBtn');
            if (satelliteBtn) {
                satelliteBtn.classList.add('active');
            }
            
            console.log('Map initialized successfully with satellite view');
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    setupEventListeners() {
        try {
            // Map click events for farm selection
            if (this.map) {
                this.map.on('click', (e) => {
                    if (this.selectionMode && e && e.latlng) {
                        // Ensure we're clicking on the map itself, not on markers or other layers
                        if (e.originalEvent && e.originalEvent.target && 
                            e.originalEvent.target.classList.contains('leaflet-zoom-animated')) {
                            this.startSelection(e.latlng);
                        } else if (!e.originalEvent || !e.originalEvent.target.closest('.leaflet-marker-icon, .leaflet-popup')) {
                            this.startSelection(e.latlng);
                        }
                    }
                });
            }

            // Button event listeners
            const selectFarmBtn = document.getElementById('selectFarmBtn');
            if (selectFarmBtn) {
                selectFarmBtn.addEventListener('click', () => {
                    this.toggleSelectionMode();
                });
            }

            const satelliteBtn = document.getElementById('satelliteBtn');
            if (satelliteBtn) {
                satelliteBtn.addEventListener('click', () => {
                    this.toggleSatelliteView();
                });
            }

            const clearBtn = document.getElementById('clearBtn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clearSelection();
                });
            }

            const locateBtn = document.getElementById('locateBtn');
            if (locateBtn) {
                locateBtn.addEventListener('click', () => {
                    this.locateUser();
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    toggleSelectionMode() {
        this.selectionMode = !this.selectionMode;
        const btn = document.getElementById('selectFarmBtn');
        
        if (this.selectionMode) {
            btn.classList.add('active');
            this.map.getContainer().style.cursor = 'crosshair';
            this.showTooltip('Click and drag to select a farm area');
        } else {
            btn.classList.remove('active');
            this.map.getContainer().style.cursor = '';
            this.hideTooltip();
        }
    }

    toggleSatelliteView() {
        const btn = document.getElementById('satelliteBtn');
        
        if (this.map.hasLayer(this.satelliteLayer)) {
            this.map.removeLayer(this.satelliteLayer);
            this.map.addLayer(this.baseLayer);
            btn.classList.remove('active');
        } else {
            this.map.removeLayer(this.baseLayer);
            this.map.addLayer(this.satelliteLayer);
            btn.classList.add('active');
        }
    }

    startSelection(startLatLng) {
        if (!this.selectionMode || !startLatLng) return;

        // Clear previous selection
        this.clearSelection();

        // Initialize polygon drawing
        this.polygonPoints = [startLatLng];
        this.tempPolygon = null;
        this.confirmButton = null;
        this.isDrawingPolygon = true;
        
        // Show tooltip for rectangle drawing
        this.showTooltip('Click to place corner 1/4 of your rectangle.');
        
        // Add click handler for polygon points
        this.polygonClickHandler = (e) => {
            if (!this.isDrawingPolygon) return;
            
            const clickPoint = e.latlng;
            
            // Add point if we haven't reached 4 points yet
            if (this.polygonPoints.length < 4) {
                this.polygonPoints.push(clickPoint);
                this.updateTempRectangle();
                
                // Update tooltip based on points count
                if (this.polygonPoints.length === 4) {
                    this.showConfirmButton();
                    this.showTooltip('All 4 corners placed. Press the Confirm button to complete.');
                } else {
                    this.showTooltip(`Corner ${this.polygonPoints.length}/4 placed. Click to place corner ${this.polygonPoints.length + 1}/4.`);
                }
            }
        };
        
        // Add mousemove handler for preview
        this.polygonMoveHandler = (e) => {
            if (!this.isDrawingPolygon || this.polygonPoints.length === 0 || this.polygonPoints.length >= 4) return;
            
            // Create preview rectangle with current mouse position
            const previewPoints = [...this.polygonPoints, e.latlng];
            this.updateTempRectangle(previewPoints);
        };
        
        this.map.on('click', this.polygonClickHandler);
        this.map.on('mousemove', this.polygonMoveHandler);
        
        // Add keyboard handlers
        this.keyHandler = (e) => {
            if (!this.isDrawingPolygon) return;
            
            if (e.key === 'Escape') {
                this.cancelPolygonSelection();
            } else if (e.key === 'Enter' && this.polygonPoints.length === 4) {
                this.completeRectangleSelection();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    clearSelection() {
        if (this.currentSelection) {
            this.map.removeLayer(this.currentSelection);
            this.currentSelection = null;
            document.getElementById('selectionInfo').style.display = 'none';
        }
        
        // Clear polygon drawing state
        if (this.tempPolygon) {
            this.map.removeLayer(this.tempPolygon);
            this.tempPolygon = null;
        }
        
        if (this.confirmButton) {
            this.hideConfirmButton();
        }
        
        if (this.isDrawingPolygon) {
            this.cancelPolygonSelection();
        }
    }

    updateTempRectangle(points = null) {
        // Remove existing temp polygon
        if (this.tempPolygon) {
            this.map.removeLayer(this.tempPolygon);
        }
        
        const pointsToUse = points || this.polygonPoints;
        
        if (pointsToUse.length >= 2) {
            // Create shape from points (line, triangle, or quadrilateral)
            if (pointsToUse.length === 2) {
                // Show line
                this.tempPolygon = L.polyline(pointsToUse, {
                    className: 'farm-selection-temp',
                    weight: 2,
                    color: '#28a745',
                    dashArray: '5, 5'
                }).addTo(this.map);
            } else {
                // Show polygon (triangle or quadrilateral)
                this.tempPolygon = L.polygon(pointsToUse, {
                    className: 'farm-selection-temp',
                    weight: 2,
                    color: '#28a745',
                    fillOpacity: 0.1,
                    dashArray: '5, 5'
                }).addTo(this.map);
            }
        }
    }
    
    completeRectangleSelection() {
        if (this.polygonPoints.length !== 4) {
            this.showTooltip('Need exactly 4 points to create your rectangle.');
            return;
        }
        
        // Remove temp polygon
        if (this.tempPolygon) {
            this.map.removeLayer(this.tempPolygon);
            this.tempPolygon = null;
        }
        
        // Remove confirm button
        if (this.confirmButton) {
            this.hideConfirmButton();
        }
        
        // Create final quadrilateral from the exact 4 points placed
        this.currentSelection = L.polygon(this.polygonPoints, {
            className: 'farm-selection',
            weight: 3,
            color: '#28a745',
            fillOpacity: 0.2
        }).addTo(this.map);
        
        // Clean up polygon drawing
        this.cleanupPolygonDrawing();
        
        // Update UI
        this.updateSelectionInfo();
        this.hideTooltip();
    }
    
    showConfirmButton() {
        // Create confirm button
        this.confirmButton = document.createElement('button');
        this.confirmButton.className = 'confirm-selection-btn';
        this.confirmButton.innerHTML = '<i class="fas fa-check"></i> Confirm';
        this.confirmButton.onclick = () => this.completeRectangleSelection();
        
        // Position it on the map
        document.body.appendChild(this.confirmButton);
    }
    
    hideConfirmButton() {
        if (this.confirmButton) {
            this.confirmButton.remove();
            this.confirmButton = null;
        }
    }
    
    cancelPolygonSelection() {
        // Remove temp polygon
        if (this.tempPolygon) {
            this.map.removeLayer(this.tempPolygon);
            this.tempPolygon = null;
        }
        
        // Remove confirm button
        if (this.confirmButton) {
            this.hideConfirmButton();
        }
        
        this.cleanupPolygonDrawing();
        this.hideTooltip();
    }
    
    cleanupPolygonDrawing() {
        this.isDrawingPolygon = false;
        this.polygonPoints = [];
        this.selectionMode = false;
        
        // Remove event listeners
        if (this.polygonClickHandler) {
            this.map.off('click', this.polygonClickHandler);
        }
        if (this.polygonMoveHandler) {
            this.map.off('mousemove', this.polygonMoveHandler);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        // Reset button state
        const selectBtn = document.getElementById('selectFarmBtn');
        if (selectBtn) {
            selectBtn.classList.remove('active');
        }
        this.map.getContainer().style.cursor = '';
    }

    updateSelectionInfo() {
        if (!this.currentSelection) return;

        let area, center;
        
        // Handle both polygon and rectangle selections
        if (this.currentSelection.getBounds) {
            // Rectangle selection (legacy)
            const bounds = this.currentSelection.getBounds();
            area = this.calculateArea(bounds);
            center = bounds.getCenter();
        } else {
            // Custom quadrilateral from 4 points - calculate actual area
            const points = this.currentSelection.getLatLngs()[0];
            area = this.calculatePolygonArea(points);
            center = this.calculatePolygonCenter(points);
        }

        // Update UI
        document.getElementById('farmArea').textContent = area.toFixed(2);
        document.getElementById('farmCoords').textContent = 
            `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        document.getElementById('selectionInfo').style.display = 'block';
        
        // Add fade-in animation
        document.getElementById('selectionInfo').classList.add('fade-in');
    }

    calculateArea(bounds) {
        // Calculate area in hectares using Leaflet's built-in methods
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const nw = L.latLng(ne.lat, sw.lng);
        const se = L.latLng(sw.lat, ne.lng);

        const width = nw.distanceTo(ne);
        const height = nw.distanceTo(sw);
        
        return (width * height) / 10000; // Convert to hectares
    }
    
    calculateRectangleArea(points) {
        // Calculate rectangle area from 4 corner points
        if (points.length !== 4) return 0;
        
        // Get the bounds of the rectangle
        const lats = points.map(p => p.lat);
        const lngs = points.map(p => p.lng);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        // Calculate width and height using Leaflet's distance calculation
        const topLeft = L.latLng(maxLat, minLng);
        const topRight = L.latLng(maxLat, maxLng);
        const bottomLeft = L.latLng(minLat, minLng);
        
        const width = topLeft.distanceTo(topRight); // meters
        const height = topLeft.distanceTo(bottomLeft); // meters
        
        const areaInSquareMeters = width * height;
        return areaInSquareMeters / 10000; // Convert to hectares
    }
    
    calculatePolygonArea(points) {
        // Calculate polygon area using the shoelace formula
        if (points.length < 3) return 0;
        
        let area = 0;
        const earthRadius = 6371000; // Earth radius in meters
        
        // Convert to radians and calculate area
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            const lat1 = points[i].lat * Math.PI / 180;
            const lat2 = points[j].lat * Math.PI / 180;
            const lng1 = points[i].lng * Math.PI / 180;
            const lng2 = points[j].lng * Math.PI / 180;
            
            area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
        }
        
        area = Math.abs(area) * earthRadius * earthRadius / 2;
        return area / 10000; // Convert to hectares
    }
    
    calculatePolygonCenter(points) {
        // Calculate centroid of polygon
        if (points.length === 0) return L.latLng(0, 0);
        
        let lat = 0, lng = 0;
        
        for (const point of points) {
            lat += point.lat;
            lng += point.lng;
        }
        
        return L.latLng(lat / points.length, lng / points.length);
    }
    
    createRectangleFromPoints(points) {
        if (points.length < 2) return points;
        
        if (points.length === 2) {
            // Two points - show line preview
            return points;
        }
        
        if (points.length === 3) {
            // Three points - show partial rectangle preview
            return points;
        }
        
        if (points.length === 4) {
            // Four points - use exactly the points the user placed
            // Return them in the order they were placed to form a quadrilateral
            return points;
        }
        
        return points;
    }

    getSelectionBounds() {
        if (!this.currentSelection) return null;
        
        // Handle both polygon and rectangle selections
        if (this.currentSelection.getBounds) {
            return this.currentSelection.getBounds();
        } else {
            // For polygons, create bounds from all points
            const points = this.currentSelection.getLatLngs()[0];
            if (points.length === 0) return null;
            
            let minLat = points[0].lat, maxLat = points[0].lat;
            let minLng = points[0].lng, maxLng = points[0].lng;
            
            for (const point of points) {
                minLat = Math.min(minLat, point.lat);
                maxLat = Math.max(maxLat, point.lat);
                minLng = Math.min(minLng, point.lng);
                maxLng = Math.max(maxLng, point.lng);
            }
            
            return L.latLngBounds(
                L.latLng(minLat, minLng),
                L.latLng(maxLat, maxLng)
            );
        }
    }

    addLatamZone() {
        // Create LATAM zone polygon - contoured only, no fill
        const latamPolygon = [
            [this.latamBounds.north, this.latamBounds.west], // Northwest
            [this.latamBounds.north, this.latamBounds.east], // Northeast
            [this.latamBounds.south, this.latamBounds.east], // Southeast
            [this.latamBounds.south, this.latamBounds.west]  // Southwest
        ];

        this.latamZone = L.polygon(latamPolygon, {
            color: '#ff6b35',
            weight: 4,
            opacity: 0.9,
            fillOpacity: 0, // No fill to prevent click conflicts
            fill: false, // Explicitly disable fill
            className: 'latam-zone-outline',
            interactive: false // Prevent this layer from intercepting clicks
        }).addTo(this.map);

        // Add a separate invisible polygon for popup only (smaller and non-interfering)
        this.latamZonePopup = L.polygon([
            [this.latamBounds.north - 5, this.latamBounds.west + 10], // Smaller area for popup
            [this.latamBounds.north - 5, this.latamBounds.west + 30],
            [this.latamBounds.north - 15, this.latamBounds.west + 30],
            [this.latamBounds.north - 15, this.latamBounds.west + 10]
        ], {
            opacity: 0,
            fillOpacity: 0,
            interactive: true
        }).addTo(this.map);

        // Add popup only to the small popup area
        this.latamZonePopup.bindPopup(`
            <div class="latam-zone-popup">
                <h6><i class="fas fa-rocket me-2"></i>LATAM Mission Zone</h6>
                <p><strong>🚀 Starship Recovery Mission</strong></p>
                <p>Complete 20 successful fertilizer missions in this region to collect starship parts and unlock the starship motors!</p>
                <div class="text-center mt-2">
                    <i class="fas fa-map-marked-alt text-warning"></i>
                    <small class="d-block">Latin America & Caribbean</small>
                </div>
            </div>
        `);

        // LATAM zone legend removed
    }

    // addLatamLegend function removed

    isInLatamZone(lat, lng) {
        return lat >= this.latamBounds.south && 
               lat <= this.latamBounds.north && 
               lng >= this.latamBounds.west && 
               lng <= this.latamBounds.east;
    }

    isSelectionInLatamZone() {
        if (!this.currentSelection) return false;
        
        const bounds = this.currentSelection.getBounds();
        const center = bounds.getCenter();
        return this.isInLatamZone(center.lat, center.lng);
    }

    addSampleFarmAreas() {
        // Add sample farm markers with focus on LATAM region
        const sampleFarms = [
            // LATAM Farms (Starship Mission Zone)
            { lat: -15.7801, lng: -47.9292, name: "Brazilian Soybean Farm", type: "Soybean Farm", region: "LATAM" },
            { lat: -34.6118, lng: -58.3960, name: "Argentine Wheat Farm", type: "Wheat Farm", region: "LATAM" },
            { lat: 19.4326, lng: -99.1332, name: "Mexican Corn Farm", type: "Corn Farm", region: "LATAM" },
            { lat: -12.0464, lng: -77.0428, name: "Peruvian Quinoa Farm", type: "Quinoa Farm", region: "LATAM" },
            { lat: 4.7110, lng: -74.0721, name: "Colombian Coffee Farm", type: "Coffee Farm", region: "LATAM" },
            { lat: -22.9068, lng: -43.1729, name: "Brazilian Sugar Cane", type: "Sugar Cane", region: "LATAM" },
            { lat: 10.4806, lng: -66.9036, name: "Venezuelan Rice Farm", type: "Rice Farm", region: "LATAM" },
            { lat: -25.2637, lng: -57.5759, name: "Paraguayan Cotton Farm", type: "Cotton Farm", region: "LATAM" },
            
            // Other regions for comparison
            { lat: 40.7589, lng: -73.9851, name: "Central Park Farm Demo", type: "Urban Agriculture", region: "North America" },
            { lat: 39.7392, lng: -104.9903, name: "Colorado Wheat Farm", type: "Grain Farm", region: "North America" },
            { lat: 36.1627, lng: -86.7816, name: "Tennessee Corn Farm", type: "Corn Farm", region: "North America" }
        ];

        sampleFarms.forEach(farm => {
            // Create different icons for LATAM vs other regions
            const isLatam = farm.region === 'LATAM';
            const iconClass = isLatam ? 'fas fa-rocket' : 'fas fa-tractor';
            const iconColor = isLatam ? '#ff6b35' : '#28a745';
            
            const customIcon = L.divIcon({
                className: 'custom-farm-marker',
                html: `<i class="${iconClass}" style="color: ${iconColor}; font-size: 20px;"></i>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            const marker = L.marker([farm.lat, farm.lng], { icon: customIcon })
                .bindPopup(`
                    <div class="farm-popup">
                        <h6>${farm.name}</h6>
                        <p><strong>Type:</strong> ${farm.type}</p>
                        <p><strong>Region:</strong> ${farm.region}</p>
                        ${isLatam ? '<p class="text-warning"><i class="fas fa-rocket me-1"></i><strong>Starship Mission Zone!</strong></p>' : ''}
                        <button class="btn btn-sm ${isLatam ? 'btn-warning' : 'btn-success'}" onclick="mapManager.flyToLocation(${farm.lat}, ${farm.lng})">
                            ${isLatam ? '🚀 Start Mission' : 'Analyze This Area'}
                        </button>
                    </div>
                `)
                .addTo(this.map);
        });
    }

    flyToLocation(lat, lng) {
        this.map.flyTo([lat, lng], 15, {
            animate: true,
            duration: 2
        });
    }

    locateUser() {
        const locateBtn = document.getElementById('locateBtn');
        
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            this.showTooltip('Geolocation is not supported by this browser.');
            return;
        }

        // Show loading state
        locateBtn.disabled = true;
        locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        this.showTooltip('Getting your location...');

        // Get current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Fly to user's location
                this.map.flyTo([lat, lng], 15, {
                    animate: true,
                    duration: 2
                });

                // Add a marker for user's location
                this.addUserLocationMarker(lat, lng, accuracy);

                // Reset button state
                locateBtn.disabled = false;
                locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                this.showTooltip(`Located! Accuracy: ${Math.round(accuracy)}m`);
                
                // Hide tooltip after 3 seconds
                setTimeout(() => {
                    this.hideTooltip();
                }, 3000);
            },
            (error) => {
                // Handle errors
                let errorMessage = 'Unable to get your location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }

                // Reset button state
                locateBtn.disabled = false;
                locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                this.showTooltip(errorMessage);
                
                // Hide tooltip after 5 seconds
                setTimeout(() => {
                    this.hideTooltip();
                }, 5000);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    addUserLocationMarker(lat, lng, accuracy) {
        // Remove existing user location marker if it exists
        if (this.userLocationMarker) {
            this.map.removeLayer(this.userLocationMarker);
        }
        if (this.userLocationCircle) {
            this.map.removeLayer(this.userLocationCircle);
        }

        // Create custom icon for user location
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<i class="fas fa-user-circle" style="color: #007bff; font-size: 20px;"></i>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Add marker for user's location
        this.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
            .bindPopup(`
                <div class="user-location-popup">
                    <h6><i class="fas fa-map-marker-alt me-2"></i>Your Location</h6>
                    <p><strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ±${Math.round(accuracy)}m</p>
                </div>
            `)
            .addTo(this.map);

        // Add accuracy circle
        this.userLocationCircle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#007bff',
            fillColor: '#007bff',
            fillOpacity: 0.1,
            weight: 2
        }).addTo(this.map);
    }

    showTooltip(message) {
        // Create or update tooltip
        let tooltip = document.getElementById('mapTooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'mapTooltip';
            tooltip.className = 'alert alert-info position-fixed';
            tooltip.style.cssText = `
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2000;
                margin: 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(tooltip);
        }
        tooltip.textContent = message;
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = document.getElementById('mapTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // Method to get current map center for API calls
    getCurrentCenter() {
        return this.map.getCenter();
    }

    // Method to get current zoom level
    getCurrentZoom() {
        return this.map.getZoom();
    }

    // Method to add overlay layers (for satellite data visualization)
    addDataOverlay(data, type) {
        // This will be used to display NDVI, LAI, or other satellite data overlays
        switch(type) {
            case 'ndvi':
                this.addNDVIOverlay(data);
                break;
            case 'lai':
                this.addLAIOverlay(data);
                break;
            case 'soil':
                this.addSoilOverlay(data);
                break;
        }
    }

    addNDVIOverlay(data) {
        // Add NDVI color overlay to the map
        // This would typically use satellite imagery data
        console.log('Adding NDVI overlay:', data);
    }

    addLAIOverlay(data) {
        // Add LAI visualization overlay
        console.log('Adding LAI overlay:', data);
    }

    addSoilOverlay(data) {
        // Add soil data overlay
        console.log('Adding soil overlay:', data);
    }

    // Mark an area as completed
    markAreaAsCompleted(bounds, isCorrect, isLatamMission = false) {
        if (!bounds) return;

        const center = bounds.getCenter();
        const areaId = `${center.lat.toFixed(4)}_${center.lng.toFixed(4)}`;
        
        // Check if this area is already marked
        const existingIndex = this.completedAreas.findIndex(area => area.id === areaId);
        if (existingIndex !== -1) {
            // Update existing marker and overlay
            this.updateCompletedMarker(existingIndex, isCorrect, isLatamMission);
            this.updateAnalyzedZoneOverlay(existingIndex, isCorrect, isLatamMission);
            return;
        }

        // Get the exact selection shape (not just bounds)
        const selectionShape = this.currentSelection ? this.currentSelection.getLatLngs() : null;
        
        // Add to completed areas
        const completedArea = {
            id: areaId,
            bounds: bounds,
            center: center,
            selectionShape: selectionShape, // Store the exact shape
            isCorrect: isCorrect,
            isLatamMission: isLatamMission,
            timestamp: new Date().toISOString()
        };
        this.completedAreas.push(completedArea);

        // Create visual marker
        this.createCompletedMarker(completedArea);
        
        // Create analyzed zone overlay
        this.createAnalyzedZoneOverlay(completedArea);
    }

    createCompletedMarker(completedArea) {
        const { center, isCorrect, isLatamMission } = completedArea;
        
        // Choose icon and color based on result
        let iconClass, iconColor, markerClass;
        if (isCorrect) {
            iconClass = isLatamMission ? 'fas fa-rocket' : 'fas fa-check-circle';
            iconColor = isLatamMission ? '#ff6b35' : '#28a745';
            markerClass = 'completed-marker-success';
        } else {
            iconClass = 'fas fa-times-circle';
            iconColor = '#dc3545';
            markerClass = 'completed-marker-failed';
        }

        // Create custom icon
        const completedIcon = L.divIcon({
            className: `completed-marker ${markerClass}`,
            html: `
                <div class="completed-marker-container">
                    <i class="${iconClass}" style="color: ${iconColor}; font-size: 24px;"></i>
                    <div class="completed-marker-ring"></div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Create marker
        const marker = L.marker([center.lat, center.lng], { icon: completedIcon })
            .bindPopup(`
                <div class="completed-area-popup">
                    <h6>
                        <i class="${iconClass} me-2" style="color: ${iconColor};"></i>
                        ${isCorrect ? 'Mission Completed!' : 'Mission Failed'}
                    </h6>
                    <p><strong>Result:</strong> ${isCorrect ? 'Correct Analysis' : 'Incorrect Analysis'}</p>
                    <p><strong>Type:</strong> ${isLatamMission ? 'LATAM Starship Mission' : 'Regular Mission'}</p>
                    <p><strong>Location:</strong> ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}</p>
                    <small class="text-muted">Completed: ${new Date(completedArea.timestamp).toLocaleString()}</small>
                    ${isCorrect && isLatamMission ? '<p class="text-warning mt-2"><i class="fas fa-star me-1"></i>Starship part collected!</p>' : ''}
                </div>
            `)
            .addTo(this.map);

        // Store marker reference
        this.completedMarkers.push({
            id: completedArea.id,
            marker: marker,
            data: completedArea
        });
    }

    updateCompletedMarker(index, isCorrect, isLatamMission) {
        // Update the existing completed area data
        this.completedAreas[index].isCorrect = isCorrect;
        this.completedAreas[index].isLatamMission = isLatamMission;
        this.completedAreas[index].timestamp = new Date().toISOString();

        // Find and update the marker
        const markerData = this.completedMarkers.find(m => m.id === this.completedAreas[index].id);
        if (markerData) {
            // Remove old marker and overlay
            this.map.removeLayer(markerData.marker);
            if (markerData.overlay) {
                this.map.removeLayer(markerData.overlay);
            }
            
            // Create new marker with updated data
            this.createCompletedMarker(this.completedAreas[index]);
            
            // Update marker reference
            const markerIndex = this.completedMarkers.findIndex(m => m.id === this.completedAreas[index].id);
            if (markerIndex !== -1) {
                this.completedMarkers[markerIndex].data = this.completedAreas[index];
            }
        }
    }


    // Create analyzed zone overlay
    createAnalyzedZoneOverlay(completedArea) {
        const { bounds, selectionShape, isCorrect, isLatamMission, id } = completedArea;
        
        // Determine overlay style
        let className = 'analyzed-zone';
        let borderColor = '#007bff';
        let fillColor = 'rgba(0, 123, 255, 0.1)';
        
        if (isCorrect) {
            className += ' correct';
            borderColor = isLatamMission ? '#ff6b35' : '#28a745';
            fillColor = isLatamMission ? 'rgba(255, 107, 53, 0.1)' : 'rgba(40, 167, 69, 0.1)';
        } else {
            className += ' incorrect';
            borderColor = '#dc3545';
            fillColor = 'rgba(220, 53, 69, 0.1)';
        }
        
        if (isLatamMission) {
            className += ' latam-mission';
        }
        
        let overlay;
        
        // Use exact selection shape if available, otherwise fall back to rectangle
        if (selectionShape && selectionShape[0] && selectionShape[0].length > 0) {
            // Create polygon overlay using the exact selection shape
            overlay = L.polygon(selectionShape[0], {
                className: className,
                color: borderColor,
                weight: isLatamMission ? 3 : 2,
                opacity: 0.8,
                fillColor: fillColor,
                fillOpacity: 0.2,
                interactive: false // Don't interfere with map interactions
            }).addTo(this.map);
        } else {
            // Fallback to rectangle overlay for legacy selections
            overlay = L.rectangle(bounds, {
                className: className,
                color: borderColor,
                weight: isLatamMission ? 3 : 2,
                opacity: 0.8,
                fillColor: fillColor,
                fillOpacity: 0.2,
                interactive: false // Don't interfere with map interactions
            }).addTo(this.map);
        }
        
        // Store overlay reference
        const existingMarker = this.completedMarkers.find(m => m.id === id);
        if (existingMarker) {
            existingMarker.overlay = overlay;
        }
    }
    
    // Update analyzed zone overlay
    updateAnalyzedZoneOverlay(index, isCorrect, isLatamMission) {
        const completedArea = this.completedAreas[index];
        const markerData = this.completedMarkers.find(m => m.id === completedArea.id);
        
        if (markerData && markerData.overlay) {
            // Remove old overlay
            this.map.removeLayer(markerData.overlay);
        }
        
        // Create new overlay with updated data
        this.createAnalyzedZoneOverlay(completedArea);
    }
    
    // Add method to highlight current selection during analysis
    highlightCurrentSelection() {
        if (this.currentSelection) {
            // Add pulsing animation to current selection
            this.currentSelection.setStyle({
                className: 'farm-selection'
            });
        }
    }
    
    // Remove highlight from current selection
    removeSelectionHighlight() {
        if (this.currentSelection) {
            this.currentSelection.setStyle({
                className: '',
                color: '#28a745',
                weight: 3,
                fillOpacity: 0.2
            });
        }
    }
        // Get current selection data for marking
    getCurrentSelectionData() {
        if (!this.currentSelection) return null;
        
        return {
            bounds: this.currentSelection.getBounds(),
            center: this.currentSelection.getBounds().getCenter(),
            isLatamMission: this.isSelectionInLatamZone()
        };
    }

    // Clear all completed markers (for reset functionality)
    clearCompletedMarkers() {
        this.completedMarkers.forEach(markerData => {
            this.map.removeLayer(markerData.marker);
            if (markerData.overlay) {
                this.map.removeLayer(markerData.overlay);
            }
        });
        this.completedMarkers = [];
        this.completedAreas = [];
    }

    // Get statistics about completed areas
    getCompletedStats() {
        const total = this.completedAreas.length;
        const correct = this.completedAreas.filter(area => area.isCorrect).length;
        const latamMissions = this.completedAreas.filter(area => area.isLatamMission).length;
        const latamCorrect = this.completedAreas.filter(area => area.isLatamMission && area.isCorrect).length;
        
        return {
            total,
            correct,
            accuracy: total > 0 ? (correct / total * 100) : 0,
            latamMissions,
            latamCorrect,
            latamAccuracy: latamMissions > 0 ? (latamCorrect / latamMissions * 100) : 0
        };
    }
}

// Initialize map manager when DOM is loaded
let mapManager;
document.addEventListener('DOMContentLoaded', () => {
    mapManager = new MapManager();
});