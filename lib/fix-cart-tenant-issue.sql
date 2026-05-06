-- QUICK FIX: Clear all cart items to start fresh
-- This will remove any orphaned cart items without tenant_id

DELETE FROM cart_items;

-- Verify cart is empty
SELECT COUNT(*) as remaining_cart_items FROM cart_items;
