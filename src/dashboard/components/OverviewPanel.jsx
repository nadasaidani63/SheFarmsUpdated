import React, { useState } from 'react';
import UiIcon from '../../components/UiIcon';

const OverviewPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 1));
  
  const events = [
    { date: new Date(2025, 8, 1), title: 'Planning', type: 'planning' },
    { date: new Date(2025, 8, 5), title: 'Drone Survey', type: 'drone' },
    { date: new Date(2025, 8, 12), title: 'Irrigation Check', type: 'irrigation' },
    { date: new Date(2025, 8, 18), title: 'Soil Analysis', type: 'analysis' },
    { date: new Date(2025, 8, 25), title: 'Harvest Planning', type: 'harvest' }
  ];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.getDate() === date &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'planning': return 'tasks';
      case 'drone': return 'drone';
      case 'irrigation': return 'water';
      case 'analysis': return 'search';
      case 'harvest': return 'sprout';
      default: return 'completed';
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3><UiIcon name="calendar" /> Agricultural Calendar</h3>
        <span className="dashboard-view-all">View full agenda</span>
      </div>
      <div className="dashboard-overview-panel">
        <div className="dashboard-calendar-section">
          <div className="dashboard-calendar-header">
            <button className="dashboard-nav-btn" onClick={() => navigateMonth(-1)}>‹</button>
            <h3 className="dashboard-calendar-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button className="dashboard-nav-btn" onClick={() => navigateMonth(1)}>›</button>
          </div>
          
          <div className="dashboard-calendar">
            <div className="dashboard-calendar-weekdays">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="dashboard-weekday">{day}</div>
              ))}
            </div>
            
            <div className="dashboard-calendar-days">
              {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                <div key={`empty-${index}`} className="dashboard-calendar-day empty"></div>
              ))}
              
              {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                const day = index + 1;
                const dayEvents = getEventsForDate(day);
                const isToday = day === new Date().getDate() &&
                               currentDate.getMonth() === new Date().getMonth() &&
                               currentDate.getFullYear() === new Date().getFullYear();
                const isSelected = day === selectedDate.getDate() &&
                                  currentDate.getMonth() === selectedDate.getMonth();
                
                return (
                  <div
                    key={day}
                    className={`dashboard-calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  >
                    <span className="dashboard-day-number">{day}</span>
                    <div className="dashboard-day-events">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div key={eventIndex} className="dashboard-event-indicator" title={event.title}>
                          <UiIcon name={getEventIcon(event.type)} size={14} />
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="dashboard-more-events">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="dashboard-calendar-events">
            <h4>Events for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h4>
            <div className="dashboard-events-list">
              {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                getEventsForDate(selectedDate.getDate()).map((event, index) => (
                  <div key={index} className="dashboard-event-item">
                    <span className="dashboard-event-icon"><UiIcon name={getEventIcon(event.type)} /></span>
                    <span className="dashboard-event-title">{event.title}</span>
                  </div>
                ))
              ) : (
                <div className="dashboard-no-events">No events scheduled</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
