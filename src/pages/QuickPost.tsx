import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import ShareButtons from "@/components/news/quickpost/ShareButtons";
import LabelSelector from "@/components/news/quickpost/LabelSelector";
import { Link2, Loader2, ExternalLink, Send, ClipboardPaste } from "lucide-react";

interface FetchedContent {
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
  url: string;
  content: string;
}

export default function QuickPost() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("u") || "");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FetchedContent | null>(null);
  const [error, setError] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    const paramUrl = searchParams.get("u") || searchParams.get("url") || searchParams.get("text") || "";
    const extractedUrl = paramUrl.startsWith("http") ? paramUrl : paramUrl.match(/https?:\/\/[^\s]+/)?.[0] || paramUrl;
    if (extractedUrl) {
      setUrl(extractedUrl);
      if (extractedUrl.startsWith("http") && !data) {
        fetchContent(extractedUrl);
      }
    }
  }, [searchParams]);

  const fetchContent = async (targetUrl?: string) => {
    const fetchUrl = targetUrl || url;
    if (!fetchUrl.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-url-metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ url: fetchUrl.trim(), extractContent: true }),
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "কন্টেন্ট আনতে ব্যর্থ হয়েছে");
      }
    } catch {
      setError("সার্ভারের সাথে সংযোগ করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const getHalfContent = () => {
    if (!data?.content) return "";
    const paragraphs = data.content.split("\n\n").filter(Boolean);
    const half = Math.ceil(paragraphs.length / 2);
    return paragraphs.slice(0, half).join("\n\n");
  };

  const generateBloggerHtml = () => {
    if (!data) return "";
    const halfContent = getHalfContent();
    const paragraphsHtml = halfContent.split("\n\n").map((p) => `<p>${p}</p>`).join("\n");
    const imageHtml = data.image
      ? `<div style="text-align:center;margin-bottom:16px;"><img src="${data.image}" alt="${data.title}" style="max-width:100%;border-radius:8px;" /></div>\n`
      : "";
    const sourceHtml = `\n<div style="margin-top:24px;padding:16px;background:#f0fdf4;border-right:4px solid #16a34a;border-radius:8px;">
<p style="margin:0;font-size:18px;font-weight:bold;">
<a href="${data.url}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;text-decoration:none;">
👉 সম্পূর্ণ আর্টিকেল পড়ুন এখানে &raquo;
</a>
</p>
<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">সূত্র: ${data.siteName}</p>
</div>`;
    return imageHtml + paragraphsHtml + sourceHtml;
  };

  const bookmarkletCode = `javascript:void(window.open('${window.location.origin}/quick-post?u='+encodeURIComponent(location.href)+'&t='+encodeURIComponent(document.title),'_blank'))`;

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-6 mb-10">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <div className="bg-card rounded shadow-sm p-6 mb-4">
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              কুইক পোস্ট টুল
            </h1>
            <p className="text-xs text-muted-foreground mt-2">
              যেকোনো ওয়েবসাইটের URL দিন — অর্ধেক কন্টেন্ট অটো-ফেচ হবে এবং সোর্স লিংক সহ Blogger, WordPress বা অন্যান্য প্ল্যাটফর্মে পোস্ট করতে পারবেন।
            </p>
          </div>

          {/* URL Input */}
          <div className="bg-card rounded shadow-sm p-6 mb-4">
            <label className="text-xs font-bold text-foreground block mb-2">আর্টিকেল URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchContent()}
                placeholder="https://example.com/article-url"
                className="flex-1 bg-muted border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setUrl(text.trim());
                      if (text.trim().startsWith("http")) fetchContent(text.trim());
                    }
                  } catch {}
                }}
                className="bg-accent text-accent-foreground px-3 py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                title="ক্লিপবোর্ড থেকে পেস্ট করুন"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span className="hidden sm:inline">পেস্ট</span>
              </button>
              <button
                onClick={() => fetchContent()}
                disabled={loading || !url.trim()}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {loading ? "লোড হচ্ছে..." : "ফেচ করুন"}
              </button>
            </div>
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded mt-3">{error}</div>
            )}
          </div>

          {/* Content Preview */}
          {data && (
            <>
              <div className="bg-card rounded shadow-sm p-6 mb-4">
                <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">
                  প্রিভিউ — যা পোস্ট হবে
                </h2>
                {data.image && (
                  <div className="rounded overflow-hidden mb-4 aspect-video">
                    <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="text-lg font-black text-foreground leading-relaxed mb-4">{data.title}</h3>
                <div className="text-sm text-foreground leading-[2] space-y-3">
                  {getHalfContent().split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-primary/10 border-r-4 border-primary rounded-l">
                  <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-primary hover:underline flex items-center gap-2">
                    👉 সম্পূর্ণ আর্টিকেল পড়ুন এখানে &raquo;
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-[11px] text-muted-foreground mt-1 block">সূত্র: {data.siteName}</span>
                </div>
              </div>

              {/* Label Selector */}
              <LabelSelector selectedLabels={selectedLabels} setSelectedLabels={setSelectedLabels} />

              {/* Share/Post Buttons */}
              <ShareButtons data={data} generateHtml={generateBloggerHtml} selectedLabels={selectedLabels} />
            </>
          )}

          {/* Bookmarklet Section */}
          <div className="bg-card rounded shadow-sm p-6 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3 border-b-2 border-primary pb-2">
              ⚡ বুকমার্কলেট — যেকোনো সাইট থেকে শেয়ার করুন
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              নিচের বাটনটি ড্র্যাগ করে আপনার ব্রাউজারের বুকমার্ক বারে রাখুন।
            </p>
            <div className="flex items-center gap-4">
              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing"
                title="এটি ড্র্যাগ করে বুকমার্ক বারে রাখুন"
              >
                <Send className="w-4 h-4" />
                📰 বাংলাখবরে পোস্ট
              </a>
              <span className="text-[11px] text-muted-foreground">← ড্র্যাগ করে বুকমার্ক বারে রাখুন</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
