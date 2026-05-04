import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const { tenantId } = req;
  const db = getAdminDb();

  if (req.method === 'GET') {
    const { category } = req.query;
    let query = db.from('message_templates').select('*').eq('tenant_id', tenantId).order('name');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data: data || [] });
  }

  if (req.method === 'POST') {
    const { name, category, message_text, language } = req.body;
    if (!name || !category || !message_text) return res.status(400).json({ error: 'Missing required fields' });
    const { data, error } = await db.from('message_templates')
      .insert({ name, category, message_text, language: language || 'en', is_active: true, tenant_id: tenantId })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, data });
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'Template ID required' });
    updates.updated_at = new Date().toISOString();
    const { data, error } = await db.from('message_templates')
      .update(updates).eq('id', id).eq('tenant_id', tenantId).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Template ID required' });
    const { error } = await db.from('message_templates').delete().eq('id', id).eq('tenant_id', tenantId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
