import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";

export default function BreakingNews() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("ব্রেকিং", 6);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("id, title, source_url, category")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, label: a.category, url: a.source_url, isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, label: p.label, url: `/post/${p.id}`, isExternal: false }));

  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div className="container mx-auto flex items-stretch">
        <div className="bg-primary text-primary-foreground px-4 py-2 font-bold text-sm flex items-center gap-2 shrink-0 z-10">
          <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
          ব্রেকিং
        </div>
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="ticker-animate whitespace-nowrap flex items-center gap-8 py-2 px-4">
            {[...items, ...items].map((item, i) =>
              item.isExternal ? (
                <a key={`${item.id}-${i}`} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  <span className="text-primary font-bold">›</span>
                  <span className="text-xs font-bold text-primary">{item.label}</span>
                  <span className="text-muted-foreground">◑</span>
                  <span>{item.title}</span>
                </a>
              ) : (
                <Link key={`${item.id}-${i}`} to={item.url}
                  className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  <span className="text-primary font-bold">›</span>
                  <span className="text-xs font-bold text-primary">{item.label}</span>
                  <span className="text-muted-foreground">◑</span>
                  <span>{item.title}</span>
                </Link>
              )
            )}
          </div>
        </div>
        <div className="bg-accent text-accent-foreground px-4 py-2 font-bold text-sm flex items-center shrink-0">
          সর্বশেষ
        </div>
      </div>
    </div>
  );
}
