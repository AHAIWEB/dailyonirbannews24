import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewsCarousel() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = useMemo(() => generatePosts("এডিটর পিক", 8, true), []);
  const [current, setCurrent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const isMobile = useIsMobile();
  const visible = isMobile ? 2 : 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("is_editor_pick" as any, true)
        .order("published_at", { ascending: false })
        .limit(8);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: a.source_url, isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, isExternal: false }));

  const maxIndex = Math.max(0, items.length - visible);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handlePrev = useCallback(() => setCurrent((p) => Math.max(0, p - 1)), []);
  const handleNext = useCallback(() => setCurrent((p) => Math.min(maxIndex, p + 1)), [maxIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging.current) touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
  }, [handleNext, handlePrev]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (maxIndex + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  const gapPx = 12;
  const itemWidthPx = containerWidth > 0 ? (containerWidth - gapPx * (visible - 1)) / visible : 0;
  const offsetPx = current * (itemWidthPx + gapPx);

  return (
    <section>
      <SectionLabel label="এডিটর পিক" />
      <div className="relative bg-card rounded shadow-sm p-3">
        <button onClick={handlePrev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={handleNext}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>

        <div ref={containerRef} className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="flex transition-transform duration-500" style={{ gap: `${gapPx}px`, transform: `translateX(-${offsetPx}px)` }}>
            {items.map((item) => {
              const card = (
                <div className="flex-shrink-0 post-card" style={{ width: itemWidthPx > 0 ? `${itemWidthPx}px` : `calc((100% - ${gapPx * (visible - 1)}px) / ${visible})` }}>
                  <div className="overflow-hidden rounded aspect-[4/5]">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />}
                  </div>
                  <h3 className="text-sm font-semibold mt-2 leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                    <span className="text-primary text-lg font-bold leading-none">&#x275D;</span>
                    {" "}{item.title}{" "}
                    <span className="text-primary text-lg font-bold leading-none">&#x275E;</span>
                  </h3>
                </div>
              );

              return item.isExternal ? (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" style={{ width: itemWidthPx > 0 ? `${itemWidthPx}px` : undefined }}>
                  {card}
                </a>
              ) : (
                <Link key={item.id} to={item.url} className="flex-shrink-0" style={{ width: itemWidthPx > 0 ? `${itemWidthPx}px` : undefined }}>
                  {card}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
