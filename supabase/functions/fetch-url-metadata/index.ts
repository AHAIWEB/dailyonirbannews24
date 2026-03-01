const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractMeta(html: string, property: string): string | null {
  // Try og: and twitter: variants
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
  // Look for link rel="icon" or rel="shortcut icon"
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
  // Fallback to Google's favicon service
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

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

    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch URL: ${response.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    const metadata = {
      title: extractTitle(html),
      description: extractDescription(html),
      image: extractImage(html),
      favicon: extractFavicon(html, formattedUrl),
      siteName: extractSiteName(html, formattedUrl),
      url: formattedUrl,
    };

    // Make relative image URLs absolute
    if (metadata.image && !metadata.image.startsWith('http')) {
      if (metadata.image.startsWith('//')) {
        metadata.image = `https:${metadata.image}`;
      } else {
        const base = new URL(formattedUrl);
        metadata.image = `${base.origin}${metadata.image.startsWith('/') ? '' : '/'}${metadata.image}`;
      }
    }

    console.log('Metadata extracted:', JSON.stringify(metadata));

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
