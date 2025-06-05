import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import type { VoteRequest } from '../types/api';

const router = Router();

// Vote on a comment
router.post('/:id/vote', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;
    const { type } = req.body; // 'upvote', 'downvote', or 'remove'
    const userId = req.user!.id;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has already voted
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        commentId_userId: {
          userId,
          commentId
        }
      }
    });

    if (type === 'remove') {
      // Remove existing vote
      if (existingVote) {
        await prisma.commentVote.delete({
          where: {
            commentId_userId: {
              userId,
              commentId
            }
          }
        });
      }
    } else {
      const voteType = type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE';
      
      if (existingVote) {
        // Update existing vote
        await prisma.commentVote.update({
          where: {
            commentId_userId: {
              userId,
              commentId
            }
          },
          data: { type: voteType }
        });
      } else {
        // Create new vote
        await prisma.commentVote.create({
          data: {
            userId,
            commentId,
            type: voteType
          }
        });
      }
    }

    // Calculate new vote count
    const upvotes = await prisma.commentVote.count({
      where: { commentId, type: 'UPVOTE' }
    });
    const downvotes = await prisma.commentVote.count({
      where: { commentId, type: 'DOWNVOTE' }
    });
    const votes = upvotes - downvotes;

    return res.json({
      success: true,
      votes
    });
  } catch (error) {
    console.error('Error voting on comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
