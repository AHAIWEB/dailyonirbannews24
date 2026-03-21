import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link2, Loader2, Image, Tags, MapPin, FolderPlus, Send, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = [
  "জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন", "খেলাধুলা",
  "প্রযুক্তি", "শিক্ষা", "স্বাস্থ্যসেবা", "লাইফস্টাইল", "দেশ বাংলা",
  "মতামত", "ভিডিও", "ওয়েব স্টোরি", "হাইলাইটস", "আলোচিত", "স্পট লাইট",
];

export default function PostManager() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"url" | "editor">("url");
  const [loading, setLoading] = useState(false);

  // URL mode
  const [url, setUrl] = useState("");
  const [fetched, setFetched] = useState<any>(null);

  // Editor mode
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Common
  const [category, setCategory] = useState("জাতীয়");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");

  const fetchUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setLoading(false); return; }
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/fetch-url-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ url: url.trim(), extractContent: true }),
      });
      const result = await res.json();
      if (result.success) {
        setFetched(result.data);
        setTitle(result.data.title || "");
        setContent(result.data.content || "");
        setImageUrl(result.data.image || "");
        setSourceUrl(result.data.url || url);
      } else {
        toast.error(result.error || "ফেচ ব্যর্থ");
      }
    } catch {
      toast.error("সার্ভারে সংযোগ ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setTagInput("");
    }
  };

  const publish = async () => {
    if (!title.trim()) { toast.error("শিরোনাম দিন"); return; }
    setLoading(true);
    try {
      const halfContent = content.split("\n\n").filter(Boolean);
      const half = Math.ceil(halfContent.length / 2);
      const content50 = halfContent.slice(0, half).join("\n\n");

      const finalSourceUrl = sourceUrl || url || `${window.location.origin}/post/manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabase.from("rss_articles").upsert({
        title: title.trim(),
        content: content50 || null,
        image_url: imageUrl || null,
        source_url: finalSourceUrl,
        source_name: fetched?.siteName || location || "Manual Post",
        category,
        is_published: true,
        is_featured: false,
      } as any, { onConflict: 'source_url' });
      if (error) throw error;
      toast.success(`"${category}" ক্যাটাগরিতে পোস্ট হয়েছে!`);
      // Reset
      setTitle(""); setContent(""); setImageUrl(""); setSourceUrl(""); setUrl(""); setFetched(null); setTags([]); setLocation("");
    } catch (err: any) {
      toast.error("পোস্ট ব্যর্থ: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">পোস্ট ম্যানেজার</CardTitle>
          <div className="flex gap-1.5">
            <Button variant={mode === "url" ? "default" : "outline"} size="sm" onClick={() => setMode("url")} className="text-xs">
              <Link2 className="w-3 h-3 mr-1" /> URL পোস্ট
            </Button>
            <Button variant={mode === "editor" ? "default" : "outline"} size="sm" onClick={() => setMode("editor")} className="text-xs">
              <Send className="w-3 h-3 mr-1" /> এডিটর পোস্ট
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Mode */}
        {mode === "url" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchUrl()}
                placeholder="https://example.com/article-url"
                className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              <Button size="sm" onClick={fetchUrl} disabled={loading || !url.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              </Button>
            </div>
            {fetched && (
              <div className="bg-muted rounded p-3 space-y-2">
                {fetched.image && <img src={fetched.image} alt="" className="w-full aspect-video object-cover rounded" />}
                <h3 className="text-sm font-bold text-foreground">{fetched.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">{fetched.content?.substring(0, 200)}</p>
              </div>
            )}
          </div>
        )}

        {/* Editor Mode */}
        {mode === "editor" && (
          <div className="space-y-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="শিরোনাম লিখুন..."
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="আর্টিকেল লিখুন..." rows={6}
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground mb-1 block"><Image className="w-3 h-3 inline mr-1" />ইমেজ URL</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                  className="w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground mb-1 block"><Link2 className="w-3 h-3 inline mr-1" />সোর্স URL</label>
                <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..."
                  className="w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* Common: Category, Tags, Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Category */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><FolderPlus className="w-3 h-3" /> ক্যাটাগরি</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Location */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> লোকেশন</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="ঢাকা, বাংলাদেশ"
              className="w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>
          {/* Tags */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Tags className="w-3 h-3" /> ট্যাগ</label>
            <div className="flex gap-1">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="ট্যাগ যোগ করুন"
                className="flex-1 bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={addTag}><Plus className="w-3 h-3" /></Button>
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(t => (
              <span key={t} className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                {t}
                <button onClick={() => setTags(prev => prev.filter(x => x !== t))}><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Publish */}
        <Button onClick={publish} disabled={loading || !title.trim()} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {loading ? "পোস্ট হচ্ছে..." : `"${category}" তে পাবলিশ করুন`}
        </Button>
      </CardContent>
    </Card>
  );
}
