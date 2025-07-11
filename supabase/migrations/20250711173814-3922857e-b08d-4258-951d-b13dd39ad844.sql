-- Fix foreign key relationships for production_materials
ALTER TABLE production_materials 
ADD CONSTRAINT fk_production_materials_production_order 
FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE;

ALTER TABLE production_materials 
ADD CONSTRAINT fk_production_materials_inventory_item 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;

-- Fix foreign key relationships for production_orders
ALTER TABLE production_orders 
ADD CONSTRAINT fk_production_orders_bom 
FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE SET NULL;

-- Fix foreign key relationships for bom_items
ALTER TABLE bom_items 
ADD CONSTRAINT fk_bom_items_bom 
FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE;

ALTER TABLE bom_items 
ADD CONSTRAINT fk_bom_items_inventory_item 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;

-- Fix foreign key relationships for bill_of_materials
ALTER TABLE bill_of_materials 
ADD CONSTRAINT fk_bill_of_materials_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Fix foreign key relationships for products
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE products 
ADD CONSTRAINT fk_products_inventory_item 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL;

-- Fix foreign key relationships for purchase_orders
ALTER TABLE purchase_orders 
ADD CONSTRAINT fk_purchase_orders_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- Fix foreign key relationships for purchase_order_items
ALTER TABLE purchase_order_items 
ADD CONSTRAINT fk_purchase_order_items_purchase_order 
FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE;

ALTER TABLE purchase_order_items 
ADD CONSTRAINT fk_purchase_order_items_inventory_item 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;

-- Fix foreign key relationships for supplier_items
ALTER TABLE supplier_items 
ADD CONSTRAINT fk_supplier_items_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

ALTER TABLE supplier_items 
ADD CONSTRAINT fk_supplier_items_inventory_item 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;

-- Fix foreign key relationships for purchase_transactions
ALTER TABLE purchase_transactions 
ADD CONSTRAINT fk_purchase_transactions_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

ALTER TABLE purchase_transactions 
ADD CONSTRAINT fk_purchase_transactions_inventory_item 
FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;

-- Fix foreign key relationships for inventory
ALTER TABLE inventory 
ADD CONSTRAINT fk_inventory_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Fix foreign key relationships for transaction_items
ALTER TABLE transaction_items 
ADD CONSTRAINT fk_transaction_items_transaction 
FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;

ALTER TABLE transaction_items 
ADD CONSTRAINT fk_transaction_items_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;