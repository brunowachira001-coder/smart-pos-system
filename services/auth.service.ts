import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';
import { encryption } from '@/lib/encryption';
import { AuthenticationError, AuthPayload } from '@/types';
import { logger } from '@/lib/logger';

export class AuthService {
  generateTokens(payload: AuthPayload) {
    try {
      const accessToken = (jwt.sign as any)(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
      });

      const refreshToken = (jwt.sign as any)(
        { userId: payload.userId, sessionId: payload.sessionId },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiry }
      );

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Token generation failed', error);
      throw new AuthenticationError('Failed to generate tokens');
    }
  }

  verifyToken(token: string): AuthPayload {
    try {
      return (jwt.verify as any)(token, config.jwt.secret) as AuthPayload;
    } catch (error) {
      logger.error('Token verification failed', error);
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return (jwt.verify as any)(token, config.jwt.refreshSecret) as any;
    } catch (error) {
      logger.error('Refresh token verification failed', error);
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  hashPassword(password: string): string {
    return encryption.hashPassword(password);
  }

  verifyPassword(password: string, hash: string): boolean {
    return encryption.verifyPassword(password, hash);
  }
}

export const authService = new AuthService();
