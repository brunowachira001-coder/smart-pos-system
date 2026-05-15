-- ============================================
-- MySQL Schema for Smart POS System
-- Converted from PostgreSQL/Supabase
-- Date: May 13, 2026
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS smart_pos 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smart_pos;

-- ============================================
-- Core Tables
-- ============================================

-- Tenants table
CREATE TABLE tenants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  business_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#10b981',
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subdomain (subdomain),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Users table
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
  phone VARCHAR(20),
  is_active TINYINT(1) DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_email (tenant_id, email),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB;

-- Shop Settings table
CREATE TABLE shop_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) UNIQUE NOT NULL,
  logo_url TEXT,
  business_tagline TEXT,
  primary_color VARCHAR(7) DEFAULT '#10b981',
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  whatsapp_number VARCHAR(20),
  background_image_url TEXT,
  background_video_url TEXT,
  ai_assistant_enabled TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB;

-- ============================================
-- Product Tables
-- ============================================

-- Products table
CREATE TABLE products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  retail_price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  stock_quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  barcode VARCHAR(100),
  sku VARCHAR(100),
  image_url TEXT,
  description TEXT,
  -- PostgreSQL arrays converted to JSON
  colors JSON COMMENT 'Array of color strings',
  sizes JSON COMMENT 'Array of size strings',
  tags JSON COMMENT 'Array of tag strings',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_category (category),
  INDEX idx_barcode (barcode),
  INDEX idx_sku (sku),
  INDEX idx_stock (stock_quantity),
  INDEX idx_is_active (is_active),
  FULLTEXT idx_name_description (name, description)
) ENGINE=InnoDB;

-- Product Images table (for immersive shop)
CREATE TABLE product_images (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  image_url TEXT NOT NULL,
  image_type ENUM('primary', 'angle', 'lifestyle', 'size_reference', 'detail') DEFAULT 'angle',
  display_order INT DEFAULT 0,
  alt_text VARCHAR(255),
  width INT,
  height INT,
  file_size_kb INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_product_order (tenant_id, product_id, display_order),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_product_id (product_id),
  INDEX idx_product_order (product_id, display_order)
) ENGINE=InnoDB;

-- Product Videos table (for immersive shop)
CREATE TABLE product_videos (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  video_url TEXT NOT NULL,
  video_type ENUM('mp4', 'webm', 'youtube', 'vimeo') DEFAULT 'mp4',
  thumbnail_url TEXT,
  duration_seconds INT,
  display_order INT DEFAULT 0,
  title VARCHAR(255),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_product_id (product_id),
  INDEX idx_product_order (product_id, display_order)
) ENGINE=InnoDB;

