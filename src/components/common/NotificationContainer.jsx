import React from 'react';
import { useNotification } from '../../context/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getNotificationStyles = (type) => {
    const baseStyles = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transition-all duration-300 transform";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-100 border border-green-400 text-green-700`;
      case 'error':
        return `${baseStyles} bg-red-100 border border-red-400 text-red-700`;
      case 'warning':
        return `${baseStyles} bg-yellow-100 border border-yellow-400 text-yellow-700`;
      default:
        return `${baseStyles} bg-blue-100 border border-blue-400 text-blue-700`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
          style={{
            top: `${1 + index * 5}rem`,
            right: '1rem'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-lg">{getIcon(notification.type)}</span>
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;