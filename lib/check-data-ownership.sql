-- Check which tenant owns the existing data

-- Check tenants
SELECT id, business_name, slug, created_at 
FROM tenants 
ORDER BY created_at;

-- Check transactions by tenant
SELECT 
  t.business_name,
  t.slug,
  COUNT(tr.id) as transaction_count,
  SUM(tr.total_amount) as total_sales
FROM tenants t
LEFT JOIN transactions tr ON tr.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug
ORDER BY t.created_at;

-- Check debts by tenant
SELECT 
  t.business_name,
  t.slug,
  COUNT(d.id) as debt_count,
  SUM(d.amount) as total_debt
FROM tenants t
LEFT JOIN debts d ON d.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug
ORDER BY t.created_at;

-- Check customers by tenant
SELECT 
  t.business_name,
  t.slug,
  COUNT(c.id) as customer_count
FROM tenants t
LEFT JOIN customers c ON c.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug
ORDER BY t.created_at;

-- Check products by tenant
SELECT 
  t.business_name,
  t.slug,
  COUNT(p.id) as product_count
FROM tenants t
LEFT JOIN products p ON p.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug
ORDER BY t.created_at;
