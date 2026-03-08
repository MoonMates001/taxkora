
-- User activity tracking table
CREATE TABLE public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL, -- 'page_view', 'login', 'feature_use'
  page_path text,
  feature_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_event_type ON public.user_activity(event_type);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity
CREATE POLICY "Users can insert own activity" ON public.user_activity
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity" ON public.user_activity
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Enable realtime for admin notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity;
