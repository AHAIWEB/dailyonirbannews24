import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw, LayoutGrid, List, Columns, Image, Map, Tv, FolderTree, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
  subcategories?: string[];
}

interface SidebarConfig {
  leftTabs: { label: string; count: number }[];
  rightTabs: { label: string; count: number }[];
  rightPopular: { label: string; count: number }[];
  leftWidget: string;
  rightWidget: string;
}

const LAYOUT_OPTIONS = [
  { value: "list", label: "লিস্ট", icon: List },
  { value: "grid", label: "গ্রিড", icon: LayoutGrid },
  { value: "highlight", label: "হাইলাইট", icon: Columns },
  { value: "magazine", label: "ম্যাগাজিন", icon: Image },
  { value: "webstory", label: "ওয়েব স্টোরি", icon: Tv },
  { value: "fotocard", label: "ফটো কার্ড", icon: Image },
  { value: "deshbangla", label: "দেশ বাংলা", icon: Map },
];

const SPECIAL_SECTIONS = ["ওয়েব স্টোরি", "বেলাভূমি কণ্ঠ", "বিনোদন", "দেশ বাংলা", "লাইফস্টাইল", "মতামত", "ভিডিও"];

// শীর্ষ সংবাদ is NOT a category — it's a fixed featured section at the top, always visible
// It shows is_featured articles from ANY category. Not shown in customizer.

const DEFAULT_SECTIONS: SectionConfig[] = [
  { label: "হাইলাইটস", count: 6, layout: "highlight", visible: true },
  { label: "জাতীয়", count: 8, layout: "grid", visible: true },
  { label: "ওয়েব স্টোরি", count: 9, layout: "webstory", visible: true },
  { label: "রাজনীতি", count: 4, layout: "magazine", visible: true },
  { label: "আন্তর্জাতিক", count: 5, layout: "highlight", visible: true },
  { label: "বেলাভূমি কণ্ঠ", count: 6, layout: "fotocard", visible: true },
  { label: "বিনোদন", count: 6, layout: "grid", visible: true },
  { label: "দেশ বাংলা", count: 8, layout: "deshbangla", visible: true },
  { label: "লাইফস্টাইল", count: 6, layout: "highlight", visible: true },
  { label: "স্বাস্থ্যসেবা", count: 5, layout: "list", visible: true },
  { label: "মতামত", count: 4, layout: "grid", visible: true },
  { label: "ভিডিও", count: 4, layout: "grid", visible: true },
  { label: "অর্থনীতি", count: 4, layout: "grid", visible: true },
  { label: "খেলাধুলা", count: 4, layout: "grid", visible: true },
  { label: "প্রযুক্তি", count: 4, layout: "list", visible: true },
  { label: "শিক্ষা", count: 4, layout: "list", visible: true },
];

const STORAGE_KEY = "site-layout-config";

const DEFAULT_SIDEBAR: SidebarConfig = {
  leftTabs: [
    { label: "পিপল", count: 7 },
    { label: "একটু থামুন", count: 7 },
  ],
  rightTabs: [
    { label: "আলোচিত", count: 7 },
    { label: "স্পট লাইট", count: 7 },
  ],
  rightPopular: [
    { label: "জনপ্রিয়", count: 7 },
  ],
  leftWidget: "ভাইরাল",
  rightWidget: "জটিল",
};

