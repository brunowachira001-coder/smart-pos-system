-- Add logo_url and business_type columns to shop_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE shop_settings 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);

-- Update existing records with default business type
UPDATE shop_settings 
SET business_type = 'Retail Store' 
WHERE business_type IS NULL;
