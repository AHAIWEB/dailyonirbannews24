-- Fix security definer view: use SECURITY INVOKER instead
DROP VIEW IF EXISTS public.public_reporters;
CREATE VIEW public.public_reporters WITH (security_invoker = true) AS
  SELECT id, reporter_id, full_name, designation, photo_url,
         social_facebook, social_twitter, social_youtube,
         issue_date, expiry_date, status
  FROM public.reporters
  WHERE status = 'approved';

GRANT SELECT ON public.public_reporters TO anon;
GRANT SELECT ON public.public_reporters TO authenticated;