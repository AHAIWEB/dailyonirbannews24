import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause } from "lucide-react";

export default function WebStorySection() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("ওয়েব স্টোরি", 9, true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("is_web_story" as any, true)
        .order("published_at", { ascending: false })
        .limit(9);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: a.source_url, isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, isExternal: false }));

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-center mb-4">
        <h2 className="text-lg font-black text-foreground border-b-2 border-primary pb-1 px-4">ওয়েব স্টোরি</h2>
      </div>
      <div className="relative group/slider">
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5" />
        </button>

        <div ref={scrollRef} className="grid grid-cols-3 gap-2 md:flex md:gap-3 md:overflow-x-auto md:scrollbar-hide pb-2 md:snap-x md:snap-mandatory">
          {items.map((item) => {
            const inner = (
              <>
                <div className="aspect-[9/16] bg-muted">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="absolute top-2 right-2 bg-black/50 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <Pause className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                </div>
                <div className="absolute top-2 left-2 right-8 md:right-10 flex gap-0.5 md:gap-1">
                  <div className="flex-1 h-0.5 bg-white/60 rounded-full" />
                  <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
                  <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                  <h3 className="text-[10px] md:text-xs font-bold text-white leading-relaxed line-clamp-2 md:line-clamp-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>
              </>
            );

            return item.isExternal ? (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="md:flex-shrink-0 md:w-[160px] lg:w-[180px] md:snap-start block relative rounded-2xl overflow-hidden group shadow-lg">
                {inner}
              </a>
            ) : (
              <Link key={item.id} to={item.url}
                className="md:flex-shrink-0 md:w-[160px] lg:w-[180px] md:snap-start block relative rounded-2xl overflow-hidden group shadow-lg">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
