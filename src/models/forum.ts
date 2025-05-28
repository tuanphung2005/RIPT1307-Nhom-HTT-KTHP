import { postsService } from '@/services/posts/postsService';
import { authService } from '@/services/auth/authService';
import type { Post, Comment, CreateCommentData, CreatePostData } from '@/services/posts/types';
import { message } from 'antd';
import { useState } from 'react';
import { history } from 'umi';

export default () => {
  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Post detail state
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postDetailLoading, setPostDetailLoading] = useState(true);

  // Comment state
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  // Create post state
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [createPostContent, setCreatePostContent] = useState('');

  // Posts methods
  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = postsService.getAllPosts(1, 20);
      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    if (value.trim()) {
      const response = postsService.searchPosts(value);
      if (response.success && response.data) {
        setPosts(response.data);
      }
    } else {
      loadPosts();
    }
  };

  const navigateToPost = (postId: string) => {
    history.push(`/forum/${postId}`);
  };

  const navigateToCreatePost = () => {
    history.push('/forum/create');
  };

  const navigateToForum = () => {
    history.push('/forum');
  };

  // Post detail methods
  const loadPost = async (postId: string) => {
    const response = postsService.getPostById(postId);
    if (response.success && response.data) {
      setCurrentPost(response.data);
    } else {
      message.error(response.message);
      navigateToForum();
    }
  };

  const loadComments = async (postId: string) => {
    const response = postsService.getCommentsByPostId(postId);
    if (response.success && response.data) {
      setComments(response.data);
    }
  };

  const loadPostData = async (postId: string) => {
    setPostDetailLoading(true);
    await Promise.all([loadPost(postId), loadComments(postId)]);
    setPostDetailLoading(false);
  };  // Vote methods
  const handleVote = async (targetId: string, type: 'upvote' | 'downvote', targetType: 'post' | 'comment') => {
    try {
      const response = postsService.vote({ targetId, type }, targetType);
      if (response.success) {
        // Don't show success message for every vote to avoid spam
        
        // Reload data to get updated vote counts
        if (targetType === 'post' && currentPost) {
          await loadPost(currentPost.id); // Make sure to wait for the update
        } else {
          if (currentPost) {
            await loadComments(currentPost.id); // Make sure to wait for the update
          }
        }
      } else {
        message.error(response.message || 'Không thể vote');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi vote');
      console.error('Vote error:', error);
    }
  };// Comment methods
  const handleSubmitComment = async (postId: string) => {
    const contentToSubmit = replyingTo ? replyContent : commentContent;
    
    if (!contentToSubmit.trim()) {
      message.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmittingComment(true);
    try {      const commentData: CreateCommentData = {
        postId,
        content: contentToSubmit,
        parentCommentId: replyingTo || undefined, // Convert null to undefined
      };

      const response = postsService.createComment(commentData);
      if (response.success) {
        setCommentContent('');
        setReplyContent('');
        setReplyingTo(null);
        await loadComments(postId); // Make sure to wait for comments to reload
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
  // Create post methods
  const commonTags = [
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lý',
    'Văn học',
    'Tiếng Anh',
    'Tin học',
    'Kinh tế',
    'Triết học',
    'Pháp luật',
    'Kỹ thuật',
    'Y học',
    'Nông nghiệp',
    'Giáo dục',
    'Nghiên cứu',
    'Thực tập',
    'Thi cử',
    'Học bổng',
    'Khác'
  ];

  const createPost = async (postData: CreatePostData) => {
    setCreatePostLoading(true);
    try {
      const response = postsService.createPost(postData);
      if (response.success) {
        message.success('Bài đăng đã được tạo thành công');
        navigateToForum();
        // Reload posts to show the new post
        loadPosts();
        return true;
      } else {
        message.error(response.message);
        return false;
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo bài đăng');
      return false;
    } finally {
      setCreatePostLoading(false);
    }
  };

  const handleCreatePost = async (values: any) => {
    if (!createPostContent.trim()) {
      message.error('Vui lòng nhập nội dung bài đăng');
      return false;
    }

    const postData: CreatePostData = {
      title: values.title,
      content: createPostContent,
      tags: values.tags || [],
    };

    return await createPost(postData);
  };

  const clearCreatePost = () => {
    setCreatePostContent('');
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
  };  const hasUserVoted = (votedBy: any[], voteType?: 'upvote' | 'downvote') => {
    // This would check if current user has voted and what type of vote
    // For now, return mock data - you'll need to implement based on your auth system
    // Should return: { hasVoted: boolean, voteType: 'upvote' | 'downvote' | null }
    return { hasVoted: false, voteType: null };
  };
  const getUserVoteType = (upvotedBy: string[] = [], downvotedBy: string[] = []) => {
    // Get current user from auth service
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      return null;
    }
    
    // Check if user has upvoted
    if (upvotedBy.includes(currentUser.id)) {
      return 'upvote';
    }
    
    // Check if user has downvoted  
    if (downvotedBy.includes(currentUser.id)) {
      return 'downvote';
    }
    
    // User hasn't voted
    return null;
  };

  const clearPostDetail = () => {
    setCurrentPost(null);
    setComments([]);
    setCommentContent('');
    setReplyContent('');
    setReplyingTo(null);
  };

  return {
    // Posts state
    posts,
    loading,
    searchKeyword,
    
    // Post detail state
    currentPost,
    comments,
    postDetailLoading,
    
    // Comment state
    commentContent,
    setCommentContent,
    replyContent,
    setReplyContent,
    replyingTo,
    submittingComment,
      // Create post state
    createPostLoading,
    createPostContent,
    setCreatePostContent,
    
    // Posts methods
    loadPosts,
    handleSearch,
    navigateToPost,
    navigateToCreatePost,
    navigateToForum,
    
    // Post detail methods
    loadPostData,
    clearPostDetail,
    
    // Vote methods
    handleVote,
    
    // Comment methods
    handleSubmitComment,
    handleReply,
    cancelReply,
      // Create post methods
    commonTags,
    createPost,
    handleCreatePost,
    clearCreatePost,
      // Utility methods
    getRoleColor,
    getRoleText,
    hasUserVoted,
    getUserVoteType,
  };
};
