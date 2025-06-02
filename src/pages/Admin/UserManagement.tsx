import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Modal, 
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Typography,
  Avatar,
  Switch
} from 'antd';
import { 
  EditOutlined,
  DeleteOutlined, 
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
  MailOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/services/auth/types';
import moment from 'moment';

const { Option } = Select;
const { Title, Text } = Typography;

interface UserFilters {
  keyword?: string;
  role?: 'student' | 'teacher' | 'admin';
  isActive?: boolean;
}

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  // Mock data - In real app, this would come from an API
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

  // Load users (mock data for now)
  const loadUsers = async () => {
    setLoading(true);
    try {
      // In real app, this would be an API call
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.fullName.toLowerCase().includes(keyword)
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === filters.isActive);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setEditModalVisible(true);
  };

  const handleUpdateUser = async (values: any) => {
    try {
      // In real app, this would be an API call
      const updatedUsers = users.map(user => 
        user.id === editingUser?.id 
          ? { ...user, ...values }
          : user
      );
      setUsers(updatedUsers);
      setEditModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      message.success('Cập nhật người dùng thành công');
    } catch (error) {
      message.error('Không thể cập nhật người dùng');
    }
  };

  const handleAddUser = async (values: any) => {
    try {
      // In real app, this would be an API call
      const newUser: User = {
        id: Date.now().toString(),
        ...values,
        isActive: true,
        createdAt: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.fullName)}&background=52c41a&color=fff`
      };
      
      setUsers([...users, newUser]);
      setAddModalVisible(false);
      addForm.resetFields();
      message.success('Thêm người dùng thành công');
    } catch (error) {
      message.error('Không thể thêm người dùng');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // In real app, this would be an API call
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      message.success('Xóa người dùng thành công');
    } catch (error) {
      message.error('Không thể xóa người dùng');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // In real app, this would be an API call
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
      // In real app, this would be an API call
      message.success('Đã gửi email reset mật khẩu');
    } catch (error) {
      message.error('Không thể reset mật khẩu');
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'teacher':
        return 'blue';
      case 'student':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giảng viên';
      case 'student':
        return 'Sinh viên';
      default:
        return role;
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      render: (_, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.avatar} 
            size={40}
            style={{ marginRight: 12 }}
          >
            {record.fullName.charAt(0)}
          </Avatar>
          <div>
            <div><Text strong>{record.fullName}</Text></div>
            <div><Text type="secondary">@{record.username}</Text></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleUserStatus(record.id, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record: User) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Reset mật khẩu">
            <Button 
              type="link" 
              icon={<MailOutlined />}
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          {record.role !== 'admin' && (            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa người dùng">
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Quản lý người dùng</Title>
          <Text type="secondary">
            Xem và quản lý tất cả người dùng trong hệ thống
          </Text>
        </div>

        {/* Filter Controls */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm tên, email, username..."
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={e => setFilters({...filters, keyword: e.target.value})}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Vai trò"
              value={filters.role}
              onChange={value => setFilters({...filters, role: value})}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="student">Sinh viên</Option>
              <Option value="teacher">Giảng viên</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={filters.isActive}
              onChange={value => setFilters({...filters, isActive: value})}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Đã khóa</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button 
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Thêm người dùng
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadUsers}
              />
              <Button onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Results Summary */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </Text>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} người dùng`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 20,
          }}
        />
      </Card>

      {/* Edit User Modal */}      <Modal
        title="Chỉnh sửa người dùng"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
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

      {/* Add User Modal */}      <Modal
        title="Thêm người dùng mới"
        visible={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
        onOk={() => addForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddUser}
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
    </div>
  );
};

export default UserManagement;
