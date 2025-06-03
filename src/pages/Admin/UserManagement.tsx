import React, { useEffect, useState } from 'react';
import { Card, Typography, Form } from 'antd';
import type { User } from '@/services/auth/types';
import type { UserFormData } from '@/services/admin/userTypes';
import useUserManagement from '@/models/userManagement';
import UserFiltersComponent from '@/components/Admin/UserFilters';
import UserTable from '@/components/Admin/UserTable';
import UserModals from '@/components/Admin/UserModals';

const { Title, Text } = Typography;

const UserManagement: React.FC = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  const {
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
  } = useUserManagement();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(users, filters);
    setFilteredUsers(filtered);
  }, [users, filters]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue(user);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: UserFormData) => {
    if (editingUser) {
      await handleUpdateUser(editingUser.id, values);
      setEditModalVisible(false);
      setEditingUser(null);
      editForm.resetFields();
    }
  };

  const handleAddSubmit = async (values: UserFormData) => {
    await handleAddUser(values);
    setAddModalVisible(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingUser(null);
    editForm.resetFields();
  };

  const handleAddCancel = () => {
    setAddModalVisible(false);
    addForm.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Quản lý người dùng</Title>
          <Text type="secondary">
            Xem và quản lý tất cả người dùng trong hệ thống
          </Text>
        </div>

        <UserFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onReload={loadUsers}
          onClearFilters={clearFilters}
          onAddUser={() => setAddModalVisible(true)}
          usersCount={{ filtered: filteredUsers.length, total: users.length }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </Text>
        </div>

        <UserTable
          users={filteredUsers}
          loading={loading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleUserStatus}
          onResetPassword={handleResetPassword}
        />

        <UserModals
          editModalVisible={editModalVisible}
          addModalVisible={addModalVisible}
          editingUser={editingUser}
          editForm={editForm}
          addForm={addForm}
          onEditCancel={handleEditCancel}
          onAddCancel={handleAddCancel}
          onEditSubmit={handleEditSubmit}
          onAddSubmit={handleAddSubmit}
        />
      </Card>
    </div>
  );
};

export default UserManagement;
