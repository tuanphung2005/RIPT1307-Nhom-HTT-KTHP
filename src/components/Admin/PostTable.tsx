import React from 'react';
import { Table, Button, Space, Tag, Popconfirm, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { history } from 'umi';
import type { ColumnsType } from 'antd/es/table';
import type { Post } from '@/services/posts/types';
import moment from 'moment';

const { Text } = Typography;

interface PostTableProps {
  posts: Post[];
  loading: boolean;
  onDelete: (postId: string) => void;
}

const PostTable: React.FC<PostTableProps> = ({ posts, loading, onDelete }) => {
  const handleViewPost = (postId: string) => {
    history.push(`/forum/${postId}`);
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
          </Text>
          <div>
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
    },
    {
      title: 'Bình luận',
      dataIndex: 'comments',
      key: 'comments',
      width: 100,
      align: 'center',
      render: () => '-',
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
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài đăng này?"
            onConfirm={() => onDelete(record.id)}
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
    <Table
      columns={columns}
      dataSource={posts}
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
  );
};

export default PostTable;
