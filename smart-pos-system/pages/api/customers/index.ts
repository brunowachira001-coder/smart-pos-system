import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { customerService } from '@/services/customer.service';
import { ApiResponse, ValidationError } from '@/types';
import { logger } from '@/lib/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', timestamp: new Date() });
  }

  try {
    if (req.method === 'POST') {
      const { name, phone, email, address, creditLimit } = req.body;

      if (!name || !phone || creditLimit === undefined) {
        throw new ValidationError('Name, phone, and creditLimit are required');
      }

      const customer = await customerService.createCustomer({
        name,
        phone,
        email,
        address,
        creditLimit,
      });

      logger.info(`Customer created: ${customer.name}`);

      return res.status(201).json({
        success: true,
        data: customer,
        timestamp: new Date(),
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  } catch (error) {
    logger.error('Customer API error', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default authMiddleware(errorHandler(handler));
