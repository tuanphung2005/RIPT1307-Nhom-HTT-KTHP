import React from 'react';
import {
  Badge,
  Button,
  Dropdown,
  List,
  Typography,
  Space,
  Empty,
  Spin,
  Divider,
} from 'antd';
import {
  BellOutlined,
  CommentOutlined,
  MessageOutlined,
  CheckOutlined,
  SafetyOutlined,
  LikeOutlined,
} from '@ant-design/icons';
import { useModel, history } from 'umi';
import { Notification } from '@/services/notificationService';
import styles from './index.less';

const { Text, Link } = Typography;

const NotificationDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    formatNotificationTime,
  } = useModel('notifications');
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to the related post only for post/comment notifications
    if (notification.type !== 'PASSWORD_RESET' && notification.postId) {
      history.push(`/forum/${notification.postId}`);
    }
    // For password reset notifications, we don't navigate anywhere
    // The notification itself contains all the necessary information
  };  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = type === 'COMMENT_ON_POST' ? 'comment' : 
                     type === 'REPLY_TO_COMMENT' ? 'reply' : 
                     type === 'PASSWORD_RESET' ? 'password' : 
                     type === 'POST_UPVOTED' ? 'upvote' : '';
    
    switch (type) {
      case 'COMMENT_ON_POST':
        return (
          <div className={`${styles.notificationIcon} ${iconClass}`}>
            <CommentOutlined />
          </div>
        );
      case 'REPLY_TO_COMMENT':
        return (
          <div className={`${styles.notificationIcon} ${iconClass}`}>
            <MessageOutlined />
          </div>
        );
      case 'PASSWORD_RESET':
        return (
          <div className={`${styles.notificationIcon} ${iconClass}`}>
            <SafetyOutlined />
          </div>
        );
      case 'POST_UPVOTED':
        return (
          <div className={`${styles.notificationIcon} ${iconClass}`}>
            <LikeOutlined />
          </div>
        );
      default:
        return (
          <div className={styles.notificationIcon}>
            <BellOutlined />
          </div>
        );
    }
  };
  const renderNotificationItem = (notification: Notification, index: number) => (
    <List.Item
      key={notification.id}
      className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
      onClick={() => handleNotificationClick(notification)}
      style={{ '--index': index } as React.CSSProperties}
    >
      <div className={styles.notificationContent}>
        <div className={styles.notificationItemHeader}>
          {getNotificationIcon(notification.type)}
          <div className={styles.notificationMeta}>
            <Text strong className={styles.notificationTitle}>
              {notification.title}
            </Text>
            <Text type="secondary" className={styles.notificationTime}>
              {formatNotificationTime(notification.createdAt)}
            </Text>
          </div>
          {!notification.isRead && <div className={styles.unreadDot} />}
        </div>
        <Text className={styles.notificationMessage}>
          {notification.message}
        </Text>
        {notification.post && (
          <Text type="secondary" className={styles.postTitle}>
            Bài đăng: {notification.post.title}
          </Text>
        )}
      </div>
    </List.Item>
  );

  const dropdownContent = (
    <div className={styles.notificationDropdown}>
      <div className={styles.notificationHeader}>
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={markAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      <Divider style={{ margin: '8px 0' }} />
      
      {loading && notifications.length === 0 ? (
        <div className={styles.loadingContainer}>
          <Spin tip="Đang tải thông báo..." />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có thông báo nào"
          className={styles.emptyState}
        />
      ) : (
        <>          <List
            className={styles.notificationList}
            dataSource={notifications.slice(0, 10)}
            renderItem={(notification, index) => renderNotificationItem(notification, index)}
            split={false}
          />
          
          {notifications.length > 10 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <div className={styles.viewAllContainer}>
                <Button
                  type="link"
                  onClick={() => history.push('/notifications')}
                  block
                >
                  Xem tất cả thông báo
                </Button>
              </div>
            </>
          )}
          
          {hasMore && notifications.length <= 10 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <div className={styles.loadMoreContainer}>
                <Button
                  type="link"
                  loading={loading}
                  onClick={loadMoreNotifications}
                  block
                >
                  Tải thêm
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName={styles.notificationDropdownOverlay}
      getPopupContainer={(trigger) => trigger.parentElement || document.body}
    >
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          className={styles.notificationButton}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
