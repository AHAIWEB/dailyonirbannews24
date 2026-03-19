-- Add a restricted anon SELECT policy that only allows reading approved reporters
-- This is needed because the security_invoker view runs as the calling user
CREATE POLICY "Anon can view approved reporters limited"
ON public.reporters
FOR SELECT
TO anon
USING (status = 'approved');