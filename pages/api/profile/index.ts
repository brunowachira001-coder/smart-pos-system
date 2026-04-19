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
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ profile: data });
}

async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
  const { id, full_name, email, phone, avatar_url } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // First, check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  const updates: any = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  let result;
  
  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: error.message });
    }
    result = data;
  } else {
    // Create new user if doesn't exist
    const newUser = {
      full_name: full_name || 'User',
      email: email,
      phone: phone || '',
      role: 'Admin',
      is_active: true
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return res.status(500).json({ error: error.message });
    }
    result = data;
  }

  res.status(200).json({ profile: result });
}
