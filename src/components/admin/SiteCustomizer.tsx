import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw, LayoutGrid, List, Columns, Image, Map, Tv, FolderTree, ChevronDown, ChevronRight, Sidebar } from "lucide-react";
import { toast } from "sonner";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
  subcategories?: string[];
}

interface SidebarTabConfig {
  label: string;
  postLabel: string;
  count: number;
}

interface SidebarWidgetConfig {
  label: string;
  title: string;
}

interface SidebarConfig {
  leftTabs: SidebarTabConfig[];
  rightTabs: SidebarTabConfig[];
  leftWidgets: SidebarWidgetConfig[];
  rightWidgets: SidebarWidgetConfig[];
  rightExtraTabs: SidebarTabConfig[];
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

const DEFAULT_SIDEBAR: SidebarConfig = {
  leftTabs: [
    { label: "পিপল", postLabel: "পিপল", count: 7 },
    { label: "একটু থামুন", postLabel: "একটু থামুন", count: 7 },
  ],
  rightTabs: [
    { label: "আলোচিত", postLabel: "আলোচিত", count: 7 },
    { label: "স্পট লাইট", postLabel: "স্পট লাইট", count: 7 },
  ],
  leftWidgets: [{ label: "ভাইরাল", title: "ভাইরাল" }],
  rightWidgets: [{ label: "জটিল", title: "জটিল" }],
  rightExtraTabs: [{ label: "জনপ্রিয়", postLabel: "জনপ্রিয়", count: 7 }],
};

const STORAGE_KEY = "site-layout-config";

export default function SiteCustomizer() {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig>(DEFAULT_SIDEBAR);
  const [newLabel, setNewLabel] = useState("");
  const [newSubcat, setNewSubcat] = useState("");
  const [newSidebarItem, setNewSidebarItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value, key")
          .in("key", ["layout_config", "sidebar_config"]);

        if (data) {
          const layoutRow = data.find(d => d.key === "layout_config");
          if (layoutRow?.value) {
            const parsed = JSON.parse(layoutRow.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSections(parsed);
            }
          }
          const sidebarRow = data.find(d => d.key === "sidebar_config");
          if (sidebarRow?.value) {
            const parsed = JSON.parse(sidebarRow.value);
            if (parsed && typeof parsed === "object") {
              setSidebarConfig({ ...DEFAULT_SIDEBAR, ...parsed });
            }
          }
        }
      } catch {}

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0 && sections.length === DEFAULT_SECTIONS.length) {
            setSections(parsed);
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
      await supabase.from("site_settings").upsert({
        key: "sidebar_config",
        value: JSON.stringify(sidebarConfig),
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "key" });
      toast.success("লেআউট ও সাইডবার কনফিগ সেভ হয়েছে!");
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
    setSidebarConfig({ ...DEFAULT_SIDEBAR });
    localStorage.removeItem(STORAGE_KEY);
    toast.success("ডিফল্ট লেআউট পুনরুদ্ধার হয়েছে");
  };

  // Sidebar helpers
  const addSidebarTab = (side: "leftTabs" | "rightTabs" | "rightExtraTabs") => {
    if (!newSidebarItem.trim()) return;
    const item: SidebarTabConfig = { label: newSidebarItem.trim(), postLabel: newSidebarItem.trim(), count: 7 };
    setSidebarConfig(prev => ({ ...prev, [side]: [...prev[side], item] }));
    setNewSidebarItem("");
  };

  const removeSidebarTab = (side: "leftTabs" | "rightTabs" | "rightExtraTabs", idx: number) => {
    setSidebarConfig(prev => ({ ...prev, [side]: prev[side].filter((_, i) => i !== idx) }));
  };

  const addSidebarWidget = (side: "leftWidgets" | "rightWidgets") => {
    if (!newSidebarItem.trim()) return;
    setSidebarConfig(prev => ({ ...prev, [side]: [...prev[side], { label: newSidebarItem.trim(), title: newSidebarItem.trim() }] }));
    setNewSidebarItem("");
  };

  const removeSidebarWidget = (side: "leftWidgets" | "rightWidgets", idx: number) => {
    setSidebarConfig(prev => ({ ...prev, [side]: prev[side].filter((_, i) => i !== idx) }));
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
              <Button size="sm" variant="outline" onClick={() => setShowSidebar(!showSidebar)} className="text-xs">
                <Sidebar className="w-3 h-3 mr-1" /> সাইডবার
              </Button>
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
                <div className={`flex items-center gap-1.5 px-2 py-2 text-xs transition-colors ${
                  sec.visible ? "bg-card" : "bg-muted/50 opacity-60"
                }`}>
                  <div className="flex flex-col gap-0 shrink-0">
                    <button onClick={() => moveSection(idx, -1)} className="text-muted-foreground hover:text-primary p-0.5">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveSection(idx, 1)} className="text-muted-foreground hover:text-primary p-0.5">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

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

