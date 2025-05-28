import type { User, LoginCredentials, RegisterData, AuthResponse } from './types';

const USERS_KEY = 'forum_users';
const CURRENT_USER_KEY = 'forum_current_user';

// test
const DEFAULT_ADMIN: User = {
  id: 'admin_001',
  username: 'admin',
  email: 'admin@forum.edu.vn',
  fullName: 'Quản trị viên',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
};

class AuthService {
  constructor() {
    this.initializeDefaultData();
  }

  // init mac dinh = admin
  private initializeDefaultData(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      this.saveUsers([DEFAULT_ADMIN]);
    }
  }  // get all tu local
  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users from localStorage:', error);
      return [];
    }
  }

  // users to localStorage
  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  // uuid
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // new user
  register(data: RegisterData): AuthResponse {
    try {
      const users = this.getUsers();
      
      // check neu user ton tai
      const existingUser = users.find(
        user => user.username === data.username || user.email === data.email
      );
      
      if (existingUser) {
        return {
          success: false,
          message: 'Tên đăng nhập hoặc email đã tồn tại'
        };
      }

      // new user
      const newUser: User = {
        id: this.generateId(),
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      this.saveUsers(users);

      return {
        success: true,
        user: newUser,
        message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.'
      };
    } catch (error) {
      console.error('Error during registration:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra trong quá trình đăng ký'
      };
    }
  }  // login user
  login(credentials: LoginCredentials): AuthResponse {
    try {
      const users = this.getUsers();
      const user = users.find(
        u => u.username === credentials.username && u.isActive
      );

      if (!user) {
        return {
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        };
      }
      // current user vao localStorage
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return {
        success: true,
        user,
        message: 'Đăng nhập thành công!'
      };
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra trong quá trình đăng nhập'
      };
    }
  }  // current user
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }  // logout
  logout(): void {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // check user dang auth chua?
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  }

  // all user (admin)
  getAllUsers(): User[] {
    return this.getUsers();
  }
}

export const authService = new AuthService();
