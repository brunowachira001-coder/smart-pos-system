/**
 * PUT /api/tenant/update-slug
 * Allows tenant owner/admin to update their shop slug.
 * Validates uniqueness and format before saving.
 */
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantId } = req;
  const { slug } = req.body;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  // Validate slug format: lowercase letters, numbers, hyphens only, 3-50 chars
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
  if (!slugRegex.test(slug)) {
    return res.status(400).json({
      error: 'Slug must be 3-50 characters, lowercase letters, numbers and hyphens only. Cannot start or end with a hyphen.'
    });
  }

  const db = getAdminDb();

  // Check uniqueness — exclude current tenant
  const { data: existing } = await db
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .neq('id', tenantId)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'This slug is already taken. Please choose another.' });
  }

  const { data, error } = await db
    .from('tenants')
    .update({ slug, updated_at: new Date().toISOString() })
    .eq('id', tenantId)
    .select('id, slug')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ slug: data.slug });
});
