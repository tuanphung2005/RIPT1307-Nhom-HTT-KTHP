import React from 'react';
import { Input, Select, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
import type { UserFilters } from '@/services/admin/userTypes';

const { Option } = Select;

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onReload: () => void;
  onClearFilters: () => void;
  onAddUser: () => void;
  usersCount: { filtered: number; total: number };
}

const UserFiltersComponent: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onReload,
  onClearFilters,
  onAddUser,
  usersCount
}) => {
  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Tìm kiếm tên, email, username..."
            prefix={<SearchOutlined />}
            value={filters.keyword}
            onChange={e => onFiltersChange({...filters, keyword: e.target.value})}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Vai trò"
            value={filters.role}
            onChange={value => onFiltersChange({...filters, role: value})}
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
            onChange={value => onFiltersChange({...filters, isActive: value})}
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
              onClick={onAddUser}
            >
              Thêm người dùng
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={onReload}
            />
            <Button onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
          </Space>
        </Col>
      </Row>
    </>
  );
};

export default UserFiltersComponent;
