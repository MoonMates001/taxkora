
-- Add a validation trigger for support_tickets to enforce input constraints
CREATE OR REPLACE FUNCTION public.validate_support_ticket()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name length
  IF length(trim(NEW.name)) < 2 OR length(trim(NEW.name)) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;

  -- Validate email format and length
  IF length(trim(NEW.email)) > 255 OR NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  -- Validate phone length if provided
  IF NEW.phone IS NOT NULL AND length(trim(NEW.phone)) > 20 THEN
    RAISE EXCEPTION 'Phone number must be less than 20 characters';
  END IF;

  -- Validate subject length
  IF length(trim(NEW.subject)) < 3 OR length(trim(NEW.subject)) > 200 THEN
    RAISE EXCEPTION 'Subject must be between 3 and 200 characters';
  END IF;

  -- Validate message length
  IF length(trim(NEW.message)) < 10 OR length(trim(NEW.message)) > 5000 THEN
    RAISE EXCEPTION 'Message must be between 10 and 5000 characters';
  END IF;

  -- Validate category against allowed values
  IF NEW.category NOT IN ('general', 'billing', 'technical', 'tax', 'account', 'feature_request') THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;

  -- Sanitize: trim whitespace
  NEW.name := trim(NEW.name);
  NEW.email := trim(lower(NEW.email));
  NEW.subject := trim(NEW.subject);
  NEW.message := trim(NEW.message);
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := trim(NEW.phone);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_support_ticket_before_insert
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.validate_support_ticket();
