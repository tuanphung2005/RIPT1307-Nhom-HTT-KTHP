import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { User } from '@/services/auth/types';
import type { UserFormData } from '@/services/admin/userTypes';

const { Option } = Select;

interface UserModalsProps {
  editModalVisible: boolean;
  addModalVisible: boolean;
  editingUser: User | null;
  editForm: any;
  addForm: any;
  onEditCancel: () => void;
  onAddCancel: () => void;
  onEditSubmit: (values: UserFormData) => void;
  onAddSubmit: (values: UserFormData) => void;
}

const UserModals: React.FC<UserModalsProps> = ({
  editModalVisible,
  addModalVisible,
  editingUser,
  editForm,
  addForm,
  onEditCancel,
  onAddCancel,
  onEditSubmit,
  onAddSubmit
}) => {
  return (
    <>
      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa người dùng"
        visible={editModalVisible}
        onCancel={onEditCancel}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onEditSubmit}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="student">Sinh viên</Option>
              <Option value="teacher">Giảng viên</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Thêm người dùng mới"
        visible={addModalVisible}
        onCancel={onAddCancel}
        onOk={() => addForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onAddSubmit}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="student">Sinh viên</Option>
              <Option value="teacher">Giảng viên</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserModals;
