import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { posService } from '@/services/pos.service';
import { ApiResponse, ValidationError } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', timestamp: new Date() });
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
    }

    const { q, branchId, limit } = req.query;

    if (!q || !branchId) {
      throw new ValidationError('Query and branchId are required');
    }

    const products = await posService.searchProducts(
      q as string,
      BigInt(branchId as string),
      limit ? parseInt(limit as string) : 20
    );

    logger.info(`Product search: ${q}`);

    res.status(200).json({
      success: true,
      data: products,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Product search error', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default authMiddleware(errorHandler(handler));
