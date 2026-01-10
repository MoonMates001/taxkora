-- Create storage bucket for deduction documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('deduction-documents', 'deduction-documents', false);

-- Create RLS policies for deduction documents bucket
CREATE POLICY "Users can view their own deduction documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'deduction-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own deduction documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'deduction-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own deduction documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'deduction-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create tax_payments table for tracking payments to FIRS/NRS
CREATE TABLE public.tax_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  
  -- Payment details
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type TEXT NOT NULL, -- 'pit', 'cit', 'vat', 'wht', 'other'
  payment_reference TEXT, -- FIRS/NRS reference number
  payment_method TEXT, -- 'bank_transfer', 'online', 'cash', 'other'
  
  -- Receipt/proof
  receipt_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tax_payments
ALTER TABLE public.tax_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax_payments
CREATE POLICY "Users can view their own tax payments"
ON public.tax_payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax payments"
ON public.tax_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax payments"
ON public.tax_payments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax payments"
ON public.tax_payments
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_tax_payments_updated_at
BEFORE UPDATE ON public.tax_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create deduction_documents table to track uploaded documents
CREATE TABLE public.deduction_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  
  -- Document details
  document_type TEXT NOT NULL, -- 'pension', 'nhis', 'nhf', 'housing_loan', 'life_insurance', 'rent', 'other'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  
  -- Description
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deduction_documents
ALTER TABLE public.deduction_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deduction_documents
CREATE POLICY "Users can view their own deduction documents"
ON public.deduction_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deduction documents"
ON public.deduction_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deduction documents"
ON public.deduction_documents
FOR DELETE
USING (auth.uid() = user_id);