import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import usePostManagement from '@/models/postManagement';
import PostFilters from '@/components/Admin/PostFilters';
import PostTable from '@/components/Admin/PostTable';

const { Title, Text } = Typography;

const PostManagement: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    loading,
    posts,
    filteredPosts,
    filters,
    setFilters,
    setFilteredPosts,
    loadPosts,
    handleDeletePost,
    applyFilters,
    clearFilters
  } = usePostManagement();

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(posts, filters);
    setFilteredPosts(filtered);
  }, [posts, filters]);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>Quản lý bài đăng</Title>
          <Text type="secondary">
            Xem và quản lý tất cả bài đăng trong diễn đàn
          </Text>
        </div>

        <PostFilters
          filters={filters}
          onFiltersChange={setFilters}
          showAdvancedFilters={showFilters}
          onToggleAdvancedFilters={() => setShowFilters(!showFilters)}
          onReload={loadPosts}
          onClearFilters={clearFilters}
          postsCount={{ filtered: filteredPosts.length, total: posts.length }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Hiển thị {filteredPosts.length} / {posts.length} bài đăng
          </Text>
        </div>

        <PostTable
          posts={filteredPosts}
          loading={loading}
          onDelete={handleDeletePost}
        />
      </Card>
    </div>
  );
};

export default PostManagement;
