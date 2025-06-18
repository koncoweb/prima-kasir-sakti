
-- Add payment and change columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN payment_amount INTEGER NOT NULL DEFAULT 0 CHECK (payment_amount >= 0),
ADD COLUMN change_amount INTEGER NOT NULL DEFAULT 0 CHECK (change_amount >= 0);

-- Add comment to clarify the calculation
COMMENT ON COLUMN public.transactions.payment_amount IS 'Amount paid by customer in currency units';
COMMENT ON COLUMN public.transactions.change_amount IS 'Change amount returned to customer in currency units';
