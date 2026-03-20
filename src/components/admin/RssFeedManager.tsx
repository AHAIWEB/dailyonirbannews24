import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, RefreshCw, Rss, Globe, ExternalLink, Eye, EyeOff, Star, Send, Edit3, Save, X } from "lucide-react";
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

const DEFAULT_CATEGORIES = ["জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন", "খেলাধুলা", "প্রযুক্তি", "শিক্ষা", "স্বাস্থ্যসেবা", "লাইফস্টাইল", "মতামত", "সারা দেশ", "অপরাধ"];

export default function RssFeedManager() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [newFeed, setNewFeed] = useState({ name: "", url: "", category: "জাতীয়" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"feeds" | "articles">("feeds");
  const [articleFilter, setArticleFilter] = useState("all");
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ title: string; content: string; category: string }>({ title: "", content: "", category: "" });
  const [editingFeed, setEditingFeed] = useState<string | null>(null);
  const [editFeedData, setEditFeedData] = useState<{ name: string; url: string; category: string }>({ name: "", url: "", category: "" });

  useEffect(() => {
    loadFeeds();
    loadArticles();
    loadCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { handleFetchAll(); }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadFeeds = async () => {
    const { data } = await supabase.from("rss_feeds").select("*").order("created_at", { ascending: false });
    setFeeds((data as any[]) || []);
    setLoading(false);
  };

  const loadArticles = async () => {
    const { data } = await supabase.from("rss_articles").select("*").order("published_at", { ascending: false }).limit(100);
    setArticles((data as any[]) || []);
  };

  const loadCategories = async () => {
    // Fetch unique categories from articles + feeds
    const { data: articleCats } = await supabase.from("rss_articles").select("category");
    const { data: feedCats } = await supabase.from("rss_feeds").select("category");
    const allCats = new Set(DEFAULT_CATEGORIES);
    articleCats?.forEach((a: any) => { if (a.category) allCats.add(a.category); });
    feedCats?.forEach((f: any) => { if (f.category) allCats.add(f.category); });
    setCategories(Array.from(allCats));
  };

  const addFeed = async () => {
    if (!newFeed.name || !newFeed.url) { toast.error("নাম ও URL দিন"); return; }
    const { error } = await supabase.from("rss_feeds").insert({ name: newFeed.name, url: newFeed.url, category: newFeed.category, created_by: user?.id } as any);
    if (error) { toast.error("ফিড যোগ করতে সমস্যা হয়েছে"); return; }
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

  const startEditFeed = (feed: RssFeed) => {
    setEditingFeed(feed.id);
    setEditFeedData({ name: feed.name, url: feed.url, category: feed.category });
  };

  const saveEditFeed = async (id: string) => {
    await supabase.from("rss_feeds").update({ name: editFeedData.name, url: editFeedData.url, category: editFeedData.category } as any).eq("id", id);
    toast.success("ফিড আপডেট হয়েছে");
    setEditingFeed(null);
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

  const publishToCategory = async (id: string, category: string) => {
    await supabase.from("rss_articles").update({ category, is_published: true, is_featured: true } as any).eq("id", id);
    toast.success(`"${category}" সেকশনে ফিচার্ড পোস্ট করা হয়েছে`);
    loadArticles();
  };

  const startEditArticle = (article: RssArticle) => {
    setEditingArticle(article.id);
    setEditData({ title: article.title, content: article.content || "", category: article.category });
  };

  const saveEditArticle = async (id: string) => {
    await supabase.from("rss_articles").update({ title: editData.title, content: editData.content, category: editData.category } as any).eq("id", id);
    toast.success("আর্টিকেল আপডেট হয়েছে");
    setEditingArticle(null);
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
          <button onClick={handleFetchAll} disabled={fetching}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} />
            {fetching ? "ফেচিং..." : "সব ফেচ করুন"}
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-semibold">
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
            <input type="text" placeholder="ফিডের নাম" value={newFeed.name}
              onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
              className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            <input type="url" placeholder="RSS URL (https://...)" value={newFeed.url}
              onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
              className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            <select value={newFeed.category} onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
              className="bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
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
        <button onClick={() => setActiveTab("feeds")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "feeds" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          ফিড তালিকা ({feeds.length})
        </button>
        <button onClick={() => setActiveTab("articles")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "articles" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          আর্টিকেল ({articles.length})
        </button>
      </div>

      {/* Feeds List */}
      {activeTab === "feeds" && (
        <div className="space-y-2">
          {feeds.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">কোনো ফিড যোগ করা হয়নি।</p>}
          {feeds.map(feed => (
            <div key={feed.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              {editingFeed === feed.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input type="text" value={editFeedData.name} onChange={(e) => setEditFeedData({ ...editFeedData, name: e.target.value })}
                      className="bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                    <input type="url" value={editFeedData.url} onChange={(e) => setEditFeedData({ ...editFeedData, url: e.target.value })}
                      className="bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                    <select value={editFeedData.category} onChange={(e) => setEditFeedData({ ...editFeedData, category: e.target.value })}
                      className="bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => saveEditFeed(feed.id)} className="flex items-center gap-1 bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold">
                      <Save className="w-3 h-3" /> সেভ
                    </button>
                    <button onClick={() => setEditingFeed(null)} className="flex items-center gap-1 bg-muted text-foreground px-2.5 py-1 rounded text-xs">
                      <X className="w-3 h-3" /> বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
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
                    {feed.last_fetched_at && <p className="text-[9px] text-muted-foreground mt-0.5">সর্বশেষ ফেচ: {new Date(feed.last_fetched_at).toLocaleString("bn-BD")}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEditFeed(feed)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleFeed(feed.id, feed.is_active)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                      {feed.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteFeed(feed.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Articles List */}
      {activeTab === "articles" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setArticleFilter("all")}
              className={`text-[10px] px-2 py-1 rounded ${articleFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              সব
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setArticleFilter(c)}
                className={`text-[10px] px-2 py-1 rounded ${articleFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {c}
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">কোনো আর্টিকেল পাওয়া যায়নি।</p>}

          {filteredArticles.map(article => (
            <div key={article.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              {editingArticle === article.id ? (
                <div className="space-y-2">
                  <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                  <textarea value={editData.content} onChange={(e) => setEditData({ ...editData, content: e.target.value })} rows={3}
                    className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none" />
                  <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <button onClick={() => saveEditArticle(article.id)} className="flex items-center gap-1 bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold">
                      <Save className="w-3 h-3" /> সেভ
                    </button>
                    <button onClick={() => setEditingArticle(null)} className="flex items-center gap-1 bg-muted text-foreground px-2.5 py-1 rounded text-xs">
                      <X className="w-3 h-3" /> বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
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
                      <button onClick={() => toggleArticleFeatured(article.id, article.is_featured)} className={`p-1 rounded ${article.is_featured ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}>
                        <Star className={`w-3.5 h-3.5 ${article.is_featured ? "fill-current" : ""}`} />
                      </button>
                      <button onClick={() => toggleArticlePublish(article.id, article.is_published)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                        {article.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => startEditArticle(article)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => deleteArticle(article.id)} className="p-1 rounded text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* One-click category post buttons */}
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-border/50">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 mr-1">
                      <Send className="w-2.5 h-2.5" /> পোস্ট:
                    </span>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => publishToCategory(article.id, cat)}
                        className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${article.category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
