-- Debt Management Tables for Smart POS

-- Debts Table (Main debt records)
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  sale_id TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_remaining DECIMAL(10,2) NOT NULL,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Outstanding', -- Outstanding, Partial, Paid
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debt Payments Table (Payment history)
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- Cash, M-Pesa, Bank Transfer, etc.
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Credit Limits Table
CREATE TABLE IF NOT EXISTS customer_credit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
  credit_limit DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_debt DECIMAL(10,2) DEFAULT 0,
  available_credit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credit ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on debts" ON debts FOR ALL USING (true);
CREATE POLICY "Allow all operations on debt_payments" ON debt_payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on customer_credit" ON customer_credit FOR ALL USING (true);

-- Insert sample debt data
INSERT INTO debts (customer_name, customer_id, sale_id, total_amount, amount_paid, amount_remaining, status, due_date, notes)
SELECT 
  c.name,
  c.id,
  'SALE-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  CASE 
    WHEN c.name = 'John Doe' THEN 900.00
    WHEN c.name = 'Jane Smith' THEN 600.00
    ELSE 0
  END,
  CASE 
    WHEN c.name = 'Jane Smith' THEN 0
    ELSE 0
  END,
  CASE 
    WHEN c.name = 'John Doe' THEN 900.00
    WHEN c.name = 'Jane Smith' THEN 600.00
    ELSE 0
  END,
  CASE 
    WHEN c.name = 'John Doe' THEN 'Partial'
    WHEN c.name = 'Jane Smith' THEN 'Outstanding'
    ELSE 'Paid'
  END,
  CURRENT_DATE + INTERVAL '30 days',
  'Credit sale'
FROM customers c
WHERE c.name IN ('John Doe', 'Jane Smith')
LIMIT 2;

-- Insert customer credit limits
INSERT INTO customer_credit (customer_id, credit_limit, current_debt, available_credit)
SELECT 
  id,
  CASE 
    WHEN name = 'John Doe' THEN 50000.00
    WHEN name = 'Jane Smith' THEN 30000.00
    WHEN name = 'Alice Brown' THEN 100000.00
    ELSE 20000.00
  END,
  CASE 
    WHEN name = 'John Doe' THEN 900.00
    WHEN name = 'Jane Smith' THEN 600.00
    ELSE 0
  END,
  CASE 
    WHEN name = 'John Doe' THEN 49100.00
    WHEN name = 'Jane Smith' THEN 29400.00
    WHEN name = 'Alice Brown' THEN 100000.00
    ELSE 20000.00
  END
FROM customers;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debts_customer_id ON debts(customer_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_customer_credit_customer_id ON customer_credit(customer_id);

-- Create function to update debt status
CREATE OR REPLACE FUNCTION update_debt_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_remaining <= 0 THEN
    NEW.status := 'Paid';
  ELSIF NEW.amount_paid > 0 AND NEW.amount_remaining > 0 THEN
    NEW.status := 'Partial';
  ELSE
    NEW.status := 'Outstanding';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_debt_status ON debts;
CREATE TRIGGER trigger_update_debt_status
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_status();
