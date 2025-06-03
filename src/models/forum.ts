import { postsService } from '@/services/posts/postsService';
import type { Post, CreatePostData, AdvancedSearchFilters } from '@/services/posts/types';
import { message } from 'antd';
import { useState } from 'react';
import { history } from 'umi';

export default () => {
  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Create post state
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [createPostContent, setCreatePostContent] = useState('');

  // Advanced search state
  const [advancedSearchResults, setAdvancedSearchResults] = useState<Post[]>([]);
  const [advancedSearchLoading, setAdvancedSearchLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<AdvancedSearchFilters>({
    keyword: '',
    tags: [] as string[],
    authorRole: '',
    dateRange: [] as string[],
    sortBy: 'newest' as 'newest' | 'oldest' | 'most_votes' | 'most_comments',
  });

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

  const navigateToAdvancedSearch = () => {
    history.push('/forum/search');
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

  // Advanced search methods
  const handleAdvancedSearch = async (filters: AdvancedSearchFilters) => {
    setAdvancedSearchLoading(true);
    try {
      // Update search filters
      setSearchFilters(filters);
      
      // Get all posts first
      let posts = postsService.getAllPosts(1, 1000).data || [];
      
      // Apply filters
      posts = posts.filter(post => {
        // Keyword filter
        if (filters.keyword && filters.keyword.trim()) {
          const keyword = filters.keyword.toLowerCase();
          const matchesKeyword = post.title.toLowerCase().includes(keyword) ||
                                post.content.toLowerCase().includes(keyword) ||
                                post.authorName.toLowerCase().includes(keyword);
          if (!matchesKeyword) return false;
        }
        
        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
          const matchesTags = filters.tags.some((tag: string) => post.tags.includes(tag));
          if (!matchesTags) return false;
        }
        
        // Author role filter
        if (filters.authorRole && filters.authorRole !== '') {
          if (post.authorRole !== filters.authorRole) return false;
        }
        
        // Date range filter
        if (filters.dateRange && filters.dateRange.length === 2) {
          const postDate = new Date(post.createdAt);
          const startDate = new Date(filters.dateRange[0]);
          const endDate = new Date(filters.dateRange[1]);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          
          if (postDate < startDate || postDate > endDate) return false;
        }
        
        return true;
      });
      
      // Sort results
      switch (filters.sortBy) {
        case 'oldest':
          posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'most_votes':
          posts.sort((a, b) => b.votes - a.votes);
          break;
        case 'most_comments':
          // For now, sort by votes since we don't have comment count on posts
          // You could enhance this by adding comment count to posts
          posts.sort((a, b) => b.votes - a.votes);
          break;
        case 'newest':
        default:
          posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
      
      setAdvancedSearchResults(posts);
      message.success(`Tìm thấy ${posts.length} bài đăng`);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setAdvancedSearchLoading(false);
    }
  };
  const clearAdvancedSearch = () => {
    setAdvancedSearchResults([]);
    setSearchFilters({
      keyword: '',
      tags: [],
      authorRole: '',
      dateRange: [],
      sortBy: 'newest',
    });
  };

  // Get all available tags from posts
  const getAllTags = () => {
    const allPosts = postsService.getAllPosts(1, 1000).data || [];
    const tagsSet = new Set<string>();
    allPosts.forEach(post => {
      post.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  };

  // Get all authors
  const getAllAuthors = () => {
    const allPosts = postsService.getAllPosts(1, 1000).data || [];
    const authorsMap = new Map<string, { name: string; role: string }>();
    allPosts.forEach(post => {
      authorsMap.set(post.authorId, {
        name: post.authorName,
        role: post.authorRole
      });
    });
    return Array.from(authorsMap.values());
  };

  // Admin methods
  const getAllPosts = async (): Promise<Post[]> => {
    try {
      const response = postsService.getAllPosts(1, 1000);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error getting all posts:', error);
      throw error;
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    try {
      const response = postsService.deletePost(postId);
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  // Utility methods (shared across forum components)
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

  return {
    // Posts state
    posts,
    loading,
    searchKeyword,
    
    // Create post state
    createPostLoading,
    createPostContent,
    setCreatePostContent,
    
    // Advanced search state
    advancedSearchResults,
    advancedSearchLoading,
    searchFilters,
    
    // Posts methods
    loadPosts,
    handleSearch,
    navigateToPost,
    navigateToCreatePost,
    navigateToForum,
    navigateToAdvancedSearch,
    
    // Create post methods
    commonTags,
    createPost,
    handleCreatePost,
    clearCreatePost,
    
    // Advanced search methods
    handleAdvancedSearch,
    clearAdvancedSearch,
    getAllTags,
    getAllAuthors,
    
    // Admin methods
    getAllPosts,
    deletePost,

    // Utility methods
    getRoleColor,
    getRoleText,
  };
};
