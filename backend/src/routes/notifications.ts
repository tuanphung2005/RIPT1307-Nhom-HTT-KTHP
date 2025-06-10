import { Router } from 'express';
import { NotificationService } from '../services/notificationService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

/**
 * Get notifications for the authenticated user
 * GET /api/notifications
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
      return;
    }    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    console.log('🔔 Backend: Getting notifications for user:', userId, `(page: ${page}, limit: ${limit})`);
    
    // Get user info for debugging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, fullName: true, role: true }
    });
    console.log('🔔 Backend: User details:', user);
    
    const notifications = await NotificationService.getUserNotifications(userId, limit, offset);
    console.log('🔔 Backend: Found notifications:', notifications?.length || 0);
    if (notifications && notifications.length > 0) {
      console.log('🔔 Backend: First notification:', notifications[0]);
    }
    
    const unreadCount = await NotificationService.getUnreadCount(userId);
    console.log('🔔 Backend: Unread count:', unreadCount);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        page,
        limit,
        hasMore: notifications.length === limit,
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications' 
    });
  }
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }    const unreadCount = await NotificationService.getUnreadCount(userId);
    res.json({ 
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }    const notification = await NotificationService.markAsRead(notificationId, userId);
    res.json({ 
      success: true,
      message: 'Notification marked as read', 
      data: { notification }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }    const result = await NotificationService.markAllAsRead(userId);
    res.json({ 
      success: true,
      message: 'All notifications marked as read', 
      data: { updatedCount: result.count }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

export default router;
