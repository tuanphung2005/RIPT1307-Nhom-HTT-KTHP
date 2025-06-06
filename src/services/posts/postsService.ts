import { authService } from '../auth/authService';
import { backendApiService } from '../api/backendApi';
import { API_CONFIG } from '../api/config';
import type { 
  CreatePostData, 
  CreateCommentData, 
  PostResponse, 
  PostsListResponse, 
  CommentResponse, 
  CommentsListResponse,
  VoteData,
  VoteResponse 
} from './types';

class PostsService {
  // Create post
  async createPost(data: CreatePostData): Promise<PostResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để đăng bài'
        };
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.POSTS.CREATE, {
        title: data.title,
        content: data.content,
        tags: data.tags || []
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Đăng bài thành công!'
      };
    } catch (error: any) {
      console.error('Error creating post:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đăng bài'
      };
    }
  }

  // Get all posts + pagi
  async getAllPosts(page: number = 1, limit: number = 10): Promise<PostsListResponse> {
    try {
      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.POSTS.LIST, {
        page,
        limit
      });

      return {
        success: response.success,
        data: response.data || [],
        total: response.total || 0,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error getting posts:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách bài đăng'
      };
    }
  }

  // Get post theo ID
  async getPostById(id: string): Promise<PostResponse> {
    try {
      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.POSTS.GET_BY_ID(id));

      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error getting post:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải bài đăng'
      };
    }
  }

  // Create comment
  async createComment(data: CreateCommentData): Promise<CommentResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để bình luận'
        };
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.POSTS.COMMENTS(data.postId), {
        content: data.content,
        parentCommentId: data.parentCommentId
      });

      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Bình luận thành công!'
      };
    } catch (error: any) {
      console.error('Error creating comment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi bình luận'
      };
    }
  }

  // Get comments => post
  async getCommentsByPostId(postId: string): Promise<CommentsListResponse> {
    try {
      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.POSTS.COMMENTS(postId));

      return {
        success: response.success,
        data: response.data || [],
        total: response.data?.length || 0,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error getting comments:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải bình luận'
      };
    }
  }

  // Vote post
  async voteOnPost(data: VoteData): Promise<VoteResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để vote'
        };
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.POSTS.VOTE(data.targetId), {
        type: data.type
      });

      return {
        success: response.success,
        votes: response.votes,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error voting on post:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi vote'
      };
    }
  }

  // Vote comment
  async voteOnComment(data: VoteData): Promise<VoteResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để vote'
        };
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.COMMENTS.VOTE(data.targetId), {
        type: data.type
      });

      return {
        success: response.success,
        votes: response.votes,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error voting on comment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi vote'
      };
    }
  }

  // ALL IN ONE VOTE METHOD TODO:REUSE THIS
  async vote(data: VoteData, targetType: 'post' | 'comment'): Promise<VoteResponse> {
    if (targetType === 'post') {
      return this.voteOnPost(data);
    } else {
      return this.voteOnComment(data);
    }
  }

  // Search posts theo keyword + tags
  async searchPosts(keyword: string = '', tags: string[] = [], page: number = 1, limit: number = 10): Promise<PostsListResponse> {
    try {
      const response = await backendApiService.get(API_CONFIG.ENDPOINTS.POSTS.SEARCH, {
        keyword,
        tags: tags.join(','),
        page,
        limit
      });

      return {
        success: response.success,
        data: response.data || [],
        total: response.total || 0,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error searching posts:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm'
      };
    }
  }

  // Delete bang ID (Admin)
  async deletePost(postId: string): Promise<PostResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Vui lòng đăng nhập để thực hiện thao tác này'
        };
      }

      if (currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Bạn không có quyền xóa bài đăng'
        };
      }

      const response = await backendApiService.delete(API_CONFIG.ENDPOINTS.POSTS.DELETE(postId));

      return {
        success: response.success,
        message: response.message || 'Xóa bài đăng thành công'
      };
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài đăng'
      };
    }
  }

// backward compatible
  migrateExistingData(): void {
    // TODO: REMoVE THIS
    console.log('backend api done');
  }
}

export const postsService = new PostsService();
