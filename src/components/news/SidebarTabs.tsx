import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Flame, Eye, Sparkles, TrendingUp, MessageCircle, Users } from "lucide-react";

interface Props {
  tabs: { label: string; postLabel: string; count: number }[];
  title?: string;
}

const tabIcons: Record<string, React.ReactNode> = {
  "পিপল": <Users className="w-3 h-3" />,
  "একটু থামুন": <MessageCircle className="w-3 h-3" />,
  "আলোচিত": <Flame className="w-3 h-3" />,
  "স্পট লাইট": <Sparkles className="w-3 h-3" />,
  "জনপ্রিয়": <TrendingUp className="w-3 h-3" />,
};

const tabAccents: Record<string, string> = {
  "পিপল": "from-violet-600 to-purple-700",
  "একটু থামুন": "from-amber-500 to-orange-600",
  "আলোচিত": "from-rose-500 to-red-600",
  "স্পট লাইট": "from-cyan-500 to-blue-600",
  "জনপ্রিয়": "from-emerald-500 to-green-600",
};

export default function SidebarTabs({ tabs, title }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);
  const mockPosts = generatePosts(tabs[activeTab].postLabel, tabs[activeTab].count);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", tabs[activeTab].postLabel)
        .order("published_at", { ascending: false })
        .limit(tabs[activeTab].count);
      setArticles(data || []);
    };
    load();
  }, [activeTab, tabs]);

  const hasRss = articles.length > 0;
  const activeLabel = tabs[activeTab].label;
  const accent = tabAccents[activeLabel] || "from-primary to-primary";

  const items = hasRss
    ? articles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: a.source_url, date: new Date(a.published_at).toLocaleDateString("bn-BD"), isExternal: true }))
    : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, date: p.date, isExternal: false }));

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border/50">
      <div className={`bg-gradient-to-r ${accent} px-3 py-2.5 flex items-center gap-2`}>
        {tabIcons[activeLabel]}
        <span className="text-white text-sm font-bold tracking-wide">{title || activeLabel}</span>
      </div>

      {tabs.length > 1 && (
        <div className="flex bg-muted/50">
          {tabs.map((tab, i) => (
            <button key={tab.label} onClick={() => setActiveTab(i)}
              className={`flex-1 text-[11px] font-bold py-2 transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                i === activeTab ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              {tabIcons[tab.label]}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-border/30">
        {items.map((item, i) => {
          const inner = (
            <>
              <span className={`text-base font-black leading-none mt-1 shrink-0 bg-gradient-to-br ${accent} bg-clip-text text-transparent`}>
                {"০১২৩৪৫৬৭৮৯"[i + 1] || (i + 1)}
              </span>
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/30">
                {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-3">{item.title}</h4>
                <span className="text-[9px] text-muted-foreground mt-0.5 block">{item.date}</span>
              </div>
            </>
          );

          return item.isExternal ? (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className="flex gap-2.5 p-2.5 group hover:bg-muted/50 transition-colors">
              {inner}
            </a>
          ) : (
            <Link key={item.id} to={item.url}
              className="flex gap-2.5 p-2.5 group hover:bg-muted/50 transition-colors">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
