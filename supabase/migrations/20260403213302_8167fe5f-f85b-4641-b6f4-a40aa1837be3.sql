ALTER TABLE public.rss_feeds ADD COLUMN IF NOT EXISTS feed_type text NOT NULL DEFAULT 'rss';

COMMENT ON COLUMN public.rss_feeds.feed_type IS 'Type of feed: rss or scraper';