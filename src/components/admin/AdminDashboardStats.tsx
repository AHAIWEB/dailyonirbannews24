import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, Rss, TrendingUp, RefreshCw, Calendar } from "lucide-react";

interface Stats {
  totalArticles: number;
  totalReporters: number;
  totalFeeds: number;
  todayFetched: number;
  totalUsers: number;
  publishedArticles: number;
}

export default function AdminDashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0, totalReporters: 0, totalFeeds: 0,
    todayFetched: 0, totalUsers: 0, publishedArticles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [articles, reporters, feeds, todayArticles, users, published] = await Promise.all([
      supabase.from("rss_articles").select("id", { count: "exact", head: true }),
      supabase.from("reporters").select("id", { count: "exact", head: true }),
      supabase.from("rss_feeds").select("id", { count: "exact", head: true }),
      supabase.from("rss_articles").select("id", { count: "exact", head: true }).gte("fetched_at", today.toISOString()),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("rss_articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    ]);

    setStats({
      totalArticles: articles.count || 0,
      totalReporters: reporters.count || 0,
      totalFeeds: feeds.count || 0,
      todayFetched: todayArticles.count || 0,
      totalUsers: users.count || 0,
      publishedArticles: published.count || 0,
    });
    setLoading(false);
  };

  const cards = [
    { label: "মোট আর্টিকেল", value: stats.totalArticles, icon: FileText, color: "text-blue-600 bg-blue-100" },
    { label: "পাবলিশড", value: stats.publishedArticles, icon: TrendingUp, color: "text-green-600 bg-green-100" },
    { label: "আজকের ফেচ", value: stats.todayFetched, icon: Calendar, color: "text-orange-600 bg-orange-100" },
    { label: "RSS ফিড", value: stats.totalFeeds, icon: Rss, color: "text-purple-600 bg-purple-100" },
    { label: "রিপোর্টার", value: stats.totalReporters, icon: Users, color: "text-red-600 bg-red-100" },
    { label: "মোট ইউজার", value: stats.totalUsers, icon: Users, color: "text-teal-600 bg-teal-100" },
  ];

  const toBangla = (n: number) => String(n).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">ড্যাশবোর্ড ওভারভিউ</h2>
        <button onClick={loadStats} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> রিফ্রেশ
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-3 flex flex-col items-center text-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-foreground">{toBangla(card.value)}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
