-- Clear all old cart items to start fresh
-- Run this in Supabase SQL Editor

-- First, check what cart items exist
SELECT 
  id,
  session_id,
  tenant_id,
  product_name,
  quantity,
  created_at
FROM cart_items
ORDER BY created_at DESC;

-- Clear ALL cart items (this will force a fresh start)
DELETE FROM cart_items;

-- Verify they're cleared
SELECT COUNT(*) as remaining_cart_items FROM cart_items;
