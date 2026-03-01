import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";

export default function TopNews() {
  const posts = generatePosts("শীর্ষ সংবাদ", 3);

  return (
    <section>
      <SectionLabel label="শীর্ষ সংবাদ" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main post */}
        <div className="md:col-span-2 post-card bg-card rounded overflow-hidden shadow-sm">
          <div className="overflow-hidden aspect-video">
            <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
          </div>
          <div className="p-4">
            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-semibold">{posts[0].label}</span>
            <h2 className="text-xl font-bold mt-2 leading-relaxed text-foreground hover:text-primary transition-colors cursor-pointer">
              {posts[0].title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{posts[0].excerpt}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>{posts[0].author}</span>
              <span>•</span>
              <span>{posts[0].date}</span>
            </div>
          </div>
        </div>

        {/* Side posts */}
        <div className="flex flex-col gap-4">
          {posts.slice(1).map((post) => (
            <div key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm">
              <div className="overflow-hidden aspect-video">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold leading-relaxed text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
                  {post.title}
                </h3>
                <span className="text-[10px] text-muted-foreground mt-1 block">{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
