-- Inventory Movements Table
-- Tracks all stock changes for complete audit trail

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Movement details
  movement_type VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment', 'return', 'initial_stock'
  stock_type VARCHAR(20) NOT NULL, -- 'Retail', 'Wholesale'
  quantity_change INTEGER NOT NULL, -- Positive for increase, negative for decrease
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  
  -- Related information
  related_transaction_id VARCHAR(100), -- Links to sale transaction ID
  related_return_id VARCHAR(100), -- Links to return ID
  reason TEXT, -- For adjustments or other manual changes
  notes TEXT,
  
  -- User tracking
  performed_by UUID REFERENCES users(id),
  performed_by_name VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant ON inventory_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_transaction ON inventory_movements(related_transaction_id);

-- RLS Policies
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view movements for their tenant
CREATE POLICY inventory_movements_select_policy ON inventory_movements
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- Policy: Users can insert movements for their tenant
CREATE POLICY inventory_movements_insert_policy ON inventory_movements
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- Grant permissions
GRANT SELECT, INSERT ON inventory_movements TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
