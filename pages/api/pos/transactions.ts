import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { posService } from '@/services/pos.service';
import { ApiResponse } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', timestamp: new Date() });
  }

  try {
    if (req.method === 'POST') {
      // Create transaction
      const transaction = await posService.createTransaction({
        branchId: BigInt(req.body.branchId),
        customerId: req.body.customerId ? BigInt(req.body.customerId) : undefined,
        items: req.body.items,
        discountAmount: req.body.discountAmount || 0,
        taxAmount: req.body.taxAmount || 0,
        createdBy: req.user.userId,
      });

      logger.info(`Transaction created: ${transaction.transactionNumber}`);

      return res.status(201).json({
        success: true,
        data: transaction,
        timestamp: new Date(),
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  } catch (error) {
    logger.error('Transaction API error', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default authMiddleware(errorHandler(handler));
