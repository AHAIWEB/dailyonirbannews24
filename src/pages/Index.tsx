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

// Map of special component labels to their renderers
const SPECIAL_SECTIONS: Record<string, (config: SectionConfig) => JSX.Element> = {
  "ওয়েব স্টোরি": () => <WebStorySection key="webstory" />,
  "কালের কন্ঠ": () => <FotoCardSection key="fotocard" />,
  "বিনোদন": () => <EntertainmentGrid key="entertainment" />,
  "দেশ বাংলা": () => <DeshBangla key="deshbangla" />,
  "লাইফস্টাইল": () => <LifestyleSection key="lifestyle" />,
  "মতামত": () => <OpinionSection key="opinion" />,
  "ভিডিও": () => <VideoSlider key="video" />,
};

function renderSection(config: SectionConfig) {
  if (!config.visible) return null;

  // Check if it's a special component
  const specialRenderer = SPECIAL_SECTIONS[config.label];
  if (specialRenderer) {
    return specialRenderer(config);
  }

  // Default: render as LabelPostSection with the configured layout/count
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

  useEffect(() => {
    // Load layout config from site_settings
    const loadConfig = async () => {
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
      } catch {
        // Use defaults on error
      }
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
            <SidebarTabs
              tabs={[
                { label: "পিপল", postLabel: "পিপল", count: 7 },
                { label: "একটু থামুন", postLabel: "একটু থামুন", count: 7 },
              ]}
            />
            <SidebarWidget label="ভাইরাল" title="ভাইরাল" />
            <RssNewsWidget />
          </aside>

          {/* Main Content — Dynamic Sections */}
          <main className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <TopNews />
            <NewsCarousel />
            {sections
              .filter(sec => sec.label !== "শীর্ষ সংবাদ")
              .map((sec) => renderSection(sec))}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3 space-y-4 order-3">
            <SidebarTabs
              tabs={[
                { label: "আলোচিত", postLabel: "আলোচিত", count: 7 },
                { label: "স্পট লাইট", postLabel: "স্পট লাইট", count: 7 },
              ]}
            />
            <SidebarTabs
              title="জনপ্রিয়"
              tabs={[
                { label: "জনপ্রিয়", postLabel: "জনপ্রিয়", count: 7 },
              ]}
            />
            <SidebarWidget label="জটিল" title="জটিল" />
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
