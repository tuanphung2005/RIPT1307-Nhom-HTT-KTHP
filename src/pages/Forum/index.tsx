
import { PlusOutlined, SearchOutlined, MessageOutlined, LikeOutlined, TagsOutlined } from '@ant-design/icons';
import { Button, Card, Input, List, Space, Tag, Typography, Avatar } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import styles from './index.less';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const Forum: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const {
    posts,
    loading,
    searchKeyword,
    loadPosts,
    handleSearch,
    navigateToPost,
    navigateToCreatePost,
    getRoleColor,
    getRoleText,
  } = useModel('forum');

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className={styles.forumContainer}>
      <div className={styles.header}>
        <Title level={2}>Diễn đàn Hỏi Đáp</Title>
        <Space size="middle">
          <Search
            placeholder="Tìm kiếm bài đăng..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 400 }}
          />          {initialState?.currentUser && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={navigateToCreatePost}
            >
              Đăng bài mới
            </Button>
          )}
        </Space>
      </div>

      <div className={styles.content}>
        <List
          loading={loading}
          dataSource={posts}
          renderItem={(post) => (
            <List.Item key={post.id}>              <Card
                className={styles.postCard}
                hoverable
                onClick={() => navigateToPost(post.id)}
              >
                <div className={styles.postHeader}>
                  <div className={styles.authorInfo}>
                    <Avatar size="small" style={{ backgroundColor: getRoleColor(post.authorRole) }}>
                      {post.authorName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Space>
                      <Text strong>{post.authorName}</Text>
                      <Tag color={getRoleColor(post.authorRole)}>
                        {getRoleText(post.authorRole)}
                      </Tag>
                      <Text type="secondary">
                        {moment(post.createdAt).fromNow()}
                      </Text>
                    </Space>
                  </div>
                </div>

                <div className={styles.postContent}>
                  <Title level={4} className={styles.postTitle}>
                    {post.title}
                  </Title>
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: false }}
                    className={styles.postDescription}
                  >
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  </Paragraph>
                </div>

                <div className={styles.postFooter}>
                  <Space split="|">
                    <Space>
                      <LikeOutlined />
                      <Text>{post.votes} votes</Text>
                    </Space>
                    <Space>
                      <MessageOutlined />
                      <Text>comments</Text>
                    </Space>
                    {post.tags.length > 0 && (
                      <Space>
                        <TagsOutlined />
                        {post.tags.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                    )}
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
          locale={{
            emptyText: searchKeyword ? 'Không tìm thấy bài đăng nào' : 'Chưa có bài đăng nào'
          }}
        />
      </div>
    </div>
  );
};

export default Forum;
