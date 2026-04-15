import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class AuditService {
  async logAction(data: {
    userId: bigint;
    action: string;
    entityType: string;
    entityId?: bigint | number | string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
  }) {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          actionType: data.action,
          entityType: data.entityType,
          entityId: data.entityId ? BigInt(data.entityId) : null,
          beforeValues: data.changes,
          ipAddress: data.ipAddress,
          deviceFingerprint: data.userAgent,
          severity: data.status === 'SUCCESS' ? 'INFO' : 'ERROR',
          reason: data.errorMessage,
          username: 'system',
        },
      });

      logger.debug(`Audit log created: ${data.action} on ${data.entityType}`);
      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async getAuditLogs(filters: { userId?: bigint; action?: string; entityType?: string; limit?: number; offset?: number }) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          ...(filters.userId && { userId: filters.userId }),
          ...(filters.action && { action: filters.action }),
          ...(filters.entityType && { entityType: filters.entityType }),
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get audit logs', error);
      throw error;
    }
  }

  async getUserActivity(userId: bigint, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await prisma.auditLog.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get user activity', error);
      throw error;
    }
  }

  async cleanupOldLogs(retentionDays: number) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      logger.info(`Cleaned up ${result.count} old audit logs`);
      return result;
    } catch (error) {
      logger.error('Failed to cleanup audit logs', error);
      throw error;
    }
  }
}

export const auditService = new AuditService();
