-- Returns Management Tables for Smart POS

-- Returns Table (Main return records)
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id TEXT UNIQUE NOT NULL,
  transaction_id TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Completed, Refunded
  refund_method TEXT, -- Cash, M-Pesa, Store Credit, Exchange
  refund_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  processed_by TEXT,
  return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return Items Table (For returns with multiple items)
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  condition TEXT, -- New, Used, Damaged
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return Reasons Table (Predefined return reasons)
CREATE TABLE IF NOT EXISTS return_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_reasons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on returns" ON returns FOR ALL USING (true);
CREATE POLICY "Allow all operations on return_items" ON return_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on return_reasons" ON return_reasons FOR ALL USING (true);

-- Insert predefined return reasons
INSERT INTO return_reasons (reason, description) VALUES
('Defective', 'Product is defective or not working properly'),
('Wrong Item', 'Customer received wrong item'),
('Not as Described', 'Product does not match description'),
('Changed Mind', 'Customer changed their mind'),
('Too Expensive', 'Product is too expensive'),
('Found Better Price', 'Customer found better price elsewhere'),
('Damaged', 'Product arrived damaged'),
('Exchanging', 'Customer wants to exchange for different item'),
('A lot', 'Quantity issue'),
('Zzz', 'Other reason'),
('Gzzz', 'Quality issue')
ON CONFLICT (reason) DO NOTHING;

-- Insert sample return data
INSERT INTO returns (return_id, transaction_id, customer_name, customer_id, product_name, quantity, amount, reason, status, return_date, processed_date)
SELECT 
  '464f7c37-cbc5-4e57-9d92-57b7d83c6041',
  'SALE-158044',
  'John Doe',
  c.id,
  'Wireless Headphones',
  6,
  299.94,
  'Zzz',
  'Pending',
  '2025-03-09 11:50:49',
  NULL
FROM customers c WHERE c.name = 'John Doe' LIMIT 1;

INSERT INTO returns (return_id, transaction_id, customer_name, customer_id, product_name, quantity, amount, reason, status, return_date, processed_date)
SELECT 
  '7318bf7e-0d77-413e-813a-f3ab8569dce7d',
  'SALE-915632',
  'Jane Smith',
  c.id,
  'USB-C Cable',
  1,
  9.99,
  'Exchanging',
  'Completed',
  '2025-12-06 13:12:24',
  '2025-12-06 14:00:00'
FROM customers c WHERE c.name = 'Jane Smith' LIMIT 1;

INSERT INTO returns (return_id, transaction_id, customer_name, customer_id, product_name, quantity, amount, reason, status, return_date, processed_date)
SELECT 
  '874bc648-0bb6-4497-8b88-691d4f25cc09',
  'SALE-502614',
  'Bob Johnson',
  c.id,
  'Phone Case',
  10,
  50.00,
  'A lot',
  'Completed',
  '2025-12-05 15:48:17',
  '2025-12-05 16:30:00'
FROM customers c WHERE c.name = 'Bob Johnson' LIMIT 1;

INSERT INTO returns (return_id, transaction_id, customer_name, customer_id, product_name, quantity, amount, reason, status, return_date, processed_date)
SELECT 
  '1ba019e8-a727-43b7-86d6-96e73dd0e417',
  'SALE-180481',
  'Alice Brown',
  c.id,
  'Power Bank',
  12,
  240.00,
  'Too much expensive',
  'Completed',
  '2025-12-03 12:47:23',
  '2025-12-03 14:00:00'
FROM customers c WHERE c.name = 'Alice Brown' LIMIT 1;

INSERT INTO returns (return_id, transaction_id, customer_name, customer_id, product_name, quantity, amount, reason, status, return_date, processed_date)
SELECT 
  '4a05daec-0fbd-4d58-9a7a-b8b2b7be5999',
  'SALE-773559',
  'Charlie Wilson',
  c.id,
  'Bluetooth Speaker',
  2,
  70.00,
  'Gzzz',
  'Completed',
  '2025-12-02 18:24:47',
  '2025-12-02 19:00:00'
FROM customers c WHERE c.name = 'Charlie Wilson' LIMIT 1;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_return_date ON returns(return_date);
CREATE INDEX IF NOT EXISTS idx_returns_transaction_id ON returns(transaction_id);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);

-- Create function to update return status
CREATE OR REPLACE FUNCTION update_return_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  
  IF NEW.status IN ('Completed', 'Refunded', 'Rejected') AND OLD.status != NEW.status THEN
    NEW.processed_date := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_return_timestamp ON returns;
CREATE TRIGGER trigger_update_return_timestamp
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_return_timestamp();

-- Create function to restore inventory on return completion
CREATE OR REPLACE FUNCTION restore_inventory_on_return()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    -- Update product stock
    UPDATE products 
    SET stock = stock + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory restoration
DROP TRIGGER IF EXISTS trigger_restore_inventory ON returns;
CREATE TRIGGER trigger_restore_inventory
  AFTER UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION restore_inventory_on_return();
