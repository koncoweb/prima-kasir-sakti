
-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  quantity_ordered NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  quantity_received NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_transactions table for completed purchases
CREATE TABLE public.purchase_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id),
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  quantity_purchased NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_items table for tracking supplier-specific pricing
CREATE TABLE public.supplier_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id),
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  supplier_item_code TEXT,
  unit_price NUMERIC NOT NULL,
  minimum_order_quantity NUMERIC DEFAULT 1,
  lead_time_days INTEGER DEFAULT 0,
  is_preferred BOOLEAN DEFAULT false,
  last_purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, inventory_item_id)
);

-- Add RLS policies
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now since there's no auth system)
CREATE POLICY "Allow all operations on suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_order_items" ON public.purchase_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_transactions" ON public.purchase_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on supplier_items" ON public.supplier_items FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at 
  BEFORE UPDATE ON public.suppliers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at 
  BEFORE UPDATE ON public.purchase_orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_items_updated_at 
  BEFORE UPDATE ON public.supplier_items 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate automatic order numbers
CREATE OR REPLACE FUNCTION generate_purchase_order_number() 
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 3) AS INTEGER)), 0) + 1 
  INTO next_number 
  FROM purchase_orders 
  WHERE order_number ~ '^PO[0-9]+$';
  
  order_number := 'PO' || LPAD(next_number::TEXT, 6, '0');
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Generate automatic transaction numbers
CREATE OR REPLACE FUNCTION generate_purchase_transaction_number() 
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  transaction_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 3) AS INTEGER)), 0) + 1 
  INTO next_number 
  FROM purchase_transactions 
  WHERE transaction_number ~ '^PT[0-9]+$';
  
  transaction_number := 'PT' || LPAD(next_number::TEXT, 6, '0');
  RETURN transaction_number;
END;
$$ LANGUAGE plpgsql;

-- Set default values for order_number and transaction_number
ALTER TABLE public.purchase_orders 
ALTER COLUMN order_number SET DEFAULT generate_purchase_order_number();

ALTER TABLE public.purchase_transactions 
ALTER COLUMN transaction_number SET DEFAULT generate_purchase_transaction_number();
