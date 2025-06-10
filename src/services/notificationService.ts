import { backendApiService } from '@/services/api/backendApi';
import { API_CONFIG } from '@/services/api/config';
import { authService } from '@/services/auth/authService';

export interface Notification {
  id: string;
  userId: string;
  type: 'COMMENT_ON_POST' | 'REPLY_TO_COMMENT';
  title: string;
  message: string;
  isRead: boolean;
  postId?: string;
  commentId?: string;
  authorId?: string;
  author?: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  post?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications?: Notification[];
  unreadCount?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  message?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
  message?: string;
}

export interface MarkReadResponse {
  success: boolean;
  message?: string;
}

class NotificationService {  // Get notifications with pagination
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
    console.log('🔔 NotificationService.getNotifications called');
    try {
      // Check authentication first
      if (!authService.isAuthenticated()) {
        console.log('🔔 NotificationService: User not authenticated');
        return {
          success: false,
          notifications: [],
          unreadCount: 0,
          message: 'Bạn cần đăng nhập để xem thông báo'
        };
      }

      console.log('🔔 NotificationService: Making API call to', `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?page=${page}&limit=${limit}`);
      const response = await backendApiService.get(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?page=${page}&limit=${limit}`
      );
      
      console.log('🔔 NotificationService: Raw API response:', response);
      
      return {
        success: response.success || false,
        notifications: response.data?.notifications || [],
        unreadCount: response.data?.unreadCount || 0,
        page: response.data?.page || page,
        limit: response.data?.limit || limit,
        hasMore: response.data?.hasMore || false,
        message: response.message
      };
    } catch (error: any) {
      console.error('🔔 NotificationService: Error getting notifications:', error);
      // Don't show error for authentication issues
      if (error.response?.status === 401) {
        console.log('🔔 NotificationService: 401 error, returning silent fail');
        return {
          success: false,
          notifications: [],
          unreadCount: 0,
          message: undefined // Silent fail for auth issues
        };
      }
      return {
        success: false,
        notifications: [],
        unreadCount: 0,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải thông báo'
      };
    }
  }
  // Get unread count
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      // Check authentication first
      if (!authService.isAuthenticated()) {
        return {
          success: false,
          unreadCount: 0,
          message: undefined // Silent fail
        };
      }

      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      
      return {
        success: response.success || false,
        unreadCount: response.data?.unreadCount || 0,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      // Don't show error for authentication issues
      if (error.response?.status === 401) {
        return {
          success: false,
          unreadCount: 0,
          message: undefined // Silent fail for auth issues
        };
      }
      return {
        success: false,
        unreadCount: 0,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải số thông báo chưa đọc'
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    try {
      const response = await backendApiService.put(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
        {}
      );
      
      return {
        success: response.success || false,
        message: response.message || 'Đánh dấu đã đọc thành công'
      };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đánh dấu thông báo đã đọc'
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<MarkReadResponse> {
    try {
      const response = await backendApiService.put(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        {}
      );
      
      return {
        success: response.success || false,
        message: response.message || 'Đánh dấu tất cả đã đọc thành công'
      };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đánh dấu tất cả thông báo đã đọc'
      };
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
