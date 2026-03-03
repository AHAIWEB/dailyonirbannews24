import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewsCarousel() {
  const posts = useMemo(() => generatePosts("এডিটর পিক", 8, true), []);
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();
  const visible = isMobile ? 2 : 4;

  const maxIndex = Math.max(0, posts.length - visible);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (maxIndex + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  // Calculate per-item width percentage accounting for gaps
  const gapPx = 12; // gap-3 = 12px
  const itemWidthCalc = `calc((100% - ${gapPx * (visible - 1)}px) / ${visible})`;

  return (
    <section>
      <SectionLabel label="এডিটর পিক" />
      <div className="relative bg-card rounded shadow-sm p-3">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrent(Math.min(maxIndex, current + 1))}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{
              gap: `${gapPx}px`,
              transform: `translateX(calc(-${current} * (${itemWidthCalc} + ${gapPx}px)))`,
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
