import React from 'react';
import { 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Row, 
  Col, 
  Card 
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  FilterOutlined 
} from '@ant-design/icons';
import type { AdminPostFilters } from '@/services/admin/types';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface PostFiltersProps {
  filters: AdminPostFilters;
  onFiltersChange: (filters: AdminPostFilters) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  onReload: () => void;
  onClearFilters: () => void;
  postsCount: { filtered: number; total: number };
}

const PostFilters: React.FC<PostFiltersProps> = ({
  filters,
  onFiltersChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  onReload,
  onClearFilters,
  postsCount
}) => {
  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Tìm kiếm từ khóa..."
            prefix={<SearchOutlined />}
            value={filters.keyword}
            onChange={e => onFiltersChange({...filters, keyword: e.target.value})}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Input
            placeholder="Tác giả"
            value={filters.author}
            onChange={e => onFiltersChange({...filters, author: e.target.value})}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Vai trò tác giả"
            value={filters.authorRole}
            onChange={value => onFiltersChange({...filters, authorRole: value})}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="student">Sinh viên</Option>
            <Option value="teacher">Giảng viên</Option>
            <Option value="admin">Quản trị viên</Option>
          </Select>
        </Col>
        <Col span={6}>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            value={filters.dateRange}
            onChange={dates => onFiltersChange({...filters, dateRange: dates as any})}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={4}>
          <Space>
            <Button 
              icon={<FilterOutlined />}
              onClick={onToggleAdvancedFilters}
            >
              Bộ lọc
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={onReload}
            />
          </Space>
        </Col>
      </Row>

      {showAdvancedFilters && (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
          <Row gutter={16}>
            <Col span={4}>
              <Input
                type="number"
                placeholder="Điểm tối thiểu"
                value={filters.minVotes}
                onChange={e => onFiltersChange({...filters, minVotes: e.target.value ? parseInt(e.target.value) : undefined})}
              />
            </Col>
            <Col span={4}>
              <Input
                type="number"
                placeholder="Điểm tối đa"
                value={filters.maxVotes}
                onChange={e => onFiltersChange({...filters, maxVotes: e.target.value ? parseInt(e.target.value) : undefined})}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Sắp xếp theo"
                value={filters.sortBy}
                onChange={value => onFiltersChange({...filters, sortBy: value})}
                style={{ width: '100%' }}
              >
                <Option value="createdAt">Ngày tạo</Option>
                <Option value="votes">Điểm số</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Thứ tự"
                value={filters.sortOrder}
                onChange={value => onFiltersChange({...filters, sortOrder: value})}
                style={{ width: '100%' }}
              >
                <Option value="desc">Giảm dần</Option>
                <Option value="asc">Tăng dần</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button onClick={onClearFilters}>Xóa bộ lọc</Button>
            </Col>
          </Row>
        </Card>
      )}
    </>
  );
};

export default PostFilters;
