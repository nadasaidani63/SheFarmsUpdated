import React from 'react';
import UiIcon from '../../components/UiIcon';

const AlertsPanel = () => {
  const alerts = [
    { 
      id: 1,
      type: 'soil',
      title: 'Dry Soil Detected',
      message: 'Plot A requires urgent irrigation',
      severity: 'high',
      time: '2h ago'
    },
    { 
      id: 2,
      type: 'drone',
      title: 'Drone Anomaly',
      message: 'Suspicious area detected in South field',
      severity: 'medium',
      time: '5h ago'
    },
    { 
      id: 3,
      type: 'weather',
      title: 'Weather Alert',
      message: 'Frost expected tonight',
      severity: 'high',
      time: '1h ago'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'soil': return 'soil';
      case 'drone': return 'drone';
      case 'weather': return 'rain';
      case 'pest': return 'alert';
      default: return 'alert';
    }
  };

  const getSeverityClass = (severity) => {
    return `dashboard-alert-severity ${severity}`;
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3><UiIcon name="alert" /> Alerts</h3>
        <span className="dashboard-badge">{alerts.length}</span>
      </div>
      <div className="dashboard-alerts-list">
        {alerts.map(alert => (
          <div key={alert.id} className="dashboard-alert-item">
            <div className="dashboard-alert-icon"><UiIcon name={getAlertIcon(alert.type)} /></div>
            <div className="dashboard-alert-content">
              <div className="dashboard-alert-title">{alert.title}</div>
              <div className="dashboard-alert-message">{alert.message}</div>
              <div className="dashboard-alert-time">{alert.time}</div>
            </div>
            <div className={getSeverityClass(alert.severity)}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
