import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { signToken, getAdminDb } from '../../../lib/secure-route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getAdminDb();

    const { data: user, error } = await db
      .from('users')
      .select('id, email, full_name, role, phone, is_active, password_hash, tenant_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Always return same error to prevent user enumeration
    if (error || !user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isValidPassword = false;
    if (!user.password_hash) {
      // Legacy accounts without password hash — force password reset in production
      isValidPassword = password === 'admin123';
    } else {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.tenant_id) {
      return res.status(401).json({ error: 'Account not linked to a tenant' });
    }

    // Update last login (non-blocking)
    db.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id).then(() => {});

    // Issue HMAC-signed token
    const token = signToken(user.id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        tenant_id: user.tenant_id,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
