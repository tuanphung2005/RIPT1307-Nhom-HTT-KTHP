import { authService } from '../auth/authService';
import type { 
  Post, 
  Comment, 
  CreatePostData, 
  CreateCommentData, 
  PostResponse, 
  PostsListResponse, 
  CommentResponse, 
  CommentsListResponse,
  VoteData,
  VoteResponse 
} from './types';

const POSTS_KEY = 'forum_posts';
const COMMENTS_KEY = 'forum_comments';

class PostsService {
  constructor() {
    // Run data migration on initialization
    this.migrateExistingData();
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Get all posts from localStorage
  private getPosts(): Post[] {
    try {
      const posts = localStorage.getItem(POSTS_KEY);
      return posts ? JSON.parse(posts) : [];
    } catch (error) {
      console.error('Error getting posts from localStorage:', error);
      return [];
    }
  }

  // Save posts to localStorage
  private savePosts(posts: Post[]): void {
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
    }
  }

  // Get all comments from localStorage
  private getComments(): Comment[] {
    try {
      const comments = localStorage.getItem(COMMENTS_KEY);
      return comments ? JSON.parse(comments) : [];
    } catch (error) {
      console.error('Error getting comments from localStorage:', error);
      return [];
    }
  }

  // Save comments to localStorage
  private saveComments(comments: Comment[]): void {
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error('Error saving comments to localStorage:', error);
    }
  }

  // Create new post
  createPost(data: CreatePostData): PostResponse {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để đăng bài'
        };
      }

      const posts = this.getPosts();
        const newPost: Post = {
        id: this.generateId(),
        title: data.title,
        content: data.content,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorRole: currentUser.role,
        tags: data.tags,
        votes: 0,
        votedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      posts.unshift(newPost); // Add to beginning
      this.savePosts(posts);

      return {
        success: true,
        data: newPost,
        message: 'Đăng bài thành công!'
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng bài'
      };
    }
  }

  // Get all posts with pagination
  getAllPosts(page: number = 1, limit: number = 10): PostsListResponse {
    try {
      const posts = this.getPosts().filter(post => post.isActive);
      const total = posts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = posts.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedPosts,
        total,
      };
    } catch (error) {
      console.error('Error getting posts:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tải danh sách bài đăng'
      };
    }
  }

  // Get post by ID
  getPostById(id: string): PostResponse {
    try {
      const posts = this.getPosts();
      const post = posts.find(p => p.id === id && p.isActive);
      
      if (!post) {
        return {
          success: false,
          message: 'Không tìm thấy bài đăng'
        };
      }

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      console.error('Error getting post:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tải bài đăng'
      };
    }
  }

  // Create comment
  createComment(data: CreateCommentData): CommentResponse {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để bình luận'
        };
      }

      const comments = this.getComments();
        const newComment: Comment = {
        id: this.generateId(),
        postId: data.postId,
        content: data.content,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorRole: currentUser.role,
        parentCommentId: data.parentCommentId,
        votes: 0,
        votedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      comments.push(newComment);
      this.saveComments(comments);

      return {
        success: true,
        data: newComment,
        message: 'Bình luận thành công!'
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi bình luận'
      };
    }
  }

  // Get comments for a post
  getCommentsByPostId(postId: string): CommentsListResponse {
    try {
      const comments = this.getComments()
        .filter(comment => comment.postId === postId && comment.isActive)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return {
        success: true,
        data: comments,
        total: comments.length,
      };
    } catch (error) {
      console.error('Error getting comments:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tải bình luận'
      };
    }
  }  // Vote on post or comment
  vote(data: VoteData, targetType: 'post' | 'comment'): VoteResponse {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Bạn cần đăng nhập để vote'
        };
      }

      if (targetType === 'post') {
        const posts = this.getPosts();
        const postIndex = posts.findIndex(p => p.id === data.targetId);
        
        if (postIndex === -1) {
          return {
            success: false,
            message: 'Không tìm thấy bài đăng'
          };
        }

        const post = posts[postIndex];
        
        // Initialize arrays if they don't exist (for backward compatibility)
        if (!post.upvotedBy) post.upvotedBy = [];
        if (!post.downvotedBy) post.downvotedBy = [];
        
        // Remove user from both arrays first
        post.upvotedBy = post.upvotedBy.filter(id => id !== currentUser.id);
        post.downvotedBy = post.downvotedBy.filter(id => id !== currentUser.id);
        
        // Add user to appropriate array based on vote type
        if (data.type === 'upvote') {
          post.upvotedBy.push(currentUser.id);
        } else if (data.type === 'downvote') {
          post.downvotedBy.push(currentUser.id);
        }
        // If type is 'remove', user is just removed from both arrays
        
        // Calculate new vote count
        post.votes = post.upvotedBy.length - post.downvotedBy.length;
        
        // Update legacy votedBy array for backward compatibility
        post.votedBy = [...post.upvotedBy, ...post.downvotedBy];

        this.savePosts(posts);
        return {
          success: true,
          votes: post.votes,
        };
      } else {
        const comments = this.getComments();
        const commentIndex = comments.findIndex(c => c.id === data.targetId);
        
        if (commentIndex === -1) {
          return {
            success: false,
            message: 'Không tìm thấy bình luận'
          };
        }

        const comment = comments[commentIndex];
        
        // Initialize arrays if they don't exist (for backward compatibility)
        if (!comment.upvotedBy) comment.upvotedBy = [];
        if (!comment.downvotedBy) comment.downvotedBy = [];
        
        // Remove user from both arrays first
        comment.upvotedBy = comment.upvotedBy.filter(id => id !== currentUser.id);
        comment.downvotedBy = comment.downvotedBy.filter(id => id !== currentUser.id);
        
        // Add user to appropriate array based on vote type
        if (data.type === 'upvote') {
          comment.upvotedBy.push(currentUser.id);
        } else if (data.type === 'downvote') {
          comment.downvotedBy.push(currentUser.id);
        }
        // If type is 'remove', user is just removed from both arrays
        
        // Calculate new vote count
        comment.votes = comment.upvotedBy.length - comment.downvotedBy.length;
        
        // Update legacy votedBy array for backward compatibility
        comment.votedBy = [...comment.upvotedBy, ...comment.downvotedBy];

        this.saveComments(comments);
        return {
          success: true,
          votes: comment.votes,
        };
      }
    } catch (error) {
      console.error('Error voting:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi vote'
      };
    }
  }

  // Search posts by title or content
  searchPosts(keyword: string, tags: string[] = []): PostsListResponse {
    try {
      const posts = this.getPosts().filter(post => {
        if (!post.isActive) return false;
        
        const matchesKeyword = keyword === '' || 
          post.title.toLowerCase().includes(keyword.toLowerCase()) ||
          post.content.toLowerCase().includes(keyword.toLowerCase());
          
        const matchesTags = tags.length === 0 || 
          tags.some(tag => post.tags.includes(tag));
          
        return matchesKeyword && matchesTags;
      });

      return {
        success: true,
        data: posts,
        total: posts.length,
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tìm kiếm'
      };
    }
  }

  // Migrate existing data to include upvotedBy/downvotedBy arrays
  migrateExistingData(): void {
    try {
      // Migrate posts
      const posts = this.getPosts();
      let postsUpdated = false;
      
      posts.forEach(post => {
        if (!post.upvotedBy || !post.downvotedBy) {
          post.upvotedBy = post.upvotedBy || [];
          post.downvotedBy = post.downvotedBy || [];
          postsUpdated = true;
        }
      });
      
      if (postsUpdated) {
        this.savePosts(posts);
      }
      
      // Migrate comments
      const comments = this.getComments();
      let commentsUpdated = false;
      
      comments.forEach(comment => {
        if (!comment.upvotedBy || !comment.downvotedBy) {
          comment.upvotedBy = comment.upvotedBy || [];
          comment.downvotedBy = comment.downvotedBy || [];
          commentsUpdated = true;
        }
      });
      
      if (commentsUpdated) {
        this.saveComments(comments);
      }
    } catch (error) {
      console.error('Error migrating existing data:', error);
    }
  }
}

export const postsService = new PostsService();
