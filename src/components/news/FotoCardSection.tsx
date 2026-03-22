import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function FotoCardSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("মতামত", 6);
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "বেলাভূমি কণ্ঠ")
        .order("published_at", { ascending: false })
        .limit(6);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({
        id: a.id,
        title: a.title,
        excerpt: a.content || "",
        image: a.image_url || "",
        url: a.source_url,
        source: a.source_name || "",
        isExternal: true,
      }))
    : mockPosts.map(p => ({
        id: String(p.id),
        title: p.title,
        excerpt: p.excerpt,
        image: p.authorImage,
        url: `/post/${p.id}`,
        source: p.author,
        isExternal: false,
      }));

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
          {items.map((item) => {
            const card = (
              <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-sky-100 dark:border-sky-900/50">
                {item.image && (
                  <div className="w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: "400px" }}
                    />
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
                </div>
                <div className="bg-sky-600 dark:bg-sky-800 px-2 py-1 md:px-4 md:py-1.5 flex items-center justify-between">
                  <span className="text-[8px] md:text-[10px] font-bold text-white tracking-wider">বেলাভূমি কণ্ঠ</span>
                  <span className="text-[7px] md:text-[8px] text-white/60 hidden md:inline">belabhuminews.com</span>
                </div>
              </div>
            );

            return item.isExternal ? (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="md:flex-shrink-0 md:w-[280px] lg:w-[300px] md:snap-start block group">
                {card}
              </a>
            ) : (
              <Link key={item.id} to={item.url}
                className="md:flex-shrink-0 md:w-[280px] lg:w-[300px] md:snap-start block group">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
