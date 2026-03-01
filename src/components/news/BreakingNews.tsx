import { breakingNews } from "@/data/mockData";

export default function BreakingNews() {
  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div className="container mx-auto flex items-stretch">
        <div className="bg-primary text-primary-foreground px-4 py-2 font-bold text-sm flex items-center gap-2 shrink-0 z-10">
          <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
          ব্রেকিং
        </div>
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="ticker-animate whitespace-nowrap flex items-center gap-8 py-2 px-4">
            {breakingNews.map((news, i) => (
              <a key={i} href="#" className="text-sm text-foreground hover:text-primary transition-colors">
                <span className="text-primary mr-2">●</span>
                {news}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-accent text-accent-foreground px-4 py-2 font-bold text-sm flex items-center shrink-0">
          সর্বশেষ
        </div>
      </div>
    </div>
  );
}
