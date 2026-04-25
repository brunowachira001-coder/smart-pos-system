-- Check what's in the debts table
SELECT 'Debts in database:' as info;
SELECT id, customer_id, amount, balance, status, created_at FROM public.debts;

SELECT '---' as separator;
SELECT 'Customers in database:' as info;
SELECT id, name, credit_limit FROM public.customers;

SELECT '---' as separator;
SELECT 'Transactions in database:' as info;
SELECT id, transaction_number, customer_id, total_amount FROM public.transactions;
