import { useNotifications } from '@/components/common/NotificationContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  userId: string; // Add user ID to associate notifications with specific users
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Utility function to add notification for a specific user
export const addNotificationForUser = async (
  userId: string,
  notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId'>
) => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...notification,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

// Utility function to get notifications for a specific user
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Utility function to mark notification as read for a specific user
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        read: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Utility function to delete notification for a specific user
export const deleteNotificationForUser = async (userId: string, notificationId: string) => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Utility function to get unread count for a specific user
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const response = await fetch(`/api/notifications/unread-count?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    const data = await response.json();
    return data.unreadCount || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

// Hook for using notifications with user context
export const useUserNotifications = (userId: string) => {
  const { addNotification, markAsRead, deleteNotification, clearAllNotifications } = useNotifications();

  const addUserNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId'>) => {
    // Add to local state immediately for better UX
    addNotification(notification);
    
    // Also save to backend
    addNotificationForUser(userId, notification).catch(console.error);
  };

  const markUserNotificationAsRead = (notificationId: string) => {
    // Update local state immediately
    markAsRead(notificationId);
    
    // Also update backend
    markNotificationAsRead(userId, notificationId).catch(console.error);
  };

  const deleteUserNotification = (notificationId: string) => {
    // Remove from local state immediately
    deleteNotification(notificationId);
    
    // Also remove from backend
    deleteNotificationForUser(userId, notificationId).catch(console.error);
  };

  return {
    addUserNotification,
    markUserNotificationAsRead,
    deleteUserNotification,
    clearAllNotifications,
  };
};
