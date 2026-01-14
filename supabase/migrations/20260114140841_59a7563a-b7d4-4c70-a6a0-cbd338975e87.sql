-- ============================================
-- 1. FIX RLS VULNERABILITIES
-- ============================================

-- Drop the problematic public referral policy
DROP POLICY IF EXISTS "Anyone can view referral by code" ON public.referrals;

-- Create a more restrictive policy for referral code lookup (only pending status, limited fields via function)
CREATE OR REPLACE FUNCTION public.get_referral_by_code(p_code text)
RETURNS TABLE (referrer_id uuid, referral_code text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT referrer_id, referral_code
  FROM public.referrals
  WHERE referral_code = p_code
  AND status = 'pending'
  LIMIT 1;
$$;

-- ============================================
-- 2. AUDIT LOGGING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_table_name text,
  p_record_id text DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, 
    old_data, new_data, ip_address, user_agent
  )
  VALUES (
    p_user_id, p_action, p_table_name, p_record_id,
    p_old_data, p_new_data, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ============================================
-- 3. ENCRYPTED DATA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.encrypted_user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  encrypted_value text NOT NULL,
  iv text NOT NULL,
  masked_value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, data_type)
);

ALTER TABLE public.encrypted_user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own encrypted data" ON public.encrypted_user_data;
CREATE POLICY "Users can view their own encrypted data"
  ON public.encrypted_user_data
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own encrypted data" ON public.encrypted_user_data;
CREATE POLICY "Users can insert their own encrypted data"
  ON public.encrypted_user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own encrypted data" ON public.encrypted_user_data;
CREATE POLICY "Users can update their own encrypted data"
  ON public.encrypted_user_data
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own encrypted data" ON public.encrypted_user_data;
CREATE POLICY "Users can delete their own encrypted data"
  ON public.encrypted_user_data
  FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_encrypted_user_data_updated_at ON public.encrypted_user_data;
CREATE TRIGGER update_encrypted_user_data_updated_at
  BEFORE UPDATE ON public.encrypted_user_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. DATA MASKING FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  at_pos int;
  local_part text;
  domain text;
  masked_local text;
BEGIN
  IF email IS NULL OR email = '' THEN
    RETURN NULL;
  END IF;
  
  at_pos := position('@' in email);
  IF at_pos = 0 THEN
    RETURN '****';
  END IF;
  
  local_part := substring(email from 1 for at_pos - 1);
  domain := substring(email from at_pos);
  
  IF length(local_part) <= 2 THEN
    masked_local := '**';
  ELSE
    masked_local := substring(local_part from 1 for 2) || repeat('*', length(local_part) - 2);
  END IF;
  
  RETURN masked_local || domain;
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_phone(phone text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF phone IS NULL OR phone = '' THEN
    RETURN NULL;
  END IF;
  
  IF length(phone) <= 4 THEN
    RETURN repeat('*', length(phone));
  END IF;
  
  RETURN repeat('*', length(phone) - 4) || right(phone, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_tin(tin text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF tin IS NULL OR tin = '' THEN
    RETURN NULL;
  END IF;
  
  IF length(tin) <= 4 THEN
    RETURN repeat('*', length(tin));
  END IF;
  
  RETURN repeat('*', length(tin) - 4) || right(tin, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_payment_ref(ref text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF ref IS NULL OR ref = '' THEN
    RETURN NULL;
  END IF;
  
  IF length(ref) <= 6 THEN
    RETURN repeat('*', length(ref));
  END IF;
  
  RETURN left(ref, 3) || repeat('*', length(ref) - 6) || right(ref, 3);
END;
$$;

-- ============================================
-- 5. SECURE VIEWS WITH MASKED DATA
-- ============================================

CREATE OR REPLACE VIEW public.clients_masked
WITH (security_invoker = on)
AS
SELECT 
  id,
  user_id,
  name,
  public.mask_email(email) as email_masked,
  public.mask_phone(phone) as phone_masked,
  city,
  state,
  public.mask_tin(tax_id) as tax_id_masked,
  created_at,
  updated_at
FROM public.clients;

CREATE OR REPLACE VIEW public.profiles_masked
WITH (security_invoker = on)
AS
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