import React, { useEffect, useState } from 'react';
import { Activity, Play, RefreshCw, Save, Square, Waves } from 'lucide-react';
import { soilSensorRequest } from '../api/soilSensor';
import './VirtualSoilSensorPanel.css';

const RANGE_FIELDS = [
  ['ph', 'pH', 0, 14, 1],
  ['moisture', 'Moisture (%)', 0, 100, 1],
  ['temperature', 'Temperature (°C)', -10, 60, 1],
  ['nitrogen', 'Nitrogen', 0, 300, 1],
  ['phosphorus', 'Phosphorus', 0, 200, 1],
  ['potassium', 'Potassium', 0, 400, 1],
  ['organic_matter', 'Organic matter (%)', 0, 20, 1],
];

const EMPTY_MANUAL = {
  ph: '', moisture: '', temperature: '', nitrogen: '', phosphorus: '', potassium: '', organic_matter: '',
};

function rangesToForm(ranges = {}) {
  return Object.fromEntries(RANGE_FIELDS.map(([key]) => {
    const range = ranges[key] || [0, 100];
    return [key, { minimum: Array.isArray(range) ? range[0] : range.minimum, maximum: Array.isArray(range) ? range[1] : range.maximum }];
  }));
}

export default function VirtualSoilSensorPanel({ status, connected, onRefresh }) {
  const sensor = status?.sensor;
  const [config, setConfig] = useState({
    sensor_id: 'virtual-sensor-01', sensor_name: '', field_name: '', plot_name: '', interval_seconds: 30,
  });
  const [ranges, setRanges] = useState(rangesToForm());
  const [manualReading, setManualReading] = useState(EMPTY_MANUAL);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const sensorRangesKey = JSON.stringify(sensor?.ranges || {});

  useEffect(() => {
    if (!sensor?.sensor_id) return;
    setConfig({
      sensor_id: sensor.sensor_id,
      sensor_name: sensor.sensor_name,
      field_name: sensor.field_name,
      plot_name: sensor.plot_name,
      interval_seconds: sensor.interval_seconds,
    });
    setRanges(rangesToForm(JSON.parse(sensorRangesKey)));
  }, [sensor?.sensor_id, sensor?.sensor_name, sensor?.field_name, sensor?.plot_name, sensor?.interval_seconds, sensorRangesKey]);

  const runAction = async (action, successMessage) => {
    setBusy('working');
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
      await onRefresh();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy('');
    }
  };

  const saveConfig = (event) => {
    event.preventDefault();
    const payloadRanges = Object.fromEntries(RANGE_FIELDS.map(([key]) => [key, {
      minimum: Number(ranges[key].minimum), maximum: Number(ranges[key].maximum),
    }]));
    runAction(() => soilSensorRequest('/sensors/config', {
      method: 'PUT', body: JSON.stringify({ ...config, interval_seconds: Number(config.interval_seconds), ranges: payloadRanges }),
    }), 'Virtual sensor settings saved.');
  };

  const submitManualReading = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(Object.entries(manualReading).map(([key, value]) => [key, Number(value)]));
    runAction(async () => {
      await soilSensorRequest('/readings/manual', {
        method: 'POST', body: JSON.stringify({ sensor_id: config.sensor_id, ...values }),
      });
      setManualReading(EMPTY_MANUAL);
    }, 'Manual reading saved and added to the analysis history.');
  };

  const runSensorAction = (path, body, label) => runAction(() => soilSensorRequest(path, {
    method: 'POST', ...(body ? { body: JSON.stringify(body) } : {}),
  }), label);

  return (
    <section className="virtual-sensor-panel">
      <div className="virtual-sensor-heading">
        <div>
          <p className="virtual-sensor-eyebrow"><Waves size={15} /> VIRTUAL SYSTEM</p>
          <h2>Soil sensor simulator</h2>
          <p>Simulated data only — no physical probe is connected.</p>
        </div>
        <span className={`sensor-connection-pill ${connected ? 'is-online' : 'is-offline'}`}>
          <span />{connected ? 'API connected' : 'API offline'}
        </span>
      </div>

      {!connected && <div className="sensor-inline-alert">Start the soil simulator on port 8001 to configure it and load measurements.</div>}
      {error && <div className="sensor-inline-alert sensor-error" role="alert">{error}</div>}
      {message && <div className="sensor-inline-alert sensor-success" role="status">{message}</div>}

      <div className="sensor-controls-row">
        <div className="sensor-identity">
          <Activity size={18} />
          <div>
            <strong>{sensor?.sensor_name || config.sensor_name || 'Virtual Soil Sensor 01'}</strong>
            <span>{sensor?.field_name || 'Field not configured'} · {sensor?.plot_name || 'Plot not configured'}</span>
            <small>{status?.reading_count ?? 0} saved readings · {sensor?.mode || 'manual'} mode</small>
          </div>
        </div>
        <div className="sensor-action-buttons">
          <button type="button" className="sensor-btn sensor-btn-secondary" disabled={!connected || !!busy} onClick={() => runSensorAction('/readings/simulate?sensor_id=' + encodeURIComponent(config.sensor_id), null, 'One simulated reading generated.') }>
            <RefreshCw size={16} /> Generate reading
          </button>
          {status?.simulation_running ? (
            <button type="button" className="sensor-btn sensor-btn-danger" disabled={!connected || !!busy} onClick={() => runSensorAction('/simulation/stop', null, 'Automatic simulation stopped.')}>
              <Square size={15} /> Stop
            </button>
          ) : (
            <button type="button" className="sensor-btn sensor-btn-primary" disabled={!connected || !!busy} onClick={() => runSensorAction('/simulation/start', { interval_seconds: Number(config.interval_seconds) }, 'Automatic simulation started.')}>
              <Play size={15} /> Start automatic
            </button>
          )}
        </div>
      </div>

      <details className="sensor-config-details">
        <summary>Configure sensor and generated ranges</summary>
        <form className="sensor-config-form" onSubmit={saveConfig}>
          <div className="sensor-config-fields">
            <label>Sensor name<input required value={config.sensor_name} onChange={(event) => setConfig({ ...config, sensor_name: event.target.value })} /></label>
            <label>Field<input required value={config.field_name} onChange={(event) => setConfig({ ...config, field_name: event.target.value })} /></label>
            <label>Plot<input required value={config.plot_name} onChange={(event) => setConfig({ ...config, plot_name: event.target.value })} /></label>
            <label>Interval (seconds)<input type="number" min="5" max="86400" required value={config.interval_seconds} onChange={(event) => setConfig({ ...config, interval_seconds: event.target.value })} /></label>
          </div>
          <div className="sensor-range-grid">
            {RANGE_FIELDS.map(([key, label, min, max, step]) => (
              <div className="sensor-range-item" key={key}>
                <strong>{label}</strong>
                <label>Min<input type="number" step={step} min={min} max={max} value={ranges[key].minimum} onChange={(event) => setRanges({ ...ranges, [key]: { ...ranges[key], minimum: event.target.value } })} /></label>
                <label>Max<input type="number" step={step} min={min} max={max} value={ranges[key].maximum} onChange={(event) => setRanges({ ...ranges, [key]: { ...ranges[key], maximum: event.target.value } })} /></label>
              </div>
            ))}
          </div>
          <button className="sensor-btn sensor-btn-primary" type="submit" disabled={!connected || !!busy}>
            <Save size={16} /> {busy ? 'Saving…' : 'Save configuration'}
          </button>
        </form>
      </details>

      <details className="sensor-manual-details">
        <summary>Enter a manual demonstration reading</summary>
        <form className="sensor-manual-form" onSubmit={submitManualReading}>
          {RANGE_FIELDS.map(([key, label, min, max]) => (
            <label key={key}>{label}<input type="number" step="any" min={min} max={max} required value={manualReading[key]} onChange={(event) => setManualReading({ ...manualReading, [key]: event.target.value })} /></label>
          ))}
          <button className="sensor-btn sensor-btn-primary" type="submit" disabled={!connected || !!busy}>
            <Save size={16} /> Save manual reading
          </button>
        </form>
      </details>
    </section>
  );
}
