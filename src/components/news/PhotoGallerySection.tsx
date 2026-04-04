import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SectionLabel from "./SectionLabel";
import { Camera, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function PhotoGallerySection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      let { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "গ্যালারি")
        .not("image_url", "is", null)
        .order("published_at", { ascending: false })
        .limit(12);

      if (!data || data.length < 4) {
        const { data: fallback } = await supabase
          .from("rss_articles")
          .select("*")
          .eq("is_published", true)
          .not("image_url", "is", null)
          .order("published_at", { ascending: false })
          .limit(12);
        data = fallback;
      }
      setArticles(data || []);
    };
    load();
  }, []);

  const navigateLightbox = (dir: number) => {
    if (lightboxIdx === null) return;
    const next = lightboxIdx + dir;
    if (next >= 0 && next < articles.length) setLightboxIdx(next);
  };

  // Layout pattern: first item big, items 1-2 medium, rest small
  const heroItem = articles[0];
  const mediumItems = articles.slice(1, 3);
  const smallItems = articles.slice(3);

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <SectionLabel label="ফটো গ্যালারি" />
        <Link
          to="/archive/gallery"
          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          সব দেখুন <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
          ফটো গ্যালারি লোড হচ্ছে...
        </div>
      ) : (
        <div className="space-y-2">
          {/* Top: Hero + 2 medium */}
          <div className="grid grid-cols-3 gap-2">
            {/* Hero - spans 2 cols */}
            {heroItem && (
              <div
                className="col-span-2 relative overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => setLightboxIdx(0)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={heroItem.image_url}
                    alt={heroItem.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="inline-flex items-center gap-1 bg-fuchsia-500/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full mb-1">
                    <Camera className="w-2.5 h-2.5" /> গ্যালারি
                  </span>
                  <p className="text-xs font-bold text-white line-clamp-2 leading-relaxed">{heroItem.title}</p>
                </div>
              </div>
            )}

            {/* 2 medium stacked */}
            <div className="flex flex-col gap-2">
              {mediumItems.map((a, i) => (
                <div
                  key={a.id}
                  className="relative overflow-hidden rounded-xl cursor-pointer group flex-1"
                  onClick={() => setLightboxIdx(i + 1)}
                >
                  <div className="h-full overflow-hidden">
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white font-semibold line-clamp-2">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: small thumbnails strip */}
          {smallItems.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {smallItems.map((a, i) => (
                <div
                  key={a.id}
                  className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer group ring-2 ring-transparent hover:ring-fuchsia-400 transition-all"
                  onClick={() => setLightboxIdx(i + 3)}
                >
                  <img
                    src={a.image_url}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && articles[lightboxIdx] && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white bg-white/10 backdrop-blur rounded-full p-2.5 hover:bg-white/20 z-10 transition-colors">
            <X className="w-6 h-6" />
          </button>
          {lightboxIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              className="absolute left-4 text-white bg-white/10 backdrop-blur rounded-full p-2.5 hover:bg-white/20 z-10 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {lightboxIdx < articles.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              className="absolute right-4 text-white bg-white/10 backdrop-blur rounded-full p-2.5 hover:bg-white/20 z-10 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          <div className="text-center max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={articles[lightboxIdx].image_url}
              alt={articles[lightboxIdx].title}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white text-sm mt-4 max-w-lg mx-auto font-semibold">{articles[lightboxIdx].title}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-[10px] text-white/50">
                {lightboxIdx + 1} / {articles.length}
              </span>
              <Link
                to={`/post/${articles[lightboxIdx].id}`}
                className="inline-block text-xs text-primary bg-white/10 backdrop-blur px-4 py-1.5 rounded-full hover:bg-white/20 transition-colors font-semibold"
                onClick={() => setLightboxIdx(null)}
              >
                বিস্তারিত পড়ুন →
              </Link>
            </div>
          </div>

          {/* Thumbnail strip in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto pb-1">
            {articles.map((a, i) => (
              <button
                key={a.id}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all ${
                  i === lightboxIdx ? "ring-2 ring-fuchsia-400 scale-110" : "opacity-50 hover:opacity-80"
                }`}
              >
                <img src={a.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
