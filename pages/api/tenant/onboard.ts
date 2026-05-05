import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Generate a URL-friendly slug from the business name
    const baseSlug = business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // spaces/special chars → hyphens
      .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
      .substring(0, 50);

    // Check if slug is taken, append random suffix if needed
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', baseSlug)
      .single();

    const slug = existing
      ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
      : baseSlug;

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
        slug,
        is_active: true,
        onboarding_step: 1,
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

    // 4. Create shop_settings with tenant's business info
    await supabase.from('shop_settings').insert({
      tenant_id: tenant.id,
      user_id: authData.user.id,
      business_name,
      business_type,
      business_email: business_email || '',
      business_phone: business_phone || '',
      business_address: '',
      business_tagline: tagline || '',
      logo_url: '',
      primary_color,
      currency,
      currency_symbol,
      tiktok_url: '',
      instagram_url: '',
      facebook_url: '',
    });

    // 5. Insert default message templates for this tenant
    await supabase.from('message_templates').insert([
      {
        tenant_id: tenant.id,
        name: 'Thank You - After Purchase',
        category: 'after_purchase',
        message_text: 'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! Call us: {shop_phone}',
        language: 'en',
        is_active: true,
      },
      {
        tenant_id: tenant.id,
        name: 'Debt Reminder',
        category: 'debt_reminder',
        message_text: 'Hi {customer_name}, you have an outstanding balance of KES {amount} at {shop_name}. Please settle by your due date. Call: {shop_phone}',
        language: 'en',
        is_active: true,
      },
      {
        tenant_id: tenant.id,
        name: 'Debt Overdue',
        category: 'debt_overdue',
        message_text: 'Hi {customer_name}, your payment of KES {amount} at {shop_name} is overdue. Please contact us urgently at {shop_phone}.',
        language: 'en',
        is_active: true,
      },
      {
        tenant_id: tenant.id,
        name: 'Welcome New Customer',
        category: 'welcome',
        message_text: 'Welcome to {shop_name}, {customer_name}! We are glad to have you. Visit us again soon. {shop_phone}',
        language: 'en',
        is_active: true,
      },
      {
        tenant_id: tenant.id,
        name: 'Win Back - Inactive Customer',
        category: 'win_back',
        message_text: 'Hi {customer_name}, we miss you at {shop_name}! Come back and check out our latest products. Call: {shop_phone}',
        language: 'en',
        is_active: true,
      },
      {
        tenant_id: tenant.id,
        name: 'Promotional Offer',
        category: 'promotion',
        message_text: 'Hi {customer_name}, {shop_name} has a special offer just for you! Visit us today or call {shop_phone} for details.',
        language: 'en',
        is_active: true,
      },
    ]);

    return res.status(201).json({
      success: true,
      tenant,
      user: { id: authData.user.id, email: admin_email },
      message: `Tenant "${business_name}" created successfully. Login with ${admin_email}.`,
      shopUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smart-pos-system-peach.vercel.app'}/s/${slug}`
    });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ error: error.message });
  }
}
