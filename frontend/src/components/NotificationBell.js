import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show notification bell for patients
  if (!user || user.role !== 'patient') {
    return null;
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getPatientNotifications({ limit: 10 });
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markNotificationAsRead(notificationId);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllNotificationsAsRead();
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

// Removed complex reschedule response functionality

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'emergency_closure':
        return '⚠️';
      case 'reschedule_request':
        return '📅';
      case 'reschedule_approved':
        return '✅';
      case 'reschedule_denied':
        return '❌';
      default:
        return '🔔';
    }
  };

  const renderNotificationContent = (notification) => {
    if (notification.type === 'emergency_closure') {
      const actionData = notification.actionData || {};
      
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{notification.message}</p>
          
          {/* Original appointment info */}
          {actionData.originalDate && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <p><strong>Tanggal Asli:</strong> {formatDate(actionData.originalDate)}</p>
              <p><strong>No. Antrian Asli:</strong> {actionData.originalQueueNumber}</p>
            </div>
          )}
        </div>
      );
    }

    return <p className="text-sm text-gray-700">{notification.message}</p>;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        title="Notifikasi"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.334C5.597 19 5 18.403 5 17.666V8.334C5 7.597 5.597 7 6.334 7h11.332C18.403 7 19 7.597 19 8.334v4.332" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
                <p className="text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                      
                      {renderNotificationContent(notification)}
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {notification.actionRequired && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Perlu Tindakan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;