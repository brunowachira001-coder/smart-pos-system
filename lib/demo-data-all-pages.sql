-- Demo Data for All Pages with Pagination
-- Run this in Supabase SQL Editor to populate all tables with test data

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
INSERT INTO products (name, sku, category, buying_price, selling_price, wholesale_price, stock_quantity, reorder_level, unit, status, description, image_url)
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
  (50 + (i * 10))::numeric,
  (100 + (i * 15))::numeric,
  (80 + (i * 12))::numeric,
  (100 + (i * 5)),
  20,
  CASE (i % 4)
    WHEN 0 THEN 'piece'
    WHEN 1 THEN 'box'
    WHEN 2 THEN 'kg'
    ELSE 'liter'
  END,
  CASE WHEN i % 20 = 0 THEN 'archived' ELSE 'active' END,
  'Demo product description for item ' || i,
  CASE WHEN i % 10 = 0 THEN 'https://i.imgur.com/placeholder.jpg' ELSE NULL END
FROM generate_series(1, 100) AS i
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE sku = 'SKU-' || LPAD(i::text, 5, '0')
);

-- ============================================
-- 3. TRANSACTIONS (150 transactions)
-- ============================================
DO $$
DECLARE
  customer_ids uuid[];
  product_ids uuid[];
  trans_id text;
  cust_id uuid;
  prod_id uuid;
  i int;
BEGIN
  -- Get customer and product IDs
  SELECT array_agg(id) INTO customer_ids FROM customers LIMIT 50;
  SELECT array_agg(id) INTO product_ids FROM products LIMIT 100;
  
  -- Create 150 transactions
  FOR i IN 1..150 LOOP
    trans_id := 'TXN-' || LPAD(i::text, 8, '0');
    cust_id := customer_ids[1 + (i % array_length(customer_ids, 1))];
    
    INSERT INTO transactions (
      transaction_number,
      customer_id,
      customer_name,
      customer_phone,
      total,
      payment_method,
      status,
      transaction_type,
      created_at
    )
    SELECT 
      trans_id,
      cust_id,
      c.name,
      c.phone,
      (500 + (i * 50))::numeric,
      CASE (i % 4)
        WHEN 0 THEN 'Cash'
        WHEN 1 THEN 'M-Pesa'
        WHEN 2 THEN 'Card'
        ELSE 'Credit'
      END,
      'completed',
      CASE WHEN i % 5 = 0 THEN 'wholesale' ELSE 'retail' END,
      NOW() - (i || ' days')::interval
    FROM customers c
    WHERE c.id = cust_id
    AND NOT EXISTS (
      SELECT 1 FROM transactions WHERE transaction_number = trans_id
    );
    
    -- Add 2-5 items per transaction
    FOR j IN 1..(2 + (i % 4)) LOOP
      prod_id := product_ids[1 + ((i + j) % array_length(product_ids, 1))];
      
      INSERT INTO transaction_items (
        transaction_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        subtotal
      )
      SELECT 
        (SELECT id FROM transactions WHERE transaction_number = trans_id),
        prod_id,
        p.name,
        (1 + (j % 5)),
        p.selling_price,
        p.selling_price * (1 + (j % 5))
      FROM products p
      WHERE p.id = prod_id;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- 4. DEBTS (60 debt records)
-- ============================================
DO $$
DECLARE
  customer_ids uuid[];
  cust_id uuid;
  i int;
BEGIN
  SELECT array_agg(id) INTO customer_ids FROM customers LIMIT 50;
  
  FOR i IN 1..60 LOOP
    cust_id := customer_ids[1 + (i % array_length(customer_ids, 1))];
    
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
      cust_id,
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
    FROM customers c
    WHERE c.id = cust_id;
  END LOOP;
END $$;

-- ============================================
-- 5. RETURNS (40 return records)
-- ============================================
DO $$
DECLARE
  customer_ids uuid[];
  product_ids uuid[];
  transaction_ids uuid[];
  cust_id uuid;
  prod_id uuid;
  trans_id uuid;
  i int;
BEGIN
  SELECT array_agg(id) INTO customer_ids FROM customers LIMIT 50;
  SELECT array_agg(id) INTO product_ids FROM products LIMIT 100;
  SELECT array_agg(id) INTO transaction_ids FROM transactions LIMIT 100;
  
  FOR i IN 1..40 LOOP
    cust_id := customer_ids[1 + (i % array_length(customer_ids, 1))];
    prod_id := product_ids[1 + (i % array_length(product_ids, 1))];
    trans_id := transaction_ids[1 + (i % array_length(transaction_ids, 1))];
    
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
      (SELECT transaction_number FROM transactions WHERE id = trans_id),
      cust_id,
      c.name,
      prod_id,
      p.name,
      (1 + (i % 5)),
      p.selling_price * (1 + (i % 5)),
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
    FROM customers c, products p
    WHERE c.id = cust_id AND p.id = prod_id;
  END LOOP;
END $$;

-- ============================================
-- 6. EXPENSES (80 expense records)
-- ============================================
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

-- ============================================
-- 7. USERS (25 users)
-- ============================================
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

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  'Customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Debts', COUNT(*) FROM debts
UNION ALL
SELECT 'Returns', COUNT(*) FROM returns
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Users', COUNT(*) FROM users;
