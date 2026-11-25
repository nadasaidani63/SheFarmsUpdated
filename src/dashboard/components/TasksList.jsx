import React from 'react';
import UiIcon from '../../components/UiIcon';

const TasksList = () => {
  const upcomingTasks = [
    { id: 1, task: 'North Field Irrigation', date: '2024-01-20', priority: 'high', type: 'irrigation' },
    { id: 2, task: 'Plot B Soil Analysis', date: '2024-01-22', priority: 'medium', type: 'analysis' },
    { id: 3, task: 'Drone Surveillance Flight', date: '2024-01-25', priority: 'medium', type: 'drone' },
    { id: 4, task: 'Plot C Corn Planting', date: '2024-01-28', priority: 'low', type: 'planting' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'irrigation': return 'water';
      case 'analysis': return 'search';
      case 'drone': return 'drone';
      case 'planting': return 'sprout';
      default: return 'completed';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3><UiIcon name="calendar" /> Upcoming Tasks</h3>
        <span className="dashboard-view-all">View all</span>
      </div>
      <div className="dashboard-tasks-list">
        {upcomingTasks.map(task => (
          <div key={task.id} className="dashboard-task-item">
            <div className="dashboard-task-icon"><UiIcon name={getTaskIcon(task.type)} /></div>
            <div className="dashboard-task-content">
              <div className="dashboard-task-title">{task.task}</div>
              <div className="dashboard-task-date">{new Date(task.date).toLocaleDateString('en-US')}</div>
            </div>
            <div 
              className="dashboard-task-priority"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksList;
