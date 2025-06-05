import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { mapPostToResponse, mapCommentToResponse } from '../utils/mappers';
import type { PostsAPIRequest, CreatePostRequest, CreateCommentRequest, VoteRequest } from '../types/api';

const router = Router();

// Create a new post
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Get user info for denormalized fields
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        tags: JSON.stringify(tags || []),
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
          }
        },
        _count: {
          select: {
            comments: true,
            postVotes: true,
          }
        }
      }
    });

    // Get vote counts
    const upvotes = await prisma.postVote.count({
      where: { postId: post.id, type: 'UPVOTE' }
    });
    const downvotes = await prisma.postVote.count({
      where: { postId: post.id, type: 'DOWNVOTE' }
    });

    return res.status(201).json({
      success: true,
      data: mapPostToResponse(post, upvotes - downvotes),
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all posts with pagination
router.get('/', async (req: PostsAPIRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              role: true,
            }
          },
          _count: {
            select: {
              comments: true,
              postVotes: true,
            }
          }
        }
      }),
      prisma.post.count()
    ]);

    // Get vote counts for each post
    const postsWithVotes = await Promise.all(
      posts.map(async (post) => {
        const upvotes = await prisma.postVote.count({
          where: { postId: post.id, type: 'UPVOTE' }
        });
        const downvotes = await prisma.postVote.count({
          where: { postId: post.id, type: 'DOWNVOTE' }
        });
        return mapPostToResponse(post, upvotes - downvotes);
      })
    );

    return res.json({
      success: true,
      data: postsWithVotes,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search posts
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { keyword = '', tags = '', sortBy = 'newest' } = req.query;
    const tagsArray = tags ? (tags as string).split(',') : [];

    // Build where clause for search
    const where: any = {};
      if (keyword) {
      where.OR = [
        { title: { contains: keyword as string } },
        { content: { contains: keyword as string } }
      ];
    }

    // Order by clause
    let orderBy: any = { createdAt: 'desc' }; // default newest
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          }
        },
        _count: {
          select: {
            comments: true,
            postVotes: true,
          }
        }
      }
    });

    // Filter by tags if provided (since tags are stored as JSON string)
    let filteredPosts = posts;
    if (tagsArray.length > 0) {
      filteredPosts = posts.filter(post => {
        try {
          const postTags = JSON.parse(post.tags as string);
          return tagsArray.some(tag => postTags.includes(tag));
        } catch {
          return false;
        }
      });
    }

    // Get vote counts for each post
    const postsWithVotes = await Promise.all(
      filteredPosts.map(async (post) => {
        const upvotes = await prisma.postVote.count({
          where: { postId: post.id, type: 'UPVOTE' }
        });
        const downvotes = await prisma.postVote.count({
          where: { postId: post.id, type: 'DOWNVOTE' }
        });
        return mapPostToResponse(post, upvotes - downvotes);
      })
    );

    // Sort by votes if requested
    if (sortBy === 'most_votes') {
      postsWithVotes.sort((a, b) => b.votes - a.votes);
    }

    return res.json({
      success: true,
      data: postsWithVotes,
      total: postsWithVotes.length
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific post by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          }
        },
        _count: {
          select: {
            comments: true,
            postVotes: true,
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get vote counts
    const upvotes = await prisma.postVote.count({
      where: { postId: post.id, type: 'UPVOTE' }
    });
    const downvotes = await prisma.postVote.count({
      where: { postId: post.id, type: 'DOWNVOTE' }
    });

    return res.json({
      success: true,
      data: mapPostToResponse(post, upvotes - downvotes)
    });
  } catch (error) {
    console.error('Error getting post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a post (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Delete related votes and comments first
    await prisma.postVote.deleteMany({
      where: { postId }
    });

    await prisma.commentVote.deleteMany({
      where: {
        comment: {
          postId
        }
      }
    });

    await prisma.comment.deleteMany({
      where: { postId }
    });

    // Delete the post
    await prisma.post.delete({
      where: { id: postId }
    });

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a comment on a post
router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const { content, parentCommentId } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get user info for denormalized fields
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // If parentCommentId is provided, check if it exists
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId }
      });

      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
        authorName: user.fullName,
        authorRole: user.role,
        parentCommentId: parentCommentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: mapCommentToResponse(comment, 0),
      message: 'Comment created successfully'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          }
        }
      }
    });

    // Get vote counts for each comment
    const commentsWithVotes = await Promise.all(
      comments.map(async (comment) => {
        const upvotes = await prisma.commentVote.count({
          where: { commentId: comment.id, type: 'UPVOTE' }
        });
        const downvotes = await prisma.commentVote.count({
          where: { commentId: comment.id, type: 'DOWNVOTE' }
        });
        return mapCommentToResponse(comment, upvotes - downvotes);
      })
    );

    return res.json({
      success: true,
      data: commentsWithVotes,
      total: commentsWithVotes.length
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Vote on a post
router.post('/:id/vote', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const { type } = req.body; // 'upvote', 'downvote', or 'remove'
    const userId = req.user!.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has already voted
    const existingVote = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          userId,
          postId
        }
      }
    });

    if (type === 'remove') {
      // Remove existing vote
      if (existingVote) {
        await prisma.postVote.delete({
          where: {
            postId_userId: {
              userId,
              postId
            }
          }
        });
      }
    } else {
      const voteType = type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE';
      
      if (existingVote) {
        // Update existing vote
        await prisma.postVote.update({
          where: {
            postId_userId: {
              userId,
              postId
            }
          },
          data: { type: voteType }
        });
      } else {
        // Create new vote
        await prisma.postVote.create({
          data: {
            userId,
            postId,
            type: voteType
          }
        });
      }
    }

    // Calculate new vote count
    const upvotes = await prisma.postVote.count({
      where: { postId, type: 'UPVOTE' }
    });
    const downvotes = await prisma.postVote.count({
      where: { postId, type: 'DOWNVOTE' }
    });
    const votes = upvotes - downvotes;

    return res.json({
      success: true,
      votes
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
