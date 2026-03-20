import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";

export default function LifestyleSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts("লাইফস্টাইল", 6, true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "লাইফস্টাইল")
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

  const ItemLink = ({ item, children, className }: { item: typeof items[0]; children: React.ReactNode; className?: string }) =>
    item.isExternal
      ? <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
      : <Link to={item.url} className={className}>{children}</Link>;

  return (
    <section>
      <SectionLabel label="লাইফস্টাইল" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.slice(0, 2).map((item) => (
          <ItemLink item={item} key={item.id} className="post-card bg-card rounded overflow-hidden shadow-sm block">
            <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
              {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold leading-relaxed text-foreground hover:text-primary transition-colors">
                <span className="quote-mark">{item.title}</span>
              </h3>
            </div>
          </ItemLink>
        ))}
        <div className="space-y-2">
          {items.slice(2).map((item) => (
            <ItemLink item={item} key={item.id} className="post-card flex gap-3 bg-card rounded p-2 shadow-sm">
              <div className="w-16 h-20 rounded overflow-hidden shrink-0" style={{ aspectRatio: "4/5" }}>
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />}
              </div>
              <h4 className="text-xs font-semibold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-3">
                <span className="quote-mark">{item.title}</span>
              </h4>
            </ItemLink>
          ))}
        </div>
      </div>
    </section>
  );
}
