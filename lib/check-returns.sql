-- Check all returns in the database
SELECT 
  id,
  transaction_id,
  product_id,
  quantity,
  reason,
  status,
  refund_amount,
  created_at
FROM returns
ORDER BY created_at DESC
LIMIT 10;

-- Check returns count
SELECT COUNT(*) as total_returns FROM returns;

-- Check if the return you just made exists
SELECT * FROM returns 
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
