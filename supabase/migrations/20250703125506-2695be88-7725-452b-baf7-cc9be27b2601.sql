
-- Phase 1: Database Schema Enhancement

-- 1.1 Add proper foreign key constraints
ALTER TABLE bom_items 
ADD CONSTRAINT IF NOT EXISTS fk_bom_items_bom 
FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE;

ALTER TABLE bom_items 
ADD CONSTRAINT IF NOT EXISTS fk_bom_items_inventory 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);

ALTER TABLE production_orders 
ADD CONSTRAINT IF NOT EXISTS fk_production_orders_bom 
FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id);

ALTER TABLE products 
ADD CONSTRAINT IF NOT EXISTS fk_products_inventory 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);

-- 1.2 Enhanced sync trigger for product-inventory
CREATE OR REPLACE FUNCTION sync_product_inventory_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- When product is updated, sync to inventory_item
  IF TG_OP = 'UPDATE' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE inventory_items 
    SET 
      name = NEW.name,
      unit_cost = NEW.price::numeric / 100,
      updated_at = NOW()
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  -- When new product is created with inventory
  IF TG_OP = 'INSERT' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE inventory_items 
    SET 
      name = NEW.name,
      item_type = 'product',
      unit_cost = NEW.price::numeric / 100
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing trigger
DROP TRIGGER IF EXISTS trigger_sync_product_inventory ON products;
CREATE TRIGGER trigger_sync_product_inventory_enhanced
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_inventory_enhanced();

-- Phase 2: Data Migration & Standardization

-- 2.1 Create missing inventory items for products that don't have them
INSERT INTO inventory_items (name, item_type, unit, current_stock, min_stock, max_stock, unit_cost, is_active)
SELECT 
  p.name,
  'product',
  'pcs',
  0,
  5,
  100,
  p.price::numeric / 100,
  true
FROM products p
WHERE p.inventory_item_id IS NULL AND p.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM inventory_items ii 
    WHERE ii.name = p.name AND ii.item_type = 'product'
  );

-- Update products with newly created inventory_item_id
UPDATE products 
SET inventory_item_id = (
  SELECT ii.id 
  FROM inventory_items ii 
  WHERE ii.name = products.name AND ii.item_type = 'product'
  LIMIT 1
)
WHERE inventory_item_id IS NULL AND is_active = true;

-- 2.2 Fix BOM-Product relationships
-- Link existing BOMs to products where possible
UPDATE bill_of_materials 
SET product_id = (
  SELECT p.id 
  FROM products p 
  WHERE LOWER(p.name) SIMILAR TO LOWER('%' || bill_of_materials.name || '%')
    OR LOWER(bill_of_materials.name) SIMILAR TO LOWER('%' || p.name || '%')
  LIMIT 1
)
WHERE product_id IS NULL;

-- Phase 3: Enhanced Production System

-- 3.1 Add columns for enhanced production tracking
ALTER TABLE production_materials 
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS actual_unit_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS variance_quantity NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS variance_cost NUMERIC DEFAULT 0;

-- 3.2 Complete production function that updates both raw materials and finished goods
CREATE OR REPLACE FUNCTION complete_production_order_enhanced(order_id UUID)
RETURNS JSON AS $$
DECLARE
  po_record production_orders%ROWTYPE;
  bom_record bill_of_materials%ROWTYPE;
  product_inventory_id UUID;
  produced_quantity NUMERIC;
  bom_item RECORD;
  result JSON;
