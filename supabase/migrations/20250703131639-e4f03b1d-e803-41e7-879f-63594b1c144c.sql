
-- Add priority column to production_orders table
ALTER TABLE public.production_orders 
ADD COLUMN priority text DEFAULT 'normal';

-- Add a check constraint to ensure valid priority values
ALTER TABLE public.production_orders 
ADD CONSTRAINT check_priority_values 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
