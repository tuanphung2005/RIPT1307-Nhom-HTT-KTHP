import { useState } from 'react';
import { message } from 'antd';
import { history } from 'umi';
import { postsService } from '@/services/posts/postsService';
import { authService } from '@/services/auth/authService';
import type { Post, Comment, CreateCommentData } from '@/services/posts/types';

export default function usePostDetail() {
  // Post detail state
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postDetailLoading, setPostDetailLoading] = useState(true);

  // Comment state
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Navigation methods
  const navigateToForum = () => {
    history.push('/forum');
  };
  // Post detail methods
  const loadPost = async (postId: string) => {
    const response = await postsService.getPostById(postId);
    if (response.success && response.data) {
      setCurrentPost(response.data);
    } else {
      message.error(response.message);
      navigateToForum();
    }
  };

  const loadComments = async (postId: string) => {
    const response = await postsService.getCommentsByPostId(postId);
    if (response.success && response.data) {
      setComments(response.data);
    }
  };

  const loadPostData = async (postId: string) => {
    setPostDetailLoading(true);
    await Promise.all([loadPost(postId), loadComments(postId)]);
    setPostDetailLoading(false);
  };

  const clearPostDetail = () => {
    setCurrentPost(null);
    setComments([]);
    setCommentContent('');
    setReplyContent('');
    setReplyingTo(null);
  };
  // Vote methods
  const handleVote = async (targetId: string, type: 'upvote' | 'downvote', targetType: 'post' | 'comment') => {
    try {
      const response = await postsService.vote({ targetId, type }, targetType);
      if (response.success) {
        // Reload data to get updated vote counts
        if (targetType === 'post' && currentPost) {
          await loadPost(currentPost.id);
        } else {
          if (currentPost) {
            await loadComments(currentPost.id);
          }
        }
      } else {
        message.error(response.message || 'Không thể vote');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi vote');
      console.error('Vote error:', error);
    }
  };

  // Comment methods
  const handleSubmitComment = async (postId: string) => {
    const contentToSubmit = replyingTo ? replyContent : commentContent;
    
    if (!contentToSubmit.trim()) {
      message.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmittingComment(true);
    try {
      const commentData: CreateCommentData = {
        postId,
        content: contentToSubmit,
        parentCommentId: replyingTo || undefined,
      };

      const response = await postsService.createComment(commentData);
      if (response.success) {
        setCommentContent('');
        setReplyContent('');
        setReplyingTo(null);
        await loadComments(postId);
        message.success(replyingTo ? 'Phản hồi đã được đăng' : 'Bình luận đã được đăng');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setCommentContent('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  // Utility methods
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'teacher':
        return 'blue';
      case 'student':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giảng viên';
      case 'student':
        return 'Sinh viên';
      default:
        return role;
    }
  };

  const getUserVoteType = (upvotedBy: string[] = [], downvotedBy: string[] = []) => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      return null;
    }
    
    if (upvotedBy.includes(currentUser.id)) {
      return 'upvote';
    }
    
    if (downvotedBy.includes(currentUser.id)) {
      return 'downvote';
    }
    
    return null;
  };

  return {
    // State
    currentPost,
    comments,
    postDetailLoading,
    commentContent,
    setCommentContent,
    replyContent,
    setReplyContent,
    replyingTo,
    submittingComment,

    // Methods
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
  };
}
