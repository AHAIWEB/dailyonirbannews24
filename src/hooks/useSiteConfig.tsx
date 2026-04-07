import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
  subcategories?: string[];
}

interface SidebarConfig {
  left: { label: string; postLabel: string; count: number }[];
  right: { label: string; postLabel: string; count: number }[];
  rightExtra: { label: string; postLabel: string; count: number }[];
  widgets: { label: string; title: string; position: "left" | "right" }[];
}

interface SiteConfig {
  sections: SectionConfig[];
  sidebar: SidebarConfig;
  categories: string[];
  loading: boolean;
  reload: () => void;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { label: "হাইলাইটস", count: 6, layout: "highlight", visible: true },
  { label: "জাতীয়", count: 8, layout: "grid", visible: true },
  { label: "ওয়েব স্টোরি", count: 9, layout: "webstory", visible: true },
  { label: "রাজনীতি", count: 4, layout: "magazine", visible: true },
  { label: "আন্তর্জাতিক", count: 5, layout: "highlight", visible: true },
  { label: "বেলাভূমি কণ্ঠ", count: 6, layout: "fotocard", visible: true },
  { label: "বিনোদন", count: 8, layout: "grid", visible: true },
  { label: "গ্যালারি", count: 12, layout: "gallery", visible: true },
  { label: "দেশ বাংলা", count: 8, layout: "deshbangla", visible: true },
  { label: "লাইফস্টাইল", count: 6, layout: "highlight", visible: true },
  { label: "ভ্রমণ", count: 6, layout: "grid", visible: true },
  { label: "স্বাস্থ্যসেবা", count: 5, layout: "list", visible: true },
  { label: "চাকরি", count: 5, layout: "list", visible: true },
  { label: "মতামত", count: 4, layout: "grid", visible: true },
  { label: "ভিডিও", count: 4, layout: "grid", visible: true },
];

const DEFAULT_SIDEBAR: SidebarConfig = {
  left: [
    { label: "পিপল", postLabel: "পিপল", count: 7 },
    { label: "একটু থামুন", postLabel: "একটু থামুন", count: 7 },
  ],
  right: [
    { label: "আলোচিত", postLabel: "আলোচিত", count: 7 },
    { label: "স্পট লাইট", postLabel: "স্পট লাইট", count: 7 },
  ],
  rightExtra: [
    { label: "জনপ্রিয়", postLabel: "জনপ্রিয়", count: 7 },
  ],
  widgets: [
    { label: "ভাইরাল", title: "ভাইরাল", position: "left" },
    { label: "জটিল", title: "জটিল", position: "right" },
  ],
};

const HIDDEN_NAV = new Set(["শীর্ষ সংবাদ", "হাইলাইটস", "ওয়েব স্টোরি", "বেলাভূমি কণ্ঠ"]);

const SiteConfigContext = createContext<SiteConfig>({
  sections: DEFAULT_SECTIONS,
  sidebar: DEFAULT_SIDEBAR,
  categories: [],
  loading: true,
  reload: () => {},
});

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [sidebar, setSidebar] = useState<SidebarConfig>(DEFAULT_SIDEBAR);
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const [layoutRes, sidebarRes] = await Promise.all([
        supabase.from("site_settings").select("value").eq("key", "layout_config").maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", "sidebar_config").maybeSingle(),
      ]);

      if (layoutRes.data?.value) {
        const parsed = JSON.parse(layoutRes.data.value);
        if (Array.isArray(parsed) && parsed.length > 0) setSections(parsed);
      }

      if (sidebarRes.data?.value) {
        const parsed = JSON.parse(sidebarRes.data.value);
        if (parsed && typeof parsed === "object") setSidebar({ ...DEFAULT_SIDEBAR, ...parsed });
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const categories = sections.filter(s => s.visible && !HIDDEN_NAV.has(s.label)).map(s => s.label);

  return (
    <SiteConfigContext.Provider value={{ sections, sidebar, categories, loading, reload: loadConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
