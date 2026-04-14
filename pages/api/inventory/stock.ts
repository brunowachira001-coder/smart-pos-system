import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { inventoryService } from '@/services/inventory.service';
import { ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', timestamp: new Date() });
  }

  try {
    if (req.method === 'GET') {
      const { productId, branchId } = req.query;

      const inventory = await inventoryService.getInventory(BigInt(productId as string), BigInt(branchId as string));

      return res.status(200).json({
        success: true,
        data: inventory,
        timestamp: new Date(),
      });
    }

    if (req.method === 'PUT') {
      const { productId, branchId, quantity, reason } = req.body;

      const updated = await inventoryService.updateStock(
        BigInt(productId),
        BigInt(branchId),
        quantity,
        reason,
        req.user.userId
      );

      return res.status(200).json({
        success: true,
        data: updated,
        timestamp: new Date(),
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  } catch (error) {
    logger.error('Inventory API error', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default authMiddleware(errorHandler(handler));
