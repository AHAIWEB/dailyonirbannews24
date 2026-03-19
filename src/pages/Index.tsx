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

const Index = () => {
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

          {/* Main Content */}
          <main className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <TopNews />
            <NewsCarousel />
            <LabelPostSection label="হাইলাইটস" count={6} layout="highlight" />
            <LabelPostSection label="জাতীয়" count={8} layout="grid" />
            <WebStorySection />
            <LabelPostSection label="রাজনীতি" count={4} layout="list" />
            <LabelPostSection label="আন্তর্জাতিক" count={5} layout="highlight" />
            <FotoCardSection />
            <EntertainmentGrid />
            <DeshBangla />
            <LifestyleSection />
            <LabelPostSection label="স্বাস্থ্যসেবা" count={5} layout="list" />
            <OpinionSection />
            <VideoSlider />
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
