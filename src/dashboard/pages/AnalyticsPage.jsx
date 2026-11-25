import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Calendar, Droplets, TestTube } from 'lucide-react';
import SoilMetrics from '../components/SoilMetrics';
import HistoryChart from '../components/HistoryChart';
import RecommendationsPanel from '../components/RecommendationsPanel';
import VirtualSoilSensorPanel from '../components/VirtualSoilSensorPanel';
import { normalizeSoilReading, soilSensorRequest } from '../api/soilSensor';
import '../styles/PageTitles.css';
import './AnalyticsPage.css';

const SENSOR_ID = 'virtual-sensor-01';

const AnalyticsPage = () => {
  const [soilData, setSoilData] = useState([]);
  const [sensorStatus, setSensorStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshData = useCallback(async () => {
    try {
      const [status, readings] = await Promise.all([
        soilSensorRequest('/status'),
        soilSensorRequest(`/readings?sensor_id=${encodeURIComponent(SENSOR_ID)}&limit=100`),
      ]);
      const normalized = (readings.items || []).map(normalizeSoilReading);
      setSensorStatus(status);
      setSoilData(normalized);
      setConnected(true);
      setError('');
      return status;
    } catch (requestError) {
      setConnected(false);
      setSensorStatus(null);
      setSoilData([]);
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData().catch(() => {});
    const interval = window.setInterval(() => refreshData().catch(() => {}), 5000);
    return () => window.clearInterval(interval);
  }, [refreshData]);

  const currentData = soilData[0] || null;
  const latestDate = currentData?.date
    ? new Date(currentData.date).toLocaleString()
    : 'No readings yet';

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-simple-header">
          <div>
            <h1 className="page-main-title"><TestTube className="w-7 h-7 title-icon" />Soil Analysis</h1>
            <p className="analytics-subtitle">Measurements and rule-based soil guidance from your virtual sensor.</p>
          </div>
          <span className={`analytics-api-status ${connected ? 'online' : 'offline'}`}>
            {isLoading ? 'Connecting…' : connected ? 'Sensor API connected' : 'Sensor API offline'}
          </span>
        </div>

        {error && <div className="analytics-api-error" role="alert">{error}</div>}
        {isLoading && <div className="analytics-api-message" role="status">Loading sensor readings…</div>}

        <VirtualSoilSensorPanel status={sensorStatus} connected={connected} onRefresh={refreshData} />

        <div className="soil-stats-grid analytics-live-stats">
          <div className="soil-stat-card">
            <div className="stat-header"><h3>Saved Measurements</h3><Activity className="w-5 h-5 text-pink-500" /></div>
            <div className="stat-value">{connected ? (sensorStatus?.reading_count ?? soilData.length) : '—'}</div>
            <div className="stat-label">Persisted by the simulator</div>
          </div>
          <div className="soil-stat-card">
            <div className="stat-header"><h3>Latest pH</h3><TestTube className="w-5 h-5 text-pink-500" /></div>
            <div className="stat-value">{currentData ? currentData.pH.toFixed(1) : '—'}</div>
            <div className="stat-label">{currentData ? currentData.source : 'No measurement available'}</div>
          </div>
          <div className="soil-stat-card">
            <div className="stat-header"><h3>Latest Moisture</h3><Droplets className="w-5 h-5 text-pink-500" /></div>
            <div className="stat-value">{currentData ? `${currentData.humidity.toFixed(1)}%` : '—'}</div>
            <div className="stat-label">{currentData ? currentData.field_name || 'Field not specified' : 'No measurement available'}</div>
          </div>
          <div className="soil-stat-card">
            <div className="stat-header"><h3>Last Reading</h3><Calendar className="w-5 h-5 text-pink-500" /></div>
            <div className="analytics-date-value">{latestDate}</div>
            <div className="stat-label">{currentData?.plot_name || (connected ? 'Waiting for first reading' : 'Unavailable')}</div>
          </div>
        </div>

        {!isLoading && connected && soilData.length === 0 && (
          <div className="analytics-api-message">No readings have been recorded yet. Generate a simulated reading or enter a manual demonstration reading above.</div>
        )}

        <div className="soil-stats-grid analytics-detail-grid">
          <SoilMetrics data={currentData} />
          <RecommendationsPanel data={currentData} />
        </div>
        <div className="historical-section"><HistoryChart data={soilData} /></div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
