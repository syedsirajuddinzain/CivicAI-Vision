import api from './api';

/**
 * Retrieve all in-app notifications from backend database
 */
export async function getNotifications(userId) {
  try {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
    const notifications = await api.get(url);
    return Array.isArray(notifications) ? notifications : [];
  } catch (err) {
    console.warn('Failed to fetch notifications from backend:', err.message);
    return [];
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId) {
  try {
    const updated = await api.patch(`/api/notifications/${notificationId}/read`);
    window.dispatchEvent(new CustomEvent('civic_notifications_updated'));
    return updated;
  } catch (err) {
    console.warn('Failed to mark notification read:', err.message);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId) {
  try {
    const result = await api.patch('/api/notifications/read-all', { userId });
    window.dispatchEvent(new CustomEvent('civic_notifications_updated'));
    return result;
  } catch (err) {
    console.warn('Failed to mark all notifications read:', err.message);
  }
}

/**
 * Calculate count of unread notifications
 */
export async function getUnreadCount(userId) {
  const notifications = await getNotifications(userId);
  return notifications.filter((n) => !n.read).length;
}

export function addNotification() {
  // Backend now automatically handles creating notifications upon ticket events
  window.dispatchEvent(new CustomEvent('civic_notifications_updated'));
}
