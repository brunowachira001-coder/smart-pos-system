import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, newUsername } = req.body;

    if (!email || !newUsername) {
      return res.status(400).json({ error: 'Email and new username are required' });
    }

    if (newUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if username already exists for a different user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('username', newUsername)
      .single();

    if (existingUser && existingUser.email !== email) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Update username
    const { data, error } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating username:', error);
      return res.status(500).json({ error: 'Failed to update username' });
    }

    res.status(200).json({ success: true, user: data });
  } catch (error: any) {
    console.error('Username change error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
