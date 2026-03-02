
-- Create site_settings table for admin configuration
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'বাংলাখবর'),
  ('site_tagline', 'সত্যের সন্ধানে নিরন্তর'),
  ('contact_email', 'info@banglakhabar.com'),
  ('contact_phone', '+৮৮০-১৭০০-০০০০০০'),
  ('facebook_url', ''),
  ('youtube_url', ''),
  ('twitter_url', '');
