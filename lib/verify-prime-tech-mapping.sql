-- VERIFY THE USER-TENANT MAPPING WAS CREATED

-- Check if the mapping exists
SELECT 
  tu.id as mapping_id,
  tu.user_id,
  tu.tenant_id,
  tu.role,
  tu.created_at
FROM tenant_users tu
WHERE tu.user_id = '9947007e-e7d3-4b3e-97ab-e69c0c0a964c'
  AND tu.tenant_id = '4b208408-970d-4713-9720-60792e5aa969';

-- Also check what email this user has
SELECT 
  id,
  email,
  email_confirmed_at
FROM auth.users
WHERE id = '9947007e-e7d3-4b3e-97ab-e69c0c0a964c';

-- Check the tenant details
SELECT 
  id,
  business_name,
  slug,
  is_active
FROM tenants
WHERE id = '4b208408-970d-4713-9720-60792e5aa969';

-- Full verification with JOIN
SELECT 
  u.id as user_id,
  u.email,
  tu.role,
  t.id as tenant_id,
  t.business_name,
  t.slug
FROM tenant_users tu
JOIN auth.users u ON tu.user_id = u.id
JOIN tenants t ON tu.tenant_id = t.id
WHERE tu.user_id = '9947007e-e7d3-4b3e-97ab-e69c0c0a964c';
