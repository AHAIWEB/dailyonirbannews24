import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Zap, AlertTriangle } from "lucide-react";

interface Props {
  label: string;
  title: string;
}

const widgetStyles: Record<string, { gradient: string; icon: React.ReactNode; badge: string }> = {
  "ভাইরাল": {
    gradient: "from-pink-600 via-rose-500 to-red-500",
    icon: <Zap className="w-3.5 h-3.5" />,
    badge: "🔥",
  },
  "জটিল": {
    gradient: "from-slate-800 via-gray-700 to-zinc-600",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badge: "⚡",
  },
};

export default function SidebarWidget({ label, title }: Props) {
  const [article, setArticle] = useState<any>(null);
  const mockPost = generatePosts(label, 1)[0];
  const style = widgetStyles[label] || widgetStyles["ভাইরাল"];

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", label)
        .order("published_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setArticle(data[0]);
    };
    load();
  }, [label]);

  const hasRss = !!article;
  const item = hasRss
    ? { title: article.title, image: article.image_url || "", url: article.source_url, excerpt: article.content || "", isExternal: true }
    : { title: mockPost.title, image: mockPost.image, url: `/post/${mockPost.id}`, excerpt: mockPost.excerpt, isExternal: false };

  const inner = (
    <>
      <div className={`bg-gradient-to-r ${style.gradient} text-white px-3 py-2 flex items-center gap-2`}>
        {style.icon}
        <span className="text-sm font-black tracking-wider">❝ {title} ❞</span>
        <span className="ml-auto text-lg">{style.badge}</span>
      </div>
      <div className="relative overflow-hidden aspect-[9/16]">
        {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold leading-relaxed text-white group-hover:text-primary transition-colors">{item.title}</h3>
          <p className="text-[10px] text-white/60 mt-1 line-clamp-2">{item.excerpt}</p>
        </div>
      </div>
    </>
  );

  return item.isExternal ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden shadow-sm group relative">{inner}</a>
  ) : (
    <Link to={item.url} className="block rounded-xl overflow-hidden shadow-sm group relative">{inner}</Link>
  );
}
