import React, { useState } from 'react';
import UiIcon from '../../components/UiIcon';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1,
      type: 'message',
      title: 'New Message',
      content: 'John Doe: "Meeting tomorrow at 10am"',
      time: '10 min',
      unread: true
    },
    { 
      id: 2,
      type: 'comment',
      title: 'Analysis Comment',
      content: 'Your soil analysis received a comment',
      time: '1h',
      unread: true
    },
    { 
      id: 3,
      type: 'system',
      title: 'System Update',
      content: 'New version available',
      time: '2h',
      unread: false
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return 'message';
      case 'comment': return 'idea';
      case 'system': return 'settings';
      case 'report': return 'report';
      default: return 'bell';
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      unread: false
    })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, unread: false } : notification
    ));
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3><UiIcon name="mail" /> Notifications</h3>
        <span className="dashboard-view-all" onClick={markAllAsRead}>Mark all as read</span>
      </div>
      <div className="dashboard-notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`dashboard-notification-item ${notification.unread ? 'unread' : ''}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="dashboard-notification-icon">
              <UiIcon name={getNotificationIcon(notification.type)} />
            </div>
            <div className="dashboard-notification-content">
              <div className="dashboard-notification-title">{notification.title}</div>
              <div className="dashboard-notification-text">{notification.content}</div>
              <div className="dashboard-notification-time">{notification.time}</div>
            </div>
            {notification.unread && <div className="dashboard-unread-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
