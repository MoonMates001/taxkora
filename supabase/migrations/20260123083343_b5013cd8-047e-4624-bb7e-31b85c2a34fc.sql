-- Add scheduled_at column for post scheduling
ALTER TABLE public.blog_posts 
ADD COLUMN scheduled_at timestamp with time zone;

-- Add referrer tracking to blog_post_views
ALTER TABLE public.blog_post_views 
ADD COLUMN referrer text,
ADD COLUMN country text,
ADD COLUMN device_type text;

-- Create index for efficient scheduling queries
CREATE INDEX idx_blog_posts_scheduled ON public.blog_posts (scheduled_at) 
WHERE scheduled_at IS NOT NULL AND is_published = false;

-- Create index for analytics queries
CREATE INDEX idx_blog_post_views_date ON public.blog_post_views (viewed_at);
CREATE INDEX idx_blog_post_views_post ON public.blog_post_views (post_id, viewed_at);