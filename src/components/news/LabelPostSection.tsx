import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface Props {
  label: string;
  count: number;
  layout?: "list" | "grid" | "highlight";
}

export default function LabelPostSection({ label, count, layout = "list" }: Props) {
  const posts = generatePosts(label, count);

  if (layout === "highlight") {
    return (
      <section>
        <SectionLabel label={label} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/post/${posts[0].id}`} className="md:col-span-2 post-card group bg-card rounded-lg overflow-hidden shadow-sm block relative">
            <div className="overflow-hidden aspect-video">
              <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-2">{label}</span>
              <h3 className="text-base md:text-lg font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
                {posts[0].title}
              </h3>
              <p className="text-xs text-white/70 mt-1 line-clamp-2 hidden md:block">{posts[0].excerpt}</p>
            </div>
          </Link>
          <div className="space-y-3">
            {posts.slice(1).map((post, i) => (
              <Link to={`/post/${post.id}`} key={post.id} className="post-card flex gap-3 bg-card rounded-lg p-2 shadow-sm group border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-24 h-[68px] rounded-md overflow-hidden shrink-0 relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded">
                    {"০১২৩৪৫৬৭৮৯"[i + 2] || (i + 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-3">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[9px]">{post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "grid") {
    return (
      <section>
        <SectionLabel label={label} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {posts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id} className="post-card bg-card rounded-lg overflow-hidden shadow-sm block group border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="overflow-hidden aspect-[4/3] relative">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-2.5">
                <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">{label}</span>
                <h3 className="text-xs font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[9px]">{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // list layout - redesigned
  return (
    <section>
      <SectionLabel label={label} />
      <div className="space-y-3">
        <Link to={`/post/${posts[0].id}`} className="post-card bg-card rounded-lg overflow-hidden shadow-sm block group relative">
          <div className="overflow-hidden aspect-video">
            <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-2">{label}</span>
            <h3 className="text-base md:text-lg font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
              {posts[0].title}
            </h3>
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{posts[0].excerpt}</p>
          </div>
        </Link>
        <div className="grid grid-cols-1 gap-2">
          {posts.slice(1).map((post, i) => (
            <Link to={`/post/${post.id}`} key={post.id} className="post-card flex gap-3 bg-card rounded-lg p-2 shadow-sm group border border-border/50 hover:border-primary/30 transition-all">
              <div className="w-28 h-20 rounded-md overflow-hidden shrink-0 relative">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded w-fit mb-1">{label}</span>
                <h4 className="text-sm font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[9px]">{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
