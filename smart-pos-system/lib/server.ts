import { Server } from 'http';
import { logger } from './logger';

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(server: Server) {
  const signals = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connections
        try {
          const { prisma } = await import('./prisma');
          await prisma.$disconnect();
          logger.info('Database connections closed');
        } catch (error) {
          logger.error('Error closing database connections', error);
        }

        // Close Redis connections
        try {
          const { closeRedis } = await import('./redis');
          await closeRedis();
          logger.info('Redis connections closed');
        } catch (error) {
          logger.error('Error closing Redis connections', error);
        }

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    });
  });
}

/**
 * Unhandled error handlers
 */
export function setupErrorHandlers() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
  });
}
