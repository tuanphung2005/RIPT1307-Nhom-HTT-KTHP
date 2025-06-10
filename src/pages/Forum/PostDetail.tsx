import {
  ArrowLeftOutlined,
  LikeOutlined,
  DislikeOutlined,
  MessageOutlined,
  TagsOutlined,
  LikeFilled,
  DislikeFilled,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Avatar,
  Input,
  Divider,
  List,
  Tooltip,
} from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import styles from './PostDetail.less';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PostDetailProps {
  match: {
    params: {
      id: string;
    };
  };
}

const PostDetail: React.FC<PostDetailProps> = ({ match }) => {
  const { initialState } = useModel('@@initialState');
  const {
    currentPost: post,
    comments,
    postDetailLoading: loading,
    commentContent,
    setCommentContent,
    replyContent,
    setReplyContent,
    replyingTo,
    submittingComment,
    loadPostData,
    clearPostDetail,
    handleVote,
    handleSubmitComment,
    handleReply,
    cancelReply,
    navigateToForum,
    getRoleColor,
    getRoleText,
    getUserVoteType,
  } = useModel('postDetail');

  const postId = match.params.id;

  useEffect(() => {
    loadPostData(postId);
    
    return () => {
      clearPostDetail();
    };
  }, [postId]);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (!post) {
    return <div className={styles.notFound}>Không tìm thấy bài đăng</div>;
  }

  const getTopLevelComments = () => {
    return comments.filter(comment => !comment.parentCommentId);
  };

  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parentCommentId === commentId);
  };

  return (
    <div className={styles.postDetailContainer}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={navigateToForum}
          type="text"
        >
          Quay lại diễn đàn
        </Button>
      </div>

      {/* Post Content */}
      <Card className={styles.postCard}>
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Avatar size="large" style={{ backgroundColor: getRoleColor(post.authorRole) }}>
              {post.authorName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div>
                <Text strong>{post.authorName}</Text>
                <Tag color={getRoleColor(post.authorRole)} style={{ marginLeft: 8 }}>
                  {getRoleText(post.authorRole)}
                </Tag>
              </div>
              <Text type="secondary">{moment(post.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
          </div>            <div className={styles.voteSection}>
            <Space direction="vertical" align="center">
              <Tooltip 
                title={
                  getUserVoteType(post.upvotedBy, post.downvotedBy) === 'upvote' 
                    ? "Nhấn để bỏ upvote" 
                    : "Upvote bài đăng này"
                }
              >
                <Button
                  icon={getUserVoteType(post.upvotedBy, post.downvotedBy) === 'upvote' ? <LikeFilled /> : <LikeOutlined />}
                  type="text"
                  onClick={() => handleVote(post.id, 'upvote', 'post')}
                  className={getUserVoteType(post.upvotedBy, post.downvotedBy) === 'upvote' ? styles.voted : ''}
                />
              </Tooltip>
              <Text strong className={styles.voteCount}>{post.votes}</Text>
              <Tooltip 
                title={
                  getUserVoteType(post.upvotedBy, post.downvotedBy) === 'downvote' 
                    ? "Nhấn để bỏ downvote" 
                    : "Downvote bài đăng này"
                }
              >
                <Button
                  icon={getUserVoteType(post.upvotedBy, post.downvotedBy) === 'downvote' ? <DislikeFilled /> : <DislikeOutlined />}
                  type="text"
                  onClick={() => handleVote(post.id, 'downvote', 'post')}
                  className={getUserVoteType(post.upvotedBy, post.downvotedBy) === 'downvote' ? styles.voted : ''}
                />
              </Tooltip>
            </Space>
          </div>
        </div>

        <Title level={2} className={styles.postTitle}>
          {post.title}
        </Title>        <div className={styles.postContent}>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {post.tags.length > 0 && (
          <div className={styles.postTags}>
            <TagsOutlined style={{ marginRight: 8 }} />
            {post.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Comments Section */}
      <Card className={styles.commentsCard}>
        <Title level={4}>
          <MessageOutlined style={{ marginRight: 8 }} />
          Bình luận ({getTopLevelComments().length})
        </Title>        {/* Add Comment Form */}
        {initialState?.currentUser && (
          <div className={styles.addCommentSection}>
            <TextArea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              rows={4}
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={() => handleSubmitComment(postId)}
                loading={submittingComment}
                disabled={!commentContent.trim()}
              >
                Gửi bình luận
              </Button>
            </div>
          </div>
        )}

        <Divider />

        {/* Comments List */}
        <List
          dataSource={getTopLevelComments()}
          renderItem={(comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <div className={styles.commentAuthor}>
                  <Avatar size="small" style={{ backgroundColor: getRoleColor(comment.authorRole) }}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Space>                    <Text strong>{comment.authorName}</Text>
                    <Tag color={getRoleColor(comment.authorRole)}>
                      {getRoleText(comment.authorRole)}
                    </Tag>
                    <Text type="secondary">
                      {moment(comment.createdAt).fromNow()}
                    </Text>
                  </Space>
                </div>                  <div className={styles.commentVotes}>
                  <Space>
                    <Tooltip 
                      title={
                        getUserVoteType(comment.upvotedBy, comment.downvotedBy) === 'upvote' 
                          ? "Nhấn để bỏ upvote" 
                          : "Upvote bình luận này"
                      }
                    >
                      <Button
                        size="small"
                        type="text"
                        icon={getUserVoteType(comment.upvotedBy, comment.downvotedBy) === 'upvote' ? <LikeFilled /> : <LikeOutlined />}
                        onClick={() => handleVote(comment.id, 'upvote', 'comment')}
                        className={getUserVoteType(comment.upvotedBy, comment.downvotedBy) === 'upvote' ? styles.voted : ''}
                      />
                    </Tooltip>
                    <Text>{comment.votes}</Text>
                    <Tooltip 
                      title={
                        getUserVoteType(comment.upvotedBy, comment.downvotedBy) === 'downvote' 
                          ? "Nhấn để bỏ downvote" 
                          : "Downvote bình luận này"
                      }
                    >
                      <Button
                        size="small"
                        type="text"
                        icon={getUserVoteType(comment.upvotedBy, comment.downvotedBy) === 'downvote' ? <DislikeFilled /> : <DislikeOutlined />}
                        onClick={() => handleVote(comment.id, 'downvote', 'comment')}
                        className={getUserVoteType(comment.upvotedBy, comment.downvotedBy) === 'downvote' ? styles.voted : ''}
                      />
                    </Tooltip>
                  </Space>
                </div>
              </div>              <div className={styles.commentContent}>
                <Paragraph>{comment.content}</Paragraph>
              </div>

              <div className={styles.commentActions}>
                {initialState?.currentUser && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleReply(comment.id)}
                  >
                    Trả lời
                  </Button>
                )}
              </div>              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className={styles.replySection}>
                  <TextArea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Viết phản hồi..."
                    rows={3}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Space>
                      <Button size="small" onClick={cancelReply}>
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleSubmitComment(postId)}
                        loading={submittingComment}
                        disabled={!replyContent.trim()}
                      >
                        Gửi
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {/* Replies */}
              {getReplies(comment.id).map(reply => (
                <div key={reply.id} className={styles.commentItem} style={{ marginLeft: 32, borderLeft: '2px solid #f0f0f0', paddingLeft: 16 }}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentAuthor}>
                      <Avatar size="small" style={{ backgroundColor: getRoleColor(reply.authorRole) }}>
                        {reply.authorName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Space>                        <Text strong>{reply.authorName}</Text>
                        <Tag color={getRoleColor(reply.authorRole)}>
                          {getRoleText(reply.authorRole)}
                        </Tag>
                        <Text type="secondary">
                          {moment(reply.createdAt).fromNow()}
                        </Text>
                      </Space>
                    </div>                      <div className={styles.commentVotes}>
                      <Space>
                        <Tooltip 
                          title={
                            getUserVoteType(reply.upvotedBy, reply.downvotedBy) === 'upvote' 
                              ? "Nhấn để bỏ upvote" 
                              : "Upvote phản hồi này"
                          }
                        >
                          <Button
                            size="small"
                            type="text"
                            icon={getUserVoteType(reply.upvotedBy, reply.downvotedBy) === 'upvote' ? <LikeFilled /> : <LikeOutlined />}
                            onClick={() => handleVote(reply.id, 'upvote', 'comment')}
                            className={getUserVoteType(reply.upvotedBy, reply.downvotedBy) === 'upvote' ? styles.voted : ''}
                          />
                        </Tooltip>
                        <Text>{reply.votes}</Text>
                        <Tooltip 
                          title={
                            getUserVoteType(reply.upvotedBy, reply.downvotedBy) === 'downvote' 
                              ? "Nhấn để bỏ downvote" 
                              : "Downvote phản hồi này"
                          }
                        >
                          <Button
                            size="small"
                            type="text"
                            icon={getUserVoteType(reply.upvotedBy, reply.downvotedBy) === 'downvote' ? <DislikeFilled /> : <DislikeOutlined />}
                            onClick={() => handleVote(reply.id, 'downvote', 'comment')}
                            className={getUserVoteType(reply.upvotedBy, reply.downvotedBy) === 'downvote' ? styles.voted : ''}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>                  <div className={styles.commentContent}>
                    <Paragraph>{reply.content}</Paragraph>
                  </div>
                </div>
              ))}
            </div>
          )}
          locale={{ emptyText: 'Chưa có bình luận nào' }}
        />
      </Card>
    </div>
  );
};

export default PostDetail;
