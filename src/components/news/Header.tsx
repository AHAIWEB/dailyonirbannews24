import { Search, Menu, User, Bell } from "lucide-react";
import { useState } from "react";

const navItems = [
  "জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন",
  "খেলাধুলা", "প্রযুক্তি", "শিক্ষা", "স্বাস্থ্য", "লাইফস্টাইল",
  "মত-দ্বিমত", "ভিডিও",
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto flex items-center justify-between py-1 text-xs">
          <span>📧 info@banglakhabar.com | ☎ +৮৮০-১৭০০-০০০০০০</span>
          <div className="flex items-center gap-3">
            <button className="hover:text-accent transition-colors"><User className="w-3.5 h-3.5" /></button>
            <button className="hover:text-accent transition-colors"><Bell className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Date bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-2">
          <BanglaDate />
        </div>
      </div>

      {/* Logo area */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xl">বা</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                বাংলা<span className="text-primary">খবর</span>
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest">সত্যের সন্ধানে নিরন্তর</p>
            </div>
          </div>

          {/* Ad banner placeholder */}
          <div className="hidden lg:flex items-center justify-center bg-muted rounded w-[468px] h-[60px] text-xs text-muted-foreground">
            বিজ্ঞাপন — ৪৬৮×৬০
          </div>

          <button
            className="lg:hidden p-2 hover:bg-muted rounded"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary">
        <div className="container mx-auto">
          <div className={`${menuOpen ? "flex" : "hidden"} lg:flex flex-col lg:flex-row items-stretch`}>
            <a href="#" className="flex items-center justify-center bg-secondary px-4 py-2.5 text-secondary-foreground hover:bg-secondary/90 transition-colors">
              <Menu className="w-4 h-4 mr-1" />
              <span className="text-sm font-semibold">সকল বিভাগ</span>
            </a>
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="px-3 py-2.5 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-colors text-center border-r border-primary-foreground/10 last:border-0"
              >
                {item}
              </a>
            ))}
            <div className="ml-auto flex items-center px-3">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function BanglaDate() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm">
      <span className="font-semibold text-foreground">
        আজ রবিবার |
      </span>
      <span className="text-foreground">
        ০১ মার্চ ২০২৬ ইংরেজি
      </span>
      <span className="text-news-green font-medium">
        ১৬ ফাল্গুন, ১৪৩২, বসন্তকাল
      </span>
      <span className="text-news-blue font-medium">
        ১২ রমজান ১৪৪৭ হিজরি
      </span>
    </div>
  );
}
