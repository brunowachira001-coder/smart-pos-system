-- Expense Management Tables for Smart POS

-- Expenses Table (Main expense records)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- Business, Personal, Rent, Utilities, Salaries, Marketing, etc.
  subcategory TEXT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- Cash, M-Pesa, Bank Transfer, Card
  vendor_name TEXT,
  receipt_number TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_period TEXT, -- Daily, Weekly, Monthly, Yearly
  tags TEXT[], -- Array of tags for categorization
  notes TEXT,
  expense_date DATE NOT NULL,
  created_by TEXT,
  approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- Business, Personal
  description TEXT,
  budget_limit DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Attachments Table (For receipts/invoices)
CREATE TABLE IF NOT EXISTS expense_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on expense_categories" ON expense_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on expense_attachments" ON expense_attachments FOR ALL USING (true);

-- Insert predefined expense categories
INSERT INTO expense_categories (name, type, description, budget_limit) VALUES
('Rent', 'Business', 'Office or store rent', 50000.00),
('Utilities', 'Business', 'Electricity, water, internet', 10000.00),
('Salaries', 'Business', 'Employee salaries and wages', 200000.00),
('Marketing', 'Business', 'Advertising and promotions', 30000.00),
('Supplies', 'Business', 'Office and store supplies', 15000.00),
('Transportation', 'Business', 'Fuel, vehicle maintenance', 20000.00),
('Insurance', 'Business', 'Business insurance premiums', 25000.00),
('Maintenance', 'Business', 'Equipment and facility maintenance', 10000.00),
('Professional Services', 'Business', 'Legal, accounting, consulting', 15000.00),
('Inventory Purchase', 'Business', 'Stock purchases', 500000.00),
('Food & Dining', 'Personal', 'Personal meals and dining', 5000.00),
('Entertainment', 'Personal', 'Personal entertainment', 3000.00),
('Healthcare', 'Personal', 'Medical expenses', 10000.00),
('Education', 'Personal', 'Training and courses', 5000.00),
('Miscellaneous', 'Business', 'Other business expenses', 10000.00)
ON CONFLICT (name) DO NOTHING;

-- Insert sample expense data
INSERT INTO expenses (expense_id, category, amount, description, payment_method, vendor_name, expense_date, status, created_by)
VALUES
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Rent', 35000.00, 'Monthly office rent', 'Bank Transfer', 'Property Management Ltd', CURRENT_DATE - INTERVAL '5 days', 'Approved', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Utilities', 4500.00, 'Electricity bill', 'M-Pesa', 'Kenya Power', CURRENT_DATE - INTERVAL '3 days', 'Approved', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Salaries', 85000.00, 'Staff salaries for December', 'Bank Transfer', 'Employees', CURRENT_DATE - INTERVAL '2 days', 'Approved', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Marketing', 12000.00, 'Facebook ads campaign', 'Card', 'Meta Platforms', CURRENT_DATE - INTERVAL '1 day', 'Approved', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Supplies', 3500.00, 'Office stationery', 'Cash', 'Stationery World', CURRENT_DATE, 'Pending', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Transportation', 6000.00, 'Fuel for delivery van', 'Cash', 'Total Petrol Station', CURRENT_DATE, 'Pending', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Maintenance', 8500.00, 'AC repair', 'M-Pesa', 'Cool Air Services', CURRENT_DATE - INTERVAL '4 days', 'Approved', 'Admin'),
  ('EXP-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0'), 'Food & Dining', 2500.00, 'Team lunch', 'Cash', 'Java House', CURRENT_DATE - INTERVAL '1 day', 'Approved', 'Admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expense_attachments_expense_id ON expense_attachments(expense_id);

-- Create function to update expense timestamp
CREATE OR REPLACE FUNCTION update_expense_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_expense_timestamp ON expenses;
CREATE TRIGGER trigger_update_expense_timestamp
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expense_timestamp();

-- Create function to calculate expense totals by category
CREATE OR REPLACE FUNCTION get_expense_totals_by_category()
RETURNS TABLE (
  category TEXT,
  total_amount DECIMAL(10,2),
  expense_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.category,
    SUM(e.amount)::DECIMAL(10,2) as total_amount,
    COUNT(*)::BIGINT as expense_count
  FROM expenses e
  WHERE e.status = 'Approved'
  GROUP BY e.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get monthly expense summary
CREATE OR REPLACE FUNCTION get_monthly_expense_summary(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
  category TEXT,
  total_amount DECIMAL(10,2),
  expense_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.category,
    SUM(e.amount)::DECIMAL(10,2) as total_amount,
    COUNT(*)::BIGINT as expense_count
  FROM expenses e
  WHERE 
    EXTRACT(YEAR FROM e.expense_date) = p_year
    AND EXTRACT(MONTH FROM e.expense_date) = p_month
    AND e.status = 'Approved'
  GROUP BY e.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;
