-- Add business address and invoice customization fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS business_city text,
ADD COLUMN IF NOT EXISTS business_state text,
ADD COLUMN IF NOT EXISTS invoice_primary_color text DEFAULT '#0d9488',
ADD COLUMN IF NOT EXISTS invoice_logo_url text;