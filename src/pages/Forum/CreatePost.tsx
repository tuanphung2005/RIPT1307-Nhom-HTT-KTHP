
import TinyEditor from '@/components/TinyEditor';
import { ArrowLeftOutlined, TagsOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import styles from './CreatePost.less';

const { Title } = Typography;

const CreatePost: React.FC = () => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const {
    createPostLoading: loading,
    createPostContent: content,
    setCreatePostContent: setContent,
    commonTags,
    handleCreatePost,
    clearCreatePost,
    navigateToForum,
  } = useModel('forum');

  useEffect(() => {
    // Clear form when component unmounts
    return () => {
      clearCreatePost();
    };
  }, []);

  const handleSubmit = async (values: any) => {
    const success = await handleCreatePost(values);
    if (success) {
      form.resetFields();
      clearCreatePost();
    }
  };

  if (!initialState?.currentUser) {
    navigateToForum();
    return null;
  }
  return (
    <div className={styles.createPostContainer}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={navigateToForum}
          type="text"
        >
          Quay lại
        </Button>
        <Title level={3}>Đăng bài mới</Title>
      </div>

      <Card className={styles.formCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự' },
              { max: 200, message: 'Tiêu đề không được quá 200 ký tự' }
            ]}
          >
            <Input
              placeholder="Nhập tiêu đề câu hỏi hoặc chủ đề thảo luận..."
              size="large"
            />
          </Form.Item>          <Form.Item
            label="Nội dung"
            required
          >            <div className={styles.editorWrapper}>
              <TinyEditor
                value={content}
                onChange={setContent}
                height={400}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="tags"
            label={
              <Space>
                <TagsOutlined />
                <span>Tags (Thẻ phân loại)</span>
              </Space>
            }
          >
            <Select
              mode="multiple"
              placeholder="Chọn hoặc nhập tags liên quan..."
              options={commonTags.map(tag => ({ label: tag, value: tag }))}
              allowClear
              maxTagCount={5}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item>
            <Space>              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                Đăng bài
              </Button>
              <Button
                size="large"
                onClick={navigateToForum}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePost;
