import { useState } from 'react';
import { message } from 'antd';
import type { User } from '@/services/auth/types';
import type { UserFilters, UserFormData } from '@/services/admin/userTypes';

export default function useUserManagement() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});

  const generateMockUsers = (): User[] => [
    {
      id: '1',
      username: 'admin',
      email: 'admin@university.edu',
      fullName: 'Quản trị viên',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=ff4d4f&color=fff'
    },
    {
      id: '2',
      username: 'teacher1',
      email: 'nguyenvana@university.edu',
      fullName: 'Nguyễn Văn A',
      role: 'teacher',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=1890ff&color=fff'
    },
    {
      id: '3',
      username: 'student1',
      email: 'student1@university.edu',
      fullName: 'Trần Thị B',
      role: 'student',
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=52c41a&color=fff'
    },
    {
      id: '4',
      username: 'student2',
      email: 'student2@university.edu',
      fullName: 'Lê Văn C',
      role: 'student',
      isActive: false,
      createdAt: '2024-02-15T00:00:00Z',
      avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=52c41a&color=fff'
    },
    {
      id: '5',
      username: 'teacher2',
      email: 'teacher2@university.edu',
      fullName: 'Phạm Thị D',
      role: 'teacher',
      isActive: true,
      createdAt: '2024-03-01T00:00:00Z',
      avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=1890ff&color=fff'
    }
  ];

  const loadUsers = async () => {
    setLoading(true);
    try {
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (users: User[], filters: UserFilters) => {
    let filtered = [...users];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.fullName.toLowerCase().includes(keyword)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === filters.isActive);
    }

    return filtered;
  };

  const handleUpdateUser = async (userId: string, values: UserFormData) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, ...values }
          : user
      );
      setUsers(updatedUsers);
      message.success('Cập nhật người dùng thành công');
    } catch (error) {
      message.error('Không thể cập nhật người dùng');
    }
  };

  const handleAddUser = async (values: UserFormData) => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        username: values.username!,
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.fullName)}&background=52c41a&color=fff`
      };
      
      setUsers([...users, newUser]);
      message.success('Thêm người dùng thành công');
    } catch (error) {
      message.error('Không thể thêm người dùng');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      message.success('Xóa người dùng thành công');
    } catch (error) {
      message.error('Không thể xóa người dùng');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, isActive }
          : user
      );
      setUsers(updatedUsers);
      message.success(isActive ? 'Kích hoạt người dùng thành công' : 'Khóa người dùng thành công');
    } catch (error) {
      message.error('Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      message.success('Đã gửi email reset mật khẩu');
    } catch (error) {
      message.error('Không thể reset mật khẩu');
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    loading,
    users,
    filteredUsers,
    filters,
    setFilters,
    setFilteredUsers,
    loadUsers,
    applyFilters,
    handleUpdateUser,
    handleAddUser,
    handleDeleteUser,
    handleToggleUserStatus,
    handleResetPassword,
    clearFilters
  };
}
