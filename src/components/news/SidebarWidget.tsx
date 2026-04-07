import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const style = widgetStyles[label] || widgetStyles["ভাইরাল"];

  useEffect(() => {
    const load = async () => {
      // Try exact category first
      let { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", label)
        .order("published_at", { ascending: false })
        .limit(1);

      // Fallback to latest post with image
      if (!data || data.length === 0) {
        const fallback = await supabase
          .from("rss_articles")
          .select("*")
          .eq("is_published", true)
          .not("image_url", "is", null)
          .order("published_at", { ascending: false })
          .limit(1);
        data = fallback.data;
      }

      if (data && data.length > 0) setArticle(data[0]);
    };
    load();
  }, [label]);

  if (!article) return null;

  const item = {
    title: article.title,
    image: article.image_url || "",
    url: `/post/${article.id}`,
    excerpt: article.content?.slice(0, 120) || "",
  };

  return (
    <Link to={item.url} className="block rounded-xl overflow-hidden shadow-sm group relative">
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
    </Link>
  );
}
