-- Add Sample Debts for Testing (Fresh Start)
-- This creates 2 customers with outstanding debts

-- Step 1: Insert customers (simple insert, no conflict handling)
INSERT INTO public.customers (name, email, phone, address, credit_limit, is_active)
VALUES 
  ('John Doe', 'john@example.com', '+254712345678', '123 Main St', 50000.00, true),
  ('Jane Smith', 'jane@example.com', '+254712345679', '456 Oak Ave', 30000.00, true);

-- Step 2: Get customer IDs and create transactions
INSERT INTO public.transactions (transaction_number, customer_id, total_amount, payment_method, payment_status)
SELECT 
  'TXN-' || TO_CHAR(NOW(), 'YYYYMMDDHHmmss') || '-' || ROW_NUMBER() OVER(),
  c.id,
  CASE WHEN c.name = 'John Doe' THEN 5000.00 ELSE 3000.00 END,
  'Credit',
  'completed'
FROM public.customers c
WHERE c.name IN ('John Doe', 'Jane Smith');

-- Step 3: Create debts for these customers
INSERT INTO public.debts (customer_id, transaction_id, amount, amount_paid, balance, status, due_date, notes)
SELECT 
  c.id,
  t.id,
  t.total_amount,
  0,
  t.total_amount,
  'pending',
  CURRENT_DATE + INTERVAL '30 days',
  'Credit sale - ' || c.name
FROM public.transactions t
JOIN public.customers c ON t.customer_id = c.id
WHERE c.name IN ('John Doe', 'Jane Smith');

-- Step 4: Verify the data was created
SELECT 'Sample data created successfully!' as message;
SELECT COUNT(*) as total_debts, SUM(balance) as total_outstanding FROM public.debts WHERE balance > 0;
SELECT '---' as separator;
SELECT 'Debts created:' as section;
SELECT d.id, c.name, d.amount, d.balance, d.status FROM public.debts d JOIN public.customers c ON d.customer_id = c.id ORDER BY d.created_at DESC LIMIT 2;
