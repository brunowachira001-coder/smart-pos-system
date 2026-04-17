-- Smart POS Database Schema for Supabase

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  items INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  warehouse TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reorder_level INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  store_email TEXT NOT NULL,
  store_phone TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
  low_stock_threshold INTEGER NOT NULL DEFAULT 50,
  enable_notifications BOOLEAN DEFAULT true,
  enable_auto_backup BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO products (name, sku, price, stock, category, status) VALUES
('Wireless Headphones', 'WH-001', 49.99, 150, 'Electronics', 'Active'),
('USB-C Cable', 'UC-002', 9.99, 500, 'Accessories', 'Active'),
('Phone Case', 'PC-003', 5.00, 300, 'Accessories', 'Active'),
('Screen Protector', 'SP-004', 2.00, 1000, 'Accessories', 'Active'),
('Power Bank', 'PB-005', 20.00, 45, 'Electronics', 'Low Stock'),
('Bluetooth Speaker', 'BS-006', 35.00, 80, 'Electronics', 'Active');

INSERT INTO customers (name, email, phone, total_spent, status) VALUES
('John Doe', 'john@example.com', '555-0001', 2450, 'Active'),
('Jane Smith', 'jane@example.com', '555-0002', 5890, 'Active'),
('Bob Johnson', 'bob@example.com', '555-0003', 1200, 'Inactive'),
('Alice Brown', 'alice@example.com', '555-0004', 8900, 'Active'),
('Charlie Wilson', 'charlie@example.com', '555-0005', 3450, 'Active');

INSERT INTO settings (store_name, store_email, store_phone, currency, tax_rate, low_stock_threshold) VALUES
('Smart POS Store', 'admin@smartpos.com', '+254 700 000 000', 'KES', 16.00, 50);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);
