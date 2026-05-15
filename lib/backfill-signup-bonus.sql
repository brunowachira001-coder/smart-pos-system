-- ============================================================
-- BACKFILL SIGNUP BONUS FOR EXISTING CUSTOMERS
-- Awards 500 coins to customers who registered before the fix
-- ============================================================

-- Check how many customers need the bonus
SELECT 
  COUNT(*) as customers_without_bonus,
  COUNT(DISTINCT c.tenant_id) as affected_tenants
FROM customers c
WHERE c.customer_type = 'online'
AND NOT EXISTS (
  SELECT 1 FROM coin_transactions ct
  WHERE ct.customer_id = c.id
  AND ct.source IN ('signup_bonus', 'signup_bonus_backfill')
);

-- Preview customers who will receive the bonus
SELECT 
  c.id,
  c.tenant_id,
  c.name,
  c.email,
  c.created_at as registered_at,
  COALESCE(uc.total_coins, 0) as current_coins
FROM customers c
LEFT JOIN user_coins uc ON c.id = uc.customer_id
WHERE c.customer_type = 'online'
AND NOT EXISTS (
  SELECT 1 FROM coin_transactions ct
  WHERE ct.customer_id = c.id
  AND ct.source IN ('signup_bonus', 'signup_bonus_backfill')
)
ORDER BY c.created_at DESC
LIMIT 20;

-- ============================================================
-- BACKFILL SCRIPT
-- ============================================================

DO $$
DECLARE
  customer_record RECORD;
  awarded_count INTEGER := 0;
  failed_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting signup bonus backfill...';
  
  FOR customer_record IN 
    SELECT c.id, c.tenant_id, c.name, c.email, c.created_at
    FROM customers c
    WHERE c.customer_type = 'online'
    AND NOT EXISTS (
      SELECT 1 FROM coin_transactions ct
      WHERE ct.customer_id = c.id
      AND ct.source IN ('signup_bonus', 'signup_bonus_backfill')
    )
    ORDER BY c.created_at ASC
  LOOP
    BEGIN
      -- Award 500 coins
      PERFORM award_coins(
        customer_record.tenant_id,
        customer_record.id,
        500,
        'signup_bonus_backfill',
        customer_record.id::TEXT,
        'Retroactive welcome bonus - Thank you for joining us!'
      );
      
      awarded_count := awarded_count + 1;
      RAISE NOTICE '[%/%] ✅ Awarded 500 coins to: % (registered: %)', 
        awarded_count, 
        awarded_count + failed_count,
        customer_record.email,
        customer_record.created_at::DATE;
        
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      RAISE WARNING '[%/%] ❌ Failed to award coins to: % - Error: %', 
        awarded_count + failed_count,
        awarded_count + failed_count,
        customer_record.email,
        SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Backfill Complete!';
  RAISE NOTICE '✅ Successfully awarded: % customers', awarded_count;
  RAISE NOTICE '❌ Failed: % customers', failed_count;
  RAISE NOTICE '💰 Total coins awarded: % coins', awarded_count * 500;
  RAISE NOTICE '============================================================';
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check results
SELECT 
  'Total customers' as metric,
  COUNT(*) as count
FROM customers
WHERE customer_type = 'online'

UNION ALL

SELECT 
  'Customers with signup bonus' as metric,
  COUNT(DISTINCT customer_id) as count
FROM coin_transactions
WHERE source IN ('signup_bonus', 'signup_bonus_backfill')

UNION ALL

SELECT 
  'Customers without signup bonus' as metric,
  COUNT(*) as count
FROM customers c
WHERE c.customer_type = 'online'
AND NOT EXISTS (
  SELECT 1 FROM coin_transactions ct
  WHERE ct.customer_id = c.id
  AND ct.source IN ('signup_bonus', 'signup_bonus_backfill')
);

-- Show recent signup bonuses awarded
SELECT 
  c.name,
  c.email,
  ct.amount as coins_awarded,
  ct.source,
  ct.description,
  ct.created_at as awarded_at
FROM coin_transactions ct
JOIN customers c ON ct.customer_id = c.id
WHERE ct.source IN ('signup_bonus', 'signup_bonus_backfill')
ORDER BY ct.created_at DESC
LIMIT 20;

-- Show total coins by customer
SELECT 
  c.name,
  c.email,
  c.created_at as registered_at,
  uc.total_coins,
  uc.lifetime_earned,
  uc.lifetime_spent
FROM customers c
LEFT JOIN user_coins uc ON c.id = uc.customer_id
WHERE c.customer_type = 'online'
ORDER BY c.created_at DESC
LIMIT 20;

-- ============================================================
-- DONE
-- ============================================================

