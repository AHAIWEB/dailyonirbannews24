import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { useRef } from "react";

export default function WebStorySection() {
  const posts = generatePosts("ওয়েব স্টোরি", 8, true);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        {/* Scroll buttons */}
        <button onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5" />
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`}
              className="flex-shrink-0 w-[160px] md:w-[180px] snap-start block relative rounded-2xl overflow-hidden group shadow-lg">
              <div className="aspect-[9/16] bg-muted">
                <img src={post.image} alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Pause icon top-right */}
              <div className="absolute top-2 right-2 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center">
                <Pause className="w-3 h-3 text-white" />
              </div>
              {/* Progress dots top */}
              <div className="absolute top-2 left-2 right-10 flex gap-1">
                <div className="flex-1 h-0.5 bg-white/60 rounded-full" />
                <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
                <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
              </div>
              {/* Title overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-xs font-bold text-white leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