                  <button onClick={() => updateSection(idx, { visible: !sec.visible })} className="text-muted-foreground hover:text-primary p-1">
                    {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button onClick={() => removeSection(idx)} className="text-destructive/60 hover:text-destructive p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

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

      {/* Sidebar Customizer */}
      {showSidebar && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sidebar className="w-4 h-4 text-primary" />
              সাইডবার কাস্টমাইজার
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Left Sidebar Tabs */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2">◀ বাম সাইডবার ট্যাবস</p>
              <div className="space-y-1">
                {sidebarConfig.leftTabs.map((tab, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded px-2 py-1.5 text-xs">
                    <span className="font-semibold">{tab.label}</span>
                    <button onClick={() => removeSidebarTab("leftTabs", i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input type="text" value={newSidebarItem} onChange={e => setNewSidebarItem(e.target.value)}
                  placeholder="নতুন ট্যাব..." className="flex-1 bg-card border border-border rounded px-2 py-1 text-[10px] focus:outline-none" />
                <Button size="sm" variant="outline" onClick={() => addSidebarTab("leftTabs")} className="text-[10px] h-6 px-2">
                  <Plus className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>

            {/* Left Sidebar Widgets */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2">◀ বাম সাইডবার উইজেট</p>
              <div className="space-y-1">
                {sidebarConfig.leftWidgets.map((w, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded px-2 py-1.5 text-xs">
                    <span className="font-semibold">{w.label}</span>
                    <button onClick={() => removeSidebarWidget("leftWidgets", i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input type="text" value={newSidebarItem} onChange={e => setNewSidebarItem(e.target.value)}
                  placeholder="নতুন উইজেট..." className="flex-1 bg-card border border-border rounded px-2 py-1 text-[10px] focus:outline-none" />
                <Button size="sm" variant="outline" onClick={() => addSidebarWidget("leftWidgets")} className="text-[10px] h-6 px-2">
                  <Plus className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>

            {/* Right Sidebar Tabs */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2">▶ ডান সাইডবার ট্যাবস</p>
              <div className="space-y-1">
                {sidebarConfig.rightTabs.map((tab, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded px-2 py-1.5 text-xs">
                    <span className="font-semibold">{tab.label}</span>
                    <button onClick={() => removeSidebarTab("rightTabs", i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input type="text" value={newSidebarItem} onChange={e => setNewSidebarItem(e.target.value)}
                  placeholder="নতুন ট্যাব..." className="flex-1 bg-card border border-border rounded px-2 py-1 text-[10px] focus:outline-none" />
                <Button size="sm" variant="outline" onClick={() => addSidebarTab("rightTabs")} className="text-[10px] h-6 px-2">
                  <Plus className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>

            {/* Right Extra Tabs */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2">▶ ডান অতিরিক্ত ট্যাবস</p>
              <div className="space-y-1">
                {sidebarConfig.rightExtraTabs.map((tab, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded px-2 py-1.5 text-xs">
                    <span className="font-semibold">{tab.label}</span>
                    <button onClick={() => removeSidebarTab("rightExtraTabs", i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input type="text" value={newSidebarItem} onChange={e => setNewSidebarItem(e.target.value)}
                  placeholder="নতুন ট্যাব..." className="flex-1 bg-card border border-border rounded px-2 py-1 text-[10px] focus:outline-none" />
                <Button size="sm" variant="outline" onClick={() => addSidebarTab("rightExtraTabs")} className="text-[10px] h-6 px-2">
                  <Plus className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>

            {/* Right Widgets */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2">▶ ডান সাইডবার উইজেট</p>
              <div className="space-y-1">
                {sidebarConfig.rightWidgets.map((w, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded px-2 py-1.5 text-xs">
                    <span className="font-semibold">{w.label}</span>
                    <button onClick={() => removeSidebarWidget("rightWidgets", i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <input type="text" value={newSidebarItem} onChange={e => setNewSidebarItem(e.target.value)}
                  placeholder="নতুন উইজেট..." className="flex-1 bg-card border border-border rounded px-2 py-1 text-[10px] focus:outline-none" />
                <Button size="sm" variant="outline" onClick={() => addSidebarWidget("rightWidgets")} className="text-[10px] h-6 px-2">
                  <Plus className="w-2.5 h-2.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
