import { useState, useEffect } from 'react';

export interface ShopSettings {
  business_name: string;
  business_tagline: string;
  business_type: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  currency_symbol: string;
  tiktok_url?: string;
  instagram_url?: string;
  facebook_url?: string;
}

const defaultSettings: ShopSettings = {
  business_name: 'My Shop',
  business_tagline: '',
  business_type: 'Retail Store',
  business_email: '',
  business_phone: '',
  business_address: '',
  logo_url: '',
  primary_color: '#10b981',
  secondary_color: '#059669',
  currency: 'KES',
  currency_symbol: 'KSh'
};

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Try cache first
      const cached = localStorage.getItem('shopSettings');
      if (cached) {
        setSettings(JSON.parse(cached));
      }

      // Try tenant API first (multi-tenant), fall back to shop-settings
      let data: any = null;
      const tenantRes = await fetch('/api/tenant');
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        if (tenantData.tenant) {
          // Map tenant fields to ShopSettings shape
          data = {
            business_name: tenantData.tenant.business_name,
            business_tagline: tenantData.tenant.tagline,
            business_type: tenantData.tenant.business_type,
            business_email: tenantData.tenant.business_email,
            business_phone: tenantData.tenant.business_phone,
            business_address: '',
            logo_url: tenantData.tenant.logo_url,
            primary_color: tenantData.tenant.primary_color,
            secondary_color: tenantData.tenant.secondary_color,
            currency: tenantData.tenant.currency,
            currency_symbol: tenantData.tenant.currency_symbol,
            instagram_url: tenantData.tenant.instagram_url,
            facebook_url: tenantData.tenant.facebook_url,
            tiktok_url: tenantData.tenant.tiktok_url,
          };
        }
      }

      // Fallback to shop-settings API
      if (!data) {
        const response = await fetch('/api/shop-settings');
        const shopData = await response.json();
        if (response.ok && shopData.settings) {
          data = shopData.settings;
        }
      }

      if (data) {
        setSettings(data);
        localStorage.setItem('shopSettings', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
}
