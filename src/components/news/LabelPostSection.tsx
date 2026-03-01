import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";

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
          <Link to={`/post/${posts[0].id}`} className="md:col-span-2 post-card bg-card rounded overflow-hidden shadow-sm block">
            <div className="overflow-hidden aspect-video">
              <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold leading-relaxed text-foreground hover:text-primary transition-colors">
                {posts[0].title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{posts[0].excerpt}</p>
            </div>
          </Link>
          <div className="space-y-3">
            {posts.slice(1).map((post) => (
              <Link to={`/post/${post.id}`} key={post.id} className="post-card flex gap-3 bg-card rounded p-2 shadow-sm">
                <div className="w-20 h-16 rounded overflow-hidden shrink-0">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                </div>
                <h4 className="text-xs font-semibold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-3">
                  {post.title}
                </h4>
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
        <div className="grid grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm block">
              <div className="overflow-hidden aspect-video">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <span className="text-[10px] text-muted-foreground">{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionLabel label={label} />
      <div className="space-y-3">
        <Link to={`/post/${posts[0].id}`} className="post-card bg-card rounded overflow-hidden shadow-sm block">
          <div className="overflow-hidden aspect-video">
            <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold leading-relaxed text-foreground hover:text-primary transition-colors">
              {posts[0].title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{posts[0].excerpt}</p>
          </div>
        </Link>
        {posts.slice(1).map((post) => (
          <Link to={`/post/${post.id}`} key={post.id} className="post-card flex gap-3 bg-card rounded p-2 shadow-sm">
            <div className="w-24 h-18 rounded overflow-hidden shrink-0">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
            </div>
            <div>
              <h4 className="text-sm font-semibold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <span className="text-[10px] text-muted-foreground">{post.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
