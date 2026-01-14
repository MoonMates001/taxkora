-- Fix remaining RLS vulnerabilities by explicitly denying anonymous access

-- Clients table: deny anonymous access
DROP POLICY IF EXISTS "Deny anonymous access to clients" ON public.clients;
CREATE POLICY "Deny anonymous access to clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Invoices table: deny anonymous access  
DROP POLICY IF EXISTS "Deny anonymous access to invoices" ON public.invoices;
CREATE POLICY "Deny anonymous access to invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update referrals policy to be more restrictive (already dropped the public one)
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = referrer_id);

-- Onboarding emails: add explicit anonymous denial
DROP POLICY IF EXISTS "Users can view their own onboarding emails" ON public.onboarding_emails;
CREATE POLICY "Users can view their own onboarding emails"
  ON public.onboarding_emails
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);