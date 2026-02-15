
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;

-- Recreate as permissive so unauthenticated users can also submit tickets
CREATE POLICY "Anyone can create support tickets"
ON public.support_tickets
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
