import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, RefreshCw, Rss, Globe, ExternalLink, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

interface RssFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  is_active: boolean;
  last_fetched_at: string | null;
}

interface RssArticle {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  fetched_at: string;
}

const categories = ["জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন", "খেলাধুলা", "প্রযুক্তি", "শিক্ষা", "স্বাস্থ্য", "লাইফস্টাইল"];

export default function RssFeedManager() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [newFeed, setNewFeed] = useState({ name: "", url: "", category: "জাতীয়" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"feeds" | "articles">("feeds");
  const [articleFilter, setArticleFilter] = useState("all");

  useEffect(() => {
    loadFeeds();
    loadArticles();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleFetchAll();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadFeeds = async () => {
    const { data } = await supabase.from("rss_feeds").select("*").order("created_at", { ascending: false });
    setFeeds((data as any[]) || []);
    setLoading(false);
  };

  const loadArticles = async () => {
    const { data } = await supabase
      .from("rss_articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(100);
    setArticles((data as any[]) || []);
  };

  const addFeed = async () => {
    if (!newFeed.name || !newFeed.url) {
      toast.error("নাম ও URL দিন");
      return;
    }
    const { error } = await supabase.from("rss_feeds").insert({
      name: newFeed.name,
      url: newFeed.url,
      category: newFeed.category,
      created_by: user?.id,
    } as any);
    if (error) {
      toast.error("ফিড যোগ করতে সমস্যা হয়েছে");
      return;
    }
    toast.success("RSS ফিড যোগ হয়েছে");
    setNewFeed({ name: "", url: "", category: "জাতীয়" });
    setShowAddForm(false);
    loadFeeds();
  };

  const deleteFeed = async (id: string) => {
    await supabase.from("rss_feeds").delete().eq("id", id);
    toast.success("ফিড মুছে ফেলা হয়েছে");
    loadFeeds();
  };

  const toggleFeed = async (id: string, isActive: boolean) => {
    await supabase.from("rss_feeds").update({ is_active: !isActive } as any).eq("id", id);
    loadFeeds();
  };

  const handleFetchAll = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss");
      if (error) throw error;
      toast.success(`${data?.totalInserted || 0} টি নতুন আর্টিকেল ফেচ হয়েছে`);
      loadArticles();
    } catch (err: any) {
      toast.error("ফেচ করতে সমস্যা: " + err.message);
    }
    setFetching(false);
  };

  const toggleArticlePublish = async (id: string, current: boolean) => {
    await supabase.from("rss_articles").update({ is_published: !current } as any).eq("id", id);
    loadArticles();
  };

  const toggleArticleFeatured = async (id: string, current: boolean) => {
    await supabase.from("rss_articles").update({ is_featured: !current } as any).eq("id", id);
    loadArticles();
  };

  const deleteArticle = async (id: string) => {
    await supabase.from("rss_articles").delete().eq("id", id);
    toast.success("আর্টিকেল মুছে ফেলা হয়েছে");
    loadArticles();
  };

  const filteredArticles = articleFilter === "all" ? articles : articles.filter(a => a.category === articleFilter);

  if (loading) return <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">RSS ফিড ম্যানেজার</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchAll}
            disabled={fetching}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} />
            {fetching ? "ফেচিং..." : "সব ফেচ করুন"}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> ফিড যোগ করুন
          </button>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted px-3 py-1.5 rounded">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        অটো রিফ্রেশ চালু — প্রতি ১ মিনিটে আপডেট হচ্ছে
      </div>

      {/* Add Feed Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">নতুন RSS ফিড যোগ করুন</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="ফিডের নাম (যেমন: প্রথম আলো)"
              value={newFeed.name}
              onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
              className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <input
              type="url"
              placeholder="RSS URL (https://...)"
              value={newFeed.url}
              onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
              className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <select
              value={newFeed.category}
              onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
              className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addFeed} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold">যোগ করুন</button>
            <button onClick={() => setShowAddForm(false)} className="bg-muted text-foreground px-4 py-2 rounded text-sm">বাতিল</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("feeds")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "feeds" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          ফিড তালিকা ({feeds.length})
        </button>
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "articles" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          আর্টিকেল ({articles.length})
        </button>
      </div>

      {/* Feeds List */}
      {activeTab === "feeds" && (
        <div className="space-y-2">
          {feeds.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">কোনো ফিড যোগ করা হয়নি। উপরের "ফিড যোগ করুন" বাটনে ক্লিক করুন।</p>
          )}
          {feeds.map(feed => (
            <div key={feed.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-foreground truncate">{feed.name}</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">{feed.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${feed.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {feed.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{feed.url}</p>
                {feed.last_fetched_at && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    সর্বশেষ ফেচ: {new Date(feed.last_fetched_at).toLocaleString("bn-BD")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleFeed(feed.id, feed.is_active)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title={feed.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}>
                  {feed.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => deleteFeed(feed.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive" title="মুছুন">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Articles List */}
      {activeTab === "articles" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setArticleFilter("all")}
              className={`text-[10px] px-2 py-1 rounded ${articleFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              সব
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setArticleFilter(c)}
                className={`text-[10px] px-2 py-1 rounded ${articleFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">কোনো আর্টিকেল পাওয়া যায়নি।</p>
          )}

          {filteredArticles.map(article => (
            <div key={article.id} className="flex gap-3 bg-card border border-border rounded-lg p-3">
              {article.image_url && (
                <div className="w-20 h-16 rounded overflow-hidden shrink-0">
                  <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground line-clamp-2">{article.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded">{article.category}</span>
                  <span className="text-[9px] text-muted-foreground">{article.source_name}</span>
                  <span className="text-[9px] text-muted-foreground">{new Date(article.published_at).toLocaleDateString("bn-BD")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleArticleFeatured(article.id, article.is_featured)} className={`p-1 rounded ${article.is_featured ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`} title="ফিচার্ড">
                  <Star className={`w-3.5 h-3.5 ${article.is_featured ? "fill-current" : ""}`} />
                </button>
                <button onClick={() => toggleArticlePublish(article.id, article.is_published)} className="p-1 rounded text-muted-foreground hover:text-foreground" title={article.is_published ? "আনপাবলিশ" : "পাবলিশ"}>
                  {article.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-muted-foreground hover:text-primary">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => deleteArticle(article.id)} className="p-1 rounded text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
