-- Shop Settings Table for customizable branding
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name VARCHAR(255) NOT NULL DEFAULT 'Smart Traders',
  business_tagline VARCHAR(255) DEFAULT 'Inventory System',
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  business_address TEXT,
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#10b981', -- emerald-500
  secondary_color VARCHAR(7) DEFAULT '#059669', -- emerald-600
  
  -- System Settings
  currency VARCHAR(10) DEFAULT 'KES',
  currency_symbol VARCHAR(5) DEFAULT 'KSh',
  timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  
  -- Receipt Settings
  receipt_header TEXT,
  receipt_footer TEXT,
  show_logo_on_receipt BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one setting per user
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shop_settings_user_id ON shop_settings(user_id);

-- Insert default settings for existing admin user
INSERT INTO shop_settings (user_id, business_name, business_tagline)
SELECT id, 'Smart Traders', 'Inventory System'
FROM users
WHERE email = 'brunowachira001@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
