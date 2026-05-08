import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tenantSlug, email, password, name, phone } = req.body;

    if (!tenantSlug || !email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', tenantSlug)
      .single();

    if (!tenant) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('email', email)
      .single();

    if (existingCustomer) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenant.id,
        name,
        email,
        phone: phone || null,
        password_hash: hashedPassword,
        customer_type: 'online'
      })
      .select('id, name, email, phone')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    // Generate session token (simple JWT-like token)
    const sessionToken = Buffer.from(JSON.stringify({
      customerId: customer.id,
      tenantId: tenant.id,
      email: customer.email,
      timestamp: Date.now()
    })).toString('base64');

    return res.status(201).json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      sessionToken
    });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
