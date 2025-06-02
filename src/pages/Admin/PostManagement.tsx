import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Typography
} from 'antd';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { history } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import type { Post } from '@/services/posts/types';
import { useModel } from '@@/plugin-model/useModel';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

interface AdminPostFilters {
  keyword?: string;
  author?: string;
  authorRole?: 'student' | 'teacher' | 'admin';
  dateRange?: [moment.Moment, moment.Moment];
  minVotes?: number;
  maxVotes?: number;
  sortBy?: 'createdAt' | 'votes';
  sortOrder?: 'asc' | 'desc';
}

const PostManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState<AdminPostFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { getAllPosts, deletePost } = useModel('forum');

  // Load all posts
  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts);
    } catch (error) {
      message.error('Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...posts];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }    // Author filter
    if (filters.author) {
      const author = filters.author.toLowerCase();
      filtered = filtered.filter(post => 
        post.authorName.toLowerCase().includes(author)
      );
    }

    // Author role filter
    if (filters.authorRole) {
      filtered = filtered.filter(post => post.authorRole === filters.authorRole);
    }

    // Date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(post => {
        const postDate = moment(post.createdAt);
        return postDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }

    // Vote count filters
    if (filters.minVotes !== undefined) {
      filtered = filtered.filter(post => post.votes >= filters.minVotes!);
    }
    if (filters.maxVotes !== undefined) {
      filtered = filtered.filter(post => post.votes <= filters.maxVotes!);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
        switch (filters.sortBy) {
        case 'votes':
          aValue = a.votes;
          bValue = b.votes;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, filters]);

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      message.success('Xóa bài đăng thành công');
      loadPosts(); // Reload posts
    } catch (error) {
      message.error('Không thể xóa bài đăng');
    }
  };

  const handleViewPost = (postId: string) => {
    history.push(`/forum/${postId}`);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const columns: ColumnsType<Post> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title: string, record: Post) => (
        <div>
          <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewPost(record.id)}>
            {title}
          </Text>          <div>
            {record.tags.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 150,
      render: (author: string, record: Post) => (
        <div>
          <Text>{author}</Text>
          <br />
          <Tag color={
            record.authorRole === 'admin' ? 'red' :
            record.authorRole === 'teacher' ? 'orange' : 'green'
          }>
            {record.authorRole === 'admin' ? 'Quản trị viên' :
             record.authorRole === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Điểm',
      dataIndex: 'votes',
      key: 'votes',
      width: 80,
      align: 'center',
      render: (votes: number) => (
        <Tag color={votes > 0 ? 'green' : votes < 0 ? 'red' : 'default'}>
          {votes > 0 ? `+${votes}` : votes}
        </Tag>
      ),
    },    {
      title: 'Bình luận',
      dataIndex: 'comments',
      key: 'comments',
      width: 100,
      align: 'center',
      render: () => '-', // We don't have comment count in Post interface
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record: Post) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewPost(record.id)}
            />
          </Tooltip>          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài đăng này?"
            onConfirm={() => handleDeletePost(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa bài đăng">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Quản lý bài đăng</Title>
          <Text type="secondary">
            Xem và quản lý tất cả bài đăng trong diễn đàn
          </Text>
        </div>

        {/* Filter Controls */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm từ khóa..."
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={e => setFilters({...filters, keyword: e.target.value})}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="Tác giả"
              value={filters.author}
              onChange={e => setFilters({...filters, author: e.target.value})}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Vai trò tác giả"
              value={filters.authorRole}
              onChange={value => setFilters({...filters, authorRole: value})}
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
              onChange={dates => setFilters({...filters, dateRange: dates as [moment.Moment, moment.Moment]})}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Bộ lọc
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadPosts}
              />
            </Space>
          </Col>
        </Row>

        {/* Advanced Filters */}
        {showFilters && (
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={4}>
                <Input
                  type="number"
                  placeholder="Điểm tối thiểu"
                  value={filters.minVotes}
                  onChange={e => setFilters({...filters, minVotes: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </Col>
              <Col span={4}>
                <Input
                  type="number"
                  placeholder="Điểm tối đa"
                  value={filters.maxVotes}
                  onChange={e => setFilters({...filters, maxVotes: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </Col>
              <Col span={4}>                <Select
                  placeholder="Sắp xếp theo"
                  value={filters.sortBy}
                  onChange={value => setFilters({...filters, sortBy: value})}
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
                  onChange={value => setFilters({...filters, sortOrder: value})}
                  style={{ width: '100%' }}
                >
                  <Option value="desc">Giảm dần</Option>
                  <Option value="asc">Tăng dần</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Button onClick={clearFilters}>Xóa bộ lọc</Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* Results Summary */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Hiển thị {filteredPosts.length} / {posts.length} bài đăng
          </Text>
        </div>

        {/* Posts Table */}
        <Table
          columns={columns}
          dataSource={filteredPosts}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bài đăng`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 20,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default PostManagement;
