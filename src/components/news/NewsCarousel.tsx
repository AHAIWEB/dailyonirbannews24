import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewsCarousel() {
  const posts = useMemo(() => generatePosts("এডিটর পিক", 8, true), []);
  const [current, setCurrent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const isMobile = useIsMobile();
  const visible = isMobile ? 2 : 4;
  const maxIndex = Math.max(0, posts.length - visible);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  // Measure container width
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
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
    if (isDragging.current) {
      touchEndX.current = e.touches[0].clientX;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) handleNext();
    else if (diff < -threshold) handlePrev();
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
        <button
          onClick={handlePrev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={containerRef}
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500"
            style={{
              gap: `${gapPx}px`,
              transform: `translateX(-${offsetPx}px)`,
            }}
          >
            {posts.map((post) => (
              <Link
                to={`/post/${post.id}`}
                key={post.id}
                className="flex-shrink-0 post-card"
                style={{ width: itemWidthCalc }}
              >
                <div className="overflow-hidden rounded aspect-[4/5]">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                </div>
                <h3 className="text-sm font-semibold mt-2 leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                  <span className="text-primary text-lg font-bold leading-none">&#x275D;</span>
                  {" "}{post.title}{" "}
                  <span className="text-primary text-lg font-bold leading-none">&#x275E;</span>
                </h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
