import { useParams, Link } from "react-router-dom";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import SidebarTabs from "@/components/news/SidebarTabs";
import SidebarWidget from "@/components/news/SidebarWidget";
import { Clock, Share2, Facebook, Twitter, MessageCircle, Printer, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  published_at: string | null;
  created_at: string;
}

export default function PostPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      // Try to find article by id or by slug in source_url
      let query = supabase.from("rss_articles").select("*").eq("is_published", true);

      if (id?.startsWith("fotocard-") || id?.includes("-")) {
        // Search by source_url containing the id
        const { data } = await query.ilike("source_url", `%${id}%`).limit(1).maybeSingle();
        if (data) {
          setArticle(data);
          // Fetch related posts from same category
          const { data: related } = await supabase
            .from("rss_articles")
            .select("*")
            .eq("is_published", true)
            .eq("category", data.category)
            .neq("id", data.id)
            .order("created_at", { ascending: false })
            .limit(4);
          setRelatedPosts(related || []);
        }
      } else {
        // Try UUID
        const { data } = await query.eq("id", id).maybeSingle();
        if (data) {
          setArticle(data);
          const { data: related } = await supabase
            .from("rss_articles")
            .select("*")
            .eq("is_published", true)
            .eq("category", data.category)
            .neq("id", data.id)
            .order("created_at", { ascending: false })
            .limit(4);
          setRelatedPosts(related || []);
        }
      }
      setLoading(false);
    };
    if (id) fetchArticle();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto py-20 text-center text-muted-foreground">পোস্ট পাওয়া যায়নি</div>
        <Footer />
      </div>
    );
  }

  // Check if source_url is external
  const isExternal = article.source_url?.startsWith("http") && !article.source_url.includes(window.location.host);

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${article.category}`} className="hover:text-primary transition-colors">{article.category}</Link>
        </div>
      </div>

      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <article className="lg:col-span-8">
            <div className="bg-card rounded shadow-sm p-4 md:p-6">
              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-semibold uppercase">
                {article.category}
              </span>
              <h1 className="text-xl md:text-3xl font-black text-foreground leading-relaxed mt-3">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-4 pb-4 border-b border-border text-xs text-muted-foreground">
                {article.source_name && <span className="font-semibold text-foreground">{article.source_name}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(article.published_at || article.created_at)}</span>
              </div>

              {/* Share buttons */}
              <div className="flex items-center gap-2 mt-3 mb-4">
                <span className="text-xs text-muted-foreground mr-1">শেয়ার:</span>
                <button className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-primary-foreground hover:opacity-80">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:opacity-80">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground hover:opacity-80">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:opacity-80">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Featured image */}
              {article.image_url && (
                <>
                  <div className="rounded overflow-hidden aspect-video mb-6">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center -mt-4 mb-6">ছবি: {article.source_name || "সংগৃহীত"}</p>
                </>
              )}

              {/* Post body */}
              {article.content && (
                <div
                  className="prose prose-sm md:prose-base max-w-none text-foreground leading-[2]
                    [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2
                    [&_p]:mb-4 [&_p]:text-sm [&_p]:md:text-base
                    [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              {/* বিস্তারিত পড়ুন Button */}
              {isExternal && (
                <div className="mt-6 p-5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">সম্পূর্ণ সংবাদটি পড়তে মূল সূত্রে যান</p>
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-md">
                    📰 বিস্তারিত পড়ুন
                    <ChevronRight className="w-4 h-4" />
                  </a>
                  {article.source_name && (
                    <p className="text-[10px] text-muted-foreground">সূত্র: {article.source_name}</p>
                  )}
                </div>
              )}
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-card rounded shadow-sm p-4 md:p-6 mt-4">
                <h3 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">সম্পর্কিত সংবাদ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPosts.map(rp => (
                    <Link to={`/post/${rp.id}`} key={rp.id} className="flex gap-3 group">
                      {rp.image_url && (
                        <div className="w-28 h-20 rounded overflow-hidden shrink-0">
                          <img src={rp.image_url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-3">
                          {rp.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground mt-1 block">{formatDate(rp.published_at || rp.created_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <SidebarTabs
              tabs={[
                { label: "আলোচিত", postLabel: "আলোচিত", count: 7 },
                { label: "স্পট লাইট", postLabel: "স্পট লাইট", count: 7 },
              ]}
            />
            <SidebarWidget label="জটিল" title="জটিল" />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
