-- Create blog_authors table for author profiles
CREATE TABLE public.blog_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  job_title TEXT,
  email TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;

-- Anyone can view authors (public info)
CREATE POLICY "Anyone can view blog authors"
ON public.blog_authors
FOR SELECT
USING (true);

-- Only admins can manage authors
CREATE POLICY "Admins can create authors"
ON public.blog_authors
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update authors"
ON public.blog_authors
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete authors"
ON public.blog_authors
FOR DELETE
USING (is_admin());

-- Add author_id foreign key to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN author_id UUID REFERENCES public.blog_authors(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_authors_slug ON public.blog_authors(slug);

-- Insert a default author for existing posts
INSERT INTO public.blog_authors (name, slug, bio, job_title)
VALUES ('TAXKORA Team', 'taxkora-team', 'The TAXKORA team of tax experts helping Nigerian businesses and individuals navigate tax compliance.', 'Tax Compliance Experts');