const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTitle(html: string): string {
  const ogTitle = extractMeta(html, 'og:title');
  if (ogTitle) return ogTitle;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractDescription(html: string): string {
  const ogDesc = extractMeta(html, 'og:description');
  if (ogDesc) return ogDesc;
  const descMatch = extractMeta(html, 'description');
  return descMatch || '';
}

function extractImage(html: string): string {
  const ogImage = extractMeta(html, 'og:image');
  if (ogImage) return ogImage;
  const twitterImage = extractMeta(html, 'twitter:image');
  return twitterImage || '';
}

function extractFavicon(html: string, baseUrl: string): string {
  const iconPatterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const pattern of iconPatterns) {
    const match = html.match(pattern);
    if (match) {
      const href = match[1];
      if (href.startsWith('http')) return href;
      if (href.startsWith('//')) return `https:${href}`;
      const url = new URL(baseUrl);
      return `${url.origin}${href.startsWith('/') ? '' : '/'}${href}`;
    }
  }
  const url = new URL(baseUrl);
  return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
}

function extractSiteName(html: string, baseUrl: string): string {
  const ogSite = extractMeta(html, 'og:site_name');
  if (ogSite) return ogSite;
  try {
    const url = new URL(baseUrl);
    return url.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function extractArticleBody(html: string): string {
  // Remove script, style, nav, header, footer, aside, form, iframe tags
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Strategy 1: Try <article> tag
  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let contentHtml = '';
  
  if (articleMatch) {
    contentHtml = articleMatch[1];
  } else {
    // Strategy 2: Try <main> tag
    const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      contentHtml = mainMatch[1];
    } else {
      // Strategy 3: Try common content class/id patterns (greedy approach)
      const contentPatterns = [
        /<div[^>]*(?:id|class)=["'][^"']*(?:article-body|article-content|post-body|post-content|entry-content|story-body|story-content|content-body|main-content|single-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|aside|footer)/i,
        /<div[^>]*(?:id|class)=["'][^"']*(?:article|content|post|entry|story)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|aside|footer)/i,
      ];
      
      for (const pattern of contentPatterns) {
        const match = cleaned.match(pattern);
        if (match && match[1].length > 200) {
          contentHtml = match[1];
          break;
        }
      }
      
      // Strategy 4: If still no content, use the whole body
      if (!contentHtml) {
        const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          contentHtml = bodyMatch[1];
        } else {
          contentHtml = cleaned;
        }
      }
    }
  }

  // Extract paragraphs
  const paragraphs: string[] = [];
  const pMatches = contentHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const m of pMatches) {
    const text = m[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    if (text.length > 15) {
      paragraphs.push(text);
    }
  }

  // If very few paragraphs found, also try div-based text blocks
  if (paragraphs.length < 3) {
    const divTexts = contentHtml.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi);
    for (const m of divTexts) {
      const inner = m[1];
      // Skip if contains nested divs (structural)
      if (/<div/i.test(inner)) continue;
      const text = inner
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      if (text.length > 30 && !paragraphs.includes(text)) {
        paragraphs.push(text);
      }
    }
  }

  return paragraphs.join('\n\n');
}

// Multiple User-Agent strings to rotate
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
];

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const ua = getRandomUA();
    const headers: Record<string, string> = {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'bn-BD,bn;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    // On retry, add Referer from Google to look like a search click
    if (attempt > 0) {
      const parsedUrl = new URL(url);
      headers['Referer'] = `https://www.google.com/search?q=${encodeURIComponent(parsedUrl.hostname)}`;
    }

    try {
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
      });

      if (response.ok) {
        return response;
      }

      // If 403, try next attempt
      if (response.status === 403 && attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} got 403, retrying with different headers...`);
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      return response; // Return non-403 errors or final 403
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) continue;
    }
  }

  throw lastError || new Error('Failed after retries');
}

// Google Cache / Web Cache fallback for stubborn 403s
async function fetchViaGoogleCache(url: string): Promise<string | null> {
  try {
    // Try Google's webcache
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}&strip=0`;
    const response = await fetch(cacheUrl, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (response.ok) {
      console.log('Successfully fetched from Google cache');
      return await response.text();
    }
  } catch (e) {
    console.log('Google cache fallback failed:', e);
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, extractContent } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Fetching metadata for:', formattedUrl);

    let html = '';
    let fetchFailed = false;

    try {
      const response = await fetchWithRetry(formattedUrl);

      if (!response.ok) {
        console.log(`Direct fetch failed with ${response.status}, trying cache fallback...`);
        fetchFailed = true;
      } else {
        html = await response.text();
      }
    } catch (err) {
      console.log('Direct fetch error, trying cache fallback...');
      fetchFailed = true;
    }

    // Fallback: try Google cache if direct fetch failed
    if (fetchFailed) {
      const cachedHtml = await fetchViaGoogleCache(formattedUrl);
      if (cachedHtml) {
        html = cachedHtml;
      } else {
        return new Response(
          JSON.stringify({ success: false, error: `সাইটটি অ্যাক্সেস ব্লক করেছে (403)। অনুগ্রহ করে অন্য একটি সোর্স ব্যবহার করুন।` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const metadata: Record<string, string> = {
      title: extractTitle(html),
      description: extractDescription(html),
      image: extractImage(html),
      favicon: extractFavicon(html, formattedUrl),
      siteName: extractSiteName(html, formattedUrl),
      url: formattedUrl,
    };

    if (metadata.image && !metadata.image.startsWith('http')) {
      if (metadata.image.startsWith('//')) {
        metadata.image = `https:${metadata.image}`;
      } else {
        const base = new URL(formattedUrl);
        metadata.image = `${base.origin}${metadata.image.startsWith('/') ? '' : '/'}${metadata.image}`;
      }
    }

    if (extractContent) {
      metadata.content = extractArticleBody(html);
      console.log(`Content extracted: ${metadata.content.length} chars, ${metadata.content.split('\n\n').length} paragraphs`);
    }

    return new Response(
      JSON.stringify({ success: true, data: metadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch metadata' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
