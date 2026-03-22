import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import CardPreview from "@/components/photocard/CardPreview";
import { PRESET_TEMPLATES, DEFAULT_CONTROLS, type CardTemplate, type CardControls } from "@/components/photocard/CardTemplates";
import { Download, Share2, Image, Type, Quote, QrCode, Upload, X, Plus, Palette, LayoutTemplate, Move, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CardImage {
  file: File;
  preview: string;
  caption: string;
}

export default function PhotoCardGenerator() {
  const { user, isAdmin } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);

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
  const [controls, setControls] = useState<CardControls>({ ...DEFAULT_CONTROLS });

  // Custom template overrides
  const [customLogoText, setCustomLogoText] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [customFooterLabel, setCustomFooterLabel] = useState("");
  const [customFooterUrl, setCustomFooterUrl] = useState("");
  const [customBgColor, setCustomBgColor] = useState("#0ea5e9");
  const [customTextColor, setCustomTextColor] = useState("#ffffff");

  const isCustom = selectedTemplate.id === "custom";

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

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      setImages(prev => [...prev, { file, preview: URL.createObjectURL(file), caption: "" }]);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateCaption = (idx: number, caption: string) => {
    setImages(prev => prev.map((img, i) => (i === idx ? { ...img, caption } : img)));
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCustomBgImage(URL.createObjectURL(file));
  };

  const downloadCard = async () => {
    if (!canvasRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `belabhumi-card-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("ফটো কার্ড ডাউনলোড হয়েছে!");
    } catch {
      toast.error("ডাউনলোড ব্যর্থ");
    }
  };

  const shareCard = async () => {
    if (!canvasRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "belabhumi-card.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: title || "বেলাভূমি নিউজ ফটো কার্ড", files: [file] });
        } else {
          downloadCard();
        }
      });
    } catch {
      toast.error("শেয়ার ব্যর্থ");
    }
  };

  const saveToDb = async () => {
    if (!title.trim()) { toast.error("শিরোনাম দিন"); return; }
    setSaving(true);
    try {
      let imgUrl: string | null = null;
      if (images[0]) {
        const ext = images[0].file.name.split(".").pop() || "jpg";
        const path = `photocard/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("post-images")
          .upload(path, images[0].file, { contentType: images[0].file.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
        imgUrl = urlData.publicUrl;
      }
      const sourceUrl = `${window.location.origin}/post/fotocard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabase.from("rss_articles").insert({
        title: title.trim(),
        content: quote || null,
        image_url: imgUrl,
        source_url: sourceUrl,
        source_name: activeTemplate.footerLabel || "বেলাভূমি কণ্ঠ",
        category,
        is_published: true,
      });
      if (error) throw error;
      toast.success("ফটো কার্ড পোস্ট হয়েছে!");
    } catch (err: any) {
      toast.error("পোস্ট ব্যর্থ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateControl = (key: keyof CardControls, value: number) => {
    setControls(prev => ({ ...prev, [key]: value }));
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
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Type className="w-3 h-3 inline mr-1" />শিরোনাম
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="নিউজ শিরোনাম লিখুন..."
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Quote className="w-3 h-3 inline mr-1" />কোটেশন
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

            {/* Font & Size Controls */}
            <div className="p-3 bg-muted rounded-lg border border-border space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1"><ZoomIn className="w-3 h-3" /> ফন্ট ও সাইজ কন্ট্রোল</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">শিরোনাম সাইজ: {controls.titleSize}px</label>
                  <input type="range" min={10} max={32} value={controls.titleSize} onChange={e => updateControl("titleSize", +e.target.value)}
                    className="w-full h-1.5 accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">কোটেশন সাইজ: {controls.quoteSize}px</label>
                  <input type="range" min={8} max={24} value={controls.quoteSize} onChange={e => updateControl("quoteSize", +e.target.value)}
                    className="w-full h-1.5 accent-primary" />
                </div>
              </div>

              <p className="text-[10px] font-bold text-foreground flex items-center gap-1 pt-1"><Move className="w-3 h-3" /> পজিশন মুভ</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">শিরোনাম X: {controls.titleX}</label>
                  <input type="range" min={-50} max={50} value={controls.titleX} onChange={e => updateControl("titleX", +e.target.value)}
                    className="w-full h-1.5 accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">শিরোনাম Y: {controls.titleY}</label>
                  <input type="range" min={-50} max={50} value={controls.titleY} onChange={e => updateControl("titleY", +e.target.value)}
                    className="w-full h-1.5 accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">ছবি X: {controls.imageX}</label>
                  <input type="range" min={-50} max={50} value={controls.imageX} onChange={e => updateControl("imageX", +e.target.value)}
                    className="w-full h-1.5 accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">ছবি Y: {controls.imageY}</label>
                  <input type="range" min={-50} max={50} value={controls.imageY} onChange={e => updateControl("imageY", +e.target.value)}
                    className="w-full h-1.5 accent-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">ছবি স্কেল: {controls.imageScale}%</label>
                <input type="range" min={50} max={150} value={controls.imageScale} onChange={e => updateControl("imageScale", +e.target.value)}
                  className="w-full h-1.5 accent-primary" />
              </div>
              <button onClick={() => setControls({ ...DEFAULT_CONTROLS })} className="text-[10px] text-destructive hover:underline">রিসেট</button>
            </div>

            {/* Background Template Upload */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">
                <Palette className="w-3 h-3 inline mr-1" />ব্যাকগ্রাউন্ড টেম্পলেট আপলোড
              </label>
              <div className="flex gap-2 items-center">
                <input type="file" accept="image/*" onChange={handleBgImageUpload}
                  className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-xs text-foreground file:mr-2 file:px-2 file:py-0.5 file:rounded file:border-0 file:bg-accent file:text-accent-foreground file:text-xs" />
                {customBgImage && (
                  <button onClick={() => setCustomBgImage("")} className="text-destructive text-xs underline">রিমুভ</button>
                )}
              </div>
            </div>

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
                {["বেলাভূমি কণ্ঠ", "জাতীয়", "আন্তর্জাতিক", "রাজনীতি", "খেলা", "বিনোদন", "প্রযুক্তি", "লাইফস্টাইল", "স্বাস্থ্যসেবা", "শিক্ষা", "অর্থনীতি"].map(c => (
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
            <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1"><Image className="w-3 h-3" /> প্রিভিউ</p>
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
              controls={controls}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
