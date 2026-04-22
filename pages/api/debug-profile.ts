import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      return res.status(500).json({ 
        error: error.message,
        details: error 
      });
    }

    return res.status(200).json({
      found: users && users.length > 0,
      count: users?.length || 0,
      users: users || [],
      message: users && users.length > 0 
        ? 'User found in database' 
        : 'User NOT found in database - will be created on first profile fetch'
    });
  } catch (error: any) {
    console.error('Debug profile error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
