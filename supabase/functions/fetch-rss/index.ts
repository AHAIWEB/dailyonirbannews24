import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractImageFromContent(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  // data-src (lazy load)
  const dataSrcMatch = content.match(/<img[^>]+data-src=["']([^"']+)["']/i);
  if (dataSrcMatch) return dataSrcMatch[1];
  // data-original
  const dataOrigMatch = content.match(/<img[^>]+data-original=["']([^"']+)["']/i);
  if (dataOrigMatch) return dataOrigMatch[1];
  const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];
  const enclosureMatch = content.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch) return enclosureMatch[1];
  // og:image in RSS content
  const ogMatch = content.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch) return ogMatch[1];
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function truncateContent(text: string, percent: number = 90): string {
  const clean = stripHtml(text);
  const words = clean.split(/\s+/);
  const cutoff = Math.ceil(words.length * (percent / 100));
  return words.slice(0, cutoff).join(' ') + (cutoff < words.length ? '...' : '');
}

function parseRSSItems(xml: string): any[] {
  const items: any[] = [];
  
  // Try RSS 2.0 format — get ALL items
  const rssItemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  let count = 0;
  const MAX_ITEMS = 200; // increased from default
  while ((match = rssItemRegex.exec(xml)) !== null && count < MAX_ITEMS) {
    count++;
    const itemXml = match[1];
    const title = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || '';
    const link = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim() || '';
    const description = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || '';
    const content = itemXml.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i)?.[1]?.trim() || description;
    const pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || '';
    const category = itemXml.match(/<category[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/i)?.[1]?.trim() || '';
    
    let image = extractImageFromContent(itemXml);
    if (!image) image = extractImageFromContent(content);
    if (!image) image = extractImageFromContent(description);
    // Check media:thumbnail
    const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
    if (!image && thumbMatch) image = thumbMatch[1];

    if (title && link) {
      items.push({
        title: stripHtml(title),
        source_url: link.trim(),
        content: truncateContent(content || description, 50),
        image_url: image,
        category: stripHtml(category) || null,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  // Try Atom format if no RSS items found
  if (items.length === 0) {
    const atomEntryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = atomEntryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      const title = entryXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || '';
      const link = entryXml.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1]?.trim() || '';
      const summary = entryXml.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)?.[1]?.trim() || '';
      const content = entryXml.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i)?.[1]?.trim() || summary;
      const updated = entryXml.match(/<updated>([\s\S]*?)<\/updated>/i)?.[1]?.trim() || '';

      let image = extractImageFromContent(entryXml);
      if (!image) image = extractImageFromContent(content);

      if (title && link) {
        items.push({
          title: stripHtml(title),
          source_url: link.trim(),
          content: truncateContent(content || summary, 50),
          image_url: image,
          category: null,
          published_at: updated ? new Date(updated).toISOString() : new Date().toISOString(),
        });
      }
    }
  }

  return items;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If called with a specific feed URL (manual fetch)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { feed_url, feed_id, category: feedCategory } = body;

    let feeds: any[] = [];

    if (feed_url) {
      feeds = [{ id: feed_id || 'manual', url: feed_url, category: feedCategory || 'জাতীয়', name: 'Manual' }];
    } else {
      // Fetch all active feeds
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      feeds = data || [];
    }

    let totalInserted = 0;
    const results: any[] = [];

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BanglaKhabar/1.0; +https://banglakhabar.com)',
            'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
          },
        });

        if (!response.ok) {
          results.push({ feed: feed.name, error: `HTTP ${response.status}` });
          continue;
        }

        const xml = await response.text();
        const items = parseRSSItems(xml);

        // Extract source name from feed URL
        const sourceName = feed.name || new URL(feed.url).hostname;

        for (const item of items) {
          const { error: insertError } = await supabase
            .from('rss_articles')
            .upsert({
              feed_id: feed.id !== 'manual' ? feed.id : undefined,
              title: item.title,
              content: item.content,
              image_url: item.image_url,
              source_url: item.source_url,
              source_name: sourceName,
              category: item.category || feed.category,
              is_published: true,
              published_at: item.published_at,
              fetched_at: new Date().toISOString(),
            }, {
              onConflict: 'source_url',
              ignoreDuplicates: true,
            });

          if (!insertError) totalInserted++;
        }

        // Update last_fetched_at
        if (feed.id !== 'manual') {
          await supabase
            .from('rss_feeds')
            .update({ last_fetched_at: new Date().toISOString() })
            .eq('id', feed.id);
        }

        results.push({ feed: feed.name, items: items.length, inserted: items.length });
      } catch (feedError: any) {
        results.push({ feed: feed.name, error: feedError.message });
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
