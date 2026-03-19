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

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`}
              className="flex-shrink-0 w-[280px] md:w-[300px] snap-start block group">
              {/* Card */}
              <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-sky-100 dark:border-sky-900/50">
                {/* Top - date + quote icon */}
                <div className="px-4 pt-4 pb-2 flex items-start justify-between">
                  <span className="text-[10px] text-muted-foreground">{today}</span>
                  <div className="text-sky-500">
                    <Quote className="w-6 h-6" />
                  </div>
                </div>
                {/* Quote text */}
                <div className="px-4 pb-4">
                  <p className="text-sm font-bold text-foreground leading-[1.8] line-clamp-5 group-hover:text-primary transition-colors">
                    {post.excerpt} {post.title}
                  </p>
                </div>
                {/* Author section */}
                <div className="bg-white dark:bg-card border-t border-sky-100 dark:border-sky-900/50 px-4 py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-200 shrink-0">
                    <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{post.author}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{post.authorTitle}</p>
                  </div>
                </div>
                {/* Brand footer */}
                <div className="bg-sky-600 dark:bg-sky-800 px-4 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white tracking-wider">কালের কন্ঠ</span>
                  <span className="text-[8px] text-white/60">dailyonirbannews24.com</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