BEGIN
  -- Get production order details
  SELECT * INTO po_record FROM production_orders WHERE id = order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Production order not found');
  END IF;
  
  -- Get BOM details
  SELECT * INTO bom_record FROM bill_of_materials WHERE id = po_record.bom_id;
  
  -- Calculate actual produced quantity
  produced_quantity := po_record.quantity_to_produce * COALESCE(bom_record.yield_quantity, 1);
  
  -- Consume raw materials first
  FOR bom_item IN 
    SELECT bi.*, ii.name as item_name, ii.current_stock
    FROM bom_items bi
    JOIN inventory_items ii ON bi.inventory_item_id = ii.id
    WHERE bi.bom_id = po_record.bom_id
  LOOP
    DECLARE
      required_qty NUMERIC;
      available_stock NUMERIC;
      new_stock NUMERIC;
    BEGIN
      required_qty := bom_item.quantity_required * po_record.quantity_to_produce;
      available_stock := bom_item.current_stock;
      
      -- Check if sufficient stock
      IF available_stock < required_qty THEN
        RETURN json_build_object(
          'success', false, 
          'error', 'Insufficient stock for ' || bom_item.item_name,
          'required', required_qty,
          'available', available_stock
        );
      END IF;
      
      -- Update raw material stock
      new_stock := available_stock - required_qty;
      UPDATE inventory_items 
      SET 
        current_stock = new_stock,
        updated_at = NOW()
      WHERE id = bom_item.inventory_item_id;
      
      -- Record material usage
      INSERT INTO production_materials (
        production_order_id, inventory_item_id, quantity_planned, 
        quantity_used, unit_cost
      ) VALUES (
        order_id,
        bom_item.inventory_item_id,
        required_qty,
        required_qty,
        COALESCE(bom_item.unit_cost, 0)
      )
      ON CONFLICT (production_order_id, inventory_item_id) 
      DO UPDATE SET
        quantity_used = EXCLUDED.quantity_used,
        unit_cost = EXCLUDED.unit_cost;
    END;
  END LOOP;
  
  -- Update finished product stock if linked to a product
  IF bom_record.product_id IS NOT NULL THEN
    SELECT inventory_item_id INTO product_inventory_id 
    FROM products 
    WHERE id = bom_record.product_id;
    
    IF product_inventory_id IS NOT NULL THEN
      UPDATE inventory_items 
      SET 
        current_stock = current_stock + produced_quantity,
        last_restock_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE id = product_inventory_id;
    END IF;
  END IF;
  
  -- Update production order status
  UPDATE production_orders 
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = order_id;
  
  RETURN json_build_object(
    'success', true, 
    'produced_quantity', produced_quantity,
    'product_inventory_updated', product_inventory_id IS NOT NULL,
    'materials_consumed', true
  );
END;
$$ LANGUAGE plpgsql;

-- Phase 4: Business Intelligence Views

-- 4.1 Production cost analysis view
CREATE OR REPLACE VIEW production_cost_analysis AS
SELECT 
  po.id as production_order_id,
  po.order_number,
  po.quantity_to_produce,
  bom.name as recipe_name,
  p.name as product_name,
  bom.total_cost as planned_cost,
  COALESCE(SUM(pm.quantity_used * pm.unit_cost), 0) as actual_cost,
  COALESCE(SUM(pm.variance_cost), 0) as cost_variance,
  (COALESCE(SUM(pm.quantity_used * pm.unit_cost), 0) / NULLIF(po.quantity_to_produce, 0)) as cost_per_unit,
  po.status,
  po.created_at,
  po.completed_at
FROM production_orders po
LEFT JOIN bill_of_materials bom ON po.bom_id = bom.id
LEFT JOIN products p ON bom.product_id = p.id
LEFT JOIN production_materials pm ON po.id = pm.production_order_id
GROUP BY po.id, po.order_number, po.quantity_to_produce, bom.name, p.name, bom.total_cost, po.status, po.created_at, po.completed_at;

-- 4.2 Inventory valuation view
CREATE OR REPLACE VIEW inventory_valuation AS
SELECT 
  ii.id,
  ii.name,
  ii.item_type,
  ii.current_stock,
  ii.min_stock,
  ii.max_stock,
  ii.unit_cost as standard_cost,
  COALESCE(
    (SELECT unit_price FROM purchase_transactions pt 
     WHERE pt.inventory_item_id = ii.id 
     ORDER BY purchase_date DESC LIMIT 1), 
    ii.unit_cost
  ) as latest_cost,
  ii.current_stock * ii.unit_cost as standard_value,
  ii.current_stock * COALESCE(
    (SELECT unit_price FROM purchase_transactions pt 
     WHERE pt.inventory_item_id = ii.id 
     ORDER BY purchase_date DESC LIMIT 1), 
    ii.unit_cost
  ) as latest_value,
  CASE 
    WHEN ii.current_stock <= ii.min_stock THEN 'LOW_STOCK'
    WHEN ii.current_stock >= ii.max_stock THEN 'OVERSTOCK'
    ELSE 'NORMAL'
  END as stock_status
FROM inventory_items ii
WHERE ii.is_active = true;

-- 4.3 BOM profitability analysis view
CREATE OR REPLACE VIEW bom_profitability AS
SELECT 
  bom.id,
  bom.name as bom_name,
  p.name as product_name,
  p.price::numeric / 100 as selling_price,
  bom.total_cost as production_cost,
  (p.price::numeric / 100) - COALESCE(bom.total_cost, 0) as gross_profit,
  CASE 
    WHEN COALESCE(bom.total_cost, 0) > 0 
    THEN (((p.price::numeric / 100) - COALESCE(bom.total_cost, 0)) / COALESCE(bom.total_cost, 1)) * 100
    ELSE 0
  END as profit_margin_percent
FROM bill_of_materials bom
LEFT JOIN products p ON bom.product_id = p.id
WHERE bom.is_active = true;
