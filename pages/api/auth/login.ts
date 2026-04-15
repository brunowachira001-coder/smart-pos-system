import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { username, password } = req.body;

    // Log for debugging
    console.log('[LOGIN] Attempt with username:', username);

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required',
      });
    }

    // Check hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      console.log('[LOGIN] Success - admin user');
      
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
          tokens: {
            accessToken: `token_${Date.now()}`,
            refreshToken: `refresh_${Date.now()}`,
          },
        },
      });
    }

    // Invalid credentials
    console.log('[LOGIN] Failed - invalid credentials');
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });

  } catch (error: any) {
    console.error('[LOGIN] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
}
