-- Add new income categories to the enum
ALTER TYPE public.income_category ADD VALUE IF NOT EXISTS 'salary';
ALTER TYPE public.income_category ADD VALUE IF NOT EXISTS 'wages';
ALTER TYPE public.income_category ADD VALUE IF NOT EXISTS 'pension';
ALTER TYPE public.income_category ADD VALUE IF NOT EXISTS 'dividends';
ALTER TYPE public.income_category ADD VALUE IF NOT EXISTS 'gifts';
ALTER TYPE public.income_category ADD VALUE IF NOT EXISTS 'freelance';

-- Add new expense categories to the enum
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'housing';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'food';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'healthcare';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'education';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'entertainment';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'personal_care';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'clothing';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'transportation';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'debt_payment';
ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'savings';