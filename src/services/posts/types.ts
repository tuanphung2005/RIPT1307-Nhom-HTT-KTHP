// filepath: src/services/posts/types.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  tags: string[];
  votes: number;
  votedBy: string[]; // User IDs who voted
  upvotedBy: string[]; // User IDs who upvoted
  downvotedBy: string[]; // User IDs who downvoted
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  parentCommentId?: string; // For replies to comments
  votes: number;
  votedBy: string[];
  upvotedBy: string[]; // User IDs who upvoted
  downvotedBy: string[]; // User IDs who downvoted
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface PostResponse {
  success: boolean;
  data?: Post;
  message?: string;
}

export interface PostsListResponse {
  success: boolean;
  data?: Post[];
  total?: number;
  message?: string;
}

export interface CommentResponse {
  success: boolean;
  data?: Comment;
  message?: string;
}

export interface CommentsListResponse {
  success: boolean;
  data?: Comment[];
  total?: number;
  message?: string;
}

export interface VoteData {
  targetId: string; // Post ID or Comment ID
  type: 'upvote' | 'downvote' | 'remove';
}

export interface VoteResponse {
  success: boolean;
  votes?: number;
  message?: string;
}
