import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, content, title } = await req.json();
    if (!articleId || (!content && !title)) {
      return new Response(JSON.stringify({ error: "articleId and content/title required" }), {
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

    const textToProcess = content || title;

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
            content: `নিচের সংবাদ আর্টিকেলটি বিশ্লেষণ করুন এবং JSON ফরম্যাটে উত্তর দিন:

শিরোনাম: ${title || 'N/A'}
কন্টেন্ট: ${textToProcess.substring(0, 3000)}

JSON ফরম্যাট:
{
  "summary": "বাংলায় ২-৩ বাক্যে সারসংক্ষেপ",
  "tags": ["ট্যাগ১", "ট্যাগ২", "ট্যাগ৩", "ট্যাগ৪", "ট্যাগ৫"]
}

নিয়ম:
- সারসংক্ষেপ বাংলায় লিখুন, সংক্ষিপ্ত ও তথ্যবহুল হতে হবে
- ট্যাগ সর্বোচ্চ ৫টি, বাংলায়, প্রাসঙ্গিক কীওয়ার্ড
- শুধু JSON দিন, অন্য কিছু না`,
          },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';

    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    let parsed = { summary: '', tags: [] as string[] };
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await sb
      .from('archived_articles')
      .update({ summary: parsed.summary, tags: parsed.tags })
      .eq('id', articleId);

    if (updateError) throw updateError;

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
