-- Simple Demo Data Script
-- This creates data only for tables that exist in your database
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CUSTOMERS (50 customers)
-- ============================================
INSERT INTO customers (name, email, phone, address, city, country, customer_type, status, notes, debt_limit)
SELECT 
  'Customer ' || i,
  'customer' || i || '@example.com',
  '+254' || LPAD((700000000 + i)::text, 9, '0'),
  i || ' Main Street',
  CASE (i % 5)
    WHEN 0 THEN 'Nairobi'
    WHEN 1 THEN 'Mombasa'
    WHEN 2 THEN 'Kisumu'
    WHEN 3 THEN 'Nakuru'
    ELSE 'Eldoret'
  END,
  'Kenya',
  CASE WHEN i % 3 = 0 THEN 'wholesale' ELSE 'retail' END,
  'active',
  'Demo customer ' || i,
  CASE WHEN i % 3 = 0 THEN 50000 ELSE 10000 END
FROM generate_series(1, 50) AS i
WHERE NOT EXISTS (
  SELECT 1 FROM customers WHERE email = 'customer' || i || '@example.com'
);

-- ============================================
-- 2. PRODUCTS (100 products)
-- ============================================
INSERT INTO products (name, sku, category, price, stock, cost_price, retail_price, wholesale_price, stock_quantity, minimum_stock_level, status, description, image_url)
SELECT 
  'Product ' || i,
  'SKU-' || LPAD(i::text, 5, '0'),
  CASE (i % 8)
    WHEN 0 THEN 'Electronics'
    WHEN 1 THEN 'Clothing'
    WHEN 2 THEN 'Food & Beverages'
    WHEN 3 THEN 'Home & Garden'
    WHEN 4 THEN 'Sports'
    WHEN 5 THEN 'Books'
    WHEN 6 THEN 'Toys'
    ELSE 'Health & Beauty'
  END,
  (100 + (i * 15))::numeric,
  (100 + (i * 5)),
  (50 + (i * 10))::numeric,
  (100 + (i * 15))::numeric,
  (80 + (i * 12))::numeric,
  (100 + (i * 5)),
  20,
  CASE WHEN i % 20 = 0 THEN 'archived' ELSE 'active' END,
  'Demo product description for item ' || i,
  CASE WHEN i % 10 = 0 THEN 'https://i.imgur.com/placeholder.jpg' ELSE NULL END
FROM generate_series(1, 100) AS i
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE sku = 'SKU-' || LPAD(i::text, 5, '0')
);

-- ============================================
-- 3. DEBTS (60 debt records) - if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'debts') THEN
    INSERT INTO debts (
      customer_id,
      customer_name,
      sale_id,
      total_amount,
      amount_paid,
      amount_remaining,
      status,
      due_date,
      notes,
      created_at
    )
    SELECT 
      c.id,
      c.name,
      'SALE-' || LPAD(i::text, 6, '0'),
      (1000 + (i * 100))::numeric,
      CASE 
        WHEN i % 3 = 0 THEN (500 + (i * 50))::numeric
        ELSE 0
      END,
      CASE 
        WHEN i % 3 = 0 THEN (500 + (i * 50))::numeric
        ELSE (1000 + (i * 100))::numeric
      END,
      CASE 
        WHEN i % 3 = 0 THEN 'Partial'
        WHEN i % 10 = 0 THEN 'Paid'
        ELSE 'Outstanding'
      END,
      NOW() + ((7 + (i % 30)) || ' days')::interval,
      'Demo debt record ' || i,
      NOW() - (i || ' days')::interval
    FROM generate_series(1, 60) AS i
    CROSS JOIN LATERAL (
      SELECT id, name FROM customers ORDER BY RANDOM() LIMIT 1
    ) c;
  END IF;
END $$;