-- Product Recommendations Cache
CREATE TABLE product_recommendations_cache (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  -- PostgreSQL UUID[] converted to JSON
  recommended_product_ids JSON NOT NULL COMMENT 'Array of product UUIDs',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_product (tenant_id, product_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_product_id (product_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- ============================================
-- Customer Tables
-- ============================================

-- Customers table
CREATE TABLE customers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  loyalty_points INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Transaction Tables
-- ============================================

-- Transactions table
CREATE TABLE transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  customer_id CHAR(36),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'mpesa', 'card', 'credit', 'bank_transfer') DEFAULT 'cash',
  payment_reference VARCHAR(255),
  status ENUM('completed', 'pending', 'cancelled', 'refunded') DEFAULT 'completed',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_user_id (user_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status),
  INDEX idx_payment_method (payment_method)
) ENGINE=InnoDB;

-- Transaction Items table
CREATE TABLE transaction_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  transaction_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB;

-- ============================================
-- E-commerce Tables
-- ============================================

-- Online Orders table
CREATE TABLE online_orders (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  payment_method ENUM('mpesa', 'cash_on_delivery', 'card', 'bank_transfer') DEFAULT 'mpesa',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_order_status (order_status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Online Order Items table
CREATE TABLE online_order_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES online_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB;

-- ============================================
-- Inventory Tables
-- ============================================

-- Inventory Movements table
CREATE TABLE inventory_movements (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  movement_type ENUM('restock', 'sale', 'adjustment', 'return', 'damage', 'transfer') NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_id CHAR(36) COMMENT 'Transaction or order ID',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_product_id (product_id),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Debt Management Tables
-- ============================================

-- Debts table
CREATE TABLE debts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  transaction_id CHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  due_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

-- Debt Payments table
CREATE TABLE debt_payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  debt_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'mpesa', 'card', 'bank_transfer') DEFAULT 'cash',
  payment_reference VARCHAR(255),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
  INDEX idx_debt_id (debt_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Returns Management Tables
-- ============================================

-- Returns table
CREATE TABLE returns (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  transaction_id CHAR(36),
  customer_id CHAR(36),
  total_amount DECIMAL(10, 2) NOT NULL,
  refund_method ENUM('cash', 'mpesa', 'card', 'credit') DEFAULT 'cash',
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  reason VARCHAR(255),
  notes TEXT,
  processed_by CHAR(36),
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Return Items table
CREATE TABLE return_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  return_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_return_id (return_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB;

-- ============================================
-- Expenses Management Tables
-- ============================================

-- Expenses table
CREATE TABLE expenses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  payment_method ENUM('cash', 'mpesa', 'card', 'bank_transfer') DEFAULT 'cash',
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_category (category),
  INDEX idx_expense_date (expense_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- SMS Communication Tables
-- ============================================

-- SMS Messages table
CREATE TABLE sms_messages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  customer_id CHAR(36),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),
  cost DECIMAL(10, 4),
  error_message TEXT,
  sent_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- SMS Templates table
CREATE TABLE sms_templates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  template_type ENUM('welcome', 'purchase', 'debt_reminder', 'promotion', 'custom') NOT NULL,
  message_template TEXT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_template_type (template_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Delivery Zones Tables
-- ============================================

-- Delivery Zones table
CREATE TABLE delivery_zones (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  zone_name VARCHAR(255) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  estimated_days INT DEFAULT 2,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_products_tenant_category ON products(tenant_id, category);
CREATE INDEX idx_products_tenant_stock ON products(tenant_id, stock_quantity);
CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, created_at);
CREATE INDEX idx_orders_tenant_status ON online_orders(tenant_id, order_status);

-- ============================================
-- Views (MySQL equivalent of PostgreSQL views)
-- ============================================

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.tenant_id,
  p.name,
  p.category,
  p.stock_quantity,
  p.reorder_level,
  p.retail_price
FROM products p
WHERE p.stock_quantity <= p.reorder_level
  AND p.is_active = 1;

-- Customer debt summary view
CREATE OR REPLACE VIEW customer_debt_summary AS
SELECT 
  c.id AS customer_id,
  c.tenant_id,
  c.name AS customer_name,
  c.phone,
  COUNT(d.id) AS total_debts,
  SUM(d.amount) AS total_debt_amount,
  SUM(d.balance) AS total_balance,
  SUM(CASE WHEN d.status = 'overdue' THEN d.balance ELSE 0 END) AS overdue_amount
FROM customers c
LEFT JOIN debts d ON c.id = d.customer_id
GROUP BY c.id, c.tenant_id, c.name, c.phone;

-- ============================================
-- Triggers (for automatic updates)
-- ============================================

-- Update customer balance on debt payment
DELIMITER //
CREATE TRIGGER after_debt_payment_insert
AFTER INSERT ON debt_payments
FOR EACH ROW
BEGIN
  UPDATE debts 
  SET 
    amount_paid = amount_paid + NEW.amount,
    balance = amount - (amount_paid + NEW.amount),
    status = CASE 
      WHEN amount - (amount_paid + NEW.amount) = 0 THEN 'paid'
      WHEN amount - (amount_paid + NEW.amount) < amount THEN 'partial'
      ELSE status
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.debt_id;
  
  UPDATE customers c
  JOIN debts d ON c.id = d.customer_id
  SET c.current_balance = c.current_balance - NEW.amount
  WHERE d.id = NEW.debt_id;
END//
DELIMITER ;

-- Update product stock on transaction
DELIMITER //
CREATE TRIGGER after_transaction_item_insert
AFTER INSERT ON transaction_items
FOR EACH ROW
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
END//
DELIMITER ;

-- ============================================
-- Initial Data (Optional)
-- ============================================

-- Insert default tenant (for testing)
-- INSERT INTO tenants (id, business_name, subdomain, primary_color)
-- VALUES (UUID(), 'Demo Store', 'demo', '#10b981');

-- ============================================
-- Grants (for application user)
-- ============================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON smart_pos.* TO 'pos_user'@'%';
-- FLUSH PRIVILEGES;

-- ============================================
-- End of Schema
-- ============================================
