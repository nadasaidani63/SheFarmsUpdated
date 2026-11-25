import React from 'react';
import UiIcon from '../../components/UiIcon';

const WeatherWidget = () => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3><UiIcon name="sun" /> Weather</h3>
      </div>
      <div className="weather-widget">
        <div className="weather-current">
          <div className="weather-temp">22°C</div>
          <div className="weather-desc">Sunny</div>
        </div>
        <div className="weather-forecast">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <div key={day} className="weather-day">
              <div>{day}</div>
              <div>{(20 + index)}°C</div>
              <div><UiIcon name={index % 2 === 0 ? 'sun' : 'rain'} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
