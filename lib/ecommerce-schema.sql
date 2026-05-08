-- ============================================================
-- E-COMMERCE PLATFORM DATABASE SCHEMA
-- Complete online shop integrated with POS system
-- Shares inventory with existing POS
-- ============================================================

-- ============================================================
-- 1. ONLINE CARTS
-- Shopping cart for online customers
-- ============================================================
CREATE TABLE IF NOT EXISTS online_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guest users
  
  -- Cart metadata
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'abandoned', 'converted'
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ONLINE CART ITEMS
-- Items in shopping cart
-- ============================================================
CREATE TABLE IF NOT EXISTS online_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cart_id UUID NOT NULL REFERENCES online_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Product details (snapshot at time of adding)
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Variant details
  size VARCHAR(50),
  color VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CUSTOMER ADDRESSES
-- Delivery addresses for customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Address details
  address_type VARCHAR(20) DEFAULT 'shipping', -- 'shipping', 'billing'
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  
  -- Metadata
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. ONLINE ORDERS
-- E-commerce orders (separate from POS transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Order identification
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Order details
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Shipping address
  shipping_full_name VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20),
  shipping_street TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100) NOT NULL,
  
  -- Order status
  order_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_method VARCHAR(50), -- 'stripe', 'mpesa', 'paypal', 'cod'
  
  -- Payment details
  payment_intent_id VARCHAR(255),
  payment_transaction_id VARCHAR(255),
  paid_at TIMESTAMPTZ,
  
  -- Fulfillment
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ONLINE ORDER ITEMS
-- Line items for online orders
-- ============================================================
CREATE TABLE IF NOT EXISTS online_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES online_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (at time of order)
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Variant details
  size VARCHAR(50),
  color VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. PRODUCT REVIEWS
-- Customer reviews and ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES online_orders(id) ON DELETE SET NULL,
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  
  -- Moderation
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. WISHLISTS
-- Customer saved products
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, customer_id, product_id)
);

-- ============================================================
-- 8. COUPONS
-- Discount codes
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Coupon details
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Constraints
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER, -- Total times can be used
  usage_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER, -- Times per customer
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. COUPON USAGE
-- Track coupon usage per customer
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES online_orders(id) ON DELETE SET NULL,
  
  discount_amount DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. ABANDONED CARTS
-- Track abandoned carts for recovery
-- ============================================================
CREATE TABLE IF NOT EXISTS abandoned_cart_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cart_id UUID NOT NULL REFERENCES online_carts(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Recovery details
  recovery_email_sent BOOLEAN DEFAULT false,
  recovery_email_sent_at TIMESTAMPTZ,
  recovery_sms_sent BOOLEAN DEFAULT false,
  recovery_sms_sent_at TIMESTAMPTZ,
  
  -- Outcome
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  recovery_order_id UUID REFERENCES online_orders(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Online carts
CREATE INDEX IF NOT EXISTS idx_online_carts_tenant ON online_carts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_online_carts_customer ON online_carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_online_carts_session ON online_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_online_carts_status ON online_carts(status);

-- Cart items
CREATE INDEX IF NOT EXISTS idx_online_cart_items_tenant ON online_cart_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_online_cart_items_cart ON online_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_online_cart_items_product ON online_cart_items(product_id);

-- Addresses
CREATE INDEX IF NOT EXISTS idx_customer_addresses_tenant ON customer_addresses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_online_orders_tenant ON online_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_customer ON online_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_number ON online_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON online_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_online_orders_payment_status ON online_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_online_orders_created ON online_orders(created_at DESC);

-- Order items
CREATE INDEX IF NOT EXISTS idx_online_order_items_tenant ON online_order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_online_order_items_order ON online_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_online_order_items_product ON online_order_items(product_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_tenant ON product_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved);

-- Wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_tenant ON wishlists(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_tenant ON coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Coupon usage
CREATE INDEX IF NOT EXISTS idx_coupon_usage_tenant ON coupon_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_customer ON coupon_usage(customer_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE online_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_cart_recovery ENABLE ROW LEVEL SECURITY;

-- Force RLS (no bypass even for table owner)
ALTER TABLE online_carts FORCE ROW LEVEL SECURITY;
ALTER TABLE online_cart_items FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses FORCE ROW LEVEL SECURITY;
ALTER TABLE online_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE online_order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE product_reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE wishlists FORCE ROW LEVEL SECURITY;
ALTER TABLE coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE abandoned_cart_recovery FORCE ROW LEVEL SECURITY;

-- RLS Policies: Tenant isolation
CREATE POLICY online_carts_tenant_isolation ON online_carts
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY online_cart_items_tenant_isolation ON online_cart_items
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY customer_addresses_tenant_isolation ON customer_addresses
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY online_orders_tenant_isolation ON online_orders
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY online_order_items_tenant_isolation ON online_order_items
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY product_reviews_tenant_isolation ON product_reviews
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY wishlists_tenant_isolation ON wishlists
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY coupons_tenant_isolation ON coupons
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY coupon_usage_tenant_isolation ON coupon_usage
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY abandoned_cart_recovery_tenant_isolation ON abandoned_cart_recovery
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON online_carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON online_cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON online_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON online_order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON coupon_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON abandoned_cart_recovery TO authenticated;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_number VARCHAR(50);
  exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM online_orders WHERE order_number = new_number) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DONE
-- ============================================================
-- E-commerce schema created successfully
-- All tables have tenant_id for multi-tenancy
-- RLS policies enforce complete tenant isolation
-- Indexes optimize query performance
