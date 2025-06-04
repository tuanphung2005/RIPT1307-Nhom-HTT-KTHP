import { User, Post, Comment, UserRole } from '@prisma/client';
import { UserResponse, PostResponse, CommentResponse } from '@/types/api';

// Map database UserRole enum to frontend string
export function mapUserRole(role: UserRole): 'student' | 'teacher' | 'admin' {
  switch (role) {
    case 'STUDENT':
      return 'student';
    case 'TEACHER':
      return 'teacher';
    case 'ADMIN':
      return 'admin';
    default:
      return 'student';
  }
}

// Map frontend role string to database UserRole enum
export function mapToUserRole(role: string): UserRole {
  switch (role.toLowerCase()) {
    case 'teacher':
      return 'TEACHER';
    case 'admin':
      return 'ADMIN';
    case 'student':
    default:
      return 'STUDENT';
  }
}

// Map User model to UserResponse
export function mapUserToResponse(user: User): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: mapUserRole(user.role),
    isActive: user.isActive,
    avatar: user.avatar || undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

// Map Post model to PostResponse
export function mapPostToResponse(
  post: Post & { 
    postVotes?: Array<{ userId: string; type: string }>;
  }
): PostResponse {
  const upvotedBy = post.postVotes?.filter(v => v.type === 'UPVOTE').map(v => v.userId) || [];
  const downvotedBy = post.postVotes?.filter(v => v.type === 'DOWNVOTE').map(v => v.userId) || [];
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
    authorId: post.authorId,
    authorName: post.authorName,
    authorRole: mapUserRole(post.authorRole),
    votes: post.voteCount,
    upvotedBy,
    downvotedBy,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

// Map Comment model to CommentResponse
export function mapCommentToResponse(
  comment: Comment & {
    commentVotes?: Array<{ userId: string; type: string }>;
  }
): CommentResponse {
  const upvotedBy = comment.commentVotes?.filter(v => v.type === 'UPVOTE').map(v => v.userId) || [];
  const downvotedBy = comment.commentVotes?.filter(v => v.type === 'DOWNVOTE').map(v => v.userId) || [];

  return {
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    authorRole: mapUserRole(comment.authorRole),
    parentCommentId: comment.parentCommentId || undefined,
    votes: comment.voteCount,
    upvotedBy,
    downvotedBy,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
