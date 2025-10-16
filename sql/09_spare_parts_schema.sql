-- Spare Parts Feature Schema
-- Created: 2025-01-14
-- Description: Tables for spare parts catalog and bulk orders

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SPARE PARTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  part_code VARCHAR(100) UNIQUE,
  category VARCHAR(100) NOT NULL CHECK (category IN ('ac', 'refrigerator')),
  sub_category VARCHAR(100),
  brand VARCHAR(100),
  appliance_models TEXT[], -- Compatible models
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  bulk_price DECIMAL(10,2), -- Price for bulk orders
  bulk_min_quantity INTEGER DEFAULT 5, -- Minimum quantity for bulk price
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  
  -- Images
  primary_image_url TEXT,
  image_gallery TEXT[], -- Array of image URLs
  
  -- Details
  description TEXT,
  specifications JSONB DEFAULT '{}', -- Flexible specs storage
  warranty_months INTEGER,
  is_genuine BOOLEAN DEFAULT true,
  
  -- SEO
  slug VARCHAR(255) UNIQUE NOT NULL,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BULK ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS spare_parts_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  delivery_location TEXT NOT NULL,
  
  -- Order Details
  items JSONB NOT NULL, -- Array of {part_id, part_name, quantity, unit_price, total_price}
  total_amount DECIMAL(10,2) NOT NULL,
  bulk_discount_applied BOOLEAN DEFAULT false,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'delivered', 'cancelled')
  ),
  
  -- Communication
  source VARCHAR(50) DEFAULT 'form' CHECK (source IN ('chat', 'form', 'whatsapp', 'phone')),
  chat_conversation_id UUID,
  whatsapp_conversation_started BOOLEAN DEFAULT false,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Spare Parts Indexes
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON spare_parts(category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_brand ON spare_parts(brand);
CREATE INDEX IF NOT EXISTS idx_spare_parts_sub_category ON spare_parts(sub_category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_availability ON spare_parts(is_available);
CREATE INDEX IF NOT EXISTS idx_spare_parts_slug ON spare_parts(slug);
CREATE INDEX IF NOT EXISTS idx_spare_parts_stock ON spare_parts(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_spare_parts_created_at ON spare_parts(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_spare_parts_search ON spare_parts 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(part_code, '') || ' ' || brand));

-- Orders Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON spare_parts_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON spare_parts_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON spare_parts_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON spare_parts_orders(order_number);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for spare_parts
DROP TRIGGER IF EXISTS update_spare_parts_updated_at ON spare_parts;
CREATE TRIGGER update_spare_parts_updated_at
  BEFORE UPDATE ON spare_parts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for spare_parts_orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON spare_parts_orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON spare_parts_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts_orders ENABLE ROW LEVEL SECURITY;

-- Spare Parts Policies
-- Public can view available parts
DROP POLICY IF EXISTS "Public can view available spare parts" ON spare_parts;
CREATE POLICY "Public can view available spare parts"
  ON spare_parts FOR SELECT
  USING (is_available = true);

-- Authenticated users (admin) can do everything
DROP POLICY IF EXISTS "Admins can manage spare parts" ON spare_parts;
CREATE POLICY "Admins can manage spare parts"
  ON spare_parts FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders Policies
-- Anyone can create orders (for form submissions)
DROP POLICY IF EXISTS "Anyone can create orders" ON spare_parts_orders;
CREATE POLICY "Anyone can create orders"
  ON spare_parts_orders FOR INSERT
  WITH CHECK (true);

-- Customers can view their own orders
DROP POLICY IF EXISTS "Customers can view own orders" ON spare_parts_orders;
CREATE POLICY "Customers can view own orders"
  ON spare_parts_orders FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Admins can manage all orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON spare_parts_orders;
CREATE POLICY "Admins can manage all orders"
  ON spare_parts_orders FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Format: CW-YYYYMMDD-XXXX
  SELECT COUNT(*) + 1 INTO counter
  FROM spare_parts_orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'CW-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check low stock parts
CREATE OR REPLACE FUNCTION get_low_stock_parts()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  part_code VARCHAR,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.part_code,
    sp.stock_quantity,
    sp.low_stock_threshold
  FROM spare_parts sp
  WHERE sp.is_available = true
    AND sp.stock_quantity <= sp.low_stock_threshold
  ORDER BY sp.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (Sample parts for testing)
-- ============================================================================

-- Insert sample AC parts
INSERT INTO spare_parts (
  name, part_code, category, sub_category, brand, appliance_models,
  price, bulk_price, bulk_min_quantity,
  stock_quantity, low_stock_threshold, is_available,
  primary_image_url, description, specifications, warranty_months, is_genuine, slug, meta_description
) VALUES
(
  'AC Compressor LG 1.5 Ton',
  'LG-COMP-1.5T',
  'ac',
  'compressors',
  'LG',
  ARRAY['LG Split AC 1.5 Ton', 'LG Window AC 1.5 Ton'],
  8500.00,
  7500.00,
  5,
  12,
  5,
  true,
  '/images/spare-parts/placeholder-compressor.jpg',
  'Genuine LG compressor for 1.5 ton AC units. High efficiency and reliable performance.',
  '{"power": "1.5 ton", "voltage": "220V", "refrigerant": "R32", "warranty": "12 months"}'::jsonb,
  12,
  true,
  'ac-compressor-lg-1-5-ton',
  'Buy genuine LG AC compressor for 1.5 ton units. Bulk discounts available. Fast delivery in Kerala.'
),
(
  'AC Remote Control Universal',
  'UNI-REMOTE-AC',
  'ac',
  'remote-controls',
  'Universal',
  ARRAY['LG', 'Samsung', 'Voltas', 'Daikin'],
  450.00,
  350.00,
  10,
  25,
  10,
  true,
  '/images/spare-parts/placeholder-remote.jpg',
  'Universal AC remote control compatible with all major brands. Easy to program.',
  '{"compatibility": "All major brands", "range": "8 meters", "battery": "2x AAA"}'::jsonb,
  6,
  false,
  'ac-remote-control-universal',
  'Universal AC remote control for all brands. Compatible with LG, Samsung, Voltas, Daikin and more.'
),
(
  'Refrigerator Door Seal Samsung',
  'SAM-SEAL-DR',
  'refrigerator',
  'door-seals',
  'Samsung',
  ARRAY['Samsung Single Door', 'Samsung Double Door'],
  850.00,
  700.00,
  5,
  8,
  5,
  true,
  '/images/spare-parts/placeholder-seal.jpg',
  'Genuine Samsung refrigerator door seal. Prevents cold air leakage and improves efficiency.',
  '{"material": "Rubber", "color": "Gray", "length": "2 meters"}'::jsonb,
  6,
  true,
  'refrigerator-door-seal-samsung',
  'Samsung refrigerator door seal replacement. Genuine part with warranty. Bulk orders available.'
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spare_parts') THEN
    RAISE NOTICE 'Table spare_parts created successfully';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spare_parts_orders') THEN
    RAISE NOTICE 'Table spare_parts_orders created successfully';
  END IF;
END $$;

-- Show sample data count
SELECT 
  'spare_parts' as table_name,
  COUNT(*) as row_count
FROM spare_parts
UNION ALL
SELECT 
  'spare_parts_orders' as table_name,
  COUNT(*) as row_count
FROM spare_parts_orders;
