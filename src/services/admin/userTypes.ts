export interface UserFilters {
  keyword?: string;
  role?: 'student' | 'teacher' | 'admin';
  isActive?: boolean;
}

export interface UserFormData {
  username?: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  password?: string;
}
