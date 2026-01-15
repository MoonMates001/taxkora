-- FIX: Strengthen referrals table RLS policies to protect referred_email
-- Allow both referrer and referred user to view the record

-- Step 1: Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;

-- Step 2: Create improved SELECT policy that allows both referrer and referred user
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = referrer_id OR 
      auth.uid() = referred_user_id
    )
  );

-- Step 3: Create a secure view that masks referred_email for the referred user
-- (The referrer entered the email so they can see it, but the referred user sees masked version)
CREATE VIEW public.referrals_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  referrer_id,
  referred_user_id,
  referral_code,
  status,
  reward_claimed,
  completed_at,
  created_at,
  updated_at,
  -- Only show full email to the referrer, mask for referred user
  CASE 
    WHEN auth.uid() = referrer_id THEN referred_email
    ELSE public.mask_email(referred_email)
  END as referred_email
FROM public.referrals;