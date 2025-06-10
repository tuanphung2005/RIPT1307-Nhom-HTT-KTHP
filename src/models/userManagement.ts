import { useState } from 'react';
import { message } from 'antd';
import type { User } from '@/services/auth/types';
import type { UserFilters, UserFormData } from '@/services/admin/userTypes';
import { userManagementService } from '@/services/admin/userManagementService';

export default function useUserManagement() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);  const [filters, setFilters] = useState<UserFilters>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        message.error(response.message || 'Không thể tải danh sách người dùng');
      }
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
      const response = await userManagementService.updateUser(userId, values);
      if (response.success) {
        message.success(response.message || 'Cập nhật người dùng thành công');

        await loadUsers();
      } else {
        message.error(response.message || 'Không thể cập nhật người dùng');
      }
    } catch (error) {
      message.error('Không thể cập nhật người dùng');
    }
  };  const handleAddUser = async (values: UserFormData) => {
    try {
      const response = await userManagementService.createUser(values);
      if (response.success) {
        message.success(response.message || 'Thêm người dùng thành công');
        // Reload users to get updated data
        await loadUsers();
      } else {
        message.error(response.message || 'Không thể thêm người dùng');
      }
    } catch (error) {
      message.error('Không thể thêm người dùng');
    }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await userManagementService.deleteUser(userId);
      if (response.success) {
        message.success(response.message || 'Xóa người dùng thành công');

        await loadUsers();
      } else {
        message.error(response.message || 'Không thể xóa người dùng');
      }
    } catch (error) {
      message.error('Không thể xóa người dùng');
    }
  };
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await userManagementService.toggleUserStatus(userId);
      if (response.success) {
        message.success(response.message || (isActive ? 'Kích hoạt người dùng thành công' : 'Khóa người dùng thành công'));

        await loadUsers();
      } else {
        message.error(response.message || 'Không thể thay đổi trạng thái người dùng');
      }
    } catch (error) {
      message.error('Không thể thay đổi trạng thái người dùng');
    }
  };  const handleResetPassword = async (userId: string) => {
    try {


      const newPassword = 'newpass123';
      
      const response = await userManagementService.resetUserPassword(userId, { newPassword });
      
      
      if (response.success) {
        message.success(response.message || 'Đặt lại mật khẩu thành công');
      } else {
        message.error(response.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (error) {
      console.error('🔧 UserManagement: Error in handleResetPassword:', error);
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
