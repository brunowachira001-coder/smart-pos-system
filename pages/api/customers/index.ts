import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { customerService } from '@/services/customer.service';
import { ApiResponse, ValidationError } from '@/types';

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', timestamp: new Date() });
  }

  try {
    if (req.method === 'POST') {
      const { firstName, lastName, phone, email, address, creditLimit } = req.body;

      if (!firstName || !lastName || !phone || creditLimit === undefined) {
        throw new ValidationError('FirstName, LastName, phone, and creditLimit are required');
      }

      const customer = await customerService.createCustomer({
        firstName,
        lastName,
        phone,
        email,
        address,
        creditLimit,
      });

      return res.status(201).json({
        success: true,
        data: customer,
        timestamp: new Date(),
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default authMiddleware(errorHandler(handler));
