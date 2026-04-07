import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, FileText, Trash2, ExternalLink } from "lucide-react";
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
}

export function ArchiveDashboard() {
  const [articles, setArticles] = useState<ArchivedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from("archived_articles")
        .select("id, title, source_url, content, author, category, featured_image, published_date, scraped_at", { count: "exact" })
        .order("scraped_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      setArticles(data || []);
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" /> আর্কাইভ ({totalCount}টি)
          </span>
          <Button size="sm" variant="outline" onClick={fetchArticles} disabled={loading}>
            {loading ? "লোড হচ্ছে..." : "রিফ্রেশ"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {articles.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground text-center py-8">কোনো আর্কাইভ নেই</p>
        )}
        {articles.map((article) => (
          <div key={article.id} className="flex gap-3 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
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
              <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                className="text-primary hover:text-primary/80">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button onClick={() => deleteArticle(article.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
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
