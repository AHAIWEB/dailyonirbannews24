import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import SidebarTabs from "@/components/news/SidebarTabs";
import SidebarWidget from "@/components/news/SidebarWidget";
import { Clock, ChevronRight, ExternalLink, ChevronLeft, ChevronRight as ChevRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  published_at: string;
}

const PAGE_SIZE = 20;

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const categoryName = decodeURIComponent(name || "");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(0);
    setArticles([]);
    setLoading(true);
  }, [categoryName]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", categoryName)
        .order("published_at", { ascending: false })
        .range(from, to);
      const items = (data as any[]) || [];
      setArticles(items);
      setHasMore(items.length === PAGE_SIZE);
      setLoading(false);
    };
    if (categoryName) load();
  }, [categoryName, page]);

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-semibold">{categoryName}</span>
        </div>
      </div>

      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <main className="lg:col-span-8 space-y-4">
            <h2 className="text-xl font-black text-foreground border-b-2 border-primary pb-2">{categoryName}</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 bg-card rounded-lg p-4">
                    <div className="w-32 h-24 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">এই ক্যাটাগরিতে কোনো পোস্ট নেই</p>
              </div>
            ) : (
              <>
                {/* Hero article */}
                {page === 0 && articles[0] && (
                  <Link to={`/post/${articles[0].id}`}
                    className="block relative rounded-xl overflow-hidden group mb-4">
                    <div className="aspect-video bg-muted">
                      {articles[0].image_url && (
                        <img src={articles[0].image_url} alt={articles[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded">{categoryName}</span>
                      <h3 className="text-lg md:text-2xl font-black text-white mt-2 leading-relaxed group-hover:text-primary transition-colors">
                        {articles[0].title}
                      </h3>
                      {articles[0].content && (
                        <p className="text-sm text-white/70 mt-2 line-clamp-2">{articles[0].content}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-white/50 text-xs">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(articles[0].published_at).toLocaleDateString("bn-BD")}</span>
                        {articles[0].source_name && <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" />{articles[0].source_name}</span>}
                      </div>
                    </div>
                  </a>
                )}

                {/* List */}
                <div className="space-y-3">
                  {articles.slice(page === 0 ? 1 : 0).map(article => (
                    <a key={article.id} href={article.source_url} target="_blank" rel="noopener noreferrer"
                      className="flex gap-4 bg-card rounded-lg p-3 group border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                      {article.image_url && (
                        <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                          <img src={article.image_url} alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                          {article.title}
                        </h4>
                        {article.content && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.content}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(article.published_at).toLocaleDateString("bn-BD")}</span>
                          {article.source_name && <span className="flex items-center gap-1"><ExternalLink className="w-2.5 h-2.5" />{article.source_name}</span>}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 py-6">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" /> আগের পৃষ্ঠা
                  </button>
                  <span className="text-sm text-muted-foreground">পৃষ্ঠা {page + 1}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={!hasMore}
                    className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold disabled:opacity-40">
                    পরের পৃষ্ঠা <ChevRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </main>

          <aside className="lg:col-span-4 space-y-4">
            <SidebarTabs tabs={[{ label: "আলোচিত", postLabel: "আলোচিত", count: 7 }, { label: "স্পট লাইট", postLabel: "স্পট লাইট", count: 7 }]} />
            <SidebarWidget label="ভাইরাল" title="ভাইরাল" />
            <div className="bg-muted rounded flex items-center justify-center h-[250px] text-xs text-muted-foreground">বিজ্ঞাপন — ৩০০×২৫০</div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
