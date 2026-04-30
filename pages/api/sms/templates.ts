import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all templates or filter by category
      const { category } = req.query;

      let query = supabase
        .from('message_templates')
        .select('*')
        .order('category', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    if (req.method === 'POST') {
      // Create new template
      const { name, category, message_text, ai_personalization, language } = req.body;

      if (!name || !category || !message_text) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          name,
          category,
          message_text,
          ai_personalization: ai_personalization !== undefined ? ai_personalization : true,
          language: language || 'en',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data
      });
    }

    if (req.method === 'PUT') {
      // Update template
      const { id, name, category, message_text, ai_personalization, language, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Template ID required' });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (category) updateData.category = category;
      if (message_text) updateData.message_text = message_text;
      if (ai_personalization !== undefined) updateData.ai_personalization = ai_personalization;
      if (language) updateData.language = language;
      if (is_active !== undefined) updateData.is_active = is_active;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('message_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        data
      });
    }

    if (req.method === 'DELETE') {
      // Delete template
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Template ID required' });
      }

      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Templates error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
