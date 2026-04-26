import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check which database we're connected to
    const { data: users, error } = await createClient(supabaseUrl!, supabaseKey!)
      .from('users')
      .select('email, full_name')
      .eq('email', 'brunowachira001@gmail.com')
      .single();

    res.status(200).json({
      database: supabaseUrl,
      userFound: !!users,
      user: users,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
