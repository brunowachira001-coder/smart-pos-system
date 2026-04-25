-- Add Sample Debts for Testing
-- This creates 2 customers with outstanding debts

-- First, ensure we have customers
INSERT INTO public.customers (name, email, phone, address, credit_limit, is_active)
VALUES 
  ('John Doe', 'john@example.com', '+254712345678', '123 Main St', 50000.00, true),
  ('Jane Smith', 'jane@example.com', '+254712345679', '456 Oak Ave', 30000.00, true)
ON CONFLICT DO NOTHING;

-- Get customer IDs and create transactions
WITH customer_data AS (
  SELECT id, name FROM public.customers WHERE name IN ('John Doe', 'Jane Smith')
)
INSERT INTO public.transactions (transaction_number, customer_id, total_amount, payment_method, payment_status)
SELECT 
  'TXN-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  id,
  CASE WHEN name = 'John Doe' THEN 5000.00 ELSE 3000.00 END,
  'Credit',
  'completed'
FROM customer_data
ON CONFLICT DO NOTHING;

-- Create debts for these customers
WITH customer_data AS (
  SELECT id, name FROM public.customers WHERE name IN ('John Doe', 'Jane Smith')
),
transaction_data AS (
  SELECT t.id as txn_id, c.id as cust_id, c.name, t.total_amount
  FROM public.transactions t
  JOIN customer_data c ON t.customer_id = c.id
  LIMIT 2
)
INSERT INTO public.debts (customer_id, transaction_id, amount, amount_paid, balance, status, due_date, notes)
SELECT 
  cust_id,
  txn_id,
  total_amount,
  0,
  total_amount,
  'pending',
  CURRENT_DATE + INTERVAL '30 days',
  'Credit sale - ' || name
FROM transaction_data
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 'Debts created successfully!' as message;
SELECT COUNT(*) as total_debts, SUM(balance) as total_outstanding FROM public.debts WHERE balance > 0;
