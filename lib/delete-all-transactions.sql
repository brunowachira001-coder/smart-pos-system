-- DELETE ALL TRANSACTIONS AND TRANSACTION ITEMS
-- This will remove all confusing demo transactions with NULL product_ids

-- Delete all transaction items first (foreign key dependency)
DELETE FROM transaction_items;

-- Delete all transactions
DELETE FROM transactions;

-- Verify deletion
SELECT COUNT(*) as remaining_transactions FROM transactions;
SELECT COUNT(*) as remaining_transaction_items FROM transaction_items;
