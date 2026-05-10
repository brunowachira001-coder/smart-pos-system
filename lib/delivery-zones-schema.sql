-- Delivery zones for each tenant's online shop
-- Each zone has a name, list of areas/cities it covers, and a fee

CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  zone_name VARCHAR(100) NOT NULL,          -- e.g. "Nairobi CBD", "Outside Nairobi"
  areas TEXT[] NOT NULL DEFAULT '{}',       -- e.g. ['CBD', 'Nairobi', 'City Centre']
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,            -- convenience flag
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast tenant lookups
CREATE INDEX IF NOT EXISTS idx_delivery_zones_tenant ON delivery_zones(tenant_id);

-- RLS
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY delivery_zones_tenant_isolation ON delivery_zones
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
