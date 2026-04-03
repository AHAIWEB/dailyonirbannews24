import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { Play, Film, Star, Sparkles } from "lucide-react";

export default function EntertainmentGrid() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("বিনোদন", 8, true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "বিনোদন")
        .order("published_at", { ascending: false })
        .limit(8);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: `/post/${a.id}`, source: a.source_name || "", date: new Date(a.published_at || Date.now()).toLocaleDateString("bn-BD") }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, source: p.author, date: p.date }));

  const hero = items[0];
  const side = items.slice(1, 3);
  const grid = items.slice(3, 8);

  return (
    <section className="relative">
      {/* Background glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-rose-500/5 rounded-2xl blur-xl -z-10" />

      <SectionLabel label="বিনোদন" />

      <div className="space-y-3">
        {/* Hero + Side */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {hero && (
            <Link to={hero.url} className="md:col-span-3 block relative overflow-hidden rounded-2xl group">
              <div className="overflow-hidden aspect-[16/10]">
                {hero.image ? (
                  <img src={hero.image} alt={hero.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-600/30 to-purple-600/30 flex items-center justify-center">
                    <Film className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Sparkle badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-pink-500/30">
                  <Sparkles className="w-3 h-3" /> HOT
                </span>
                <span className="bg-black/50 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" /> বিনোদন
                </span>
              </div>
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-base md:text-lg font-black text-white leading-relaxed group-hover:text-pink-200 transition-colors line-clamp-3">
                  {hero.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-white/60">{hero.source}</span>
                  <span className="w-1 h-1 rounded-full bg-pink-400" />
                  <span className="text-[10px] text-white/60">{hero.date}</span>
                </div>
              </div>
            </Link>
          )}

          <div className="md:col-span-2 grid grid-cols-1 gap-3">
            {side.map((item, i) => (
              <Link key={item.id} to={item.url} className="block relative overflow-hidden rounded-xl group">
                <div className="overflow-hidden aspect-[4/3]">
                  {item.image ? (
                    <img src={item.image} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Film className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-current" /> {i === 0 ? 'ট্রেন্ডিং' : 'জনপ্রিয়'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-xs font-bold text-white leading-relaxed group-hover:text-pink-200 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-white/60">{item.source}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-pink-400" />
                    <span className="text-[9px] text-white/60">{item.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom grid - cinematic card style */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {grid.map((item, i) => (
            <Link key={item.id} to={item.url} className="block relative overflow-hidden rounded-lg group">
              <div className="overflow-hidden aspect-[3/4]">
                {item.image ? (
                  <img src={item.image} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center">
                    <Film className="w-5 h-5 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {/* Hover glow */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-400/50 rounded-lg transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h4 className="text-[10px] font-bold text-white leading-relaxed group-hover:text-pink-200 transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
