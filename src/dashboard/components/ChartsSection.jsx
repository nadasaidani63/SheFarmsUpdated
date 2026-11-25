import React from 'react';

const ChartsSection = () => {
  return (
    <div className="dashboard-charts-section">
      <div className="dashboard-chart-container">
        <h3>Monthly Yield</h3>
        <div className="dashboard-chart-bars">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
            <div key={month} className="dashboard-chart-bar-container">
              <div 
                className="dashboard-chart-bar"
                style={{ height: `${40 + (index * 15)}%` }}
              ></div>
              <div className="dashboard-chart-label">{month}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard-chart-container">
        <h3>Activities by Type</h3>
        <div className="dashboard-chart-bars">
          {['Irrigation', 'Planting', 'Drone', 'Analysis'].map((type, index) => (
            <div key={type} className="dashboard-chart-bar-container">
              <div 
                className="dashboard-chart-bar"
                style={{
                  height: `${30 + (index * 20)}%`,
                  backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'][index]
                }}
              ></div>
              <div className="dashboard-chart-label">{type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
