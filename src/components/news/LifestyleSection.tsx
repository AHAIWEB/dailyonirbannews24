import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";

export default function LifestyleSection() {
  const posts = generatePosts("লাইফস্টাইল", 6, true);

  return (
    <section>
      <SectionLabel label="লাইফস্টাইল" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Featured 2 */}
        {posts.slice(0, 2).map((post) => (
          <div key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm">
            <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold leading-relaxed text-foreground hover:text-primary transition-colors cursor-pointer">
                <span className="quote-mark">{post.title}</span>
              </h3>
            </div>
          </div>
        ))}
        {/* List */}
        <div className="space-y-2">
          {posts.slice(2).map((post) => (
            <div key={post.id} className="post-card flex gap-3 bg-card rounded p-2 shadow-sm">
              <div className="w-16 h-20 rounded overflow-hidden shrink-0" style={{ aspectRatio: "4/5" }}>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
              </div>
              <h4 className="text-xs font-semibold leading-relaxed text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-3">
                <span className="quote-mark">{post.title}</span>
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
