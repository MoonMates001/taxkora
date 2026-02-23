
-- Add country_of_residence column to profiles
ALTER TABLE public.profiles ADD COLUMN country_of_residence text NULL DEFAULT NULL;

-- Update handle_new_user to capture country from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, account_type, country_of_residence)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'personal'),
    NEW.raw_user_meta_data ->> 'country_of_residence'
  );
  RETURN NEW;
END;
$function$;
