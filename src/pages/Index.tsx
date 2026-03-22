import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import BreakingNews from "@/components/news/BreakingNews";
import TopNews from "@/components/news/TopNews";
import NewsCarousel from "@/components/news/NewsCarousel";
import LabelPostSection from "@/components/news/LabelPostSection";
import EntertainmentGrid from "@/components/news/EntertainmentGrid";
import DeshBangla from "@/components/news/DeshBangla";
import LifestyleSection from "@/components/news/LifestyleSection";
import OpinionSection from "@/components/news/OpinionSection";
import VideoSlider from "@/components/news/VideoSlider";
import SidebarTabs from "@/components/news/SidebarTabs";
import SidebarWidget from "@/components/news/SidebarWidget";
import RssNewsWidget from "@/components/news/RssNewsWidget";
import WebStorySection from "@/components/news/WebStorySection";
import FotoCardSection from "@/components/news/FotoCardSection";
import Footer from "@/components/news/Footer";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
}

interface SidebarConfig {
  leftTabs: { label: string; postLabel: string; count: number }[];
  rightTabs: { label: string; postLabel: string; count: number }[];
  leftWidgets: { label: string; title: string }[];
  rightWidgets: { label: string; title: string }[];
  rightExtraTabs: { label: string; postLabel: string; count: number }[];
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { label: "হাইলাইটস", count: 6, layout: "highlight", visible: true },
  { label: "জাতীয়", count: 8, layout: "grid", visible: true },
  { label: "ওয়েব স্টোরি", count: 9, layout: "webstory", visible: true },
  { label: "রাজনীতি", count: 4, layout: "list", visible: true },
  { label: "আন্তর্জাতিক", count: 5, layout: "highlight", visible: true },
  { label: "বেলাভূমি কণ্ঠ", count: 6, layout: "fotocard", visible: true },
  { label: "বিনোদন", count: 6, layout: "grid", visible: true },
  { label: "দেশ বাংলা", count: 8, layout: "deshbangla", visible: true },
  { label: "লাইফস্টাইল", count: 6, layout: "highlight", visible: true },
  { label: "স্বাস্থ্যসেবা", count: 5, layout: "list", visible: true },
  { label: "মতামত", count: 4, layout: "grid", visible: true },
  { label: "ভিডিও", count: 4, layout: "grid", visible: true },
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

const SPECIAL_SECTIONS: Record<string, (config: SectionConfig) => JSX.Element> = {
  "ওয়েব স্টোরি": () => <WebStorySection key="webstory" />,
  "বেলাভূমি কণ্ঠ": () => <FotoCardSection key="fotocard" />,
  "বিনোদন": () => <EntertainmentGrid key="entertainment" />,
  "দেশ বাংলা": () => <DeshBangla key="deshbangla" />,
  "লাইফস্টাইল": () => <LifestyleSection key="lifestyle" />,
  "মতামত": () => <OpinionSection key="opinion" />,
  "ভিডিও": () => <VideoSlider key="video" />,
};

function renderSection(config: SectionConfig) {
  if (!config.visible) return null;
  const specialRenderer = SPECIAL_SECTIONS[config.label];
  if (specialRenderer) return specialRenderer(config);
  return (
    <LabelPostSection
      key={config.label}
      label={config.label}
      count={config.count}
      layout={config.layout as "list" | "grid" | "highlight" | "magazine"}
    />
  );
}

const Index = () => {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [sidebar, setSidebar] = useState<SidebarConfig>(DEFAULT_SIDEBAR);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value, key")
          .in("key", ["layout_config", "sidebar_config"]);

        if (data) {
          const layoutRow = data.find(d => d.key === "layout_config");
          if (layoutRow?.value) {
            const parsed = JSON.parse(layoutRow.value);
            if (Array.isArray(parsed) && parsed.length > 0) setSections(parsed);
          }
          const sidebarRow = data.find(d => d.key === "sidebar_config");
          if (sidebarRow?.value) {
            const parsed = JSON.parse(sidebarRow.value);
            if (parsed && typeof parsed === "object") setSidebar({ ...DEFAULT_SIDEBAR, ...parsed });
          }
        }
      } catch {}
    };
    loadConfig();
  }, []);

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <BreakingNews />

      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <aside className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {sidebar.leftTabs.length > 0 && (
              <SidebarTabs tabs={sidebar.leftTabs} />
            )}
            {sidebar.leftWidgets.map(w => (
              <SidebarWidget key={w.label} label={w.label} title={w.title} />
            ))}
            <RssNewsWidget />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <TopNews />
            <NewsCarousel />
            {sections
              .filter(sec => sec.label !== "শীর্ষ সংবাদ")
              .map((sec) => renderSection(sec))}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3 space-y-4 order-3">
            {sidebar.rightTabs.length > 0 && (
              <SidebarTabs tabs={sidebar.rightTabs} />
            )}
            {sidebar.rightExtraTabs.map((tabGroup, i) => (
              <SidebarTabs key={`extra-${i}`} title={tabGroup.label} tabs={[tabGroup]} />
            ))}
            {sidebar.rightWidgets.map(w => (
              <SidebarWidget key={w.label} label={w.label} title={w.title} />
            ))}
            <div className="bg-muted rounded flex items-center justify-center h-[250px] text-xs text-muted-foreground">
              বিজ্ঞাপন — ৩০০×২৫০
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
