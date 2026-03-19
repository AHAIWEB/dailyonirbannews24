import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { label: "হাইলাইটস", count: 6, layout: "highlight", visible: true },
  { label: "জাতীয়", count: 8, layout: "grid", visible: true },
  { label: "ওয়েব স্টোরি", count: 9, layout: "webstory", visible: true },
  { label: "রাজনীতি", count: 4, layout: "list", visible: true },
  { label: "আন্তর্জাতিক", count: 5, layout: "highlight", visible: true },
  { label: "কালের কন্ঠ", count: 6, layout: "fotocard", visible: true },
  { label: "বিনোদন", count: 6, layout: "grid", visible: true },
  { label: "দেশ বাংলা", count: 8, layout: "deshbangla", visible: true },
  { label: "লাইফস্টাইল", count: 6, layout: "highlight", visible: true },
  { label: "স্বাস্থ্যসেবা", count: 5, layout: "list", visible: true },
  { label: "মতামত", count: 4, layout: "grid", visible: true },
  { label: "ভিডিও", count: 4, layout: "grid", visible: true },
];

const STORAGE_KEY = "site-layout-config";

export default function SiteCustomizer() {
  const [sections, setSections] = useState<SectionConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const saveConfig = async () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    // Also save to site_settings for persistence
    try {
      await supabase.from("site_settings").upsert({
        key: "layout_config",
        value: JSON.stringify(sections),
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "key" });
      toast.success("লেআউট কনফিগ সেভ হয়েছে!");
    } catch {
      toast.success("লোকালি সেভ হয়েছে");
    }
    setSaving(false);
  };

  const updateSection = (idx: number, updates: Partial<SectionConfig>) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const arr = [...sections];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setSections(arr);
  };

  const removeSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const addSection = () => {
    if (!newLabel.trim()) return;
    setSections(prev => [...prev, { label: newLabel.trim(), count: 4, layout: "list", visible: true }]);
    setNewLabel("");
  };

  const resetToDefault = () => {
    setSections(DEFAULT_SECTIONS);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("ডিফল্ট লেআউট পুনরুদ্ধার হয়েছে");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">সাইট কাস্টমাইজ — লেআউট</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetToDefault} className="text-xs">ডিফল্ট</Button>
            <Button size="sm" onClick={saveConfig} disabled={saving} className="text-xs">
              <Save className="w-3 h-3 mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((sec, idx) => (
          <div key={`${sec.label}-${idx}`}
            className={`flex items-center gap-2 p-2 rounded border text-xs ${sec.visible ? "bg-card border-border" : "bg-muted/50 border-border/50 opacity-60"}`}>
            {/* Order */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => moveSection(idx, -1)} className="text-muted-foreground hover:text-foreground"><ArrowUp className="w-3 h-3" /></button>
              <button onClick={() => moveSection(idx, 1)} className="text-muted-foreground hover:text-foreground"><ArrowDown className="w-3 h-3" /></button>
            </div>
            {/* Label */}
            <span className="font-bold text-foreground min-w-[80px]">{sec.label}</span>
            {/* Layout */}
            <select value={sec.layout} onChange={e => updateSection(idx, { layout: e.target.value })}
              className="bg-muted border border-border rounded px-2 py-1 text-[10px] w-24">
              <option value="list">লিস্ট</option>
              <option value="grid">গ্রিড</option>
              <option value="highlight">হাইলাইট</option>
              <option value="magazine">ম্যাগাজিন</option>
              <option value="webstory">ওয়েব স্টোরি</option>
              <option value="fotocard">ফটো কার্ড</option>
              <option value="deshbangla">দেশ বাংলা</option>
            </select>
            {/* Count */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => updateSection(idx, { count: Math.max(1, sec.count - 1) })}
                className="w-5 h-5 bg-muted border border-border rounded flex items-center justify-center text-[10px] hover:bg-accent">−</button>
              <span className="text-[10px] font-bold w-4 text-center">{sec.count}</span>
              <button onClick={() => updateSection(idx, { count: Math.min(20, sec.count + 1) })}
                className="w-5 h-5 bg-muted border border-border rounded flex items-center justify-center text-[10px] hover:bg-accent">+</button>
            </div>
            {/* Toggle visibility */}
            <button onClick={() => updateSection(idx, { visible: !sec.visible })} className="text-muted-foreground hover:text-foreground">
              {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            {/* Delete */}
            <button onClick={() => removeSection(idx)} className="text-destructive/60 hover:text-destructive ml-auto">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Add new section */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSection()}
            placeholder="নতুন ক্যাটাগরি যোগ করুন..."
            className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none" />
          <Button size="sm" variant="outline" onClick={addSection} disabled={!newLabel.trim()} className="text-xs">
            <Plus className="w-3 h-3 mr-1" /> যোগ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
