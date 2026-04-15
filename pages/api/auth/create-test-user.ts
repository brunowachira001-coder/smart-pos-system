import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authService } from '@/services/auth.service';
import { ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Test user already exists',
        timestamp: new Date(),
      });
    }

    // Hash password
    const passwordHash = authService.hashPassword('admin123');

    // Create test user
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@test.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
      },
    });

    logger.info(`Test user created: ${user.username}`);

    res.status(201).json({
      success: true,
      data: {
        message: 'Test user created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        credentials: {
          username: 'admin',
          password: 'admin123',
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Failed to create test user', error);

    res.status(500).json({
      success: false,
      error: 'Failed to create test user',
      timestamp: new Date(),
    });
  }
}

export default handler;
