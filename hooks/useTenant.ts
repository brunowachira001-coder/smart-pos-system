import { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Tenant {
  id: string;
  business_name: string;
  business_type: string;
  business_email: string;
  business_phone: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  sms_sender_name: string;
  currency: string;
  currency_symbol: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  whatsapp?: string;
  subdomain?: string;
}

const defaultTenant: Tenant = {
  id: '',
  business_name: 'My Shop',
  business_type: 'Retail Store',
  business_email: '',
  business_phone: '',
  tagline: '',
  logo_url: '',
  primary_color: '#10b981',
  secondary_color: '#059669',
  sms_sender_name: '',
  currency: 'KES',
  currency_symbol: 'KSh',
};

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant>(defaultTenant);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem('tenant');
      if (cached) {
        const parsed = JSON.parse(cached);
        setTenant(parsed);
        setTenantId(parsed.id);
      }

      // Fetch fresh from API
      const res = await fetch('/api/tenant');
      if (res.ok) {
        const data = await res.json();
        if (data.tenant) {
          setTenant(data.tenant);
          setTenantId(data.tenant.id);
          localStorage.setItem('tenant', JSON.stringify(data.tenant));
        }
      }
    } catch (err) {
      console.error('Failed to load tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  return { tenant, tenantId, loading, refetch: loadTenant };
}
