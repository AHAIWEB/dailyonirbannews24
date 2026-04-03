import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SectionLabel from "./SectionLabel";
import { Camera, X } from "lucide-react";

export default function PhotoGallerySection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "গ্যালারি")
        .not("image_url", "is", null)
        .order("published_at", { ascending: false })
        .limit(12);
      setArticles(data || []);
    };
    load();
  }, []);

  if (articles.length === 0) return null;

  return (
    <section>
      <SectionLabel label="ফটো গ্যালারি" />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
        {articles.map((a, i) => (
          <div
            key={a.id}
            className={`relative overflow-hidden rounded-lg cursor-pointer group ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
            onClick={() => setLightbox(a.image_url)}
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

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
