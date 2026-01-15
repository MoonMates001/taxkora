-- SECURITY FIX: Separate sensitive payment data from subscriptions table
-- This migration moves card_token, card_last_four, card_expiry to a separate table
-- that can ONLY be accessed by the service role (edge functions)

-- Step 1: Create the payment_methods table for sensitive payment data
CREATE TABLE public.subscription_payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  card_token text,
  card_last_four text,
  card_expiry text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(subscription_id)
);

-- Step 2: Enable RLS and deny ALL client access - only service role can access
ALTER TABLE public.subscription_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: No client access at all - only service role (edge functions) can access
-- This is critical: card tokens should NEVER be readable from client-side code
CREATE POLICY "No client access - service role only" ON public.subscription_payment_methods
  FOR ALL USING (false) WITH CHECK (false);

-- Step 3: Migrate existing payment data to the new table
INSERT INTO public.subscription_payment_methods (subscription_id, user_id, card_token, card_last_four, card_expiry)
SELECT id, user_id, card_token, card_last_four, card_expiry
FROM public.subscriptions
WHERE card_token IS NOT NULL;

-- Step 4: Create a secure view that hides sensitive payment data from clients
-- This view will replace direct access to subscriptions for read operations
CREATE VIEW public.subscriptions_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  plan,
  status,
  amount,
  start_date,
  end_date,
  payment_reference,
  flutterwave_tx_ref,
  auto_renew,
  created_at,
  updated_at,
  -- Expose only whether a card is on file, not the actual token
  (EXISTS (
    SELECT 1 FROM public.subscription_payment_methods pm 
    WHERE pm.subscription_id = subscriptions.id 
    AND pm.card_token IS NOT NULL
  )) AS has_card_on_file,
  -- Expose masked card info only (safe for display)
  (SELECT pm.card_last_four FROM public.subscription_payment_methods pm 
   WHERE pm.subscription_id = subscriptions.id LIMIT 1) AS card_last_four,
  (SELECT pm.card_expiry FROM public.subscription_payment_methods pm 
   WHERE pm.subscription_id = subscriptions.id LIMIT 1) AS card_expiry
FROM public.subscriptions;

-- Step 5: Add trigger for updated_at on payment_methods
CREATE TRIGGER update_subscription_payment_methods_updated_at
  BEFORE UPDATE ON public.subscription_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 6: Drop the sensitive columns from subscriptions table
-- Now that data is migrated to the secure table, remove from original
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS card_token;
-- Keep card_last_four and card_expiry for display purposes but they're also in the new table