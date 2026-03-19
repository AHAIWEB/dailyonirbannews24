import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef } from "react";

export default function FotoCardSection() {
  const posts = generatePosts("মতামত", 6);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  return (
    <section>
      <SectionLabel label="কালের কন্ঠ" />
      <div className="relative group/slider">
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Mobile: 3-column grid, Desktop: horizontal scroll */}
        <div ref={scrollRef} className="grid grid-cols-3 gap-2 md:flex md:gap-4 md:overflow-x-auto md:scrollbar-hide pb-2 md:snap-x md:snap-mandatory">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`}
              className="md:flex-shrink-0 md:w-[280px] lg:w-[300px] md:snap-start block group">
              <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-sky-100 dark:border-sky-900/50">
                <div className="px-2 pt-2 pb-1 md:px-4 md:pt-4 md:pb-2 flex items-start justify-between">
                  <span className="text-[8px] md:text-[10px] text-muted-foreground">{today}</span>
                  <div className="text-sky-500">
                    <Quote className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="px-2 pb-2 md:px-4 md:pb-4">
                  <p className="text-[10px] md:text-sm font-bold text-foreground leading-[1.6] md:leading-[1.8] line-clamp-3 md:line-clamp-5 group-hover:text-primary transition-colors">
                    {post.excerpt} {post.title}
                  </p>
                </div>
                <div className="bg-white dark:bg-card border-t border-sky-100 dark:border-sky-900/50 px-2 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-sky-200 shrink-0">
                    <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[9px] md:text-xs font-bold text-foreground truncate">{post.author}</h4>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">{post.authorTitle}</p>
                  </div>
                </div>
                <div className="bg-sky-600 dark:bg-sky-800 px-2 py-1 md:px-4 md:py-1.5 flex items-center justify-between">
                  <span className="text-[8px] md:text-[10px] font-bold text-white tracking-wider">কালের কন্ঠ</span>
                  <span className="text-[7px] md:text-[8px] text-white/60 hidden md:inline">dailyonirbannews24.com</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
