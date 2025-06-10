import { authService } from '../auth/authService';
import { backendApiService } from '../api/backendApi';
import { API_CONFIG } from '../api/config';
import type { User } from '../auth/types';
import type { UserFormData } from './userTypes';

export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  total: number;
  message?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  fullName?: string;
  role?: 'admin' | 'teacher' | 'student';
  isActive?: boolean;
}

export interface ResetPasswordData {
  newPassword: string;
}

class UserManagementService {
  // Get all users (admin only)
  async getAllUsers(): Promise<UsersListResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          data: [],
          total: 0,
          message: 'Bạn không có quyền truy cập'
        };
      }

      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.USERS.LIST);

      return {
        success: response.success,
        data: response.data || [],
        total: response.total || 0,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error getting users:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách người dùng'
      };
    }
  }

  // Update user (admin only)
  async updateUser(userId: string, data: UpdateUserData): Promise<UserResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Bạn không có quyền thực hiện thao tác này'
        };
      }

      const response = await backendApiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), data);

      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Cập nhật người dùng thành công!'
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng'
      };
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<UserResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Bạn không có quyền thực hiện thao tác này'
        };
      }

      const response = await backendApiService.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(userId));

      return {
        success: response.success,
        message: response.message || 'Xóa người dùng thành công!'
      };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng'
      };
    }
  }

  // Toggle user status (admin only)
  async toggleUserStatus(userId: string): Promise<UserResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Bạn không có quyền thực hiện thao tác này'
        };
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.USERS.TOGGLE_STATUS(userId), {});

      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Cập nhật trạng thái người dùng thành công!'
      };
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng'
      };
    }
  }
  // Reset user password (admin only)
  async resetUserPassword(userId: string, data: ResetPasswordData): Promise<UserResponse> {
    try {
      
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Bạn không có quyền thực hiện thao tác này'
        };
      }

      const endpoint = API_CONFIG.ENDPOINTS.USERS.RESET_PASSWORD(userId);
 
      const response = await backendApiService.post(endpoint, data);

      return {
        success: response.success,
        message: response.message || 'Đặt lại mật khẩu thành công!'
      };
    } catch (error: any) {

      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu'
      };
    }
  }

  // Create new user (admin only)
  async createUser(data: UserFormData): Promise<UserResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Bạn không có quyền thực hiện thao tác này'
        };
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.USERS.CREATE, data);

      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Tạo người dùng thành công!'
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng'
      };
    }
  }
}

export const userManagementService = new UserManagementService();
