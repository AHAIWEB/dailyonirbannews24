import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { Link2, Loader2, ExternalLink, Send, Copy, Bookmark, CheckCircle2 } from "lucide-react";

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

  // Protect: admin only
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [authLoading, user, isAdmin, navigate]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FetchedContent | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [customLabel, setCustomLabel] = useState("");

  const predefinedLabels = [
    "জাতীয়", "আন্তর্জাতিক", "রাজনীতি", "অর্থনীতি", "খেলাধুলা",
    "বিনোদন", "তথ্যপ্রযুক্তি", "শিক্ষা", "স্বাস্থ্য", "লাইফস্টাইল",
    "মতামত", "ব্রেকিং", "ভিডিও", "ফটো গ্যালারি", "দেশ-বাংলা",
  ];

  // Auto-fetch if URL came from query params (bookmarklet/share)
  useEffect(() => {
    const paramUrl = searchParams.get("u");
    const paramTitle = searchParams.get("t");
    if (paramUrl) {
      setUrl(paramUrl);
      // If title also provided via share, pre-fill
      if (paramTitle && !data) {
        fetchContent(paramUrl);
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

  // Get half content + "Read more" link
  const getHalfContent = () => {
    if (!data?.content) return "";
    const paragraphs = data.content.split("\n\n").filter(Boolean);
    const half = Math.ceil(paragraphs.length / 2);
    return paragraphs.slice(0, half).join("\n\n");
  };

  const generateBloggerHtml = () => {
    if (!data) return "";
    const halfContent = getHalfContent();
    const paragraphsHtml = halfContent
      .split("\n\n")
      .map((p) => `<p>${p}</p>`)
      .join("\n");

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

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const addCustomLabel = () => {
    const trimmed = customLabel.trim();
    if (trimmed && !selectedLabels.includes(trimmed)) {
      setSelectedLabels((prev) => [...prev, trimmed]);
      setCustomLabel("");
    }
  };

  const openInBlogger = () => {
    if (!data) return;
    const content = generateBloggerHtml();
    const labels = selectedLabels.join(",");
    const bloggerUrl = `https://www.blogger.com/blog-this.g?n=${encodeURIComponent(data.title)}&t=${encodeURIComponent(content)}&u=${encodeURIComponent(data.url)}${labels ? `&l=${encodeURIComponent(labels)}` : ""}`;
    window.open(bloggerUrl, "_blank");
  };

  const copyHtml = () => {
    const html = generateBloggerHtml();
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate bookmarklet code
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
              যেকোনো ওয়েবসাইটের URL দিন — অর্ধেক কন্টেন্ট অটো-ফেচ হবে এবং সোর্স লিংক সহ সরাসরি Blogger-এ পোস্ট করতে পারবেন।
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
                onClick={() => fetchContent()}
                disabled={loading || !url.trim()}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {loading ? "লোড হচ্ছে..." : "ফেচ করুন"}
              </button>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded mt-3">
                {error}
              </div>
            )}
          </div>

          {/* Content Preview */}
          {data && (
            <>
              <div className="bg-card rounded shadow-sm p-6 mb-4">
                <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">
                  প্রিভিউ — যা Blogger-এ পোস্ট হবে
                </h2>

                {/* Image */}
                {data.image && (
                  <div className="rounded overflow-hidden mb-4 aspect-video">
                    <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-black text-foreground leading-relaxed mb-4">
                  {data.title}
                </h3>

                {/* Half content */}
                <div className="text-sm text-foreground leading-[2] space-y-3">
                  {getHalfContent()
                    .split("\n\n")
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                </div>

                {/* Read More CTA */}
                <div className="mt-6 p-4 bg-primary/10 border-r-4 border-primary rounded-l">
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-primary hover:underline flex items-center gap-2"
                  >
                    👉 সম্পূর্ণ আর্টিকেল পড়ুন এখানে &raquo;
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    সূত্র: {data.siteName}
                  </span>
                </div>
              </div>

              {/* Label Selector */}
              <div className="bg-card rounded shadow-sm p-6 mb-4">
                <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">
                  ক্যাটাগরি / লেবেল সিলেক্ট করুন
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedLabels.map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        selectedLabels.includes(label)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomLabel()}
                    placeholder="কাস্টম লেবেল লিখুন..."
                    className="flex-1 bg-muted border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    onClick={addCustomLabel}
                    disabled={!customLabel.trim()}
                    className="bg-accent text-accent-foreground px-4 py-2 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    যোগ করুন
                  </button>
                </div>
                {selectedLabels.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    সিলেক্টেড: <span className="text-foreground font-semibold">{selectedLabels.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-card rounded shadow-sm p-6 mb-4">
                <h2 className="text-sm font-bold text-foreground mb-4 border-b border-border pb-2">
                  পোস্ট করুন
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={openInBlogger}
                    className="bg-[#FF6600] text-white px-5 py-3 rounded text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    Blogger-এ পোস্ট করুন
                  </button>
                  <button
                    onClick={copyHtml}
                    className="bg-muted text-foreground px-5 py-3 rounded text-sm font-semibold hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    {copied ? "কপি হয়েছে!" : "HTML কপি করুন"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Bookmarklet Section */}
          <div className="bg-card rounded shadow-sm p-6 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3 border-b-2 border-primary pb-2">
              ⚡ বুকমার্কলেট — যেকোনো সাইট থেকে শেয়ার করুন
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              নিচের বাটনটি ড্র্যাগ করে আপনার ব্রাউজারের বুকমার্ক বারে রাখুন। এরপর যেকোনো ওয়েবসাইটে গিয়ে ক্লিক করলে সেই পেজের কন্টেন্ট
              সরাসরি কুইক পোস্ট টুলে চলে আসবে।
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
              <span className="text-[11px] text-muted-foreground">← এটি ড্র্যাগ করে বুকমার্ক বারে রাখুন</span>
            </div>
          </div>

          {/* Quick Post Guide */}
          <div className="bg-card rounded shadow-sm p-6">
            <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">
              📖 কুইক পোস্ট ব্যবহার গাইড
            </h2>
            <div className="space-y-4 text-sm text-foreground leading-relaxed">
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">১</span>
                <div>
                  <h4 className="font-bold mb-1">URL দিন ও ফেচ করুন</h4>
                  <p className="text-xs text-muted-foreground">যেকোনো নিউজ সাইটের আর্টিকেল লিংক উপরের বক্সে পেস্ট করুন এবং "ফেচ করুন" বাটনে ক্লিক করুন। সিস্টেম স্বয়ংক্রিয়ভাবে শিরোনাম, ছবি এবং কন্টেন্টের প্রথম অর্ধাংশ নিয়ে আসবে।</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">২</span>
                <div>
                  <h4 className="font-bold mb-1">প্রিভিউ দেখুন</h4>
                  <p className="text-xs text-muted-foreground">ফেচ করার পরে কন্টেন্টের প্রিভিউ দেখানো হবে — ছবি, শিরোনাম, অর্ধেক কন্টেন্ট এবং "সম্পূর্ণ আর্টিকেল পড়ুন" সোর্স লিংক। চেক করুন সবকিছু ঠিক আছে কিনা।</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">৩</span>
                <div>
                  <h4 className="font-bold mb-1">ক্যাটাগরি / লেবেল নির্বাচন</h4>
                  <p className="text-xs text-muted-foreground">পোস্টের জন্য প্রাসঙ্গিক ক্যাটাগরি বা লেবেল সিলেক্ট করুন (জাতীয়, আন্তর্জাতিক, খেলাধুলা ইত্যাদি)। কাস্টম লেবেলও যোগ করতে পারবেন।</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">৪</span>
                <div>
                  <h4 className="font-bold mb-1">Blogger-এ পোস্ট করুন</h4>
                  <p className="text-xs text-muted-foreground">"Blogger-এ পোস্ট করুন" বাটনে ক্লিক করলে Blogger এডিটর খুলবে — শিরোনাম, কন্টেন্ট, সোর্স লিংক ও লেবেল সব অটো-ফিল হয়ে যাবে। শুধু পাবলিশ করুন!</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">৫</span>
                <div>
                  <h4 className="font-bold mb-1">বুকমার্কলেট (দ্রুত শর্টকাট)</h4>
                  <p className="text-xs text-muted-foreground">উপরের "📰 বাংলাখবরে পোস্ট" বাটনটি ড্র্যাগ করে ব্রাউজারের বুকমার্ক বারে রাখুন। এরপর যেকোনো ওয়েবসাইটে থাকা অবস্থায় বুকমার্কলেটে ক্লিক করলে সরাসরি এই টুলে URL চলে আসবে।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
