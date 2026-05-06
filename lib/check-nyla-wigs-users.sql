-- Check Nyla Wigs tenant and its users
SELECT id, business_name, slug FROM tenants WHERE business_name ILIKE '%nyla%';

-- Check users linked to Nyla Wigs
SELECT u.id, u.email, u.role, u.system_role, u.tenant_id, t.business_name
FROM users u
JOIN tenants t ON t.id = u.tenant_id
WHERE t.business_name ILIKE '%nyla%';
