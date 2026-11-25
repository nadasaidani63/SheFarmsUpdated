import React from 'react';
import { 
  TestTube, 
  Droplets, 
  Thermometer, 
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

const SoilMetrics = ({ data }) => {
  if (!data) {
    return (
      <div className="soil-metrics-container">
        <div className="soil-metrics-header">
          <h3 className="section-title-left">Current Soil Metrics</h3>
          <div className="metric-status">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">No data available</span>
          </div>
        </div>
        <div className="metrics-empty-state">
          <div className="empty-icon">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Add soil measurements to start monitoring</p>
        </div>
      </div>
    );
  }

  const getValueStatus = (value, min, max) => {
    if (value >= min && value <= max) return 'optimal';
    if (value < min) return 'low';
    return 'high';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'emerald';
      case 'low': return 'orange';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const MetricCard = ({ icon, title, value, unit, optimalRange, maxValue, status }) => {
    const colorScheme = getStatusColor(status);
    const progressPercentage = Math.min((value / maxValue) * 100, 100);

    return (
      <div className="metric-card">
        <div className="metric-card-header">
          <div className="metric-icon">
            {icon}
          </div>
          <div className="metric-info">
            <span className="metric-title">{title}</span>
            <span className="metric-range">{optimalRange}</span>
          </div>
        </div>
        
        <div className="metric-value-section">
          <div className={`metric-value metric-value-${colorScheme}`}>
            {Number(value).toFixed(1)}{unit}
          </div>
          
          <div className="metric-progress-container">
            <div className="metric-progress-track">
              <div 
                className={`metric-progress-bar metric-progress-${colorScheme}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-percentage">
            {progressPercentage.toFixed(1)}%
          </div>

          <div className={`metric-status-badge metric-status-${colorScheme}`}>
            {status === 'optimal' && '✓ Optimal'}
            {status === 'low' && '↓ Low'}
            {status === 'high' && '↑ High'}
          </div>
        </div>
      </div>
    );
  };

  const NutrientCard = ({ name, value, color, optimalRange, unit = '' }) => {
    const maxValue = name === 'Organic Matter' ? 20 : name.includes('Nitrogen') ? 300 : name.includes('Phosphorus') ? 200 : 400;
    const progressPercentage = Math.min((value / maxValue) * 100, 100);
    
    let status = 'optimal';
    if (name === 'Organic Matter') {
      status = getValueStatus(value, 3, 5);
    } else {
      status = getValueStatus(value, 80, 100);
    }
    
    const colorScheme = getStatusColor(status);

    return (
      <div className="nutrient-card">
        <div className="nutrient-header">
          <div className={`nutrient-indicator nutrient-indicator-${color}`}></div>
          <span className="nutrient-name">{name}</span>
        </div>
        
        <div className={`nutrient-value nutrient-value-${colorScheme}`}>
          {Number(value).toFixed(1)}{unit}
        </div>
        
        <div className="nutrient-progress-container">
          <div className="nutrient-progress-track">
            <div 
              className={`nutrient-progress-bar nutrient-progress-${color}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="nutrient-range">{optimalRange}</div>
        
        <div className={`nutrient-status-badge nutrient-status-${colorScheme}`}>
          {status === 'optimal' && '✓'}
          {status === 'low' && '↓'}
          {status === 'high' && '↑'}
        </div>
      </div>
    );
  };

  // Calculate status for each metric
  const pHStatus = getValueStatus(data.pH, 6.0, 7.5);
  const humidityStatus = getValueStatus(data.humidity, 60, 80);
  const temperatureStatus = getValueStatus(data.temperature, 18, 30);

  return (
    <div className="soil-metrics-container">
      {/* Header Section */}
      <div className="soil-metrics-header">
        <h3 className="section-title-left">Current Soil Metrics</h3>
        <div className="metric-status">
          <span className="text-xs text-gray-500">{data.source === 'simulated' ? 'Simulated reading' : 'Manual reading'}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Date unavailable'}</span>
        </div>
      </div>

      {/* Main Environmental Metrics Grid */}
      <div className="metrics-grid-main">
        <MetricCard
          icon={<TestTube className="w-5 h-5" />}
          title="pH Level"
          value={data.pH}
          unit=""
          optimalRange="6.0-7.5 optimal"
          maxValue={14}
          status={pHStatus}
        />
        
        <MetricCard
          icon={<Droplets className="w-5 h-5" />}
          title="Humidity"
          value={data.humidity}
          unit="%"
          optimalRange="60-80% optimal"
          maxValue={100}
          status={humidityStatus}
        />
        
        <MetricCard
          icon={<Thermometer className="w-5 h-5" />}
          title="Temperature"
          value={data.temperature}
          unit="°C"
          optimalRange="18-30°C optimal"
          maxValue={50}
          status={temperatureStatus}
        />
      </div>

      {/* Nutrient Levels Section */}
      <div className="nutrients-section">
        <div className="nutrients-header">
          <h4 className="nutrients-title">
            <Activity className="w-4 h-4 text-pink-500" />
            Nutrient Levels
          </h4>
        </div>
        
        <div className="nutrients-grid">
          <NutrientCard
            name="Nitrogen (N)"
            value={data.nitrogen}
            color="emerald"
            optimalRange="80-100% optimal"
          />
          
          <NutrientCard
            name="Phosphorus (P)"
            value={data.phosphorus}
            color="orange"
            optimalRange="80-100% optimal"
          />
          
          <NutrientCard
            name="Potassium (K)"
            value={data.potassium}
            color="purple"
            optimalRange="80-100% optimal"
          />
          
          <NutrientCard
            name="Organic Matter"
            value={data.organicMatter}
            color="green"
            optimalRange="3-5% optimal"
            unit="%"
          />
        </div>
      </div>
    </div>
  );
};

export default SoilMetrics;
