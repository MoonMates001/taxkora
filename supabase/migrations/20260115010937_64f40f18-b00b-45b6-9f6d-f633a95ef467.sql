-- Drop existing SELECT policy and replace with one that explicitly denies anonymous access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id));