-- ============================================
-- 4. RETURNS (40 return records) - if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns') THEN
    INSERT INTO returns (
      return_id,
      transaction_id,
      customer_id,
      customer_name,
      product_id,
      product_name,
      quantity,
      amount,
      reason,
      status,
      notes,
      return_date
    )
    SELECT 
      gen_random_uuid()::text,
      'TXN-' || LPAD(i::text, 8, '0'),
      c.id,
      c.name,
      p.id,
      p.name,
      (1 + (i % 5)),
      p.retail_price * (1 + (i % 5)),
      CASE (i % 5)
        WHEN 0 THEN 'Defective'
        WHEN 1 THEN 'Wrong Item'
        WHEN 2 THEN 'Changed Mind'
        WHEN 3 THEN 'Damaged'
        ELSE 'Other'
      END,
      CASE (i % 3)
        WHEN 0 THEN 'Pending'
        WHEN 1 THEN 'Approved'
        ELSE 'Rejected'
      END,
      'Demo return record ' || i,
      NOW() - (i || ' days')::interval
    FROM generate_series(1, 40) AS i
    CROSS JOIN LATERAL (
      SELECT id, name FROM customers ORDER BY RANDOM() LIMIT 1
    ) c
    CROSS JOIN LATERAL (
      SELECT id, name, retail_price FROM products ORDER BY RANDOM() LIMIT 1
    ) p;
  END IF;
END $$;

-- ============================================
-- 5. EXPENSES (80 expense records) - if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses') THEN
    INSERT INTO expenses (
      expense_id,
      category,
      subcategory,
      amount,
      description,
      payment_method,
      vendor_name,
      receipt_number,
      expense_date,
      status,
      notes,
      created_by
    )
    SELECT 
      'EXP-' || LPAD(i::text, 6, '0'),
      CASE (i % 8)
        WHEN 0 THEN 'Rent'
        WHEN 1 THEN 'Utilities'
        WHEN 2 THEN 'Salaries'
        WHEN 3 THEN 'Marketing'
        WHEN 4 THEN 'Supplies'
        WHEN 5 THEN 'Maintenance'
        WHEN 6 THEN 'Transport'
        ELSE 'Miscellaneous'
      END,
      'Subcategory ' || i,
      (500 + (i * 100))::numeric,
      'Demo expense description ' || i,
      CASE (i % 3)
        WHEN 0 THEN 'Cash'
        WHEN 1 THEN 'Bank Transfer'
        ELSE 'M-Pesa'
      END,
      'Vendor ' || i,
      'RCP-' || LPAD(i::text, 6, '0'),
      (NOW() - (i || ' days')::interval)::date,
      CASE (i % 3)
        WHEN 0 THEN 'Pending'
        WHEN 1 THEN 'Approved'
        ELSE 'Paid'
      END,
      'Demo expense notes ' || i,
      'Admin'
    FROM generate_series(1, 80) AS i;
  END IF;
END $$;

-- ============================================
-- 6. USERS (25 users) - if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    INSERT INTO users (
      username,
      email,
      password_hash,
      full_name,
      role,
      status,
      phone,
      created_at
    )
    SELECT 
      'user' || i,
      'user' || i || '@example.com',
      '$2a$10$dummyhashfordemopurposes' || i,
      'User ' || i || ' Demo',
      CASE (i % 3)
        WHEN 0 THEN 'admin'
        WHEN 1 THEN 'manager'
        ELSE 'cashier'
      END,
      CASE WHEN i % 10 = 0 THEN 'inactive' ELSE 'active' END,
      '+254' || LPAD((700000000 + i)::text, 9, '0'),
      NOW() - (i || ' days')::interval
    FROM generate_series(1, 25) AS i
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE username = 'user' || i
    );
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  'Customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Debts', COUNT(*) FROM debts WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'debts')
UNION ALL
SELECT 'Returns', COUNT(*) FROM returns WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns')
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses')
UNION ALL
SELECT 'Users', COUNT(*) FROM users WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');
