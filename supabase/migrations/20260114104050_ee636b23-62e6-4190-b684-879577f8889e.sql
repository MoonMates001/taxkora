-- Create table to track VAT filing status per month
CREATE TABLE public.vat_filing_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filed', 'paid')),
  filed_date DATE,
  payment_date DATE,
  payment_reference TEXT,
  payment_amount NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Enable RLS
ALTER TABLE public.vat_filing_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own VAT filing status"
ON public.vat_filing_status
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own VAT filing status"
ON public.vat_filing_status
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VAT filing status"
ON public.vat_filing_status
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own VAT filing status"
ON public.vat_filing_status
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vat_filing_status_updated_at
BEFORE UPDATE ON public.vat_filing_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();