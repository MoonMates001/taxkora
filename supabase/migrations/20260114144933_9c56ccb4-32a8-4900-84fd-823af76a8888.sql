-- Drop and recreate clients_masked view with security_invoker enabled
DROP VIEW IF EXISTS public.clients_masked;

CREATE VIEW public.clients_masked 
WITH (security_invoker = on) AS
SELECT 
    id,
    user_id,
    name,
    mask_email(email) AS email_masked,
    mask_phone(phone) AS phone_masked,
    city,
    state,
    mask_tin(tax_id) AS tax_id_masked,
    created_at,
    updated_at
FROM public.clients;

-- Drop and recreate profiles_masked view with security_invoker enabled
DROP VIEW IF EXISTS public.profiles_masked;

CREATE VIEW public.profiles_masked 
WITH (security_invoker = on) AS
SELECT 
    id,
    user_id,
    full_name,
    mask_email(email) AS email_masked,
    mask_phone(phone) AS phone_masked,
    account_type,
    business_name,
    business_city,
    business_state,
    invoice_primary_color,
    created_at,
    updated_at
FROM public.profiles;