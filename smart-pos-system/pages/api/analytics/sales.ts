import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { analyticsService } from '@/services/analytics.service';
import { ApiResponse, ValidationError } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', timestamp: new Date() });
  }

  try {
    if (req.method === 'GET') {
      const { branchId, date } = req.query;

      if (!branchId || !date) {
        throw new ValidationError('branchId and date are required');
      }

      const report = await analyticsService.getDailySalesReport(BigInt(branchId as string), new Date(date as string));

      return res.status(200).json({
        success: true,
        data: report,
        timestamp: new Date(),
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  } catch (error) {
    logger.error('Analytics API error', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default authMiddleware(errorHandler(handler));
