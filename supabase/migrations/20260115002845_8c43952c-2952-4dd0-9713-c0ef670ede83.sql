-- FIX: Recreate masked views with security_invoker=on to inherit RLS from base tables
-- This ensures the views respect the RLS policies of their underlying tables

-- Step 1: Drop existing views
DROP VIEW IF EXISTS public.profiles_masked;
DROP VIEW IF EXISTS public.clients_masked;

-- Step 2: Recreate profiles_masked view with security_invoker=on
CREATE VIEW public.profiles_masked
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  full_name,
  public.mask_email(email) as email_masked,
  public.mask_phone(phone) as phone_masked,
  account_type,
  business_name,
  business_city,
  business_state,
  invoice_primary_color,
  created_at,
  updated_at
FROM public.profiles;

-- Step 3: Recreate clients_masked view with security_invoker=on
CREATE VIEW public.clients_masked
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  name,
  public.mask_email(email) as email_masked,
  public.mask_phone(phone) as phone_masked,
  public.mask_tin(tax_id) as tax_id_masked,
  city,
  state,
  created_at,
  updated_at
FROM public.clients;