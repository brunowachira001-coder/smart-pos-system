import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.query;

    if (req.method === 'GET') {
      // Get shop settings by user email or get default/first settings
      if (email) {
        // First get user ID from email
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Get shop settings for specific user
        const { data: settings, error } = await supabase
          .from('shop_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          return res.status(500).json({ error: error.message });
        }

        // Return null if no settings exist
        if (!settings) {
          return res.status(200).json({ settings: null });
        }

        return res.status(200).json({ settings });
      } else {
        // Get first/default shop settings (for POS receipt)
        const { data: settings, error } = await supabase
          .from('shop_settings')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          return res.status(500).json({ error: error.message });
        }

        // Return null if no settings exist
        if (!settings) {
          return res.status(200).json({ settings: null });
        }

        return res.status(200).json({ settings });
      }
    } else if (req.method === 'PUT') {
      // Update shop settings
      const { user_email, ...settingsData } = req.body;

      if (!user_email) {
        return res.status(400).json({ error: 'User email is required' });
      }

      // Get user ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', user_email)
        .single();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Upsert shop settings
      const { data, error } = await supabase
        .from('shop_settings')
        .upsert({
          user_id: user.id,
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, settings: data });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Shop settings error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
