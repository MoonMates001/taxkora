-- Fix function search path warnings for masking functions
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
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
SET search_path = public
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
SET search_path = public
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
SET search_path = public
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