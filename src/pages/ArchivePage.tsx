import { useParams, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import SidebarTabs from "@/components/news/SidebarTabs";
import { Clock, ChevronRight, ExternalLink, ChevronLeft, ChevronRight as ChevRight, Camera, MapPin, Briefcase, Grid3X3 } from "lucide-react";

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

const PAGE_SIZE = 24;

const ARCHIVE_META: Record<string, { label: string; icon: any; color: string; categories: string[] }> = {
  gallery: {
    label: "ফটো গ্যালারি আর্কাইভ",
    icon: Camera,
    color: "from-fuchsia-600 to-pink-500",
    categories: ["গ্যালারি", "ফটো গ্যালারি"],
  },
  travel: {
    label: "ভ্রমণ গাইড আর্কাইভ",
    icon: MapPin,
    color: "from-emerald-600 to-teal-500",
    categories: ["ভ্রমণ"],
  },
  jobs: {
    label: "চাকরি আর্কাইভ",
    icon: Briefcase,
    color: "from-amber-600 to-orange-500",
    categories: ["চাকরি"],
  },
};

export default function ArchivePage() {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10) - 1;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const meta = ARCHIVE_META[type || ""] || ARCHIVE_META.gallery;
  const Icon = meta.icon;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("rss_articles")
        .select("*", { count: "exact" })
        .eq("is_published", true)
        .not("image_url", "is", null)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (meta.categories.length === 1) {
        query = query.eq("category", meta.categories[0]);
      } else {
        query = query.in("category", meta.categories);
      }

      const { data, count } = await query;

      // Fallback: if no specific category posts, show all with images
      if ((!data || data.length === 0) && page === 0) {
        const { data: fallback, count: fbCount } = await supabase
          .from("rss_articles")
          .select("*", { count: "exact" })
          .eq("is_published", true)
          .not("image_url", "is", null)
          .order("published_at", { ascending: false })
          .range(from, to);

        setArticles((fallback as Article[]) || []);
        setTotal(fbCount || 0);
      } else {
        setArticles((data as Article[]) || []);
        setTotal(count || 0);
      }
      setLoading(false);
    };
    load();
  }, [type, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = (p: number) => {
    setSearchParams({ page: String(p + 1) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${meta.color} py-8`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-white/60 text-xs mb-3">
            <Link to="/" className="hover:text-white transition-colors">হোম</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">{meta.label}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <Icon className="w-8 h-8" />
            {meta.label}
          </h1>
          <p className="text-white/70 text-sm mt-2">মোট {total} টি পোস্ট</p>
        </div>
      </div>

      <div className="container mx-auto mt-6 px-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-xl" />
                <div className="mt-2 h-4 bg-muted rounded w-3/4" />
                <div className="mt-1 h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg">এই আর্কাইভে এখনো কোনো পোস্ট নেই</p>
          </div>
        ) : (
          <>
            {/* Masonry-like grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {articles.map((article, i) => (
                <Link
                  key={article.id}
                  to={`/post/${article.id}`}
                  className={`group block rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all ${
                    i === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <div className={`${i === 0 ? "aspect-square md:aspect-[4/3]" : "aspect-[4/3]"} overflow-hidden bg-muted relative`}>
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed ${
                      i === 0 ? "text-sm md:text-base" : "text-xs"
                    }`}>
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(article.published_at).toLocaleDateString("bn-BD")}
                      </span>
                      {article.source_name && (
                        <span className="flex items-center gap-0.5">
                          <ExternalLink className="w-2.5 h-2.5" />
                          {article.source_name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-8 flex-wrap">
                <button
                  onClick={() => goToPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" /> আগের
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i;
                  } else if (page < 4) {
                    pageNum = i;
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                        pageNum === page
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
                >
                  পরের <ChevRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
