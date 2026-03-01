export default function Footer() {
  const sections = [
    {
      title: "বিভাগসমূহ",
      links: ["জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন", "খেলাধুলা"],
    },
    {
      title: "আরও",
      links: ["প্রযুক্তি", "শিক্ষা", "স্বাস্থ্য", "লাইফস্টাইল", "মত-দ্বিমত", "ভিডিও"],
    },
    {
      title: "প্রতিষ্ঠান",
      links: ["আমাদের সম্পর্কে", "যোগাযোগ", "বিজ্ঞাপন", "গোপনীয়তা নীতি", "শর্তাবলী"],
    },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground mt-8">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">বা</span>
              </div>
              <div>
                <h3 className="text-lg font-black">বাংলাখবর</h3>
                <p className="text-[10px] text-secondary-foreground/60">সত্যের সন্ধানে নিরন্তর</p>
              </div>
            </div>
            <p className="text-xs text-secondary-foreground/70 leading-relaxed">
              বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন নিউজ পোর্টাল। সর্বশেষ খবর, বিশ্লেষণ এবং মতামত।
            </p>
          </div>
          {sections.map((sec) => (
            <div key={sec.title}>
              <h4 className="font-bold text-sm mb-3 border-b border-secondary-foreground/20 pb-2">{sec.title}</h4>
              <ul className="space-y-1.5">
                {sec.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-secondary-foreground/70 hover:text-accent transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-secondary-foreground/20 mt-6 pt-4 text-center text-[10px] text-secondary-foreground/50">
          © ২০২৬ বাংলাখবর। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
