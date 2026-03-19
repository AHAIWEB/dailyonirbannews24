
-- RSS Feeds table
CREATE TABLE public.rss_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'জাতীয়',
  is_active boolean NOT NULL DEFAULT true,
  fetch_interval_seconds integer NOT NULL DEFAULT 60,
  last_fetched_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Fetched articles from RSS
CREATE TABLE public.rss_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid REFERENCES public.rss_feeds(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  image_url text,
  source_url text NOT NULL,
  source_name text,
  category text NOT NULL DEFAULT 'জাতীয়',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamp with time zone DEFAULT now(),
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint on source_url to prevent duplicates
ALTER TABLE public.rss_articles ADD CONSTRAINT rss_articles_source_url_unique UNIQUE (source_url);

-- Enable RLS
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_articles ENABLE ROW LEVEL SECURITY;

-- RSS Feeds: only admins can manage, anyone can read active feeds
CREATE POLICY "Admins can manage RSS feeds" ON public.rss_feeds FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active feeds" ON public.rss_feeds FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Auth users can read active feeds" ON public.rss_feeds FOR SELECT TO authenticated USING (is_active = true);

-- RSS Articles: anyone can read published articles, admins can manage all
CREATE POLICY "Anyone can read published articles" ON public.rss_articles FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Auth users can read published articles" ON public.rss_articles FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins can manage articles" ON public.rss_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for articles
ALTER PUBLICATION supabase_realtime ADD TABLE public.rss_articles;

-- Update trigger for rss_feeds
CREATE TRIGGER update_rss_feeds_updated_at BEFORE UPDATE ON public.rss_feeds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
