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
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractDescription(html: string): string {
  const metaDescription = extractMeta(html, 'og:description') || extractMeta(html, 'description');
  if (metaDescription) return metaDescription;

  const firstParagraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return firstParagraph
    ? firstParagraph[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 280)
    : '';
}

function resolveUrl(rawUrl: string, baseUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http')) return rawUrl;
  if (rawUrl.startsWith('//')) return `https:${rawUrl}`;

  try {
    return new URL(rawUrl, baseUrl).toString();
  } catch {
    return rawUrl;
  }
}

function extractImage(html: string, baseUrl: string): string {
  const metaImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
  if (metaImage) return resolveUrl(metaImage, baseUrl);

  const imagePatterns = [
    /<article[^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["']/i,
    /<main[^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["']/i,
    /<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*(?:class|alt)=["'][^"']*(?:featured|thumbnail|article|story|news)[^"']*["']/i,
    /<img[^>]+(?:data-src|src)=["']([^"']+)["']/i,
  ];

  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) return resolveUrl(match[1], baseUrl);
  }

  return '';
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
    return new URL(baseUrl).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function extractArticleBody(html: string): string {
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

  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let contentHtml = '';
  
  if (articleMatch) {
    contentHtml = articleMatch[1];
  } else {
    const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      contentHtml = mainMatch[1];
    } else {
      const contentPatterns = [
        /<div[^>]*(?:id|class)=["'][^"']*(?:article-body|article-content|post-body|post-content|entry-content|story-body|story-content|content-body|main-content|single-content|news-content|news-detail|article-detail|story-detail|content-area|post-detail)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|aside|footer)/i,
        /<div[^>]*(?:id|class)=["'][^"']*(?:article|content|post|entry|story|news)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|aside|footer)/i,
      ];
      
      for (const pattern of contentPatterns) {
        const match = cleaned.match(pattern);
        if (match && match[1].length > 200) {
          contentHtml = match[1];
          break;
        }
      }
      
      if (!contentHtml) {
        const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        contentHtml = bodyMatch ? bodyMatch[1] : cleaned;
      }
    }
  }

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
      .replace(/&#\d+;/g, '')
      .trim();
    if (text.length > 15) {
      paragraphs.push(text);
    }
  }

  if (paragraphs.length < 3) {
    const divTexts = contentHtml.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi);
    for (const m of divTexts) {
      const inner = m[1];
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

  // Also try extracting from <span> blocks inside content divs (bd-pratidin style)
  if (paragraphs.length < 2) {
    const spanTexts = contentHtml.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi);
    for (const m of spanTexts) {
      const text = m[1].replace(/<[^>]+>/g, '').trim();
      if (text.length > 50 && !paragraphs.includes(text)) {
        paragraphs.push(text);
      }
    }
  }

  return paragraphs.join('\n\n');
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
];

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Site-specific fetch strategies
function getSiteHeaders(url: string, attempt: number): Record<string, string> {
  const hostname = new URL(url).hostname;
  const ua = getRandomUA();

  // For bd-pratidin, kalerkantho - use Googlebot or Facebook bot
  const banglaNewsSites = ['bd-pratidin.com', 'kalerkantho.com', 'prothomalo.com', 'jugantor.com', 'daily-bangladesh.com', 'jagonews24.com', 'banglatribune.com'];
  const isBanglaNews = banglaNewsSites.some(s => hostname.includes(s));

  if (isBanglaNews) {
    if (attempt === 0) {
      return {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'bn,en;q=0.5',
      };
    } else if (attempt === 1) {
      return {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      };
    } else {
      return {
        'User-Agent': 'WhatsApp/2.23.20.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      };
    }
  }

  // Generic strategy
  const headers: Record<string, string> = {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'bn-BD,bn;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Upgrade-Insecure-Requests': '1',
  };

  if (attempt === 1) {
    headers['Referer'] = `https://www.google.com/search?q=${encodeURIComponent(hostname)}`;
  } else if (attempt >= 2) {
    headers['Referer'] = `https://t.co/${Math.random().toString(36).slice(2, 8)}`;
    delete headers['Sec-Fetch-Dest'];
    delete headers['Sec-Fetch-Mode'];
    delete headers['Sec-Fetch-Site'];
  }

  return headers;
}

async function fetchWithRetry(url: string, maxRetries = 4): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const headers = getSiteHeaders(url, attempt);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) return response;

      if ((response.status === 403 || response.status === 429 || response.status === 503) && attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} got ${response.status} for ${url}, retrying...`);
        lastError = new Error(`HTTP ${response.status}`);
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed after retries');
}

async function fetchViaGoogleCache(url: string): Promise<string | null> {
  try {
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}&strip=0`;
    const response = await fetch(cacheUrl, {
      headers: { 'User-Agent': getRandomUA(), 'Accept': 'text/html,*/*;q=0.8' },
    });
    if (response.ok) {
      console.log('Fetched from Google cache');
      return await response.text();
    }
  } catch (e) {
    console.log('Google cache failed:', e);
  }
  return null;
}

async function fetchViaArchive(url: string): Promise<string | null> {
  try {
    const archiveUrl = `https://web.archive.org/web/2/${url}`;
    const response = await fetch(archiveUrl, {
      headers: { 'User-Agent': getRandomUA() },
      redirect: 'follow',
    });
    if (response.ok) {
      console.log('Fetched from archive.org');
      return await response.text();
    }
  } catch (e) {
    console.log('Archive.org failed:', e);
  }
  return null;
}

// Try fetching via 12ft.io proxy (paywall bypass)
async function fetchViaProxy(url: string): Promise<string | null> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        headers: { 'User-Agent': getRandomUA() },
      });
      if (response.ok) {
        console.log('Fetched via proxy');
        return await response.text();
      }
    } catch (e) {
      console.log('Proxy failed:', e);
    }
  }
  return null;
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function isPrivateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname;
    // Block private IPs, loopback, link-local, cloud metadata
    const blocked = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|0\.|localhost|::1|\[::1\]|metadata\.google|100\.100\.100\.200)/i;
    if (blocked.test(hostname)) return true;
    // Block non-http(s) schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return true;
    return false;
  } catch {
    return true;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check: require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // SSRF protection: block private/internal URLs
    if (isPrivateUrl(formattedUrl)) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching metadata for:', formattedUrl);

    let html = '';
    let fetchFailed = false;

    try {
      const response = await fetchWithRetry(formattedUrl);
      if (!response.ok) {
        console.log(`Direct fetch failed with ${response.status}`);
        fetchFailed = true;
      } else {
        html = await response.text();
      }
    } catch (err) {
      console.log('Direct fetch error');
      fetchFailed = true;
    }

    // Fallback chain
    if (fetchFailed || !html) {
      const proxyHtml = await fetchViaProxy(formattedUrl);
      if (proxyHtml) { html = proxyHtml; fetchFailed = false; }
    }

    if (fetchFailed || !html) {
      const cachedHtml = await fetchViaGoogleCache(formattedUrl);
      if (cachedHtml) { html = cachedHtml; fetchFailed = false; }
    }
    
    if (fetchFailed || !html) {
      const archivedHtml = await fetchViaArchive(formattedUrl);
      if (archivedHtml) { html = archivedHtml; fetchFailed = false; }
    }

    if (!html) {
      return new Response(
        JSON.stringify({ success: false, error: `সাইটটি অ্যাক্সেস ব্লক করেছে। অনুগ্রহ করে অন্য একটি সোর্স ব্যবহার করুন।` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metadata: Record<string, string> = {
      title: extractTitle(html),
      description: extractDescription(html),
      image: extractImage(html, formattedUrl),
      favicon: extractFavicon(html, formattedUrl),
      siteName: extractSiteName(html, formattedUrl),
      url: formattedUrl,
    };

    const extractedBody = extractContent ? extractArticleBody(html) : '';
    if (!metadata.description && extractedBody) {
      metadata.description = extractedBody.replace(/\s+/g, ' ').trim().slice(0, 280);
    }

    if (extractContent) {
      metadata.content = extractedBody;
      console.log(`Content extracted: ${metadata.content.length} chars, ${metadata.content.split('\n\n').length} paragraphs`);
    }

    return new Response(
      JSON.stringify({ success: true, ...metadata, data: metadata }),
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
