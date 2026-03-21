import { Search, Menu, X, User, Bell, Home, ChevronDown, LogIn, UserPlus, Shield, LogOut, CreditCard, Send, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getFormattedDates } from "@/lib/banglaDate";
import { supabase } from "@/integrations/supabase/client";
import { bangladeshLocations } from "@/data/bangladeshLocations";

interface SectionConfig {
  label: string;
  count: number;
  layout: string;
  visible: boolean;
  subcategories?: string[];
}

const FALLBACK_NAV = [
  "জাতীয়", "রাজনীতি", "আন্তর্জাতিক", "অর্থনীতি", "বিনোদন",
  "খেলাধুলা", "প্রযুক্তি", "শিক্ষা", "স্বাস্থ্য", "লাইফস্টাইল",
  "মতামত", "ভিডিও",
];

// দেশ বাংলা special — has division/district/upazila
const DESH_BANGLA_LABEL = "দেশ বাংলা";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<string[]>(FALLBACK_NAV);
  const [navSubcats, setNavSubcats] = useState<Record<string, string[]>>({});
  const [hasDeshBangla, setHasDeshBangla] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // দেশ বাংলা dropdowns
  const [selectedDiv, setSelectedDiv] = useState<string | null>(null);
  const [selectedDist, setSelectedDist] = useState<string | null>(null);
  const { user, isAdmin, isReporter, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Load nav from layout_config
  useEffect(() => {
    const loadNav = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "layout_config")
          .maybeSingle();
        if (data?.value) {
          const sections: SectionConfig[] = JSON.parse(data.value);
          const visible = sections.filter(s => s.visible);
          const labels = visible.map(s => s.label).filter(l => l !== "শীর্ষ সংবাদ" && l !== "হাইলাইটস" && l !== "ওয়েব স্টোরি" && l !== "বেলাভূমি কণ্ঠ");
          if (labels.length > 0) {
            setNavItems(labels);
            // Build subcategory map
            const subcatMap: Record<string, string[]> = {};
            visible.forEach(s => {
              if (s.subcategories && s.subcategories.length > 0) {
                subcatMap[s.label] = s.subcategories;
              }
            });
            setNavSubcats(subcatMap);
            setHasDeshBangla(labels.includes(DESH_BANGLA_LABEL));
          }
        }
      } catch {}
    };
    loadNav();
  }, []);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 150);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  const divisions = Object.keys(bangladeshLocations);

  return (
    <>
      <header className="w-full relative z-50">
        {/* Top bar */}
        <div className="bg-secondary text-secondary-foreground hidden md:block">
          <div className="container mx-auto flex items-center justify-between py-1 text-xs">
            <span>📧 info@belabhuminews.com | ☎ +৮৮০-১৭০০-০০০০০০</span>
            <div className="flex items-center gap-3">
              {!loading && !user ? (
                <>
                  <Link to="/login" className="hover:text-accent transition-colors flex items-center gap-1">
                    <LogIn className="w-3 h-3" /> লগইন
                  </Link>
                  <Link to="/register" className="hover:text-accent transition-colors flex items-center gap-1">
                    <UserPlus className="w-3 h-3" /> রেজিস্টার
                  </Link>
                </>
              ) : !loading && user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="hover:text-accent transition-colors flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] z-[300]">
                      {isAdmin && (
                        <>
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                            <Shield className="w-3.5 h-3.5 text-primary" /> এডমিন প্যানেল
                          </Link>
                          <Link to="/quick-post" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                            <Send className="w-3.5 h-3.5 text-primary" /> কুইক পোস্ট
                          </Link>
                        </>
                      )}
                      {isReporter && (
                        <Link to="/reporter-id" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                          <CreditCard className="w-3.5 h-3.5 text-primary" /> আইডি কার্ড
                        </Link>
                      )}
                      {!isReporter && (
                        <Link to="/reporter-register" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                          <UserPlus className="w-3.5 h-3.5 text-primary" /> রিপোর্টার রেজিস্ট্রেশন
                        </Link>
                      )}
                      <div className="border-t border-border my-1" />
                      <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-muted transition-colors w-full text-left">
                        <LogOut className="w-3.5 h-3.5" /> লগআউট
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Date bar */}
        <div className="bg-card border-b border-border hidden md:block">
          <div className="container mx-auto py-2">
            <BanglaDate />
          </div>
        </div>

        {/* Logo area */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto flex items-center justify-between py-3 md:py-4">
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg md:text-xl">বে</span>
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-foreground leading-tight">
                  বেলাভূমি <span className="text-primary">NEWS</span>
                </h1>
                <p className="text-[8px] md:text-[10px] text-muted-foreground tracking-widest">Belabhumi News</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center justify-center bg-muted rounded w-[468px] h-[60px] text-xs text-muted-foreground">
              বিজ্ঞাপন — ৪৬৮×৬০
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {!loading && !user && (
                <Link to="/login" className="p-2 hover:bg-muted rounded transition-colors">
                  <LogIn className="w-5 h-5" />
                </Link>
              )}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-muted rounded transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded transition-colors" onClick={() => setMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="lg:hidden border-t border-border p-3">
              <div className="flex gap-2">
                <input type="text" placeholder="অনুসন্ধান করুন..."
                  className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none" autoFocus />
                <button className="bg-primary text-primary-foreground px-4 rounded text-sm font-semibold">খুঁজুন</button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="bg-primary hidden lg:block">
          <div className="container mx-auto">
            <div className="flex items-stretch">
              <a href="#" className="flex items-center justify-center bg-secondary px-4 py-2.5 text-secondary-foreground hover:bg-secondary/90 transition-colors">
                <Menu className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">সকল বিভাগ</span>
              </a>
              {navItems.slice(0, 12).map((item) => {
                const hasSub = navSubcats[item]?.length > 0;
                const isDeshBangla = item === DESH_BANGLA_LABEL;
                const categoryUrl = `/category/${encodeURIComponent(item)}`;

                return (
                  <div
                    key={item}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item)}
                    onMouseLeave={() => { setOpenDropdown(null); setSelectedDiv(null); setSelectedDist(null); }}
                  >
                    <Link to={categoryUrl}
                      className="px-3 py-2.5 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-colors text-center border-r border-primary-foreground/10 last:border-0 flex items-center gap-1 h-full"
                    >
                      {item}
                      {(hasSub || isDeshBangla) && <ChevronDown className="w-3 h-3" />}
                    </Link>

                    {/* Subcategory dropdown */}
                    {openDropdown === item && hasSub && !isDeshBangla && (
                      <div className="absolute top-full left-0 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[160px] z-[200]">
                        {navSubcats[item].map(sub => (
                          <Link key={sub} to={`/category/${encodeURIComponent(sub)}`} className="block px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors">
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* দেশ বাংলা mega dropdown */}
                    {openDropdown === item && isDeshBangla && (
                      <div className="absolute top-full left-0 bg-card border border-border rounded-lg shadow-xl p-3 min-w-[400px] z-[200]">
                        <div className="flex gap-3">
                          {/* Divisions */}
                          <div className="w-1/3 border-r border-border pr-2 max-h-[300px] overflow-y-auto">
                            <p className="text-[10px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> বিভাগ
                            </p>
                            {divisions.map(div => (
                              <button
                                key={div}
                                onMouseEnter={() => { setSelectedDiv(div); setSelectedDist(null); }}
                                className={`block w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                                  selectedDiv === div ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted"
                                }`}
                              >
                                {div}
                              </button>
                            ))}
                          </div>

                          {/* Districts */}
                          <div className="w-1/3 border-r border-border pr-2 max-h-[300px] overflow-y-auto">
                            <p className="text-[10px] font-bold text-muted-foreground mb-1">জেলা</p>
                            {selectedDiv && Object.keys(bangladeshLocations[selectedDiv]).map(dist => (
                              <button
                                key={dist}
                                onMouseEnter={() => setSelectedDist(dist)}
                                className={`block w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                                  selectedDist === dist ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted"
                                }`}
                              >
                                {dist}
                              </button>
                            ))}
                          </div>

                          {/* Upazilas */}
                          <div className="w-1/3 max-h-[300px] overflow-y-auto">
                            <p className="text-[10px] font-bold text-muted-foreground mb-1">উপজেলা</p>
                            {selectedDiv && selectedDist && bangladeshLocations[selectedDiv][selectedDist]?.map(upz => (
                              <a
                                key={upz}
                                href="#"
                                className="block px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded transition-colors"
                              >
                                {upz}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="ml-auto flex items-center px-3">
                <Search className="w-4 h-4 text-primary-foreground cursor-pointer" />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Sticky nav */}
      <div className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${sticky ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-primary shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 py-2">
                <div className="w-8 h-8 rounded bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">বে</span>
                </div>
                <span className="text-primary-foreground font-bold text-sm hidden sm:inline">বেলাভূমি NEWS</span>
              </Link>
              <div className="hidden lg:flex items-stretch">
                {navItems.slice(0, 8).map((item) => (
                  <Link key={item} to={`/category/${encodeURIComponent(item)}`} className="px-2.5 py-2.5 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/10 transition-colors">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded">
                <Search className="w-4 h-4" />
              </button>
              <button className="lg:hidden p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded" onClick={() => setMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-[300px] max-w-[90vw] h-full bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-foreground">মেনু</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3 bg-muted border-b border-border">
              <BanglaDate />
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Home className="w-4 h-4 text-primary" /> হোম
              </Link>

              {navItems.map((item) => {
                const hasSub = navSubcats[item]?.length > 0;
                const isDeshBangla = item === DESH_BANGLA_LABEL;
                const isOpen = openDropdown === item;

                return (
                  <div key={item}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : item)}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/50"
                    >
                      <span>{item}</span>
                      {(hasSub || isDeshBangla) && (
                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </button>

                    {/* Mobile subcategories */}
                    {isOpen && hasSub && !isDeshBangla && (
                      <div className="bg-muted/50 border-b border-border">
                        {navSubcats[item].map(sub => (
                          <a key={sub} href="#" onClick={() => setMenuOpen(false)}
                            className="block px-8 py-2 text-xs text-foreground hover:text-primary transition-colors">
                            {sub}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Mobile দেশ বাংলা */}
                    {isOpen && isDeshBangla && (
                      <div className="bg-muted/50 border-b border-border px-4 py-2 space-y-2">
                        <select
                          value={selectedDiv || ""}
                          onChange={e => { setSelectedDiv(e.target.value); setSelectedDist(null); }}
                          className="w-full bg-card border border-border rounded px-3 py-2 text-xs"
                        >
                          <option value="">বিভাগ নির্বাচন করুন</option>
                          {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {selectedDiv && (
                          <select
                            value={selectedDist || ""}
                            onChange={e => setSelectedDist(e.target.value)}
                            className="w-full bg-card border border-border rounded px-3 py-2 text-xs"
                          >
                            <option value="">জেলা নির্বাচন করুন</option>
                            {Object.keys(bangladeshLocations[selectedDiv]).map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        )}
                        {selectedDiv && selectedDist && (
                          <div className="grid grid-cols-2 gap-1">
                            {bangladeshLocations[selectedDiv][selectedDist]?.map(upz => (
                              <a key={upz} href="#" onClick={() => setMenuOpen(false)}
                                className="block px-2 py-1.5 text-[10px] text-foreground hover:text-primary bg-card rounded border border-border/50">
                                {upz}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile auth */}
            <div className="p-4 border-t border-border bg-muted space-y-2">
              {!loading && !user ? (
                <div className="flex items-center gap-3 text-xs">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 text-primary font-semibold">
                    <LogIn className="w-3.5 h-3.5" /> লগইন
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 text-primary font-semibold">
                    <UserPlus className="w-3.5 h-3.5" /> রেজিস্টার
                  </Link>
                </div>
              ) : !loading && user ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground truncate">{user.user_metadata?.full_name || user.email}</p>
                  {isAdmin && (
                    <>
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-xs text-foreground py-1.5 hover:text-primary">
                        <Shield className="w-3.5 h-3.5" /> এডমিন প্যানেল
                      </Link>
                      <Link to="/quick-post" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-xs text-foreground py-1.5 hover:text-primary">
                        <Send className="w-3.5 h-3.5" /> কুইক পোস্ট
                      </Link>
                    </>
                  )}
                  {isReporter && (
                    <Link to="/reporter-id" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-xs text-foreground py-1.5 hover:text-primary">
                      <CreditCard className="w-3.5 h-3.5" /> আইডি কার্ড
                    </Link>
                  )}
                  <Link to="/reporter-register" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-xs text-foreground py-1.5 hover:text-primary">
                    <UserPlus className="w-3.5 h-3.5" /> রিপোর্টার রেজিস্ট্রেশন
                  </Link>
                  <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="flex items-center gap-2 text-xs text-destructive py-1.5">
                    <LogOut className="w-3.5 h-3.5" /> লগআউট
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BanglaDate() {
  const dates = getFormattedDates();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-sm">
      <span className="font-semibold text-foreground">আজ {dates.dayName} |</span>
      <span className="text-foreground">{dates.english}</span>
      <span className="text-news-green font-medium">{dates.bangla}</span>
      <span className="text-news-blue font-medium">{dates.hijri}</span>
    </div>
  );
}
