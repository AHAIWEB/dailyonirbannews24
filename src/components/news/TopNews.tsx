import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface RssArticle {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  published_at: string;
  is_featured: boolean;
}

export default function TopNews() {
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const mockPosts = generatePosts("শীর্ষ সংবাদ", 3);

  useEffect(() => {
    const load = async () => {
      // Only featured articles for top news
      const { data: featured } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (featured && featured.length > 0) {
        setArticles(featured as RssArticle[]);
        return;
      }

      // Fallback: latest published (but NOT all — just the most recent few)
      const { data: latest } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      setArticles((latest as RssArticle[]) || []);
    };
    load();
  }, []);

  const hasRss = articles.length > 0;

  const items = hasRss
    ? articles.map(a => ({
        id: a.id,
        title: a.title,
        image: a.image_url || "",
        url: `/post/${a.id}`,
        date: new Date(a.published_at).toLocaleDateString("bn-BD"),
        source: a.source_name,
        excerpt: a.content || "",
        category: a.category,
      }))
    : mockPosts.map(p => ({
        id: String(p.id),
        title: p.title,
        image: p.image,
        url: `/post/${p.id}`,
        date: p.date,
        source: "",
        excerpt: p.excerpt,
        category: "শীর্ষ সংবাদ",
      }));

  const hero = items[0];
  const sideItems = items.slice(1, 3);
  const bottomItems = items.slice(3, 6);

  return (
    <section>
      <SectionLabel label="শীর্ষ সংবাদ" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hero && (
          <Link to={hero.url} className="md:col-span-2 post-card bg-card rounded overflow-hidden shadow-sm block relative group">
            <div className="overflow-hidden aspect-video">
              <img src={hero.image} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-semibold">
                {hero.category}
              </span>
              <h2 className="text-lg md:text-xl font-bold mt-2 leading-relaxed text-white group-hover:text-primary transition-colors line-clamp-3">
                {hero.title}
              </h2>
              {hero.excerpt && <p className="text-xs text-white/70 mt-1 line-clamp-2">{hero.excerpt}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                <Clock className="w-3 h-3" />
                <span>{hero.date}</span>
                {hero.source && <><span>•</span><span>{hero.source}</span></>}
              </div>
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-4">
          {sideItems.map((item) => (
            <Link to={item.url} key={item.id} className="post-card bg-card rounded overflow-hidden shadow-sm block relative group">
              <div className="overflow-hidden aspect-video">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-bold leading-relaxed text-white group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <span className="text-[10px] text-white/60 mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {item.date}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {bottomItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {bottomItems.map(item => (
            <Link key={item.id} to={item.url} className="block rounded overflow-hidden group relative">
              <div className="aspect-video bg-muted">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h4 className="text-[11px] font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                  {item.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
