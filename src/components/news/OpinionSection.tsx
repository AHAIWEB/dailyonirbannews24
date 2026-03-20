import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";

export default function OpinionSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("মত-দ্বিমত", 4);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "মতামত")
        .order("published_at", { ascending: false })
        .limit(4);
      setArticles(data || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: a.source_url, source: a.source_name || "মতামত", isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.authorImage, url: `/post/${p.id}`, source: p.author, isExternal: false }));

  return (
    <section>
      <SectionLabel label="মতামত" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const card = (
            <div className="post-card bg-card rounded p-4 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary">
                {item.image && <img src={item.image} alt={item.source} className="w-full h-full object-cover" />}
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">{item.source}</h4>
              <h3 className="text-xs leading-relaxed text-muted-foreground hover:text-primary transition-colors">
                <span className="quote-mark">{item.title}</span>
              </h3>
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
