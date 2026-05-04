import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/tenant/onboard
 * Creates a new tenant + admin user in one call.
 * 
 * Body:
 *   business_name, business_email, business_phone,
 *   admin_email, admin_password, admin_name
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    business_name,
    business_type = 'Retail Store',
    business_email,
    business_phone,
    tagline = '',
    primary_color = '#10b981',
    currency = 'KES',
    currency_symbol = 'KSh',
    admin_email,
    admin_password,
    admin_name,
  } = req.body;

  if (!business_name || !admin_email || !admin_password) {
    return res.status(400).json({
      error: 'business_name, admin_email, and admin_password are required'
    });
  }

  try {
    // 1. Create tenant
    const subdomain = business_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 30);

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        business_name,
        business_type,
        business_email,
        business_phone,
        tagline,
        primary_color,
        currency,
        currency_symbol,
        sms_sender_name: subdomain.toUpperCase(),
        subdomain,
        is_active: true,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 2. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true,
      user_metadata: { full_name: admin_name, tenant_id: tenant.id }
    });

    if (authError) {
      // Rollback tenant creation
      await supabase.from('tenants').delete().eq('id', tenant.id);
      throw authError;
    }

    // 3. Link user to tenant as owner
    const { error: linkError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        user_id: authData.user.id,
        role: 'owner',
        full_name: admin_name || admin_email,
        is_active: true,
      });

    if (linkError) throw linkError;

    // 4. Insert default message templates for this tenant
    await supabase.from('message_templates').insert([
      {
        tenant_id: tenant.id,
        name: 'Thank You',
        message_text: 'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! 🙏',
        message_type: 'thank_you',
        is_active: true,
      },
      {
        tenant_id: tenant.id,
        name: 'Promotional',
        message_text: 'Hi {customer_name}! {shop_name} has a special offer just for you. Visit us today! 🎉',
        message_type: 'promotional',
        is_active: true,
      }
    ]).select(); // ignore errors if message_templates doesn't exist yet

    return res.status(201).json({
      success: true,
      tenant,
      user: { id: authData.user.id, email: admin_email },
      message: `Tenant "${business_name}" created successfully. Login with ${admin_email}.`
    });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ error: error.message });
  }
}
