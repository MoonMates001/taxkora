-- Add card token fields to subscriptions table for automatic billing
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS card_token TEXT,
ADD COLUMN IF NOT EXISTS card_last_four TEXT,
ADD COLUMN IF NOT EXISTS card_expiry TEXT,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;