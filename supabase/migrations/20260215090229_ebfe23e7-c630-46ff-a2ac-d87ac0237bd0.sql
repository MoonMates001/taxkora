
-- Grant INSERT permission to anon and authenticated roles on support_tickets
GRANT INSERT ON public.support_tickets TO anon, authenticated;
GRANT SELECT ON public.support_tickets TO anon, authenticated;
