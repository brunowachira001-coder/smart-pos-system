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
  business_name: 'Nyla Wigs',
  business_tagline: 'Premium Quality Wigs',
  business_type: 'Retail Store',
  business_email: 'info@nylawigs.com',
  business_phone: '0789715533',
  business_address: 'Nairobi, Kenya',
  logo_url: '/nyla-logo.png',
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

      // Fetch fresh data
      const response = await fetch('/api/shop-settings');
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings(data.settings);
        localStorage.setItem('shopSettings', JSON.stringify(data.settings));
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
}
