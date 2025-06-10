import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Avatar, 
  Typography, 
  Space, 
  Tag, 
  Spin, 
  Empty,
  Divider,
  Badge,
  Tooltip 
} from 'antd';
import { 
  SendOutlined, 
  ReloadOutlined, 
  UserOutlined,
  LoadingOutlined,
  MoreOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { useChatModel } from '@/models/chat';
import { ChatMessage } from '@/services/chat/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './GlobalChat.less';

const { TextArea } = Input;
const { Text, Title } = Typography;

// Role color mapping
const getRoleColor = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'red';
    case 'TEACHER':
      return 'blue';
    case 'STUDENT':
      return 'green';
    default:
      return 'default';
  }
};

// Role display text
const getRoleText = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'Quản trị viên';
    case 'TEACHER':
      return 'Giảng viên';
    case 'STUDENT':
      return 'Sinh viên';
    default:
      return role;
  }
};

// Message item component
const MessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return (
    <List.Item className={styles.messageItem}>
      <List.Item.Meta
        avatar={
          <Avatar 
            icon={<UserOutlined />} 
            size="large"
            style={{ backgroundColor: getRoleColor(message.authorRole) }}
          />
        }
        title={
          <Space>
            <Text strong>{message.authorName}</Text>
            <Tag color={getRoleColor(message.authorRole)}>
              {getRoleText(message.authorRole)}
            </Tag>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatDistanceToNow(new Date(message.createdAt), { 
                addSuffix: true, 
                locale: vi 
              })}
            </Text>
          </Space>
        }
        description={
          <div className={styles.messageContent}>
            {message.content}
          </div>
        }
      />
    </List.Item>
  );
};

const GlobalChat: React.FC = () => {
  const {
    messages,
    loading,
    sending,
    hasMore,
    total,
    isPolling,
    sendMessage,
    loadMore,
    refresh,
  } = useChatModel();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;
    
    const content = messageText.trim();
    setMessageText('');
    await sendMessage(content);
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  return (
    <div className={styles.globalChat}>
      <Card 
        className={styles.chatContainer}
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Chat toàn cầu
            </Title>
            <Badge count={total} overflowCount={999} showZero />
            {isPolling && (
              <Tooltip title="Đang cập nhật tự động">
                <WifiOutlined style={{ color: '#52c41a' }} />
              </Tooltip>
            )}
          </Space>
        }
        extra={
          <Tooltip title="Làm mới">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refresh}
              loading={loading}
              type="text"
            />
          </Tooltip>
        }
      >
        {/* Messages Area */}
        <div className={styles.messagesArea} ref={listRef}>
          {loading && messages.length === 0 ? (
            <div className={styles.loadingContainer}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <Text type="secondary">Đang tải tin nhắn...</Text>
            </div>
          ) : messages.length === 0 ? (
            <Empty 
              description="Chưa có tin nhắn nào" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              {/* Load More Button */}
              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <Button 
                    onClick={handleLoadMore}
                    loading={loading}
                    icon={<MoreOutlined />}
                    type="dashed"
                    block
                  >
                    Xem thêm tin nhắn cũ
                  </Button>
                  <Divider />
                </div>
              )}

              {/* Messages List */}
              <List
                className={styles.messagesList}
                dataSource={[...messages].reverse()} // Reverse to show oldest first
                renderItem={(message) => (
                  <MessageItem key={message.id} message={message} />
                )}
                split={false}
              />
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className={styles.messageInput}>
          <div style={{ display: 'flex', width: '100%' }}>
            <TextArea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={sending}
              style={{ flex: 1, borderRadius: '6px 0 0 6px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={sending}
              disabled={!messageText.trim()}
              style={{ borderRadius: '0 6px 6px 0' }}
            >
              Gửi
            </Button>
          </div>
          {isPolling && (
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <WifiOutlined style={{ marginRight: '4px' }} />
                Tự động cập nhật tin nhắn mới
              </Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GlobalChat;
