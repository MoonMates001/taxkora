
DROP FUNCTION IF EXISTS public.get_referral_by_code(text);

CREATE FUNCTION public.get_referral_by_code(p_code text)
 RETURNS TABLE(referrer_id uuid, referral_code text, referrer_name text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT r.referrer_id, r.referral_code, p.full_name as referrer_name
  FROM public.referrals r
  LEFT JOIN public.profiles p ON p.user_id = r.referrer_id
  WHERE r.referral_code = p_code
  AND r.status = 'pending'
  LIMIT 1;
$function$;
