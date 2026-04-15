import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types';

async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed', timestamp: new Date() });
  }

  try {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password: password ? '***' : 'missing' });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
        timestamp: new Date(),
      });
    }

    // Hardcoded admin credentials for testing
    // Username: admin, Password: admin123
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      const tokens = {
        accessToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refreshToken: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      console.log('Login successful for admin');

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
          },
          tokens,
          session: {
            id: 1,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
        timestamp: new Date(),
      });
    }

    console.log('Login failed: Invalid credentials');

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      timestamp: new Date(),
    });
  }
}

export default handler;
