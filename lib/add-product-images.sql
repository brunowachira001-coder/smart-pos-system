-- Add product images to Prime Tech Electronics products
-- This will make the storefront look more professional

-- Get the tenant ID first
DO $$
DECLARE
  prime_tech_id UUID;
BEGIN
  SELECT id INTO prime_tech_id FROM tenants WHERE subdomain = 'prime-tech-electronics-ltd';
  
  -- Update products with placeholder images (you can replace these with real product images later)
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' WHERE name ILIKE '%headphone%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' WHERE name ILIKE '%watch%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400' WHERE name ILIKE '%airpod%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' WHERE name ILIKE '%sunglasses%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400' WHERE name ILIKE '%perfume%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400' WHERE name ILIKE '%sneaker%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' WHERE name ILIKE '%backpack%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400' WHERE name ILIKE '%laptop%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400' WHERE name ILIKE '%charger%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' WHERE name ILIKE '%phone%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' WHERE name ILIKE '%speaker%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' WHERE name ILIKE '%keyboard%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' WHERE name ILIKE '%camera%' AND tenant_id = prime_tech_id;
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1572635196184-84e35138cf62?w=400' WHERE name ILIKE '%mouse%' AND tenant_id = prime_tech_id;
  
  -- For any remaining products without images, use a generic electronics image
  UPDATE products 
  SET image_url = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' 
  WHERE image_url IS NULL AND tenant_id = prime_tech_id;
  
END $$;

-- Verify the update
SELECT name, image_url, retail_price, stock_quantity 
FROM products 
WHERE tenant_id = (SELECT id FROM tenants WHERE subdomain = 'prime-tech-electronics-ltd')
ORDER BY name
LIMIT 20;
