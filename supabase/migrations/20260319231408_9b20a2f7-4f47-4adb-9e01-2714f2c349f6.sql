-- Fix: Drop the overly permissive public policy that exposes PII
DROP POLICY IF EXISTS "Anyone can view approved reporters" ON public.reporters;

-- Create a new restricted policy for anon users that only allows safe fields via a view
CREATE OR REPLACE VIEW public.public_reporters AS
  SELECT id, reporter_id, full_name, designation, photo_url,
         social_facebook, social_twitter, social_youtube,
         issue_date, expiry_date, status
  FROM public.reporters
  WHERE status = 'approved';

-- Grant anon and authenticated access to the view
GRANT SELECT ON public.public_reporters TO anon;
GRANT SELECT ON public.public_reporters TO authenticated;