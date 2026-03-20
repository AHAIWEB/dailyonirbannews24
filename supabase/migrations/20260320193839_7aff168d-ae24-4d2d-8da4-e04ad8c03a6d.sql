
ALTER TABLE public.rss_articles ADD COLUMN IF NOT EXISTS sub_category text;
ALTER TABLE public.rss_articles ADD COLUMN IF NOT EXISTS is_editor_pick boolean NOT NULL DEFAULT false;
ALTER TABLE public.rss_articles ADD COLUMN IF NOT EXISTS is_web_story boolean NOT NULL DEFAULT false;
ALTER TABLE public.rss_articles ADD COLUMN IF NOT EXISTS location_division text;
ALTER TABLE public.rss_articles ADD COLUMN IF NOT EXISTS location_district text;
ALTER TABLE public.rss_articles ADD COLUMN IF NOT EXISTS location_upazila text;
