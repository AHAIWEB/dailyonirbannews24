import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";

export default function OpinionSection() {
  const posts = generatePosts("মত-দ্বিমত", 4);

  return (
    <section>
      <SectionLabel label="মত-দ্বিমত" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="post-card bg-card rounded p-4 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary">
              <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1">{post.author}</h4>
            <span className="text-[10px] text-primary font-medium block mb-2">{post.authorTitle}</span>
            <h3 className="text-xs leading-relaxed text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <span className="quote-mark">{post.title}</span>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
