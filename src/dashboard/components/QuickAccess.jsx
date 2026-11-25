import React from 'react';
import UiIcon from '../../components/UiIcon';

const QuickAccess = () => {
  const quickLinks = [
    { icon: 'calendar', label: 'Calendar', description: 'Schedule management', color: '#3498db' },
    { icon: 'completed', label: 'Tasks', description: 'Activity list', color: '#2ecc71' },
    { icon: 'drone', label: 'Drone', description: 'Flight monitoring', color: '#e74c3c' },
    { icon: 'soil', label: 'Soil Analysis', description: 'Soil data', color: '#f39c12' }
  ];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3><UiIcon name="action" /> Quick Access</h3>
      </div>
      <div className="dashboard-quick-access-vertical">
        {quickLinks.map((link, index) => (
          <div key={index} className="dashboard-quick-access-item-vertical">
            <div 
              className="dashboard-quick-access-icon-vertical"
              style={{ backgroundColor: link.color }}
            >
              <UiIcon name={link.icon} size={21} />
            </div>
            <div className="dashboard-quick-access-info-vertical">
              <div className="dashboard-quick-access-label-vertical">{link.label}</div>
              <div className="dashboard-quick-access-desc-vertical">{link.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
