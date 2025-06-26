
-- Create inventory_items table to replace current inventory system
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'raw_material', 'supply')),
    unit TEXT NOT NULL DEFAULT 'pcs',
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    max_stock DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (max_stock >= 0),
    unit_cost DECIMAL(12,2) DEFAULT 0,
    supplier_info TEXT,
    last_restock_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bill_of_materials table for product recipes
CREATE TABLE public.bill_of_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    yield_quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    total_cost DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bom_items table for BOM components
CREATE TABLE public.bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_id UUID REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity_required DECIMAL(10,2) NOT NULL CHECK (quantity_required > 0),
    unit_cost DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_orders table
CREATE TABLE public.production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    bom_id UUID REFERENCES public.bill_of_materials(id) ON DELETE SET NULL,
    quantity_to_produce DECIMAL(10,2) NOT NULL CHECK (quantity_to_produce > 0),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    planned_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_materials table to track material usage
CREATE TABLE public.production_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity_planned DECIMAL(10,2) NOT NULL,
    quantity_used DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for demo purposes)
CREATE POLICY "Allow all operations on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bill_of_materials" ON public.bill_of_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bom_items" ON public.bom_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on production_orders" ON public.production_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on production_materials" ON public.production_materials FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_type ON public.inventory_items(item_type);
CREATE INDEX idx_inventory_items_active ON public.inventory_items(is_active);
CREATE INDEX idx_bom_product_id ON public.bill_of_materials(product_id);
CREATE INDEX idx_bom_items_bom_id ON public.bom_items(bom_id);
CREATE INDEX idx_bom_items_inventory_item_id ON public.bom_items(inventory_item_id);
CREATE INDEX idx_production_orders_status ON public.production_orders(status);
CREATE INDEX idx_production_orders_date ON public.production_orders(planned_date);

-- Create updated_at triggers
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_of_materials_updated_at BEFORE UPDATE ON public.bill_of_materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON public.production_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for inventory items
INSERT INTO public.inventory_items (name, description, item_type, unit, current_stock, min_stock, max_stock, unit_cost) VALUES 
('Tepung Terigu', 'Tepung terigu protein tinggi untuk kue', 'raw_material', 'kg', 50, 10, 100, 12000),
('Gula Pasir', 'Gula pasir halus', 'raw_material', 'kg', 25, 5, 50, 14000),
('Telur Ayam', 'Telur ayam segar', 'raw_material', 'kg', 10, 3, 20, 28000),
('Butter', 'Mentega untuk kue', 'raw_material', 'kg', 8, 2, 15, 45000),
('Kemasan Kotak', 'Kotak kemasan untuk kue', 'supply', 'pcs', 100, 20, 200, 2500),
('Label Produk', 'Stiker label untuk produk', 'supply', 'pcs', 500, 100, 1000, 500);
