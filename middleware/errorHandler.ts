import { NextApiRequest, NextApiResponse } from 'next';
import { AppError, ValidationError } from '@/types';
import { logger } from '@/lib/logger';

export const errorHandler = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      logger.error('API Error', error);

      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code,
          fields: error.fields,
        });
      }

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};
