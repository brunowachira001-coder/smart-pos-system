-- Check recent returns (main table)
SELECT 
  r.id,
  r.transaction_id,
  r.customer_id,
  r.total_amount,
  r.reason,
  r.status,
  r.created_at,
  c.name as customer_name
FROM returns r
LEFT JOIN customers c ON r.customer_id = c.id
ORDER BY r.created_at DESC 
LIMIT 5;

-- Check return items (details)
SELECT 
  ri.id,
  ri.return_id,
  ri.product_id,
  ri.quantity,
  ri.unit_price,
  ri.subtotal,
  p.name as product_name
FROM return_items ri
LEFT JOIN products p ON ri.product_id = p.id
ORDER BY ri.created_at DESC
LIMIT 10;
