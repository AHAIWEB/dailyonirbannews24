
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users can upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Public read post images"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'post-images');

CREATE POLICY "Auth read post images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-images');

CREATE POLICY "Admin delete post images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'));
