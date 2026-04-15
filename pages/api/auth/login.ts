import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authService } from '@/services/auth.service';
import { auditService } from '@/services/audit.service';
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

    // Log session creation to audit log (non-blocking)
    auditService.logAction({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER_SESSION',
      entityId: session.id.toString(),
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      status: 'SUCCESS',
      changes: {
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt,
      },
    }).catch((err: any) => {
      logger.error('Failed to log login action', err);
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
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    
    logger.error('Login failed', error);

    if (error instanceof ValidationError) {
      // Log validation error (non-blocking)
      auditService.logAction({
        userId: BigInt(0),
        action: 'LOGIN_ATTEMPT',
        entityType: 'AUTHENTICATION',
        ipAddress,
        userAgent: userAgent as string,
        status: 'FAILURE',
        errorMessage: error.message,
      }).catch((err: any) => logger.error('Failed to log validation error', err));

      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }

    if (error instanceof AuthenticationError) {
      // Log authentication error (non-blocking)
      auditService.logAction({
        userId: BigInt(0),
        action: 'LOGIN_ATTEMPT',
        entityType: 'AUTHENTICATION',
        ipAddress,
        userAgent: userAgent as string,
        status: 'FAILURE',
        errorMessage: error.message,
      }).catch((err: any) => logger.error('Failed to log auth error', err));

      return res.status(401).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }

    // Log unexpected error (non-blocking)
    auditService.logAction({
      userId: BigInt(0),
      action: 'LOGIN_ATTEMPT',
      entityType: 'AUTHENTICATION',
      ipAddress,
      userAgent: userAgent as string,
      status: 'FAILURE',
      errorMessage: 'Internal server error',
    }).catch((err: any) => logger.error('Failed to log server error', err));

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default errorHandler(handler);
