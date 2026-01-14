-- Create capital asset category enum
CREATE TYPE public.capital_asset_category AS ENUM (
  'plant_machinery',
  'motor_vehicles',
  'furniture_fittings',
  'buildings',
  'computers_equipment',
  'agricultural_equipment',
  'other'
);

-- Create capital_assets table
CREATE TABLE public.capital_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  category capital_asset_category NOT NULL,
  cost NUMERIC NOT NULL,
  acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
  year_acquired INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create VAT transaction type enum
CREATE TYPE public.vat_transaction_type AS ENUM ('output', 'input');

-- Create vat_transactions table
CREATE TABLE public.vat_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type vat_transaction_type NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vat_amount NUMERIC NOT NULL,
  category TEXT,
  is_exempt BOOLEAN NOT NULL DEFAULT false,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on capital_assets
ALTER TABLE public.capital_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for capital_assets
CREATE POLICY "Users can view their own capital assets"
  ON public.capital_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own capital assets"
  ON public.capital_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capital assets"
  ON public.capital_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capital assets"
  ON public.capital_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on vat_transactions
ALTER TABLE public.vat_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vat_transactions
CREATE POLICY "Users can view their own VAT transactions"
  ON public.vat_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own VAT transactions"
  ON public.vat_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VAT transactions"
  ON public.vat_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own VAT transactions"
  ON public.vat_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_capital_assets_updated_at
  BEFORE UPDATE ON public.capital_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vat_transactions_updated_at
  BEFORE UPDATE ON public.vat_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();