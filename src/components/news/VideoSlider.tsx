import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Play } from "lucide-react";

export default function VideoSlider() {
  const posts = generatePosts("ভিডিও", 4);

  return (
    <section>
      <SectionLabel label="ভিডিও" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {posts.map((post) => (
          <div key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm relative group cursor-pointer">
            <div className="overflow-hidden aspect-video relative">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
              <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground fill-current" />
                </div>
              </div>
            </div>
            <div className="p-2">
              <h3 className="text-xs font-bold leading-relaxed text-foreground line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
