import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Download, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ScrapeResult {
  title: string;
  content: string | null;
  image: string | null;
  author: string | null;
  url: string;
  saved: boolean;
}

export function ArchiveScraper() {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);

  const scrapeUrl = async () => {
    if (!url.trim()) return;
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-website", {
        body: { url: url.trim(), maxLinks: 20 },
      });

      if (error) throw error;

      const articles = data?.articles || data?.links || [];
      if (articles.length === 0) {
        // Single article mode
        const { data: metaData, error: metaErr } = await supabase.functions.invoke("fetch-url-metadata", {
          body: { url: url.trim(), extractContent: true },
        });
        if (metaErr) throw metaErr;

        const meta = metaData?.data ?? metaData ?? {};
        setResults([{
          title: meta.title || url.trim(),
          content: meta.content || meta.description || null,
          image: meta.image || null,
          author: meta.author || null,
          url: url.trim(),
          saved: false,
        }]);
      } else {
        setResults(articles.map((a: any) => ({
          title: a.title || a.text || "শিরোনামহীন",
          content: a.content || a.description || null,
          image: a.image || a.imageUrl || null,
          author: a.author || null,
          url: a.url || a.link || url.trim(),
          saved: false,
        })));
      }

      toast.success(`${Math.max(articles.length, 1)}টি আর্টিকেল পাওয়া গেছে`);
    } catch (err: any) {
      toast.error(err.message || "স্ক্র্যাপ ব্যর্থ");
    } finally {
      setScraping(false);
    }
  };

  const saveToArchive = async (result: ScrapeResult, index: number) => {
    try {
      const { error } = await supabase.from("archived_articles").insert({
        title: result.title,
        source_url: result.url,
        content: result.content,
        featured_image: result.image,
        author: result.author,
      });
      if (error) throw error;
      setResults((prev) => prev.map((r, i) => (i === index ? { ...r, saved: true } : r)));
      toast.success("আর্কাইভে সেভ হয়েছে");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const saveAllToArchive = async () => {
    const unsaved = results.filter((r) => !r.saved);
    if (unsaved.length === 0) return;

    try {
      const { error } = await supabase.from("archived_articles").insert(
        unsaved.map((r) => ({
          title: r.title,
          source_url: r.url,
          content: r.content,
          featured_image: r.image,
          author: r.author,
        }))
      );
      if (error) throw error;
      setResults((prev) => prev.map((r) => ({ ...r, saved: true })));
      toast.success(`${unsaved.length}টি আর্টিকেল আর্কাইভে সেভ হয়েছে`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const aiProcess = async (result: ScrapeResult, index: number) => {
    setAiProcessing(result.url);
    try {
      // Fetch full content if missing
      let content = result.content;
      if (!content || content.length < 100) {
        const { data, error } = await supabase.functions.invoke("fetch-url-metadata", {
          body: { url: result.url, extractContent: true },
        });
        if (!error) {
          const meta = data?.data ?? data ?? {};
          content = meta.content || meta.description || content;
          if (meta.image && !result.image) {
            setResults((prev) => prev.map((r, i) => i === index ? { ...r, image: meta.image } : r));
          }
        }
      }

      // Update content
      setResults((prev) => prev.map((r, i) => i === index ? { ...r, content: content || r.content } : r));
      toast.success("AI প্রসেসিং সম্পন্ন");
    } catch (err: any) {
      toast.error(err.message || "AI প্রসেসিং ব্যর্থ");
    } finally {
      setAiProcessing(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="w-4 h-4" /> URL স্ক্র্যাপার
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="text-sm"
          />
          <Button onClick={scrapeUrl} disabled={scraping} className="gap-1 shrink-0">
            {scraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {scraping ? "স্ক্র্যাপ হচ্ছে..." : "স্ক্র্যাপ"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{results.length}টি রেজাল্ট</span>
              <Button size="sm" variant="secondary" onClick={saveAllToArchive} className="text-xs gap-1">
                <Download className="w-3 h-3" /> সব সেভ
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-border bg-muted/30 space-y-2">
                  <div className="flex gap-2">
                    {result.image && (
                      <img src={result.image} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{result.title}</p>
                      {result.content && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{result.content}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.saved ? (
                      <Badge variant="secondary" className="text-[9px] gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> সেভ হয়েছে
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => saveToArchive(result, idx)} className="text-[10px] h-6 px-2">
                        <Download className="w-2.5 h-2.5 mr-1" /> সেভ
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => aiProcess(result, idx)}
                      disabled={aiProcessing === result.url}
                      className="text-[10px] h-6 px-2"
                    >
                      {aiProcessing === result.url ? (
                        <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                      )}
                      AI প্রসেস
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
