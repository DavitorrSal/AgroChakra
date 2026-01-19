/**
 * Control Farm - Field Renderer Module
 * Handles satellite imagery visualization and field mapping
 */

class FieldRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.fieldData = null;
        this.currentVisualization = 'satellite';
        this.animationFrame = null;
        
        // Visualization parameters
        this.visualizationModes = {
            satellite: { name: 'Satellite View', colors: this.getSatelliteColors() },
            ndvi: { name: 'NDVI Analysis', colors: this.getNDVIColors() },
            lai: { name: 'LAI Mapping', colors: this.getLAIColors() },
            moisture: { name: 'Soil Moisture', colors: this.getMoistureColors() },
            temperature: { name: 'Temperature', colors: this.getTemperatureColors() }
        };
        
        this.fieldBoundaries = [
            { id: 'A', x: 100, y: 50, width: 120, height: 80 },
            { id: 'B', x: 250, y: 100, width: 100, height: 100 },
            { id: 'C', x: 400, y: 150, width: 140, height: 90 },
            { id: 'D', x: 150, y: 230, width: 110, height: 70 }
        ];
        
        this.selectedField = null;
        this.hoveredField = null;
    }
    
    init() {
        this.canvas = document.getElementById('field-canvas');
        if (!this.canvas) {
            console.error('Field canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
        this.startRenderLoop();
        
        console.log('Field Renderer initialized');
    }
    
    setupCanvas() {
        // Set canvas size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Enable high DPI rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.handleMouseClick(e);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredField = null;
        });
        
        // Analysis type change
        const analysisSelect = document.getElementById('analysis-type');
        if (analysisSelect) {
            analysisSelect.addEventListener('change', (e) => {
                this.setVisualizationMode(e.target.value);
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const field = this.getFieldAtPosition(x, y);
        if (field !== this.hoveredField) {
            this.hoveredField = field;
            this.canvas.style.cursor = field ? 'pointer' : 'default';
        }
    }
    
    handleMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const field = this.getFieldAtPosition(x, y);
        if (field) {
            this.selectField(field);
        }
    }
    
    getFieldAtPosition(x, y) {
        for (const field of this.fieldBoundaries) {
            if (x >= field.x && x <= field.x + field.width &&
                y >= field.y && y <= field.y + field.height) {
                return field;
            }
        }
        return null;
    }
    
    selectField(field) {
        this.selectedField = field;
        
        // Update field info in the UI
        if (window.GameEngine) {
            const fieldInfo = document.getElementById('field-info');
            if (fieldInfo) {
                fieldInfo.innerHTML = `
                    <div class="field-details">
                        <h4>Field ${field.id}</h4>
                        <p><strong>Area:</strong> ${(field.width * field.height / 1000).toFixed(1)} hectares</p>
                        <p><strong>Coordinates:</strong> ${field.x + field.width/2}, ${field.y + field.height/2}</p>
                        <p><strong>Status:</strong> Ready for analysis</p>
                    </div>
                `;
            }
        }
        
        // Enable analysis button
        const analysisBtn = document.getElementById('run-analysis');
        if (analysisBtn) {
            analysisBtn.disabled = false;
        }
    }
    
    setVisualizationMode(mode) {
        if (this.visualizationModes[mode]) {
            this.currentVisualization = mode;
        }
    }
    
    startRenderLoop() {
        const render = () => {
            this.render();
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }
    
    render() {
        this.clearCanvas();
        this.renderBackground();
        this.renderFields();
        this.renderFieldBoundaries();
        this.renderAnalysisPoints();
        this.renderUI();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderBackground() {
        // Create a satellite-like background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#2d4a3e');
        gradient.addColorStop(0.5, '#3e5c4a');
        gradient.addColorStop(1, '#4a6b56');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add some texture
        this.addBackgroundTexture();
    }
    
    addBackgroundTexture() {
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            
            this.ctx.fillStyle = Math.random() > 0.5 ? '#5a7a66' : '#3a5a46';
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1.0;
    }
    
    renderFields() {
        this.fieldBoundaries.forEach(field => {
            this.renderField(field);
        });
    }
    
    renderField(field) {
        const colors = this.visualizationModes[this.currentVisualization].colors;
        
        // Generate field visualization based on current mode
        switch (this.currentVisualization) {
            case 'satellite':
                this.renderSatelliteField(field);
                break;
            case 'ndvi':
                this.renderNDVIField(field, colors);
                break;
            case 'lai':
                this.renderLAIField(field, colors);
                break;
            case 'moisture':
                this.renderMoistureField(field, colors);
                break;
            case 'temperature':
                this.renderTemperatureField(field, colors);
                break;
        }
    }
    
    renderSatelliteField(field) {
        // Create a realistic satellite view with crop patterns
        const gradient = this.ctx.createRadialGradient(
            field.x + field.width/2, field.y + field.height/2, 0,
            field.x + field.width/2, field.y + field.height/2, Math.max(field.width, field.height)/2
        );
        
        // Vary colors based on field health (simulated)
        const healthFactor = 0.5 + Math.random() * 0.5;
        const green = Math.floor(100 + healthFactor * 100);
        const red = Math.floor(60 + (1 - healthFactor) * 60);
        
        gradient.addColorStop(0, `rgb(${red}, ${green}, 70)`);
        gradient.addColorStop(0.7, `rgb(${red + 20}, ${green - 20}, 60)`);
        gradient.addColorStop(1, `rgb(${red + 10}, ${green - 30}, 50)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(field.x, field.y, field.width, field.height);
        
        // Add crop row patterns
        this.addCropRows(field);
    }
    
    addCropRows(field) {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        const rowSpacing = 8;
        for (let i = 0; i < field.height; i += rowSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(field.x, field.y + i);
            this.ctx.lineTo(field.x + field.width, field.y + i);
            this.ctx.stroke();
        }
    }
    
    renderNDVIField(field, colors) {
        // Simulate NDVI values and render accordingly
        const ndviValue = 0.3 + Math.random() * 0.5; // 0.3 to 0.8
        const colorIndex = Math.floor(ndviValue * (colors.length - 1));
        
        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.fillRect(field.x, field.y, field.width, field.height);
        
        // Add NDVI value text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `NDVI: ${ndviValue.toFixed(2)}`,
            field.x + field.width/2,
            field.y + field.height/2
        );
    }
    
    renderLAIField(field, colors) {
        // Simulate LAI values
        const laiValue = 1.0 + Math.random() * 4.0; // 1.0 to 5.0
        const colorIndex = Math.floor((laiValue - 1.0) / 4.0 * (colors.length - 1));
        
        this.ctx.fillStyle = colors[Math.min(colorIndex, colors.length - 1)];
        this.ctx.fillRect(field.x, field.y, field.width, field.height);
        
        // Add LAI value text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `LAI: ${laiValue.toFixed(1)}`,
            field.x + field.width/2,
            field.y + field.height/2
        );
    }
    
    renderMoistureField(field, colors) {
        // Simulate moisture values
        const moistureValue = 20 + Math.random() * 60; // 20% to 80%
        const colorIndex = Math.floor(moistureValue / 100 * (colors.length - 1));
        
        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.fillRect(field.x, field.y, field.width, field.height);
        
        // Add moisture value text
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${moistureValue.toFixed(0)}%`,
            field.x + field.width/2,
            field.y + field.height/2
        );
    }
    
    renderTemperatureField(field, colors) {
        // Simulate temperature values
        const tempValue = 15 + Math.random() * 20; // 15°C to 35°C
        const colorIndex = Math.floor((tempValue - 15) / 20 * (colors.length - 1));
        
        this.ctx.fillStyle = colors[colorIndex];
        this.ctx.fillRect(field.x, field.y, field.width, field.height);
        
        // Add temperature value text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${tempValue.toFixed(1)}°C`,
            field.x + field.width/2,
            field.y + field.height/2
        );
    }
    
    renderFieldBoundaries() {
        this.fieldBoundaries.forEach(field => {
            // Field border
            this.ctx.strokeStyle = field === this.selectedField ? '#00ff88' : 
                                  field === this.hoveredField ? '#ffff00' : '#ffffff';
            this.ctx.lineWidth = field === this.selectedField ? 3 : 
                                field === this.hoveredField ? 2 : 1;
            this.ctx.strokeRect(field.x, field.y, field.width, field.height);
            
            // Field label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                field.id,
                field.x + field.width/2,
                field.y - 10
            );
        });
    }
    
    renderAnalysisPoints() {
        // Render the analysis points that correspond to the HTML overlay
        const points = [
            { x: 150, y: 100, field: 'A' },
            { x: 300, y: 150, field: 'B' },
            { x: 450, y: 200, field: 'C' },
            { x: 200, y: 280, field: 'D' }
        ];
        
        points.forEach(point => {
            // Point circle
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#00ff88';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Pulsing effect
            const time = Date.now() * 0.003;
            const pulseRadius = 8 + Math.sin(time + point.x * 0.01) * 3;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, pulseRadius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }
    
    renderUI() {
        // Render legend for current visualization mode
        this.renderLegend();
        
        // Render scale
        this.renderScale();
    }
    
    renderLegend() {
        const mode = this.visualizationModes[this.currentVisualization];
        if (!mode || this.currentVisualization === 'satellite') return;
        
        const legendX = 10;
        const legendY = 10;
        const legendWidth = 150;
        const legendHeight = 20;
        
        // Legend background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(legendX - 5, legendY - 5, legendWidth + 10, legendHeight + 30);
        
        // Legend title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(mode.name, legendX, legendY + 12);
        
        // Color gradient
        const gradient = this.ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
        mode.colors.forEach((color, index) => {
            gradient.addColorStop(index / (mode.colors.length - 1), color);
        });
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(legendX, legendY + 15, legendWidth, 10);
        
        // Legend labels
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Low', legendX, legendY + 35);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('High', legendX + legendWidth, legendY + 35);
    }
    
    renderScale() {
        const scaleX = this.canvas.width - 120;
        const scaleY = this.canvas.height - 30;
        const scaleLength = 100;
        
        // Scale line
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX, scaleY);
        this.ctx.lineTo(scaleX + scaleLength, scaleY);
        this.ctx.stroke();
        
        // Scale markers
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX, scaleY - 5);
        this.ctx.lineTo(scaleX, scaleY + 5);
        this.ctx.moveTo(scaleX + scaleLength, scaleY - 5);
        this.ctx.lineTo(scaleX + scaleLength, scaleY + 5);
        this.ctx.stroke();
        
        // Scale label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('100m', scaleX + scaleLength/2, scaleY + 15);
    }
    
    // Color schemes for different visualizations
    getSatelliteColors() {
        return ['#2d4a3e', '#3e5c4a', '#4a6b56', '#5a7a66', '#6a8a76'];
    }
    
    getNDVIColors() {
        return [
            '#8B4513', // Brown (bare soil)
            '#CD853F', // Sandy brown
            '#DAA520', // Goldenrod
            '#ADFF2F', // Green yellow
            '#32CD32', // Lime green
            '#228B22', // Forest green
            '#006400'  // Dark green
        ];
    }
    
    getLAIColors() {
        return [
            '#FFE4B5', // Moccasin (low LAI)
            '#DEB887', // Burlywood
            '#D2B48C', // Tan
            '#BC8F8F', // Rosy brown
            '#8FBC8F', // Dark sea green
            '#90EE90', // Light green
            '#32CD32'  // Lime green (high LAI)
        ];
    }
    
    getMoistureColors() {
        return [
            '#8B4513', // Saddle brown (dry)
            '#CD853F', // Sandy brown
            '#F4A460', // Sandy brown
            '#87CEEB', // Sky blue
            '#4682B4', // Steel blue
            '#1E90FF', // Dodger blue
            '#0000FF'  // Blue (wet)
        ];
    }
    
    getTemperatureColors() {
        return [
            '#0000FF', // Blue (cold)
            '#4169E1', // Royal blue
            '#00CED1', // Dark turquoise
            '#32CD32', // Lime green
            '#FFFF00', // Yellow
            '#FFA500', // Orange
            '#FF0000'  // Red (hot)
        ];
    }
    
    // Utility methods
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    exportCanvas() {
        return this.canvas.toDataURL('image/png');
    }
    
    updateFieldData(fieldData) {
        this.fieldData = fieldData;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.FieldRenderer = new FieldRenderer();
});