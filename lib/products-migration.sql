-- Products Table Migration - Add Missing Fields
-- Run this in Supabase SQL Editor to add new fields to existing products table

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_stock_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS variant_of TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Update existing data: copy price to retail_price and stock to stock_quantity
UPDATE products 
SET 
  retail_price = COALESCE(retail_price, price),
  stock_quantity = COALESCE(stock_quantity, stock),
  cost_price = COALESCE(cost_price, price * 0.6),
  wholesale_price = COALESCE(wholesale_price, price * 0.85)
WHERE retail_price IS NULL OR stock_quantity IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_minimum_stock ON products(minimum_stock_level);
CREATE INDEX IF NOT EXISTS idx_products_variant_of ON products(variant_of);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Add check constraint for stock quantity
ALTER TABLE products 
ADD CONSTRAINT check_stock_quantity CHECK (stock_quantity >= 0);

-- Add check constraint for prices
ALTER TABLE products 
ADD CONSTRAINT check_prices CHECK (
  cost_price >= 0 AND 
  retail_price >= 0 AND 
  wholesale_price >= 0
);
