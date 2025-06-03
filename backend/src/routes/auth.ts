import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { mapUserToResponse, mapToUserRole } from '@/utils/mappers';
import { authenticateToken, AuthRequest } from '@/middleware/auth';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '@/types/api';

const router = express.Router();

// Login
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        user: mapUserToResponse(user),
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password, fullName, role = 'student' }: RegisterRequest = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        role: mapToUserRole(role),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=52c41a&color=fff`
      }
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Registration successful',
      data: {
        user: mapUserToResponse(user),
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: req.user
    };

    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
