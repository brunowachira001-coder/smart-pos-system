-- Add seller rating for Nyla Wigs (the only missing piece)
INSERT INTO seller_ratings (
  tenant_id, 
  overall_rating, 
  item_as_described, 
  communication, 
  shipping_speed,
  total_orders,
  positive_ratings
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  5.0,
  5.0,
  5.0,
  5.0,
  0,
  0
)
ON CONFLICT (tenant_id) DO NOTHING;
