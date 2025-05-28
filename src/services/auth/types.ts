
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
