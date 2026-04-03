import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { Play, Film } from "lucide-react";

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
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: a.source_url, source: a.source_name || "", date: new Date(a.published_at || Date.now()).toLocaleDateString("bn-BD"), isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, source: p.author, date: p.date, isExternal: false }));

  const hero = items[0];
  const side = items.slice(1, 3);
  const grid = items.slice(3, 8);

  const renderCard = (item: typeof hero, variant: "hero" | "side" | "grid") => {
    const inner = (
      <div className={`relative overflow-hidden group ${
        variant === "hero" ? "rounded-2xl" : variant === "side" ? "rounded-xl" : "rounded-lg"
      }`}>
        <div className={`overflow-hidden ${
          variant === "hero" ? "aspect-[16/10]" : variant === "side" ? "aspect-[4/3]" : "aspect-[3/4]"
        }`}>
          {item.image ? (
            <img src={item.image} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Film className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-current" /> বিনোদন
          </span>
        </div>
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className={`font-bold text-white leading-snug group-hover:text-pink-200 transition-colors ${
            variant === "hero" ? "text-base md:text-lg line-clamp-3" : variant === "side" ? "text-xs line-clamp-2" : "text-[10px] line-clamp-2"
          }`}>{item.title}</h3>
          {variant !== "grid" && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] text-white/60">{item.source}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[9px] text-white/60">{item.date}</span>
            </div>
          )}
        </div>
      </div>
    );

    return item.isExternal ? (
      <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
    ) : (
      <Link key={item.id} to={item.url} className="block">{inner}</Link>
    );
  };

  return (
    <section>
      <SectionLabel label="বিনোদন" />
      <div className="space-y-3">
        {/* Hero + Side */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {hero && <div className="md:col-span-3">{renderCard(hero, "hero")}</div>}
          <div className="md:col-span-2 grid grid-cols-1 gap-3">
            {side.map(item => renderCard(item, "side"))}
          </div>
        </div>
        {/* Bottom grid */}
        <div className="grid grid-cols-5 gap-2">
          {grid.map(item => renderCard(item, "grid"))}
        </div>
      </div>
    </section>
  );
}
