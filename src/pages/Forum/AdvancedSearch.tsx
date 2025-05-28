import {
  SearchOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  ClearOutlined,
  LikeOutlined,
  MessageOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  Form,
  Space,
  Typography,
  List,
  Tag,
  Avatar,
  Row,
  Col,
} from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import styles from './index.less';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdvancedSearch: React.FC = () => {
  const [form] = Form.useForm();
  const {
    advancedSearchResults,
    advancedSearchLoading,
    handleAdvancedSearch,
    clearAdvancedSearch,
    getAllTags,
    getAllAuthors,
    navigateToPost,
    navigateToForum,
    getRoleColor,
    getRoleText,
    commonTags,
  } = useModel('forum');

  useEffect(() => {
    // Load available tags and authors when component mounts
    getAllTags();
    getAllAuthors();
  }, []);

  const handleSearch = async (values: any) => {
    const filters = {
      keyword: values.keyword || '',
      tags: values.tags || [],
      authorRole: values.authorRole || '',
      dateRange: values.dateRange || [],
      sortBy: values.sortBy || 'newest',
    };
    
    await handleAdvancedSearch(filters);
  };

  const handleClear = () => {
    form.resetFields();
    clearAdvancedSearch();
  };

  const roleOptions = [
    { value: 'student', label: 'Sinh viên' },
    { value: 'teacher', label: 'Giảng viên' },
    { value: 'admin', label: 'Quản trị viên' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'most_votes', label: 'Nhiều vote nhất' },
    { value: 'most_comments', label: 'Nhiều bình luận nhất' },
  ];

  return (
    <div className={styles.forumContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={navigateToForum}
            type="text"
            style={{ marginRight: 16 }}
          >
            Quay lại diễn đàn
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Tìm kiếm nâng cao
          </Title>
        </div>
      </div>

      {/* Search Form */}
      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{
            sortBy: 'newest',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Từ khóa" name="keyword">
                <Input
                  placeholder="Tìm trong tiêu đề, nội dung, tên tác giả..."
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Vai trò tác giả" name="authorRole">
                <Select placeholder="Chọn vai trò" allowClear>
                  {roleOptions.map(role => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Thẻ" name="tags">
                <Select
                  mode="multiple"
                  placeholder="Chọn thẻ"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                >
                  {commonTags.map(tag => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Khoảng thời gian" name="dateRange">
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Sắp xếp theo" name="sortBy">
                <Select>
                  {sortOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={advancedSearchLoading}
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClear}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Search Results */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>
            <FilterOutlined style={{ marginRight: 8 }} />
            Kết quả tìm kiếm
            {advancedSearchResults.length > 0 && (
              <Text type="secondary" style={{ marginLeft: 8, fontWeight: 'normal' }}>
                ({advancedSearchResults.length} bài đăng)
              </Text>
            )}
          </Title>
        </div>

        <List
          loading={advancedSearchLoading}
          dataSource={advancedSearchResults}
          renderItem={(post) => (
            <List.Item key={post.id}>
              <Card
                className={styles.postCard}
                hoverable
                onClick={() => navigateToPost(post.id)}
                style={{ width: '100%' }}
              >
                <div className={styles.postHeader}>
                  <div className={styles.authorInfo}>
                    <Avatar size="small" style={{ backgroundColor: getRoleColor(post.authorRole) }}>
                      {post.authorName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Space>
                      <Text strong>{post.authorName}</Text>                      <Tag color={getRoleColor(post.authorRole)}>
                        {getRoleText(post.authorRole)}
                      </Tag>
                      <Text type="secondary">
                        {moment(post.createdAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </Space>
                  </div>
                </div>

                <div className={styles.postContent}>
                  <Title level={4} className={styles.postTitle}>
                    {post.title}
                  </Title>
                  <Paragraph
                    ellipsis={{ rows: 3, expandable: false }}
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
                      <Text>bình luận</Text>
                    </Space>
                    {post.tags.length > 0 && (
                      <Space>
                        <TagsOutlined />                        {post.tags.slice(0, 3).map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                        {post.tags.length > 3 && (
                          <Text type="secondary">+{post.tags.length - 3}</Text>
                        )}
                      </Space>
                    )}
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
          locale={{
            emptyText: advancedSearchResults.length === 0 && !advancedSearchLoading 
              ? 'Chưa có kết quả tìm kiếm. Vui lòng sử dụng bộ lọc phía trên.' 
              : 'Không tìm thấy bài đăng nào phù hợp với tiêu chí tìm kiếm.'
          }}
        />
      </Card>
    </div>
  );
};

export default AdvancedSearch;
