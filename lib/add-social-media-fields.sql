-- Add social media URL fields to shop_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE shop_settings 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Update existing record with placeholder URLs (optional)
-- You can update these in the Shop Settings page later
UPDATE shop_settings 
SET 
  tiktok_url = 'https://www.tiktok.com/@nylawigs',
  instagram_url = 'https://www.instagram.com/nylawigs',
  facebook_url = 'https://www.facebook.com/nylawigs'
WHERE tiktok_url IS NULL;
