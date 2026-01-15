-- Fix: Remove user_id parameter and use auth.uid() directly to prevent impersonation
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invoice_count INTEGER;
  year_prefix TEXT;
  current_user_id UUID;
BEGIN
  -- Get authenticated user ID server-side (prevents impersonation)
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT COUNT(*) + 1 INTO invoice_count 
  FROM public.invoices 
  WHERE user_id = current_user_id;
  
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  RETURN 'INV-' || year_prefix || '-' || LPAD(invoice_count::TEXT, 4, '0');
END;
$$;