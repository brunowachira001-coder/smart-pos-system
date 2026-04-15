import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authService } from '@/services/auth.service';
import { errorHandler } from '@/middleware/errorHandler';
import { ValidationError, AuthenticationError, ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = authService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: `session-${Date.now()}`,
        refreshToken: `refresh-${Date.now()}`,
        ipAddress: req.headers['x-forwarded-for'] as string,
        userAgent: req.headers['user-agent'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Extract roles and permissions
    const roles = user.roles.map((ur: any) => ur.role.roleName);
    const permissions = user.roles.flatMap((ur: any) => ur.role.permissions.map((rp: any) => rp.permission.permissionName));

    // Generate tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles,
      permissions,
      sessionId: session.id,
    });

    logger.info(`User logged in: ${user.username}`, {
      userId: user.id,
      sessionId: session.id,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        tokens,
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Login failed', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }

    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default errorHandler(handler);
