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

    
    // Check if user is authenticated first
    if (!authService.isAuthenticated() && !initialState?.currentUser) {

      return;
    }


    setLoading(true);
    try {
      const response = await notificationService.getNotifications(page, 20);

      if (response.success && response.notifications) {
     
        if (reset || page === 1) {
          setNotifications(response.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.notifications!]);
        }
        setUnreadCount(response.unreadCount || 0);        setHasMore(response.hasMore || false);
        setCurrentPage(page);
      } else {

        if (response.message) {
          message.error(response.message);
        }
      }
    } catch (error) {

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
  }; 
  useEffect(() => {


    if (authService.isAuthenticated() || initialState?.currentUser) {

      loadNotifications();
    } else {

    }
  }, [initialState?.currentUser]);


  useEffect(() => {

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
