import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai-gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
              {
                type: 'text',
                text: `এই নিউজ কার্ড ইমেজটি পড়ুন। নিচের JSON ফরম্যাটে উত্তর দিন:
{
  "title": "কার্ডের মূল শিরোনাম (বাংলায়)",
  "quote": "কার্ডে থাকা কোটেশন বা সংক্ষিপ্ত বিবরণ (বাংলায়)",
  "source": "যদি কোনো সোর্স URL বা ওয়েবসাইটের নাম দেখা যায়"
}
শুধু JSON দিন, অন্য কিছু না।`,
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let parsed = { title: '', quote: '', source: '' };
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
