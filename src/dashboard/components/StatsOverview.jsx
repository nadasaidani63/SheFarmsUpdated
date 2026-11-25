import React from 'react';
import UiIcon from '../../components/UiIcon';

const StatsOverview = () => {
  const stats = [
    { icon: 'sprout', title: 'Active Plots', value: '24', change: '+12%', trend: 'up' },
    { icon: 'water', title: 'Irrigation', value: '78%', change: '+5%', trend: 'up' },
    { icon: 'trend', title: 'Yield', value: '3.2t/ha', change: '+8%', trend: 'up' },
    { icon: 'rain', title: 'Precipitation', value: '45mm', change: '-2%', trend: 'down' }
  ];

  return (
    <div className="dashboard-stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="dashboard-stats-card">
          <div className="dashboard-stats-content">
            <div className="dashboard-stats-info">
              <h3>{stat.title}</h3>
              <h2>{stat.value}</h2>
              <span className={`dashboard-change ${stat.trend}`}>{stat.change}</span>
            </div>
            <div className="dashboard-stats-icon"><UiIcon name={stat.icon} size={24} /></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
