
-- Add discount columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Update the existing check constraint for total_amount to account for discount
-- Remove the old constraint first
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_total_amount_check;

-- Add new constraint that accounts for discount
ALTER TABLE public.transactions ADD CONSTRAINT transactions_total_amount_check 
CHECK (total_amount >= 0);

-- Add comment to clarify the calculation
COMMENT ON COLUMN public.transactions.discount_amount IS 'Fixed discount amount in currency units';
COMMENT ON COLUMN public.transactions.discount_percentage IS 'Percentage discount (0-100)';
