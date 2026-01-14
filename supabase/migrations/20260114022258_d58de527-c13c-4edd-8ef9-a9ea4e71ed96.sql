-- Create enum for WHT payment types
CREATE TYPE public.wht_payment_type AS ENUM (
  'dividends',
  'interest',
  'royalties',
  'rent',
  'commissions',
  'professionalFees',
  'constructionContracts',
  'managementFees',
  'technicalFees',
  'consultingFees',
  'directorsFees',
  'other'
);

-- Create enum for recipient types
CREATE TYPE public.wht_recipient_type AS ENUM (
  'corporate',
  'individual',
  'non_resident'
);

-- Create WHT transactions table
CREATE TABLE public.wht_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_type public.wht_payment_type NOT NULL,
  recipient_type public.wht_recipient_type NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_tin TEXT,
  gross_amount NUMERIC NOT NULL,
  wht_rate NUMERIC NOT NULL,
  wht_amount NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wht_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own WHT transactions"
ON public.wht_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own WHT transactions"
ON public.wht_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WHT transactions"
ON public.wht_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WHT transactions"
ON public.wht_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_wht_transactions_updated_at
BEFORE UPDATE ON public.wht_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries by user and year
CREATE INDEX idx_wht_transactions_user_date ON public.wht_transactions (user_id, payment_date);