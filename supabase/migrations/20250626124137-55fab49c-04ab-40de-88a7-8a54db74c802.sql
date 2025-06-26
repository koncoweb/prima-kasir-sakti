
-- Phase 1: Database Migration and Integration

-- Add inventory_item_id column to products table to link with inventory_items
ALTER TABLE products ADD COLUMN inventory_item_id UUID REFERENCES inventory_items(id);

-- Create index for better performance
CREATE INDEX idx_products_inventory_item_id ON products(inventory_item_id);

-- Migrate existing product-type inventory items to products table
INSERT INTO products (name, price, category_id, inventory_item_id, is_active)
SELECT 
  ii.name,
  COALESCE(ii.unit_cost * 100, 0)::integer as price, -- Convert to integer cents
  (SELECT id FROM categories LIMIT 1) as category_id, -- Use first available category
  ii.id as inventory_item_id,
  ii.is_active
FROM inventory_items ii
WHERE ii.item_type = 'product' 
  AND ii.id NOT IN (SELECT inventory_item_id FROM products WHERE inventory_item_id IS NOT NULL);

-- Create function to sync product updates with inventory
CREATE OR REPLACE FUNCTION sync_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory_item when product is updated
  IF TG_OP = 'UPDATE' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE inventory_items 
    SET 
      name = NEW.name,
      unit_cost = NEW.price::numeric / 100, -- Convert back from cents
      updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic sync
CREATE TRIGGER trigger_sync_product_inventory
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_inventory();

-- Create function to prevent duplicate product creation
CREATE OR REPLACE FUNCTION prevent_duplicate_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent creating inventory items of type 'product' if they already exist as products
  IF NEW.item_type = 'product' AND EXISTS (
    SELECT 1 FROM products WHERE inventory_item_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'This item already exists as a product. Please use the Product Manager instead.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate creation
CREATE TRIGGER trigger_prevent_duplicate_product_inventory
  BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_product_inventory();