export default function SiteCustomizer() {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [sidebar, setSidebar] = useState<SidebarConfig>(DEFAULT_SIDEBAR);
  const [newLabel, setNewLabel] = useState("");
  const [newSubcat, setNewSubcat] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load config
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "layout_config")
          .maybeSingle();
        
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
          }
        }
      } catch {}

      // Load sidebar config
      try {
        const { data: sData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "sidebar_config")
          .maybeSingle();
        if (sData?.value) {
          const parsed = JSON.parse(sData.value);
          if (parsed && typeof parsed === "object") {
            setSidebar({ ...DEFAULT_SIDEBAR, ...parsed });
          }
        }
      } catch {}

      setLoading(false);
    };
    load();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
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
    if (sections.some(s => s.label === newLabel.trim())) {
      toast.error("এই ক্যাটাগরি আগে থেকেই আছে");
      return;
    }
    setSections(prev => [...prev, { label: newLabel.trim(), count: 4, layout: "grid", visible: true, subcategories: [] }]);
    setNewLabel("");
    toast.success(`"${newLabel.trim()}" ক্যাটাগরি যোগ হয়েছে`);
  };

  const addSubcategory = (idx: number) => {
    if (!newSubcat.trim()) return;
    const sec = sections[idx];
    const subs = sec.subcategories || [];
    if (subs.includes(newSubcat.trim())) return;
    updateSection(idx, { subcategories: [...subs, newSubcat.trim()] });
    setNewSubcat("");
  };

  const removeSubcategory = (idx: number, sub: string) => {
    const sec = sections[idx];
    updateSection(idx, { subcategories: (sec.subcategories || []).filter(s => s !== sub) });
  };

  const resetToDefault = () => {
    setSections([...DEFAULT_SECTIONS]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("ডিফল্ট লেআউট পুনরুদ্ধার হয়েছে");
  };

  const getLayoutIcon = (layout: string) => {
    const opt = LAYOUT_OPTIONS.find(o => o.value === layout);
    return opt ? opt.icon : LayoutGrid;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          লোড হচ্ছে...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Layout Customizer */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                সাইট লেআউট কাস্টমাইজার
              </CardTitle>
              <p className="text-[10px] text-muted-foreground mt-1">
                সেকশন সাজান, লেআউট বদলান, পোস্ট সংখ্যা নিয়ন্ত্রণ করুন
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={resetToDefault} className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> ডিফল্ট
              </Button>
              <Button size="sm" onClick={saveConfig} disabled={saving} className="text-xs">
                <Save className="w-3 h-3 mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {sections.map((sec, idx) => {
            const LayoutIcon = getLayoutIcon(sec.layout);
            const isExpanded = expandedIdx === idx;
            const isSpecial = SPECIAL_SECTIONS.includes(sec.label);

            return (
              <div key={`${sec.label}-${idx}`} className="rounded-lg border border-border overflow-hidden">
                {/* Main row */}
                <div className={`flex items-center gap-1.5 px-2 py-2 text-xs transition-colors ${
                  sec.visible ? "bg-card" : "bg-muted/50 opacity-60"
                }`}>
                  {/* Grip + Order */}
                  <div className="flex flex-col gap-0 shrink-0">
                    <button onClick={() => moveSection(idx, -1)} className="text-muted-foreground hover:text-primary p-0.5">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveSection(idx, 1)} className="text-muted-foreground hover:text-primary p-0.5">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Index badge */}
                  <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* Label */}
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="font-bold text-foreground min-w-0 flex items-center gap-1 flex-1 text-left"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-primary shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                    <span className="truncate">{sec.label}</span>
                    {isSpecial && (
                      <span className="text-[8px] bg-accent text-accent-foreground px-1 py-0 rounded shrink-0">বিশেষ</span>
                    )}
                    {(sec.subcategories?.length || 0) > 0 && (
                      <span className="text-[8px] bg-primary/10 text-primary px-1 py-0 rounded shrink-0">
                        +{sec.subcategories!.length}
                      </span>
                    )}
                  </button>

                  {/* Layout selector */}
                  <div className="flex items-center gap-1 shrink-0">
                    <LayoutIcon className="w-3 h-3 text-muted-foreground" />
                    <select
                      value={sec.layout}
                      onChange={e => updateSection(idx, { layout: e.target.value })}
                      className="bg-muted border border-border rounded px-1.5 py-0.5 text-[10px] w-20"
                    >
                      {LAYOUT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Count */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => updateSection(idx, { count: Math.max(1, sec.count - 1) })}
                      className="w-5 h-5 bg-muted border border-border rounded flex items-center justify-center text-[10px] hover:bg-accent"
                    >−</button>
                    <span className="text-[10px] font-bold w-4 text-center">{sec.count}</span>
                    <button
                      onClick={() => updateSection(idx, { count: Math.min(20, sec.count + 1) })}
                      className="w-5 h-5 bg-muted border border-border rounded flex items-center justify-center text-[10px] hover:bg-accent"
                    >+</button>
                  </div>

                  {/* Visibility */}
                  <button onClick={() => updateSection(idx, { visible: !sec.visible })} className="text-muted-foreground hover:text-primary p-1">
                    {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete */}
                  <button onClick={() => removeSection(idx)} className="text-destructive/60 hover:text-destructive p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanded: Subcategories */}
                {isExpanded && (
                  <div className="px-3 py-2 bg-muted/30 border-t border-border space-y-2">
                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <FolderTree className="w-3 h-3" /> সাব-ক্যাটাগরি
                    </p>
                    {(sec.subcategories || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sec.subcategories!.map(sub => (
                          <span key={sub} className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-2 py-0.5 text-[10px]">
                            {sub}
                            <button onClick={() => removeSubcategory(idx, sub)} className="text-destructive/60 hover:text-destructive">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={expandedIdx === idx ? newSubcat : ""}
                        onChange={e => setNewSubcat(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addSubcategory(idx)}
                        placeholder="সাব-ক্যাটাগরি যোগ..."
                        className="flex-1 bg-card border border-border rounded px-2 py-1 text-[10px] focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <Button size="sm" variant="outline" onClick={() => addSubcategory(idx)} className="text-[10px] h-6 px-2">
                        <Plus className="w-2.5 h-2.5 mr-0.5" /> যোগ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new category */}
          <div className="flex gap-2 pt-3 border-t border-border">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSection()}
              placeholder="নতুন ক্যাটাগরি যোগ করুন..."
              className="flex-1 bg-muted border border-border rounded px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <Button size="sm" variant="outline" onClick={addSection} disabled={!newLabel.trim()} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> যোগ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
