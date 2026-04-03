import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function extractImage(html: string): string | null {
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch) return ogMatch[1];
  const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twMatch) return twMatch[1];
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+(?:\.jpg|\.jpeg|\.png|\.webp)[^"']*)["']/i);
  if (imgMatch) return imgMatch[1];
  const dataSrc = html.match(/<img[^>]+data-src=["']([^"']+)["']/i);
  if (dataSrc) return dataSrc[1];
  return null;
}

function extractArticleLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const seen = new Set<string>();
  const base = new URL(baseUrl);
  
  const linkRegex = /<a[^>]+href=["']([^"'#]+)["'][^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1].trim();
    if (!href || href === '/' || href === '#') continue;
    
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname !== base.hostname) continue;
      const path = url.pathname;
      if (path === '/' || path.length < 5) continue;
      if (/\.(css|js|png|jpg|gif|svg|ico|pdf|xml|json|rss|atom)$/i.test(path)) continue;
      if (/\/(tag|author|page|search|login|register|contact|about|privacy|terms|category|#)/i.test(path)) continue;
      
      const fullUrl = url.origin + url.pathname;
      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        links.push(fullUrl);
      }
    } catch {}
  }
  
  return links.slice(0, 30);
}

async function fetchPage(url: string): Promise<string | null> {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
  ];
  
  for (const ua of userAgents) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'bn-BD,bn;q=0.9,en;q=0.8',
          'Referer': 'https://www.google.com/',
        },
        redirect: 'follow',
      });
      if (resp.ok) return await resp.text();
    } catch {}
  }
  return null;
}

function extractTitle(html: string): string {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitle) return stripHtml(ogTitle[1]);
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTag) return stripHtml(titleTag[1]);
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return stripHtml(h1[1]);
  return '';
}

function extractContent(html: string): string {
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const bodyHtml = articleMatch?.[1] || html;
  
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRegex.exec(bodyHtml)) !== null) {
    const text = stripHtml(m[1]);
    if (text.length > 30) paragraphs.push(text);
  }
  
  const fullText = paragraphs.join('\n\n');
  const words = fullText.split(/\s+/);
  const cutoff = Math.ceil(words.length * 0.5);
  return words.slice(0, cutoff).join(' ') + (cutoff < words.length ? '\n\n[বিস্তারিত পড়তে মূল সূত্রে যান]' : '');
}

function extractDescription(html: string): string {
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
  if (ogDesc) return stripHtml(ogDesc[1]);
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (metaDesc) return stripHtml(metaDesc[1]);
  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { scraper_url, scraper_id, category: scraperCategory } = body;

    let scrapers: any[] = [];

    if (scraper_url) {
      scrapers = [{ id: scraper_id || 'manual', url: scraper_url, category: scraperCategory || 'জাতীয়', name: 'Manual' }];
    } else {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .eq('is_active', true)
        .eq('feed_type', 'scraper');
      if (error) throw error;
      scrapers = data || [];
    }

    let totalInserted = 0;
    const results: any[] = [];

    for (const scraper of scrapers) {
      try {
        console.log(`Scraping: ${scraper.url}`);
        const pageHtml = await fetchPage(scraper.url);
        if (!pageHtml) {
          results.push({ scraper: scraper.name, error: 'Failed to fetch page' });
          continue;
        }

        const articleLinks = extractArticleLinks(pageHtml, scraper.url);
        console.log(`Found ${articleLinks.length} links on ${scraper.url}`);
        
        let inserted = 0;
        const sourceName = scraper.name || new URL(scraper.url).hostname;

        for (const link of articleLinks) {
          try {
            const { data: existing } = await supabase
              .from('rss_articles')
              .select('id')
              .eq('source_url', link)
              .maybeSingle();
            
            if (existing) continue;

            const articleHtml = await fetchPage(link);
            if (!articleHtml) continue;

            const title = extractTitle(articleHtml);
            if (!title || title.length < 5) continue;

            const image = extractImage(articleHtml);
            const content = extractContent(articleHtml);
            const description = extractDescription(articleHtml);
            const finalContent = content || description || '';

            const { error: insertError } = await supabase
              .from('rss_articles')
              .upsert({
                title,
                content: finalContent,
                image_url: image,
                source_url: link,
                source_name: sourceName,
                category: scraper.category,
                is_published: true,
                is_featured: false,
                published_at: new Date().toISOString(),
                fetched_at: new Date().toISOString(),
              }, {
                onConflict: 'source_url',
                ignoreDuplicates: true,
              });

            if (!insertError) {
              inserted++;
              totalInserted++;
            }
          } catch (articleErr: any) {
            console.error(`Error scraping article ${link}:`, articleErr.message);
          }
        }

        if (scraper.id !== 'manual') {
          await supabase
            .from('rss_feeds')
            .update({ last_fetched_at: new Date().toISOString() })
            .eq('id', scraper.id);
        }

        results.push({ scraper: scraper.name, links: articleLinks.length, inserted });
      } catch (scraperErr: any) {
        results.push({ scraper: scraper.name, error: scraperErr.message });
      }
    }

    return new Response(JSON.stringify({ success: true, totalInserted, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
