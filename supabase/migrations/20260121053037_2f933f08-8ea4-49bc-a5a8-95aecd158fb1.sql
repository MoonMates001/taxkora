-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
  ON public.blog_categories
  FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can create categories"
  ON public.blog_categories
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON public.blog_categories
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.blog_categories
  FOR DELETE
  USING (is_admin());

-- Create blog post views table
CREATE TABLE public.blog_post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can record views"
  ON public.blog_post_views
  FOR INSERT
  WITH CHECK (true);

-- Admins can view statistics
CREATE POLICY "Admins can view statistics"
  ON public.blog_post_views
  FOR SELECT
  USING (is_admin());

-- Create index for faster view counts
CREATE INDEX idx_blog_post_views_post_id ON public.blog_post_views(post_id);

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Tax Tips', 'tax-tips', 'Practical tax advice for Nigerian businesses and individuals'),
  ('FIRS Updates', 'firs-updates', 'Latest news and updates from the Federal Inland Revenue Service'),
  ('VAT Guidance', 'vat-guidance', 'Value Added Tax compliance and filing guides'),
  ('Business Finance', 'business-finance', 'Financial management tips for Nigerian SMEs'),
  ('Tax Law', 'tax-law', 'Nigerian tax legislation and regulatory changes');