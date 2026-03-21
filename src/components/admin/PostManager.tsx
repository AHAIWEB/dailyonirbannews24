import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link2, Loader2, ImagePlus, Tags, MapPin, FolderPlus, Send, Plus, X, Upload, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = [
  "জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন", "খেলাধুলা",
  "প্রযুক্তি", "শিক্ষা", "স্বাস্থ্যসেবা", "লাইফস্টাইল", "দেশ বাংলা",
  "মতামত", "ভিডিও", "ওয়েব স্টোরি", "হাইলাইটস", "আলোচিত", "স্পট লাইট",
];

interface UploadedImage {
  file?: File;
  url: string;
  caption: string;
  uploading?: boolean;
}

export default function PostManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL fetch
  const [url, setUrl] = useState("");
  const [fetched, setFetched] = useState<any>(null);

  // Editor fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Multiple images
  const [images, setImages] = useState<UploadedImage[]>([]);

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
        if (result.data.image) {
          setImages(prev => [...prev, { url: result.data.image, caption: result.data.title || "" }]);
        }
      } else {
        toast.error(result.error || "ফেচ ব্যর্থ");
      }
    } catch {
      toast.error("সার্ভারে সংযোগ ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newImages: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const localUrl = URL.createObjectURL(file);
      newImages.push({ file, url: localUrl, caption: "", uploading: true });
    }
    setImages(prev => [...prev, ...newImages]);

    // Upload each to storage
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i].file!;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

      const { data, error } = await supabase.storage.from("post-images").upload(path, file);
      if (error) {
        toast.error(`আপলোড ব্যর্থ: ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      setImages(prev => prev.map(img =>
        img.file === file ? { ...img, url: publicUrl, uploading: false, file: undefined } : img
      ));

      // Set first uploaded image as main image
      if (i === 0 && !imageUrl) {
        setImageUrl(publicUrl);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index].url === imageUrl && updated.length > 0) {
        setImageUrl(updated[0].url);
      } else if (updated.length === 0) {
        setImageUrl("");
      }
      return updated;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));
  };

  const setAsMain = (index: number) => {
    setImageUrl(images[index].url);
    toast.success("মেইন ইমেজ সেট হয়েছে");
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

      // Append image gallery to content if multiple images
      let finalContent = content50;
      if (images.length > 1) {
        const gallery = images.map(img =>
          `<figure><img src="${img.url}" alt="${img.caption}" />${img.caption ? `<figcaption>${img.caption}</figcaption>` : ""}</figure>`
        ).join("\n");
        finalContent = `${content50}\n\n<div class="image-gallery">${gallery}</div>`;
      }

      const finalSourceUrl = sourceUrl || url || `${window.location.origin}/post/manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabase.from("rss_articles").upsert({
        title: title.trim(),
        content: finalContent || null,
        image_url: imageUrl || (images[0]?.url) || null,
        source_url: finalSourceUrl,
        source_name: fetched?.siteName || location || "Manual Post",
        category,
        is_published: true,
        is_featured: false,
      } as any, { onConflict: 'source_url' });
      if (error) throw error;
      toast.success(`"${category}" ক্যাটাগরিতে পোস্ট হয়েছে!`);
      setTitle(""); setContent(""); setImageUrl(""); setSourceUrl(""); setUrl(""); setFetched(null); setTags([]); setLocation(""); setImages([]);
    } catch (err: any) {
      toast.error("পোস্ট ব্যর্থ: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none";
  const smallInputClass = "w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">পোস্ট ম্যানেজার</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Fetch */}
        <div className="space-y-3">
          <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Link2 className="w-3 h-3" /> URL থেকে ফেচ করুন</label>
          <div className="flex gap-2">
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchUrl()}
              placeholder="https://example.com/article-url"
              className={`flex-1 ${inputClass}`} />
            <Button size="sm" onClick={fetchUrl} disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            </Button>
          </div>
          {fetched && (
            <div className="bg-muted rounded p-3 space-y-2 relative">
              <button onClick={() => { setFetched(null); }} className="absolute top-1 right-1"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              {fetched.image && <img src={fetched.image} alt="" className="w-full aspect-video object-cover rounded" />}
              <h3 className="text-sm font-bold text-foreground">{fetched.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{fetched.content?.substring(0, 150)}</p>
            </div>
          )}
        </div>

        {/* Editor Fields */}
        <div className="space-y-3">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="শিরোনাম লিখুন..."
            className={`${inputClass} font-bold`} />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="আর্টিকেল লিখুন..." rows={5}
            className={`${inputClass} resize-y`} />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block"><ImagePlus className="w-3 h-3 inline mr-1" />মেইন ইমেজ URL</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                className={smallInputClass} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block"><Link2 className="w-3 h-3 inline mr-1" />সোর্স URL</label>
              <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..."
                className={smallInputClass} />
            </div>
          </div>
        </div>

        {/* Multiple Image Upload */}
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Upload className="w-3 h-3" /> মাল্টিপল ইমেজ আপলোড (ক্যাপশন সহ)
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-xs">
            <Upload className="w-3 h-3 mr-1" /> ছবি নির্বাচন করুন
          </Button>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className={`relative border rounded overflow-hidden ${img.url === imageUrl ? "ring-2 ring-primary" : "border-border"}`}>
                  <div className="aspect-video relative">
                    {img.uploading && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 flex gap-1">
                      {img.url !== imageUrl && (
                        <button onClick={() => setAsMain(i)} title="মেইন ইমেজ"
                          className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[8px]">★</button>
                      )}
                      <button onClick={() => removeImage(i)}
                        className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {img.url === imageUrl && (
                      <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full">মেইন</span>
                    )}
                  </div>
                  <input type="text" value={img.caption} onChange={e => updateCaption(i, e.target.value)}
                    placeholder="ক্যাপশন লিখুন..."
                    className="w-full bg-muted px-2 py-1 text-[10px] text-foreground border-t border-border focus:outline-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common: Category, Tags, Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><FolderPlus className="w-3 h-3" /> ক্যাটাগরি</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={smallInputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> লোকেশন</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="ঢাকা, বাংলাদেশ"
              className={smallInputClass} />
          </div>
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

        <Button onClick={publish} disabled={loading || !title.trim()} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {loading ? "পোস্ট হচ্ছে..." : `"${category}" তে পাবলিশ করুন`}
        </Button>
      </CardContent>
    </Card>
  );
}
