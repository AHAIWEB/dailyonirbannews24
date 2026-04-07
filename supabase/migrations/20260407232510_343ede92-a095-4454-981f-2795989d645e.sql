
-- Archived articles table for ArchiveHub
CREATE TABLE IF NOT EXISTS public.archived_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  content TEXT,
  html_content TEXT,
  author TEXT,
  category TEXT DEFAULT 'সাধারণ',
  featured_image TEXT,
  published_date TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scrape schedules table
CREATE TABLE IF NOT EXISTS public.scrape_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  interval TEXT DEFAULT '24h',
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.archived_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for archived_articles
CREATE POLICY "Anyone can read archived articles" ON public.archived_articles FOR SELECT TO anon USING (true);
CREATE POLICY "Auth users can read archived articles" ON public.archived_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage archived articles" ON public.archived_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Policies for scrape_schedules
CREATE POLICY "Admins can manage scrape schedules" ON public.scrape_schedules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active schedules" ON public.scrape_schedules FOR SELECT TO anon USING (is_active = true);
