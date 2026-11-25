import React, { useState } from 'react';
import { TrendingUp, Calendar, Clock, BarChart3 } from 'lucide-react';

const HistoryChart = ({ data = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState('pH');
  const [timeRange, setTimeRange] = useState('month');

  const metrics = [
    { key: 'pH', label: 'pH Level', color: 'from-pink-400 to-rose-600', unit: '' },
    { key: 'humidity', label: 'Moisture', color: 'from-blue-400 to-cyan-600', unit: '%' },
    { key: 'temperature', label: 'Temperature', color: 'from-orange-400 to-amber-600', unit: '°C' },
    { key: 'nitrogen', label: 'Nitrogen', color: 'from-emerald-400 to-teal-600', unit: '' },
    { key: 'phosphorus', label: 'Phosphorus', color: 'from-amber-400 to-orange-600', unit: '' },
    { key: 'potassium', label: 'Potassium', color: 'from-purple-400 to-indigo-600', unit: '' },
    { key: 'organicMatter', label: 'Organic Matter', color: 'from-green-400 to-emerald-600', unit: '%' }
  ];

  const currentMetric = metrics.find(m => m.key === selectedMetric) || metrics[0];

  // Trier les données par date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const rangeDays = { week: 7, month: 30, year: 365 }[timeRange];
  const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
  const visibleData = sortedData.filter((item) => new Date(item.date).getTime() >= cutoff);

  // Calculer la tendance
  const calculateTrend = () => {
    if (visibleData.length < 2) return { trend: 'stable', change: 0 };
    
    const latest = visibleData[visibleData.length - 1][selectedMetric];
    const previous = visibleData[visibleData.length - 2][selectedMetric];
    const change = previous === 0 ? (latest === 0 ? 0 : 100) : ((latest - previous) / Math.abs(previous)) * 100;
    
    if (Math.abs(change) < 2) return { trend: 'stable', change: 0 };
    return { trend: change > 0 ? 'up' : 'down', change: Math.abs(change) };
  };

  const { trend, change } = calculateTrend();

  const getMaxValue = (key) => {
    if (key === 'pH') return 14;
    if (key === 'temperature') return 60;
    if (key === 'organicMatter') return 20;
    if (key === 'nitrogen') return 300;
    if (key === 'phosphorus') return 200;
    if (key === 'potassium') return 400;
    return 100;
  };

  const getOptimalRange = (key) => {
    switch (key) {
      case 'pH': return { min: 6.0, max: 7.5 };
      case 'humidity': return { min: 60, max: 80 };
      case 'nitrogen': return { min: 80, max: 100 };
      case 'phosphorus': return { min: 80, max: 100 };
      case 'potassium': return { min: 80, max: 100 };
      case 'temperature': return { min: 18, max: 30 };
      case 'organicMatter': return { min: 3, max: 5 };
      default: return { min: 0, max: 100 };
    }
  };

  if (visibleData.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Historical Trends</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">No historical data available</p>
          <p className="text-sm text-gray-400 mt-2">Add soil measurements to see trends</p>
        </div>
      </div>
    );
  }

  const optimalRange = getOptimalRange(selectedMetric);
  const maxValue = getMaxValue(selectedMetric);

  return (
    <div className="history-chart-container">
      {/* Header Section */}
      <div className="history-header">
        <div className="history-title-section">
          <h3 className="history-title">Historical Trends</h3>
          <div className="history-measurements">
            <Calendar className="calendar-icon" />
            {visibleData.length} measurements
          </div>
        </div>
        
        <div className="history-controls">
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-selector"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>

          {/* Time Range Buttons */}
          <div className="time-range-buttons">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              >
                {range === 'week' && 'Week'}
                {range === 'month' && 'Month'}
                {range === 'year' && 'Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Value Section */}
      <div className="current-value-section">
        <div className="current-value-content">
          <div className="current-label">Current {currentMetric.label}</div>
          <div className="current-number">
            {visibleData[visibleData.length - 1]?.[selectedMetric]?.toFixed(1)}
          </div>
        </div>
        
        <div className="trend-section">
          <div className="trend-label">Trend</div>
          <div className="trend-value">
            <TrendingUp className="trend-icon" />
            {trend === 'stable' ? '0.0%' : 
             trend === 'up' ? `+${change.toFixed(1)}%` : 
             `-${change.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        {/* Y-Axis Labels */}
        <div className="y-axis-labels">
          {Array.from({ length: 6 }, (_, i) => {
            const value = (maxValue * (5 - i)) / 5;
            return (
              <div key={i} className="y-axis-label">
                {value.toFixed(selectedMetric === 'pH' ? 1 : 0)}
              </div>
            );
          })}
        </div>

        {/* Chart Area */}
        <div className="chart-area">
          {/* Optimal Range Background */}
          <div className="optimal-range-bg">
            {(() => {
              const optimalMinPercent = (optimalRange.min / maxValue) * 100;
              const optimalMaxPercent = (optimalRange.max / maxValue) * 100;
              
              return (
                <div 
                  className="optimal-zone"
                  style={{
                    bottom: `${optimalMinPercent}%`,
                    height: `${optimalMaxPercent - optimalMinPercent}%`
                  }}
                />
              );
            })()}
          </div>

          {/* Chart Grid */}
          <div className="chart-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="grid-line" style={{ bottom: `${i * 20}%` }} />
            ))}
          </div>

          {/* Data Points */}
          <div className="data-points">
            {visibleData.slice(-10).map((item, index) => {
              const value = item[selectedMetric];
                const height = Math.max(0, Math.min(100, (value / maxValue) * 100));
              
              return (
                <div key={index} className="data-point" style={{ height: `${height}%` }}>
                  <div className="data-bar" />
                  <div className="data-tooltip">
                    {value.toFixed(1)}{currentMetric.unit}
                    <br />
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="x-axis-labels">
            {visibleData.slice(-10).map((item, index) => (
              <div key={index} className="x-axis-label">
                {new Date(item.date).toLocaleDateString('fr-FR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color optimal-range"></div>
          <span>Optimal Range</span>
        </div>
        <div className="legend-item">
          <div className="legend-color ph-level"></div>
          <span>{currentMetric.label}</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryChart;
