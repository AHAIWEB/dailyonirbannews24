import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { Download, Share2, Eye, Image, Type, Quote, QrCode, Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
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

  const [title, setTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [images, setImages] = useState<CardImage[]>([]);
  const [qrUrl, setQrUrl] = useState("https://belabhuminews.lovable.app");
  const [showQr, setShowQr] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [bgColor, setBgColor] = useState("#0ea5e9");
  const [textColor, setTextColor] = useState("#ffffff");
  const [category, setCategory] = useState("বেলাভূমি কণ্ঠ");
  const [saving, setSaving] = useState(false);

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: CardImage[] = [];
    Array.from(files).forEach(file => {
      newImages.push({ file, preview: URL.createObjectURL(file), caption: "" });
    });
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateCaption = (idx: number, caption: string) => {
    setImages(prev => prev.map((img, i) => i === idx ? { ...img, caption } : img));
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
      const sourceUrl = `${window.location.origin}/post/fotocard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const imgUrl = images[0]?.preview || null;
      
      const { error } = await supabase.from("rss_articles").upsert({
        title: title.trim(),
        content: quote || null,
        image_url: imgUrl,
        source_url: sourceUrl,
        source_name: "বেলাভূমি কণ্ঠ",
        category,
        is_published: true,
      } as any, { onConflict: 'source_url' });
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
      <div className="container mx-auto py-6">
        <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
          <Image className="w-6 h-6 text-primary" /> কুইক ফটো কার্ড জেনারেটর
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block"><Type className="w-3 h-3 inline mr-1" />শিরোনাম</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="নিউজ শিরোনাম লিখুন..."
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block"><Quote className="w-3 h-3 inline mr-1" />কোটেশন</label>
              <textarea value={quote} onChange={e => setQuote(e.target.value)} placeholder="❝ কোটেশন লিখুন... ❞" rows={3}
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
            </div>

            {/* Multiple Image Upload */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block"><Upload className="w-3 h-3 inline mr-1" />ছবি আপলোড (মাল্টিপল)</label>
              <input type="file" accept="image/*" multiple onChange={addImages}
                className="w-full bg-muted border border-border rounded px-3 py-2 text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-semibold" />
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.preview} alt="" className="w-full aspect-square object-cover rounded-lg border border-border" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                      <input type="text" value={img.caption} onChange={e => updateCaption(idx, e.target.value)}
                        placeholder="ক্যাপশন..."
                        className="w-full mt-1 bg-muted border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">ব্যাকগ্রাউন্ড</label>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 rounded border border-border cursor-pointer" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">টেক্সট কালার</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 rounded border border-border cursor-pointer" />
              </div>
            </div>

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

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadCard} size="sm" className="gap-1"><Download className="w-4 h-4" /> ডাউনলোড</Button>
              <Button onClick={shareCard} size="sm" variant="outline" className="gap-1"><Share2 className="w-4 h-4" /> শেয়ার</Button>
              <Button onClick={saveToDb} size="sm" variant="secondary" className="gap-1" disabled={saving}>
                <Plus className="w-4 h-4" /> {saving ? "পোস্ট হচ্ছে..." : "পোস্ট করুন"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> প্রিভিউ</p>
            <div ref={canvasRef} className="rounded-2xl overflow-hidden shadow-2xl max-w-[400px] mx-auto" style={{ backgroundColor: bgColor }}>
              {/* Header */}
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                {showLogo && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <span className="font-black text-sm" style={{ color: textColor }}>বে</span>
                    </div>
                    <div>
                      <p className="text-sm font-black leading-tight" style={{ color: textColor }}>বেলাভূমি NEWS</p>
                      <p className="text-[7px] opacity-60" style={{ color: textColor }}>Belabhumi News</p>
                    </div>
                  </div>
                )}
                <span className="text-[8px] opacity-50" style={{ color: textColor }}>
                  {new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              {/* Image */}
              {images[0] && (
                <div className="px-3">
                  <div className="rounded-xl overflow-hidden aspect-[4/3]">
                    <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
                  </div>
                  {images[0].caption && (
                    <p className="text-[9px] mt-1 opacity-60 text-center" style={{ color: textColor }}>{images[0].caption}</p>
                  )}
                </div>
              )}

              {/* Title */}
              {title && (
                <div className="px-4 pt-3">
                  <h3 className="text-base font-black leading-relaxed" style={{ color: textColor }}>
                    {title}
                  </h3>
                </div>
              )}

              {/* Quote */}
              {quote && (
                <div className="px-4 pt-2">
                  <div className="border-r-2 pr-3" style={{ borderColor: `${textColor}40` }}>
                    <p className="text-xs italic leading-relaxed opacity-80" style={{ color: textColor }}>
                      ❝ {quote} ❞
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 pt-3 pb-4 flex items-end justify-between">
                <div>
                  <p className="text-[8px] font-bold opacity-60" style={{ color: textColor }}>বেলাভূমি কণ্ঠ</p>
                  <p className="text-[7px] opacity-40" style={{ color: textColor }}>belabhuminews.lovable.app</p>
                </div>
                {showQr && (
                  <div className="bg-white rounded-lg p-1.5">
                    <QRCodeSVG value={qrUrl} size={48} />
                  </div>
                )}
              </div>

              {/* Additional images grid */}
              {images.length > 1 && (
                <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
                  {images.slice(1, 4).map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden aspect-square relative">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                          <p className="text-[7px] text-white truncate">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
