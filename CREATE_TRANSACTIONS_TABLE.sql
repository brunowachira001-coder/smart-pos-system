-- Create sales_transactions table for dashboard
CREATE TABLE IF NOT EXISTS sales_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  payment_status TEXT NOT NULL DEFAULT 'Completed',
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all on sales_transactions" ON sales_transactions FOR ALL USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_transactions_created_at ON sales_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_customer_id ON sales_transactions(customer_id);

-- Verify
SELECT COUNT(*) as total_transactions FROM sales_transactions;
