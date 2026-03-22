import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function FotoCardSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "বেলাভূমি কণ্ঠ")
        .order("created_at", { ascending: false })
        .limit(10);
      setArticles(data || []);
    };
    load();
  }, []);

  if (articles.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  return (
    <section>
      <SectionLabel label="বেলাভূমি কণ্ঠ" />
      <div className="relative group/slider">
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5" />
        </button>

        <div ref={scrollRef} className="grid grid-cols-3 gap-2 md:flex md:gap-4 md:overflow-x-auto md:scrollbar-hide pb-2 md:snap-x md:snap-mandatory">
          {articles.map((item) => {
            const isInternal = item.source_url?.includes(window.location.origin) || item.source_url?.startsWith("/");
            const postUrl = isInternal ? `/post/${item.id}` : item.source_url;

            const card = (
              <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-sky-100 dark:border-sky-900/50">
                {item.image_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="px-2 pt-2 pb-1 md:px-4 md:pt-4 md:pb-2 flex items-start justify-between">
                  <span className="text-[8px] md:text-[10px] text-muted-foreground">{today}</span>
                  <div className="text-sky-500"><Quote className="w-4 h-4 md:w-6 md:h-6" /></div>
                </div>
                <div className="px-2 pb-2 md:px-4 md:pb-4">
                  <p className="text-[10px] md:text-sm font-bold text-foreground leading-[1.6] md:leading-[1.8] line-clamp-3 md:line-clamp-5 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  {item.content && (
                    <p className="text-[8px] md:text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                  )}
                </div>
                <div className="bg-sky-600 dark:bg-sky-800 px-2 py-1 md:px-4 md:py-1.5 flex items-center justify-between">
                  <span className="text-[8px] md:text-[10px] font-bold text-white tracking-wider">বেলাভূমি কণ্ঠ</span>
                  <span className="text-[7px] md:text-[8px] text-white/60 hidden md:inline">belabhuminews.com</span>
                </div>
              </div>
            );

            return isInternal ? (
              <Link key={item.id} to={postUrl}
                className="md:flex-shrink-0 md:w-[280px] lg:w-[300px] md:snap-start block group">
                {card}
              </Link>
            ) : (
              <a key={item.id} href={postUrl} target="_blank" rel="noopener noreferrer"
                className="md:flex-shrink-0 md:w-[280px] lg:w-[300px] md:snap-start block group">
                {card}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
