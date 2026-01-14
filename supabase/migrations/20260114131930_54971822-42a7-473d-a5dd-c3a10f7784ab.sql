-- Create table to track onboarding emails sent
CREATE TABLE public.onboarding_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email_type)
);

-- Enable RLS
ALTER TABLE public.onboarding_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own records
CREATE POLICY "Users can view their own onboarding emails"
ON public.onboarding_emails
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX idx_onboarding_emails_user_id ON public.onboarding_emails(user_id);
CREATE INDEX idx_onboarding_emails_type ON public.onboarding_emails(email_type);