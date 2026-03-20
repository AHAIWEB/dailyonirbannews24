import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";

export default function EntertainmentGrid() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("বিনোদন", 6, true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "বিনোদন")
        .order("published_at", { ascending: false })
        .limit(6);
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
      <SectionLabel label="বিনোদন" />
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) =>
          item.isExternal ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} className="post-card bg-card rounded overflow-hidden shadow-sm block">
              <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />}
              </div>
              <div className="p-2">
                <h3 className="text-xs font-bold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
              </div>
            </a>
          ) : (
            <Link to={item.url} key={item.id} className="post-card bg-card rounded overflow-hidden shadow-sm block">
              <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover post-image" />
              </div>
              <div className="p-2">
                <h3 className="text-xs font-bold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
              </div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
