-- Allow admins to update support tickets
CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow admins to delete support tickets
CREATE POLICY "Admins can delete tickets"
ON public.support_tickets
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Allow admins to view all support tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (public.is_admin());