import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewsCarousel() {
  const posts = generatePosts("স্লাইড", 8);
  const [current, setCurrent] = useState(0);
  const visible = 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (posts.length - visible + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [posts.length]);

  return (
    <section>
      <SectionLabel label="কারসরল স্লাইড" />
      <div className="relative bg-card rounded shadow-sm p-3">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrent(Math.min(posts.length - visible, current + 1))}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-secondary/80 text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 gap-3"
            style={{ transform: `translateX(-${current * (100 / visible)}%)` }}
          >
            {posts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id} className="flex-shrink-0 post-card" style={{ width: `calc(${100 / visible}% - 9px)` }}>
                <div className="overflow-hidden rounded aspect-[4/3]">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                </div>
                <h3 className="text-xs font-semibold mt-2 leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: posts.length - visible + 1 }, (_, i) => (
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
