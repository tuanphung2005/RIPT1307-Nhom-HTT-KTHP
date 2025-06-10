import { PrismaClient } from '@prisma/client';
import { NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  postId?: string;
  commentId?: string;
  authorId?: string;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          postId: data.postId,
          commentId: data.commentId,
          authorId: data.authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
    try {
      return await prisma.notification.findMany({
        where: {
          userId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user can only mark their own notifications
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Create notification when someone comments on a post
   */
  static async notifyPostCommented(postId: string, commentAuthorId: string, commentId: string) {
    try {
      // Get the post and its author
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { 
          id: true, 
          title: true, 
          authorId: true,
          author: {
            select: {
              fullName: true,
            },
          },
        },
      });

      if (!post || post.authorId === commentAuthorId) {
        // Don't notify if post doesn't exist or if author commented on their own post
        return null;
      }

      // Get the comment author's name
      const commentAuthor = await prisma.user.findUnique({
        where: { id: commentAuthorId },
        select: { fullName: true },
      });

      if (!commentAuthor) return null;

      return await this.createNotification({
        userId: post.authorId,
        type: 'COMMENT_ON_POST',
        title: 'New comment on your post',
        message: `${commentAuthor.fullName} commented on "${post.title}"`,
        postId: postId,
        commentId: commentId,
        authorId: commentAuthorId,
      });
    } catch (error) {
      console.error('Error creating post comment notification:', error);
      throw error;
    }
  }

  /**
   * Create notification when someone replies to a comment
   */
  static async notifyCommentReplied(parentCommentId: string, replyAuthorId: string, replyId: string) {
    try {
      // Get the parent comment and its author
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { 
          id: true, 
          authorId: true,
          postId: true,
          post: {
            select: {
              title: true,
            },
          },
          author: {
            select: {
              fullName: true,
            },
          },
        },
      });

      if (!parentComment || parentComment.authorId === replyAuthorId) {
        // Don't notify if comment doesn't exist or if author replied to their own comment
        return null;
      }

      // Get the reply author's name
      const replyAuthor = await prisma.user.findUnique({
        where: { id: replyAuthorId },
        select: { fullName: true },
      });

      if (!replyAuthor) return null;

      return await this.createNotification({
        userId: parentComment.authorId,
        type: 'REPLY_TO_COMMENT',
        title: 'New reply to your comment',
        message: `${replyAuthor.fullName} replied to your comment on "${parentComment.post.title}"`,
        postId: parentComment.postId,
        commentId: replyId,
        authorId: replyAuthorId,
      });
    } catch (error) {
      console.error('Error creating comment reply notification:', error);      throw error;
    }
  }

  /**
   * Create notification when someone upvotes a post
   */
  static async notifyPostUpvoted(postId: string, voterUserId: string) {
    try {
      // Get the post and its author
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { 
          id: true, 
          title: true, 
          authorId: true,
        },
      });

      if (!post || post.authorId === voterUserId) {
        // Don't notify if post doesn't exist or if author upvoted their own post
        return null;
      }

      // Get the voter's name
      const voter = await prisma.user.findUnique({
        where: { id: voterUserId },
        select: { fullName: true },
      });

      if (!voter) return null;

      return await NotificationService.createNotification({
        userId: post.authorId,
        type: 'POST_UPVOTED',
        title: 'Your post was liked',
        message: `${voter.fullName} liked your post "${post.title}"`,
        postId: postId,
        authorId: voterUserId,
      });
    } catch (error) {
      console.error('Error creating post upvote notification:', error);
      throw error;
    }
  }

  /**
   * Notify user when admin resets their password
   */
  static async notifyPasswordReset(userId: string, adminId: string, newPassword: string) {
    try {
      // Get admin info
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { fullName: true, role: true },
      });

      if (!admin) return null;

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, username: true },
      });

      if (!user) return null;      return await NotificationService.createNotification({
        userId: userId,
        type: 'PASSWORD_RESET',
        title: 'Mật khẩu đã được đặt lại',
        message: `Quản trị viên ${admin.fullName} đã đặt lại mật khẩu của bạn. Mật khẩu mới: ${newPassword}. Vui lòng đăng nhập và thay đổi mật khẩu ngay lập tức.`,
        authorId: adminId,
      });
    } catch (error) {
      console.error('Error creating password reset notification:', error);
      throw error;
    }
  }
}
