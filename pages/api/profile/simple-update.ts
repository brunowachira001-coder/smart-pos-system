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
    const { identifier_email, full_name, phone } = req.body;

    if (!identifier_email) {
      return res.status(400).json({ error: 'Email identifier is required' });
    }

    // Try to update first - ONLY update full_name and phone, NOT email
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        full_name: full_name || 'Admin User',
        phone: phone || '',
        updated_at: new Date().toISOString()
      })
      .eq('email', identifier_email)
      .select()
      .single();

    // If update worked, return the data
    if (updateData && !updateError) {
      return res.status(200).json({ success: true, profile: updateData });
    }

    // If user doesn't exist (PGRST116 error), create them
    if (updateError && updateError.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          email: identifier_email,
          full_name: full_name || 'Admin User',
          phone: phone || '',
          role: 'Admin',
          is_active: true
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(200).json({ success: true, profile: insertData });
    }

    // Some other error occurred
    console.error('Update error:', updateError);
    return res.status(500).json({ error: updateError?.message || 'Unknown error' });

  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
