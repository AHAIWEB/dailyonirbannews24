import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
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
import PhotoGallerySection from "@/components/news/PhotoGallerySection";
import TravelGuideSection from "@/components/news/TravelGuideSection";
import JobSection from "@/components/news/JobSection";
import Footer from "@/components/news/Footer";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
}

const SECTION_LABEL_ALIASES: Record<string, string> = {
  "ভ্রমণ গাইড": "ভ্রমণ",
  "ফটো গ্যালারি": "গ্যালারি",
};

const REQUIRED_SPECIAL_SECTIONS: SectionConfig[] = [
  { label: "গ্যালারি", count: 12, layout: "gallery", visible: true },
  { label: "ভ্রমণ গাইড", count: 6, layout: "grid", visible: true },
  { label: "চাকরি", count: 5, layout: "list", visible: true },
];

const getCanonicalLabel = (label: string) => SECTION_LABEL_ALIASES[label] || label;

function ensureSpecialSections(configs: SectionConfig[]) {
  const existing = new Set(configs.map((s) => getCanonicalLabel(s.label)));
  const missing = REQUIRED_SPECIAL_SECTIONS.filter((s) => !existing.has(getCanonicalLabel(s.label)));
  return missing.length > 0 ? [...configs, ...missing] : configs;
}

const SPECIAL_SECTIONS: Record<string, (config: SectionConfig) => JSX.Element> = {
  "ওয়েব স্টোরি": () => <WebStorySection key="webstory" />,
  "বেলাভূমি কণ্ঠ": () => <FotoCardSection key="fotocard" />,
  "বিনোদন": () => <EntertainmentGrid key="entertainment" />,
  "গ্যালারি": () => <PhotoGallerySection key="gallery" />,
  "ফটো গ্যালারি": () => <PhotoGallerySection key="gallery-alt" />,
  "দেশ বাংলা": () => <DeshBangla key="deshbangla" />,
  "লাইফস্টাইল": () => <LifestyleSection key="lifestyle" />,
  "ভ্রমণ": () => <TravelGuideSection key="travel" />,
  "ভ্রমণ গাইড": () => <TravelGuideSection key="travel-guide" />,
  "চাকরি": () => <JobSection key="jobs" />,
  "মতামত": () => <OpinionSection key="opinion" />,
  "ভিডিও": () => <VideoSlider key="video" />,
};

function renderSection(config: SectionConfig) {
  if (!config.visible) return null;
  const specialRenderer = SPECIAL_SECTIONS[getCanonicalLabel(config.label)] || SPECIAL_SECTIONS[config.label];
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

// Auto-refresh interval: 5 minutes
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const Index = () => {
  const { sections: rawSections, sidebar } = useSiteConfig();
  const sections = ensureSpecialSections(rawSections);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to realtime changes on rss_articles
  useEffect(() => {
    const channel = supabase
      .channel("homepage-articles")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rss_articles" }, () => {
        setRefreshKey(k => k + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const leftWidgets = sidebar.widgets.filter(w => w.position === "left");
  const rightWidgets = sidebar.widgets.filter(w => w.position === "right");

  return (
    <div className="min-h-screen bg-background font-bangla" key={refreshKey}>
      <Header />
      <BreakingNews />

      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <aside className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {sidebar.left.length > 0 && (
              <SidebarTabs tabs={sidebar.left} />
            )}
            {leftWidgets.map(w => (
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
            {sidebar.right.length > 0 && (
              <SidebarTabs tabs={sidebar.right} />
            )}
            {sidebar.rightExtra.length > 0 && (
              <SidebarTabs title={sidebar.rightExtra[0]?.label} tabs={sidebar.rightExtra} />
            )}
            {rightWidgets.map(w => (
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
