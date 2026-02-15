
-- Create table to track referral link clicks/visits
CREATE TABLE public.referral_link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code TEXT NOT NULL,
  referrer_id UUID NOT NULL,
  visitor_ip TEXT NULL,
  user_agent TEXT NULL,
  referrer_url TEXT NULL,
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_user_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_link_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (tracking happens before auth)
CREATE POLICY "Anyone can log referral clicks"
  ON public.referral_link_clicks
  FOR INSERT
  WITH CHECK (true);

-- Referrers can view their own click data
CREATE POLICY "Referrers can view their own clicks"
  ON public.referral_link_clicks
  FOR SELECT
  USING (auth.uid() = referrer_id);

-- Allow updating converted status (for marking conversions)
CREATE POLICY "Referrers can update their own clicks"
  ON public.referral_link_clicks
  FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Index for fast lookups by referral code
CREATE INDEX idx_referral_link_clicks_code ON public.referral_link_clicks (referral_code);
CREATE INDEX idx_referral_link_clicks_referrer ON public.referral_link_clicks (referrer_id);
