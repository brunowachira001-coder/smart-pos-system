import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await createUser(req, res);
      case 'PUT':
        return await updateUser(req, res);
      case 'DELETE':
        return await deleteUser(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('User API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { full_name, email, role, phone } = req.body;

  if (!full_name || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create user in Supabase Auth (optional - if you want actual auth users)
  // For now, we'll just create in the users table
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        full_name,
        email,
        role,
        phone: phone || null,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ user: data });
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const { id, full_name, email, role, phone, is_active } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // If email is being changed, check for duplicates
  if (email !== undefined) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    // If email exists and belongs to a different user, reject
    if (existingUser && existingUser.id !== id) {
      return res.status(400).json({ error: 'Email already in use by another account' });
    }
  }

  const updates: any = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (phone !== undefined) updates.phone = phone;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ user: data });
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'User deleted successfully' });
}
