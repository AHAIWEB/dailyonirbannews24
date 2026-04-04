import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SectionLabel from "./SectionLabel";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PhotoGallerySection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      // Try gallery category
      let { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "গ্যালারি")
        .not("image_url", "is", null)
        .order("published_at", { ascending: false })
        .limit(12);

      // Fallback: any posts with images
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

  return (
    <section>
      <SectionLabel label="ফটো গ্যালারি" />

      {articles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
          ফটো গ্যালারি লোড হচ্ছে...
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
          {articles.map((a, i) => (
            <div
              key={a.id}
              className={`relative overflow-hidden rounded-lg cursor-pointer group ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
              onClick={() => setLightboxIdx(i)}
            >
              <div className={`${i === 0 ? "aspect-square" : "aspect-[4/3]"} overflow-hidden`}>
                <img
                  src={a.image_url}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[10px] text-white font-semibold line-clamp-2 leading-relaxed">{a.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Camera className="w-2.5 h-2.5 text-white/60" />
                    <span className="text-[8px] text-white/60">{a.source_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && articles[lightboxIdx] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 z-10">
            <X className="w-6 h-6" />
          </button>
          {lightboxIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              className="absolute left-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 z-10">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {lightboxIdx < articles.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              className="absolute right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 z-10">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={articles[lightboxIdx].image_url}
              alt={articles[lightboxIdx].title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-white text-sm mt-3 max-w-lg mx-auto">{articles[lightboxIdx].title}</p>
            <Link
              to={`/post/${articles[lightboxIdx].id}`}
              className="inline-block mt-2 text-xs text-primary bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setLightboxIdx(null)}
            >
              বিস্তারিত পড়ুন →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
