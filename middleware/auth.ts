import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';
import { AuthenticationError, AuthorizationError } from '@/types';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: bigint;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    sessionId: bigint;
  };
}

export const authMiddleware = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new AuthenticationError('No token provided');
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      logger.error('Authentication failed', error);
      res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  };
};

export const requireRole = (roles: string[]) => {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const hasRole = req.user.roles.some((role: any) => roles.includes(role));

      if (!hasRole) {
        logger.warn(`Access denied for user ${req.user.userId}`, { requiredRoles: roles });
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      return handler(req, res);
    };
  };
};

export const requirePermission = (permissions: string[]) => {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const hasPermission = req.user.permissions.some((perm: any) => permissions.includes(perm));

      if (!hasPermission) {
        logger.warn(`Permission denied for user ${req.user.userId}`, { requiredPermissions: permissions });
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      return handler(req, res);
    };
  };
};
