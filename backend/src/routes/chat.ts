import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

// Get chat
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              role: true,
              avatar: true,
            }
          }
        }
      }),
      prisma.chatMessage.count()
    ]);

    // Reverse to show oldest first (chat order)
    const messagesInOrder = messages.reverse();

    return res.json({
      success: true,
      data: messagesInOrder,
      total,
      page,
      limit,
      hasMore: total > page * limit
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send chat
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatar: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create chat
    const chatMessage = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        authorId: userId,
        authorName: user.fullName,
        authorRole: user.role,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatar: true,
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: chatMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
