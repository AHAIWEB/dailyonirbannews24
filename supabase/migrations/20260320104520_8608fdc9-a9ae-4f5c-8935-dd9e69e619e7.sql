
-- Fix 1: Remove anon direct access to reporters table PII
DROP POLICY IF EXISTS "Anon can view approved reporters limited" ON public.reporters;

-- Recreate public_reporters view as SECURITY DEFINER (no PII columns)
DROP VIEW IF EXISTS public.public_reporters;
CREATE OR REPLACE VIEW public.public_reporters
WITH (security_barrier = true)
AS
SELECT id, reporter_id, full_name, designation, photo_url,
       social_facebook, social_twitter, social_youtube,
       issue_date, expiry_date, status
FROM public.reporters
WHERE status = 'approved';

ALTER VIEW public.public_reporters OWNER TO postgres;
GRANT SELECT ON public.public_reporters TO anon;
GRANT SELECT ON public.public_reporters TO authenticated;

-- Fix 2: Make reporter-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'reporter-photos';
