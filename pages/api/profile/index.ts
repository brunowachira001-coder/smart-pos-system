import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getProfile(req, res);
      case 'PUT':
        return await updateProfile(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getProfile(req: NextApiRequest, res: NextApiResponse) {
  const { email, id } = req.query;

  if (!email && !id) {
    return res.status(400).json({ error: 'Email or ID is required' });
  }

  let query = supabase.from('users').select('*');
  
  if (id && typeof id === 'string') {
    query = query.eq('id', id);
  } else if (email && typeof email === 'string') {
    query = query.eq('email', email);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ profile: data });
}

async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
  const { id, full_name, email, phone, avatar_url } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Build updates object
  const updates: any = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  updates.updated_at = new Date().toISOString();

  // Update user by ID
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({ profile: data });
}
