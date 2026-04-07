import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Trash2, ExternalLink, Sparkles, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

interface ArchivedArticle {
  id: string;
  title: string;
  source_url: string;
  content: string | null;
  author: string | null;
  category: string | null;
  featured_image: string | null;
  published_date: string | null;
  scraped_at: string;
  summary: string | null;
  tags: string[] | null;
}

export function ArchiveDashboard() {
  const [articles, setArticles] = useState<ArchivedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const pageSize = 20;

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from("archived_articles")
        .select("id, title, source_url, content, author, category, featured_image, published_date, scraped_at, summary, tags", { count: "exact" })
        .order("scraped_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      setArticles((data as ArchivedArticle[]) || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      toast.error(err.message || "আর্টিকেল লোড ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase.from("archived_articles").delete().eq("id", id);
      if (error) throw error;
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setTotalCount((prev) => prev - 1);
      toast.success("আর্টিকেল ডিলিট হয়েছে");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const summarizeArticle = async (article: ArchivedArticle) => {
    setProcessingId(article.id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-summarize", {
        body: { articleId: article.id, content: article.content, title: article.title },
      });
      if (error) throw error;
      setArticles((prev) =>
        prev.map((a) => a.id === article.id ? { ...a, summary: data.summary, tags: data.tags } : a)
      );
      toast.success("AI সারসংক্ষেপ ও ট্যাগিং সম্পন্ন");
    } catch (err: any) {
      toast.error(err.message || "AI প্রসেসিং ব্যর্থ");
    } finally {
      setProcessingId(null);
    }
  };

  const batchSummarize = async () => {
    const unsummarized = articles.filter((a) => !a.summary && a.content);
    if (unsummarized.length === 0) {
      toast.info("সব আর্টিকেলের সারসংক্ষেপ আছে");
      return;
    }
    setBatchProcessing(true);
    let done = 0;
    for (const article of unsummarized) {
      try {
        const { data, error } = await supabase.functions.invoke("ai-summarize", {
          body: { articleId: article.id, content: article.content, title: article.title },
        });
        if (!error && data) {
          setArticles((prev) =>
            prev.map((a) => a.id === article.id ? { ...a, summary: data.summary, tags: data.tags } : a)
          );
          done++;
        }
      } catch {}
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 1500));
    }
    setBatchProcessing(false);
    toast.success(`${done}/${unsummarized.length}টি আর্টিকেল প্রসেস হয়েছে`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" /> আর্কাইভ ({totalCount}টি)
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={batchSummarize} disabled={batchProcessing || loading} className="gap-1 text-xs">
              {batchProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {batchProcessing ? "প্রসেস হচ্ছে..." : "সব AI সারসংক্ষেপ"}
            </Button>
            <Button size="sm" variant="outline" onClick={fetchArticles} disabled={loading}>
              {loading ? "লোড হচ্ছে..." : "রিফ্রেশ"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {articles.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground text-center py-8">কোনো আর্কাইভ নেই</p>
        )}
        {articles.map((article) => (
          <div key={article.id} className="p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors space-y-2">
            <div className="flex gap-3">
              {article.featured_image && (
                <img src={article.featured_image} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-2">{article.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {article.category && <Badge variant="secondary" className="text-[9px]">{article.category}</Badge>}
                  {article.author && <span className="text-[9px] text-muted-foreground">{article.author}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => deleteArticle(article.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Summary & Tags */}
            {article.summary && (
              <div className="pl-1 border-l-2 border-primary/30 ml-1">
                <p className="text-[10px] text-muted-foreground leading-relaxed">{article.summary}</p>
              </div>
            )}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[8px] px-1.5 py-0 gap-0.5">
                    <Tag className="w-2 h-2" />{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* AI Button */}
            {!article.summary && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => summarizeArticle(article)}
                disabled={processingId === article.id || batchProcessing}
                className="text-[10px] h-6 px-2 gap-1"
              >
                {processingId === article.id ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
                AI সারসংক্ষেপ ও ট্যাগ
              </Button>
            )}
          </div>
        ))}

        {totalCount > pageSize && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              আগের
            </Button>
            <span className="text-xs text-muted-foreground">
              পৃষ্ঠা {page + 1}/{Math.ceil(totalCount / pageSize)}
            </span>
            <Button size="sm" variant="outline" disabled={(page + 1) * pageSize >= totalCount} onClick={() => setPage((p) => p + 1)}>
              পরের
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
