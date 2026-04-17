-- Customers Table Schema for Supabase

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Kenya',
  notes TEXT,
  customer_type VARCHAR(20) DEFAULT 'retail', -- 'retail' or 'wholesale'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'blocked'
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  last_purchase_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);

-- Trigger for updated_at (uses function from pos-schema.sql)
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update customer stats after transaction
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer's total purchases and transaction count
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET 
      total_purchases = COALESCE(total_purchases, 0) + NEW.total,
      total_transactions = COALESCE(total_transactions, 0) + 1,
      last_purchase_date = NEW.created_at,
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats when transaction is created
DROP TRIGGER IF EXISTS update_customer_stats_on_transaction ON sales_transactions;
CREATE TRIGGER update_customer_stats_on_transaction
  AFTER INSERT ON sales_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();
