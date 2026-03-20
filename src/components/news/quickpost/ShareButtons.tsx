import { useState } from "react";
import { Bookmark, Copy, CheckCircle2, Globe, FileText, Share2, Database, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareButtonsProps {
  data: {
    title: string;
    url: string;
    siteName: string;
    image: string;
    description?: string;
    content?: string;
  };
  generateHtml: () => string;
  selectedLabels: string[];
}

export default function ShareButtons({ data, generateHtml, selectedLabels }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);

  const postToReact = async () => {
    setPosting(true);
    try {
      const halfContent = data.content || data.description || "";
      const paragraphs = halfContent.split("\n\n").filter(Boolean);
      const half = Math.ceil(paragraphs.length / 2);
      const content50 = paragraphs.slice(0, half).join("\n\n");

      const category = selectedLabels[0] || "জাতীয়";
      const { error } = await supabase.from("rss_articles").upsert({
        title: data.title,
        content: content50,
        image_url: data.image || null,
        source_url: data.url,
        source_name: data.siteName || "Quick Post",
        category,
        is_published: true,
        is_featured: false,
      } as any, { onConflict: 'source_url' });
      if (error) throw error;
      toast.success(`"${category}" ক্যাটাগরিতে পোস্ট হয়েছে!`);
    } catch (err: any) {
      toast.error("পোস্ট করতে সমস্যা: " + (err.message || ""));
    } finally {
      setPosting(false);
    }
  };

  const openInBlogger = () => {
    const content = generateHtml();
    const labels = selectedLabels.join(",");
    const bloggerUrl = `https://www.blogger.com/blog-this.g?n=${encodeURIComponent(data.title)}&t=${encodeURIComponent(content)}&u=${encodeURIComponent(data.url)}${labels ? `&l=${encodeURIComponent(labels)}` : ""}`;
    window.open(bloggerUrl, "_blank");
  };

  const openInWordPress = () => {
    const content = generateHtml();
    const tags = selectedLabels.join(",");
    const wpUrl = `https://wordpress.com/post?title=${encodeURIComponent(data.title)}&content=${encodeURIComponent(content)}&tags=${encodeURIComponent(tags)}&url=${encodeURIComponent(data.url)}`;
    window.open(wpUrl, "_blank");
  };

  const openInMedium = () => {
    const mediumUrl = `https://medium.com/new-story?title=${encodeURIComponent(data.title)}&content=${encodeURIComponent(data.url)}`;
    window.open(mediumUrl, "_blank");
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`;
    window.open(telegramUrl, "_blank");
  };

  const shareToWhatsApp = () => {
    const text = `${data.title}\n${data.url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title)}`;
    window.open(fbUrl, "_blank");
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`;
    window.open(twitterUrl, "_blank");
  };

  const copyHtml = () => {
    const html = generateHtml();
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded shadow-sm p-6 mb-4">
      <h2 className="text-sm font-bold text-foreground mb-4 border-b border-border pb-2">
        পোস্ট / শেয়ার করুন
      </h2>

      {/* Publishing Platforms */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">📝 পাবলিশ করুন</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={postToReact}
            disabled={posting}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {posting ? "পোস্ট হচ্ছে..." : "React সাইটে পোস্ট"}
          </button>
          <button
            onClick={openInBlogger}
            className="bg-[#FF6600] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4" />
            Blogger
          </button>
          <button
            onClick={openInWordPress}
            className="bg-[#21759B] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            WordPress
          </button>
          <button
            onClick={openInMedium}
            className="bg-[#000000] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Medium
          </button>
          <button
            onClick={copyHtml}
            className="bg-muted text-foreground px-4 py-2.5 rounded text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-2"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            {copied ? "কপি হয়েছে!" : "HTML কপি"}
          </button>
        </div>
      </div>

      {/* Social Share */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">📢 সোশ্যাল শেয়ার</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={shareToFacebook} className="bg-[#1877F2] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2">Facebook</button>
          <button onClick={shareToTwitter} className="bg-[#1DA1F2] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2">Twitter/X</button>
          <button onClick={shareToWhatsApp} className="bg-[#25D366] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2">WhatsApp</button>
          <button onClick={shareToTelegram} className="bg-[#0088CC] text-white px-4 py-2.5 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2">Telegram</button>
        </div>
      </div>
    </div>
  );
}
