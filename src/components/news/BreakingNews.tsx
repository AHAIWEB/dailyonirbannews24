import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";

export default function BreakingNews() {
  const posts = generatePosts("ব্রেকিং", 6);

  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div className="container mx-auto flex items-stretch">
        <div className="bg-primary text-primary-foreground px-4 py-2 font-bold text-sm flex items-center gap-2 shrink-0 z-10">
          <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
          ব্রেকিং
        </div>
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="ticker-animate whitespace-nowrap flex items-center gap-8 py-2 px-4">
            {[...posts, ...posts].map((post, i) => (
              <Link
                key={`${post.id}-${i}`}
                to={`/post/${post.id}`}
                className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <span className="text-primary font-bold">›</span>
                <span className="text-xs font-bold text-primary">{post.label}</span>
                <span className="text-muted-foreground">◑</span>
                <span>{post.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-accent text-accent-foreground px-4 py-2 font-bold text-sm flex items-center shrink-0">
          সর্বশেষ
        </div>
      </div>
    </div>
  );
}
