import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function VideoSlider() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("ভিডিও", 4);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "ভিডিও")
        .order("published_at", { ascending: false })
        .limit(4);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: a.source_url, isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, isExternal: false }));

  return (
    <section>
      <SectionLabel label="ভিডিও" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const card = (
            <div className="post-card bg-card rounded overflow-hidden shadow-sm relative group">
              <div className="overflow-hidden aspect-video relative">
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />}
                <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-xs font-bold leading-relaxed text-foreground line-clamp-2">{item.title}</h3>
              </div>
            </div>
          );

          return item.isExternal ? (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block">{card}</a>
          ) : (
            <Link key={item.id} to={item.url} className="block">{card}</Link>
          );
        })}
      </div>
    </section>
  );
}
