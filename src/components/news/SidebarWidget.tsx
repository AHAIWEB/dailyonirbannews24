import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";

interface Props {
  label: string;
  title: string;
}

export default function SidebarWidget({ label, title }: Props) {
  const post = generatePosts(label, 1)[0];

  return (
    <Link to={`/post/${post.id}`} className="bg-card rounded shadow-sm overflow-hidden block">
      <div className="bg-primary text-primary-foreground px-3 py-2 text-sm font-bold flex items-center gap-2">
        <span className="quote-mark text-primary-foreground" style={{ color: "inherit" }}>
          ❝ {title} ❞
        </span>
      </div>
      <div className="overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-auto object-cover post-image hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold leading-relaxed text-foreground hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
      </div>
    </Link>
  );
}
