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
      const response = await postsService.getAllPosts(1, 20);
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

  const handleSearch = async (value: string) => {
    setSearchKeyword(value);
    if (value.trim()) {
      try {
        const response = await postsService.searchPosts(value);
        if (response.success && response.data) {
          setPosts(response.data);
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi tìm kiếm');
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
      const response = await postsService.createPost(postData);
      if (response.success) {
        message.success('Bài đăng đã được tạo thành công');
        navigateToForum();
        // Reload posts
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
      
      // Use backend search API with filters
      const response = await postsService.searchPosts(
        filters.keyword || '',
        filters.tags || [],
        1,
        1000
      );
      
      if (response.success && response.data) {
        let posts = response.data;
        
        posts = posts.filter((post: Post) => {
          // Author role 
          if (filters.authorRole && filters.authorRole !== '') {
            if (post.authorRole !== filters.authorRole) return false;
          }
          
          // Date filter
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
            posts.sort((a: Post, b: Post) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
          case 'most_votes':
            posts.sort((a: Post, b: Post) => b.votes - a.votes);
            break;
          case 'most_comments':
            posts.sort((a: Post, b: Post) => b.votes - a.votes);
            break;
          case 'newest':
          default:
            posts.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
        
        setAdvancedSearchResults(posts);
        message.success(`Tìm thấy ${posts.length} bài đăng`);
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi tìm kiếm');
      }
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

  const getAllTags = async () => {
    try {
      const response = await postsService.getAllPosts(1, 1000);
      if (response.success && response.data) {
        const tagsSet = new Set<string>();
        response.data.forEach((post: Post) => {
          post.tags.forEach((tag: string) => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
      }
      return [];
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  };


  const getAllAuthors = async () => {
    try {
      const response = await postsService.getAllPosts(1, 1000);
      if (response.success && response.data) {
        const authorsMap = new Map<string, { name: string; role: string }>();
        response.data.forEach((post: Post) => {
          authorsMap.set(post.authorId, {
            name: post.authorName,
            role: post.authorRole
          });
        });
        return Array.from(authorsMap.values());
      }
      return [];
    } catch (error) {
      console.error('Error getting authors:', error);
      return [];
    }
  };

  // Admin methods
  const getAllPosts = async (): Promise<Post[]> => {
    try {
      const response = await postsService.getAllPosts(1, 1000);
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
      const response = await postsService.deletePost(postId);
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  // Utility
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
