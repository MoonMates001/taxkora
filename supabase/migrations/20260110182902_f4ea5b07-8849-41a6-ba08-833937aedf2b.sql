-- Create statutory deductions table for tracking allowable deductions
CREATE TABLE public.statutory_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Pension contributions
  pension_contribution NUMERIC NOT NULL DEFAULT 0,
  
  -- NHIS contributions
  nhis_contribution NUMERIC NOT NULL DEFAULT 0,
  
  -- NHF contributions  
  nhf_contribution NUMERIC NOT NULL DEFAULT 0,
  
  -- Housing loan interest
  housing_loan_interest NUMERIC NOT NULL DEFAULT 0,
  
  -- Life insurance/annuity premiums
  life_insurance_premium NUMERIC NOT NULL DEFAULT 0,
  
  -- Annual rent paid (for rent relief calculation)
  annual_rent_paid NUMERIC NOT NULL DEFAULT 0,
  
  -- Compensation for loss of employment (exempt up to 50M)
  employment_compensation NUMERIC NOT NULL DEFAULT 0,
  
  -- Gifts received (fully exempt)
  gifts_received NUMERIC NOT NULL DEFAULT 0,
  
  -- Approved pension benefits (fully exempt)
  pension_benefits_received NUMERIC NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- One record per user per year
  UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE public.statutory_deductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own deductions"
ON public.statutory_deductions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deductions"
ON public.statutory_deductions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deductions"
ON public.statutory_deductions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deductions"
ON public.statutory_deductions
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_statutory_deductions_updated_at
BEFORE UPDATE ON public.statutory_deductions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();