import type { User, LoginCredentials, RegisterData, AuthResponse } from './types';
import { backendApiService } from '../api/backendApi';
import { API_CONFIG } from '../api/config';

const CURRENT_USER_KEY = 'forum_current_user';
const TOKEN_KEY = 'forum_token';

class AuthService {  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
      
      // Backend returns data in { success, message, data: { user, token } } format
      if (response.success && response.data?.token && response.data?.user) {
        // token + data
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
      }
      
      return {
        success: response.success,
        user: response.data?.user,
        token: response.data?.token,
        message: response.message || 'Đăng ký thành công!'
      };
    } catch (error: any) {
      console.error('Error during registration:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký'
      };
    }
  }
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      // { success, message, data: { user, token } } format
      if (response.success && response.data?.token && response.data?.user) {
        // Save token + user data
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
      }
      
      return {
        success: response.success,
        user: response.data?.user,
        token: response.data?.token,
        message: response.message || 'Đăng nhập thành công!'
      };
    } catch (error: any) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
      };
    }
  }

  // get user tu localstorage
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  // get user tu backend
  async getCurrentUserFromBackend(): Promise<User | null> {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }

      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      // Backend returns data in { success, message, data: { user } } format
      if (response.success && response.data?.user) {
        // update local data
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error getting current user from backend:', error);
      
      // sai token => clear data
      if (error.response?.status === 401) {
        this.logout();
      }
      
      return null;
    }
  }

  // jwt token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // logout
  logout(): void {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // check authenticate
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getToken();
    return user !== null && token !== null;
  }

  // Get all users (admin)
  async getAllUsers(): Promise<User[]> {
    try {
      // Note: This endpoint may need to be implemented in the backend
      // TODO ADD VAO BACKEND
      console.warn('getAllUsers not yet implemented in backend');
      return [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // ref token
  async refreshToken(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUserFromBackend();
      return currentUser !== null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
