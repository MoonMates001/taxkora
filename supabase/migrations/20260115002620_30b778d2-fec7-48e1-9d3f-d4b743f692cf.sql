-- Remove remaining card display fields from subscriptions table
-- These are now properly stored in subscription_payment_methods and exposed via subscriptions_safe view
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS card_last_four;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS card_expiry;