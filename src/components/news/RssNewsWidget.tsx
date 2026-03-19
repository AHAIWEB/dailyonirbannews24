import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SectionLabel from "./SectionLabel";
import { Rss, ExternalLink } from "lucide-react";

interface RssArticle {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  published_at: string;
}

export default function RssNewsWidget() {
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    const { data } = await supabase
      .from("rss_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(10);
    setArticles((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadArticles, 60000);

    // Realtime subscription
    const channel = supabase
      .channel("rss-articles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rss_articles" }, () => {
        loadArticles();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded shadow-sm p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-t text-sm font-bold">
          <Rss className="w-3.5 h-3.5" />
          <span>সর্বশেষ সংবাদ</span>
        </div>
        <div className="flex-1 h-0.5 bg-primary/20 rounded" />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="লাইভ আপডেট" />
      </div>

      <div className="space-y-2">
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 bg-card rounded-lg p-2.5 shadow-sm group border border-border/50 hover:border-primary/30 transition-all"
          >
            {article.image_url && (
              <div className="w-20 h-[56px] rounded-md overflow-hidden shrink-0">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  {article.category}
                </span>
                {article.source_name && (
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <ExternalLink className="w-2.5 h-2.5" />
                    {article.source_name}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
