import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { authService } from '@/services/auth/authService';
import notificationService, { Notification } from '@/services/notificationService';

export default function useNotifications() {
  const { initialState } = useModel('@@initialState');
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Load notifications
  const loadNotifications = async (page: number = 1, reset: boolean = false) => {
    console.log('🔔 loadNotifications called, page:', page, 'reset:', reset);
    
    // Check if user is authenticated first
    if (!authService.isAuthenticated() && !initialState?.currentUser) {
      console.log('🔔 User not authenticated, skipping notification load');
      return;
    }

    console.log('🔔 User authenticated, proceeding with API call');
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(page, 20);
      console.log('🔔 Notification API response:', response);
      
      if (response.success && response.notifications) {
        console.log('🔔 Setting notifications:', response.notifications.length, 'items');
        if (reset || page === 1) {
          setNotifications(response.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.notifications!]);
        }
        setUnreadCount(response.unreadCount || 0);        setHasMore(response.hasMore || false);
        setCurrentPage(page);
      } else {
        console.log('🔔 API response not successful or no notifications');
        // Only show error message if there is one and it's not an auth issue
        if (response.message) {
          message.error(response.message);
        }
      }
    } catch (error) {
      // Only show error for non-authentication issues
      if (error.response?.status !== 401) {
        message.error('Có lỗi xảy ra khi tải thông báo');
      }
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more notifications
  const loadMoreNotifications = async () => {
    if (!loading && hasMore) {
      await loadNotifications(currentPage + 1, false);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    await loadNotifications(1, true);
  };
  // Load unread count only
  const loadUnreadCount = async () => {
    // Check if user is authenticated first
    if (!authService.isAuthenticated() && !initialState?.currentUser) {
      return;
    }
    
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        if (response.message) {
          message.error(response.message);
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đánh dấu thông báo');
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        message.success(response.message || 'Đã đánh dấu tất cả thông báo là đã đọc');
      } else {
        if (response.message) {
          message.error(response.message);
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đánh dấu thông báo');
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format notification time
  const formatNotificationTime = (createdAt: string): string => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    } else {
      return notificationTime.toLocaleDateString('vi-VN');
    }
  };  // Initialize notifications on mount
  useEffect(() => {
    console.log('🔔 Notification useEffect triggered');
    console.log('🔔 authService.isAuthenticated():', authService.isAuthenticated());
    console.log('🔔 initialState?.currentUser:', initialState?.currentUser);
    console.log('🔔 localStorage forum_token:', localStorage.getItem('forum_token') ? 'EXISTS' : 'NOT FOUND');
    
    // Only load notifications if user is authenticated
    if (authService.isAuthenticated() || initialState?.currentUser) {
      console.log('🔔 Loading notifications...');
      loadNotifications();
    } else {
      console.log('🔔 User not authenticated, skipping notification load');
    }
  }, [initialState?.currentUser]);

  // Set up polling for unread count (every 30 seconds)
  useEffect(() => {
    // Only set up polling if user is authenticated
    if (authService.isAuthenticated() || initialState?.currentUser) {
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [initialState?.currentUser]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    hasMore,
    currentPage,

    // Actions
    loadNotifications,
    loadMoreNotifications,
    refreshNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,

    // Utilities
    formatNotificationTime,
  };
}
