-- Stock Management Functions
-- Functions for managing inventory stock levels

-- Function to safely decrement stock quantity
-- This ensures stock never goes below 0
CREATE OR REPLACE FUNCTION decrement_stock(
  part_id UUID,
  quantity_to_deduct INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update stock quantity, ensuring it doesn't go below 0
  UPDATE spare_parts
  SET 
    stock_quantity = GREATEST(0, stock_quantity - quantity_to_deduct),
    updated_at = NOW()
  WHERE id = part_id;
  
  -- Log the stock change (optional - for audit trail)
  -- You can create a stock_history table if needed
END;
$$ LANGUAGE plpgsql;

-- Function to increment stock quantity (for returns/restocking)
CREATE OR REPLACE FUNCTION increment_stock(
  part_id UUID,
  quantity_to_add INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE spare_parts
  SET 
    stock_quantity = stock_quantity + quantity_to_add,
    updated_at = NOW()
  WHERE id = part_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if sufficient stock is available
CREATE OR REPLACE FUNCTION check_stock_availability(
  part_id UUID,
  required_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM spare_parts
  WHERE id = part_id AND is_available = true;
  
  RETURN current_stock >= required_quantity;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create stock history table for audit trail
CREATE TABLE IF NOT EXISTS spare_parts_stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES spare_parts_orders(id) ON DELETE SET NULL,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('order', 'restock', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- Index for stock history queries
CREATE INDEX IF NOT EXISTS idx_stock_history_part ON spare_parts_stock_history(part_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_order ON spare_parts_stock_history(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created ON spare_parts_stock_history(created_at DESC);

-- Enhanced decrement function with history tracking
CREATE OR REPLACE FUNCTION decrement_stock_with_history(
  part_id UUID,
  quantity_to_deduct INTEGER,
  order_id UUID DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  old_quantity INTEGER;
  new_quantity INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO old_quantity
  FROM spare_parts
  WHERE id = part_id;
  
  -- Calculate new quantity
  new_quantity := GREATEST(0, old_quantity - quantity_to_deduct);
  
  -- Update stock
  UPDATE spare_parts
  SET 
    stock_quantity = new_quantity,
    updated_at = NOW()
  WHERE id = part_id;
  
  -- Record in history
  INSERT INTO spare_parts_stock_history (
    part_id,
    order_id,
    change_type,
    quantity_change,
    previous_quantity,
    new_quantity,
    notes
  ) VALUES (
    part_id,
    order_id,
    'order',
    -quantity_to_deduct,
    old_quantity,
    new_quantity,
    notes
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION decrement_stock TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_stock TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_stock_availability TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_stock_with_history TO authenticated, anon;

-- Comments for documentation
COMMENT ON FUNCTION decrement_stock IS 'Safely decrements stock quantity for a part, ensuring it never goes below 0';
COMMENT ON FUNCTION increment_stock IS 'Increments stock quantity for a part (for restocking or returns)';
COMMENT ON FUNCTION check_stock_availability IS 'Checks if sufficient stock is available for an order';
COMMENT ON FUNCTION decrement_stock_with_history IS 'Decrements stock with audit trail in stock_history table';
