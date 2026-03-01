import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";

export default function EntertainmentGrid() {
  const posts = generatePosts("বিনোদন", 6, true);

  return (
    <section>
      <SectionLabel label="বিনোদন" />
      <div className="grid grid-cols-3 gap-3">
        {posts.map((post) => (
          <Link to={`/post/${post.id}`} key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm block">
            <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="p-2">
              <h3 className="text-xs font-bold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
