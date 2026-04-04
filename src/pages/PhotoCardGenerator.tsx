import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import CardPreview, { type ImageTransform, type TextTransform, type ClipShape } from "@/components/photocard/CardPreview";
import { PRESET_TEMPLATES, type CardTemplate } from "@/components/photocard/CardTemplates";
import { Download, Share2, Image, Type, Quote, QrCode, Upload, X, Plus, Palette, LayoutTemplate, Link2, RotateCw, Move, ZoomIn, Layers, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

interface CardImage {
  file?: File;
  preview: string;
  caption: string;
}

interface FetchedArticle {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  published_at: string | null;
}

export default function PhotoCardGenerator() {
  const { user, isAdmin } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(PRESET_TEMPLATES[0]);
  const [title, setTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [images, setImages] = useState<CardImage[]>([]);
  const [qrUrl, setQrUrl] = useState("https://belabhuminews.lovable.app");
  const [showQr, setShowQr] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customBgImage, setCustomBgImage] = useState<string>("");
  const [category, setCategory] = useState("বেলাভূমি কণ্ঠ");
  const [bgOpacity, setBgOpacity] = useState(1);

  // URL fetch
  const [fetchUrl, setFetchUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchedArticles, setFetchedArticles] = useState<FetchedArticle[]>([]);
  const [headlineSearch, setHeadlineSearch] = useState("");
  const [headlineLoading, setHeadlineLoading] = useState(false);

  // Image transform
  const [imageTransform, setImageTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1, rotate: 0 });
  const [titleTransform, setTitleTransform] = useState<TextTransform>({ x: 0, y: 0 });
  const [quoteTransform, setQuoteTransform] = useState<TextTransform>({ x: 0, y: 0 });
  const [frameAspectRatio, setFrameAspectRatio] = useState<number | undefined>(undefined);
  const [imageOnTop, setImageOnTop] = useState(true); // default: image on top for positioning
  const [clipShape, setClipShape] = useState<ClipShape>("none");

  // Custom template overrides
  const [customLogoText, setCustomLogoText] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [customFooterLabel, setCustomFooterLabel] = useState("");
  const [customFooterUrl, setCustomFooterUrl] = useState("");
  const [customBgColor, setCustomBgColor] = useState("#0ea5e9");
  const [customTextColor, setCustomTextColor] = useState("#ffffff");

  const isCustom = selectedTemplate.id === "custom";

  const cardCategories = [
    "বেলাভূমি কণ্ঠ",
    "জাতীয়",
    "আন্তর্জাতিক",
    "রাজনীতি",
    "দেশ বাংলা",
    "বিনোদন",
    "গ্যালারি",
    "ভ্রমণ",
    "চাকরি",
    "ভিডিও",
    "মতামত",
    "খেলা",
    "প্রযুক্তি",
    "লাইফস্টাইল",
    "স্বাস্থ্যসেবা",
    "শিক্ষা",
    "অর্থনীতি",
  ];

  const activeTemplate: CardTemplate = isCustom
    ? {
        ...selectedTemplate,
        bgColor: customBgColor,
        textColor: customTextColor,
        logoText: customLogoText || "কাস্টম",
        subtitleText: customSubtitle,
        footerLabel: customFooterLabel,
        footerUrl: customFooterUrl,
      }
    : selectedTemplate;

  const getMetadataPayload = (payload: any) => payload?.data ?? payload ?? {};

  const stripMarkup = (value: string | null | undefined) =>
    (value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  const buildSmartQuote = (article: Pick<FetchedArticle, "title" | "content">) => {
    const cleanContent = stripMarkup(article.content)
      .replace("[বিস্তারিত পড়তে মূল সূত্রে যান]", "")
      .trim();

    if (!cleanContent) return article.title;

    const sentences = cleanContent
      .split(/(?<=[।!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length >= 28);

    const highlighted =
      sentences.find((sentence) => /[“"❝]/.test(sentence)) ||
      sentences.find((sentence) => sentence.length <= 180) ||
      cleanContent.slice(0, 220);

    return highlighted.slice(0, 220).trim();
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = objectUrl;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const createCardBlob = async () => {
    if (!canvasRef.current) throw new Error("কার্ড প্রিভিউ পাওয়া যায়নি");
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(canvasRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("কার্ড ইমেজ তৈরি ব্যর্থ"));
      }, "image/png");
    });
  };

  const uploadRenderedCard = async () => {
    const blob = await createCardBlob();
    const fileName = `photocard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const path = `photocard/${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from("post-images")
      .upload(path, blob, { contentType: "image/png", upsert: false });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const resetAllTransforms = () => {
    setImageTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
    setTitleTransform({ x: 0, y: 0 });
    setQuoteTransform({ x: 0, y: 0 });
  };

  const clearUploadedFrame = () => {
    if (customBgImage.startsWith("blob:")) {
      URL.revokeObjectURL(customBgImage);
    }
    setCustomBgImage("");
    setFrameAspectRatio(undefined);
    setBgOpacity(1);
  };

  const replaceImagesWithArticle = (article: FetchedArticle) => {
    setImages((previous) => {
      previous.forEach((image) => {
        if (image.preview.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });

      if (!article.image_url) return [];

      return [{
        preview: article.image_url,
        caption: article.source_name || article.category,
      }];
    });
  };

  const applyFetchedArticle = (article: FetchedArticle, withQuote = true) => {
    setTitle(article.title);
    setFetchUrl(article.source_url);
    setQrUrl(`${window.location.origin}/post/${article.id}`);
    setCategory(article.category);
    replaceImagesWithArticle(article);

    if (withQuote) {
      setQuote(buildSmartQuote(article));
    }

    toast.success("ফেচ হওয়া পোস্ট কার্ড মেকারে লোড হয়েছে");
  };

  const pickQuoteFromArticle = (article: FetchedArticle) => {
    setQuote(buildSmartQuote(article));
    toast.success("সংক্ষিপ্ত উক্তি যোগ হয়েছে");
  };

  const loadFetchedArticles = async () => {
    setHeadlineLoading(true);
    try {
      const { data, error } = await supabase
        .from("rss_articles")
        .select("id, title, content, image_url, source_url, source_name, category, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(80);

      if (error) throw error;
      setFetchedArticles((data as FetchedArticle[]) || []);
    } catch (err: any) {
      toast.error(err?.message || "ফেচ হওয়া শিরোনাম লোড করা যায়নি");
    } finally {
      setHeadlineLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadFetchedArticles();
  }, [isAdmin]);

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (!articleId || fetchedArticles.length === 0) return;

    const matchedArticle = fetchedArticles.find((article) => article.id === articleId);
    if (matchedArticle) {
      applyFetchedArticle(matchedArticle, true);
    }
  }, [searchParams, fetchedArticles]);

  const filteredHeadlines = fetchedArticles.filter((article) => {
    const query = headlineSearch.trim().toLowerCase();
    if (!query) return true;

    return [article.title, article.category, article.source_name || ""]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  // Fetch from URL
  const fetchFromUrl = async () => {
    if (!fetchUrl.trim()) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-metadata", {
        body: { url: fetchUrl.trim(), extractContent: true },
      });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || "URL ফেচ ব্যর্থ");

      const metadata = getMetadataPayload(data);

      if (metadata?.title) setTitle(metadata.title);

      const summary = metadata?.content || metadata?.description || "";
      if (summary) setQuote(summary.slice(0, 220));

      if (metadata?.image) {
        setImages((prev) => [{ preview: metadata.image, caption: metadata.siteName || "" }, ...prev]);
      }

      toast.success("URL থেকে শিরোনাম, সংক্ষিপ্ত ও ছবি লোড হয়েছে!");
    } catch (err: any) {
      toast.error(err?.message || "URL ফেচ ব্যর্থ");
    } finally {
      setFetching(false);
    }
  };

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      setImages(prev => [...prev, { file, preview: URL.createObjectURL(file), caption: "" }]);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      if (prev[idx].file) URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateCaption = (idx: number, caption: string) => {
    setImages(prev => prev.map((img, i) => (i === idx ? { ...img, caption } : img)));
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (customBgImage.startsWith("blob:")) {
      URL.revokeObjectURL(customBgImage);
    }

    const previewUrl = URL.createObjectURL(file);
    setCustomBgImage(previewUrl);
    setBgOpacity(1);

    const frameImage = new window.Image();
    frameImage.onload = () => {
      if (frameImage.naturalWidth && frameImage.naturalHeight) {
        setFrameAspectRatio(frameImage.naturalWidth / frameImage.naturalHeight);
      }
    };
    frameImage.src = previewUrl;
  };

  const downloadCard = async () => {
    try {
      const blob = await createCardBlob();
      downloadBlob(blob, `belabhumi-card-${Date.now()}.png`);
      toast.success("ফটো কার্ড ডাউনলোড হয়েছে!");
    } catch (err: any) {
      toast.error(err?.message || "ডাউনলোড ব্যর্থ");
    }
  };

  const shareCard = async () => {
    try {
      const blob = await createCardBlob();
      const file = new File([blob], "belabhumi-card.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: title || "বেলাভূমি নিউজ ফটো কার্ড", files: [file] });
      } else {
        downloadBlob(blob, `belabhumi-card-${Date.now()}.png`);
      }
    } catch (err: any) {
      toast.error(err?.message || "শেয়ার ব্যর্থ");
    }
  };

  const saveToDb = async () => {
    // Allow posting without title - use a default
    const postTitle = title.trim() || "ফটো কার্ড পোস্ট";
    setSaving(true);
    try {
      const imgUrl = await uploadRenderedCard();

      const sourceUrl = `${window.location.origin}/post/fotocard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const { error } = await supabase.from("rss_articles").upsert({
        title: postTitle,
        content: quote || null,
        image_url: imgUrl,
        source_url: sourceUrl,
        source_name: activeTemplate.footerLabel || "বেলাভূমি কণ্ঠ",
        category,
        is_published: true,
      }, { onConflict: "source_url" });
      if (error) throw error;
      toast.success("ফটো কার্ড পোস্ট হয়েছে!");
    } catch (err: any) {
      toast.error("পোস্ট ব্যর্থ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto py-20 text-center">
          <p className="text-muted-foreground">এডমিন অ্যাক্সেস প্রয়োজন</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto py-6 px-3">
        <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
          <Image className="w-6 h-6 text-primary" /> কুইক ফটো কার্ড জেনারেটর
        </h2>

        {/* Template Selector */}
        <div className="mb-4">
          <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <LayoutTemplate className="w-3 h-3" /> টেম্পলেট নির্বাচন
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {PRESET_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t);
                  if (t.id !== "custom") {
                    setCustomBgColor(t.bgColor);
                    setCustomTextColor(t.textColor);
                  }
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                  selectedTemplate.id === t.id
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border hover:border-primary/50"
                }`}
                style={{ backgroundColor: t.bgColor, color: t.textColor }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-3">
            {/* URL Fetch */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Link2 className="w-3 h-3 inline mr-1" />URL থেকে ফেচ করুন
              </label>
              <div className="flex gap-2">
                <input type="url" value={fetchUrl} onChange={e => setFetchUrl(e.target.value)}
                  placeholder="https://example.com/news-article"
                  className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
                <Button onClick={fetchFromUrl} size="sm" disabled={fetching} className="gap-1">
                  {fetching ? "লোড..." : "ফেচ"}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-foreground">ফেচ হওয়া সব শিরোনাম</p>
                <Button type="button" size="sm" variant="outline" onClick={loadFetchedArticles} disabled={headlineLoading}>
                  {headlineLoading ? "রিফ্রেশ..." : "রিফ্রেশ"}
                </Button>
              </div>

              <input
                type="text"
                value={headlineSearch}
                onChange={(e) => setHeadlineSearch(e.target.value)}
                placeholder="শিরোনাম / ক্যাটাগরি / সূত্র খুঁজুন"
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredHeadlines.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">কোনো শিরোনাম পাওয়া যায়নি</p>
                ) : (
                  filteredHeadlines.map((article) => (
                    <div key={article.id} className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
                      <button
                        type="button"
                        onClick={() => applyFetchedArticle(article, true)}
                        className="w-full text-left flex gap-2"
                      >
                        {article.image_url && (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-12 h-12 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed hover:text-primary transition-colors">
                            {article.title}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                            <span>{article.category}</span>
                            {article.source_name && <span>{article.source_name}</span>}
                          </div>
                        </div>
                      </button>

                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => applyFetchedArticle(article, true)}>
                          ক্যানভাসে নিন
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => pickQuoteFromArticle(article)}>
                          উক্তি তুলুন
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Type className="w-3 h-3 inline mr-1" />শিরোনাম
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="নিউজ শিরোনাম লিখুন (ঐচ্ছিক)..."
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Quote className="w-3 h-3 inline mr-1" />কোটেশন / সংক্ষিপ্ত
              </label>
              <textarea value={quote} onChange={e => setQuote(e.target.value)} placeholder="❝ কোটেশন লিখুন... ❞" rows={2}
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Upload className="w-3 h-3 inline mr-1" />ছবি আপলোড (মাল্টিপল)
              </label>
              <input type="file" accept="image/*" multiple onChange={addImages}
                className="w-full bg-muted border border-border rounded px-3 py-2 text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-semibold" />
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.preview} alt="" className="w-full aspect-square object-cover rounded-lg border border-border" />
                      <button onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <input type="text" value={img.caption} onChange={e => updateCaption(idx, e.target.value)}
                        placeholder="ক্যাপশন"
                        className="w-full mt-0.5 bg-muted border border-border rounded px-1 py-0.5 text-[9px] text-foreground focus:outline-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Transform Controls */}
            {images.length > 0 && (
              <div className="p-3 bg-muted rounded-lg border border-border space-y-2">
                <p className="text-xs font-bold text-foreground flex items-center gap-1"><Move className="w-3 h-3" /> ছবি পজিশন ও এঙ্গেল (ড্র্যাগ করেও সরানো যায়)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">X পজিশন ({imageTransform.x}px)</label>
                    <input type="range" min={-220} max={220} value={imageTransform.x}
                      onChange={e => setImageTransform(p => ({ ...p, x: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Y পজিশন ({imageTransform.y}px)</label>
                    <input type="range" min={-220} max={220} value={imageTransform.y}
                      onChange={e => setImageTransform(p => ({ ...p, y: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground flex items-center gap-1"><ZoomIn className="w-3 h-3" /> স্কেল ({imageTransform.scale.toFixed(1)}x)</label>
                    <input type="range" min={0.3} max={5} step={0.1} value={imageTransform.scale}
                      onChange={e => setImageTransform(p => ({ ...p, scale: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground flex items-center gap-1"><RotateCw className="w-3 h-3" /> রোটেট ({imageTransform.rotate}°)</label>
                    <input type="range" min={-360} max={360} value={imageTransform.rotate}
                      onChange={e => setImageTransform(p => ({ ...p, rotate: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                </div>

                {/* Layer toggle */}
                {customBgImage && (
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                      <Layers className="w-3 h-3 text-primary" />
                      <input type="checkbox" checked={imageOnTop} onChange={e => setImageOnTop(e.target.checked)} className="rounded" />
                      ছবি উপরে (পজিশন সেটআপ)
                    </label>
                    <span className="text-[9px] text-muted-foreground">
                      {imageOnTop ? "📌 ছবি ফ্রেমের উপরে — সাইজ/পজিশন ঠিক করুন" : "✅ ছবি ফ্রেমের পেছনে"}
                    </span>
                  </div>
                )}

                {/* Clip shape */}
                <div className="pt-1">
                  <label className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                    <Crop className="w-3 h-3" /> ছবি ক্রপ / ফ্রেম সেপ
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {([
                      { value: "none", label: "কোনোটা না" },
                      { value: "circle", label: "⬤ বৃত্ত" },
                      { value: "rounded", label: "▢ গোল কোণা" },
                      { value: "hexagon", label: "⬡ হেক্সাগন" },
                      { value: "diamond", label: "◆ ডায়মন্ড" },
                      { value: "oval", label: "⬮ ওভাল" },
                    ] as { value: ClipShape; label: string }[]).map(s => (
                      <button
                        key={s.value}
                        onClick={() => setClipShape(s.value)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                          clipShape === s.value
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={resetAllTransforms}
                  className="text-[10px] text-primary underline">রিসেট</button>
              </div>
            )}

            {(title || quote || customBgImage) && (
              <div className="p-3 bg-muted rounded-lg border border-border space-y-2">
                <p className="text-xs font-bold text-foreground flex items-center gap-1"><Type className="w-3 h-3" /> লেখা পজিশন</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">শিরোনাম X ({titleTransform.x}px)</label>
                    <input type="range" min={-220} max={220} value={titleTransform.x}
                      onChange={e => setTitleTransform(p => ({ ...p, x: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">শিরোনাম Y ({titleTransform.y}px)</label>
                    <input type="range" min={-220} max={220} value={titleTransform.y}
                      onChange={e => setTitleTransform(p => ({ ...p, y: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">সংক্ষিপ্ত X ({quoteTransform.x}px)</label>
                    <input type="range" min={-220} max={220} value={quoteTransform.x}
                      onChange={e => setQuoteTransform(p => ({ ...p, x: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">সংক্ষিপ্ত Y ({quoteTransform.y}px)</label>
                    <input type="range" min={-220} max={220} value={quoteTransform.y}
                      onChange={e => setQuoteTransform(p => ({ ...p, y: Number(e.target.value) }))}
                      className="w-full h-1.5 accent-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Background Template Upload */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Palette className="w-3 h-3 inline mr-1" />ফ্রেম / ওভারলে টেম্পলেট আপলোড
              </label>
              <div className="flex gap-2 items-center">
                <input type="file" accept="image/*" onChange={handleBgImageUpload}
                  className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground file:mr-2 file:px-2 file:py-0.5 file:rounded file:border-0 file:bg-accent file:text-accent-foreground file:text-xs" />
                {customBgImage && (
                  <button onClick={clearUploadedFrame} className="text-destructive text-xs underline">রিমুভ</button>
                )}
              </div>
            </div>

            {/* Background Opacity */}
            {customBgImage && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">
                  ফ্রেম অপাসিটি ({Math.round(bgOpacity * 100)}%)
                </label>
                <input type="range" min={0.2} max={1} step={0.05} value={bgOpacity}
                  onChange={e => setBgOpacity(Number(e.target.value))}
                  className="w-full h-1.5 accent-primary" />
              </div>
            )}

            {/* Custom Template Options */}
            {isCustom && (
              <div className="space-y-2 p-3 bg-muted rounded-lg border border-border">
                <p className="text-xs font-bold text-foreground">✨ কাস্টম টেম্পলেট সেটিংস</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">লোগো টেক্সট</label>
                    <input type="text" value={customLogoText} onChange={e => setCustomLogoText(e.target.value)} placeholder="লোগো"
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">সাবটাইটেল</label>
                    <input type="text" value={customSubtitle} onChange={e => setCustomSubtitle(e.target.value)} placeholder="Subtitle"
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">ফুটার লেবেল</label>
                    <input type="text" value={customFooterLabel} onChange={e => setCustomFooterLabel(e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">ফুটার URL</label>
                    <input type="text" value={customFooterUrl} onChange={e => setCustomFooterUrl(e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">ব্যাকগ্রাউন্ড</label>
                    <input type="color" value={customBgColor} onChange={e => setCustomBgColor(e.target.value)} className="w-full h-7 rounded border border-border cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">টেক্সট কালার</label>
                    <input type="color" value={customTextColor} onChange={e => setCustomTextColor(e.target.value)} className="w-full h-7 rounded border border-border cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* Color override for presets */}
            {!isCustom && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground mb-1 block">ব্যাকগ্রাউন্ড</label>
                  <input type="color" value={selectedTemplate.bgColor} onChange={e => setSelectedTemplate(prev => ({ ...prev, bgColor: e.target.value }))}
                    className="w-full h-7 rounded border border-border cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground mb-1 block">টেক্সট কালার</label>
                  <input type="color" value={selectedTemplate.textColor} onChange={e => setSelectedTemplate(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-full h-7 rounded border border-border cursor-pointer" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={showQr} onChange={e => setShowQr(e.target.checked)} className="rounded" />
                <QrCode className="w-3 h-3" /> QR কোড
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} className="rounded" />
                লোগো
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">QR URL</label>
              <input type="url" value={qrUrl} onChange={e => setQrUrl(e.target.value)}
                className="w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">পোস্ট ক্যাটাগরি</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground">
                {cardCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadCard} size="sm" className="gap-1"><Download className="w-4 h-4" /> ডাউনলোড</Button>
              <Button onClick={shareCard} size="sm" variant="outline" className="gap-1"><Share2 className="w-4 h-4" /> শেয়ার</Button>
              <Button onClick={saveToDb} size="sm" variant="secondary" className="gap-1" disabled={saving}>
                <Plus className="w-4 h-4" /> {saving ? "পোস্ট হচ্ছে..." : "সাইটে পোস্ট"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
              <Image className="w-3 h-3" /> প্রিভিউ
            </p>
            <CardPreview
              ref={canvasRef}
              template={activeTemplate}
              title={title}
              quote={quote}
              images={images}
              showQr={showQr}
              showLogo={showLogo}
              qrUrl={qrUrl}
              bgImage={customBgImage}
              bgOpacity={bgOpacity}
              frameAspectRatio={frameAspectRatio}
              imageTransform={imageTransform}
              titleTransform={titleTransform}
              quoteTransform={quoteTransform}
              imageOnTop={imageOnTop}
              clipShape={clipShape}
              onImageTransformChange={setImageTransform}
              onTitleTransformChange={setTitleTransform}
              onQuoteTransformChange={setQuoteTransform}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
