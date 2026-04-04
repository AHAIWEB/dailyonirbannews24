import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bangladeshLocations } from "@/data/bangladeshLocations";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { MapPin, Compass, ChevronDown } from "lucide-react";

export default function TravelGuideSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");

  const divisions = Object.keys(bangladeshLocations);
  const districts = division ? Object.keys(bangladeshLocations[division] || {}) : [];

  useEffect(() => {
    const load = async () => {
      // Try ভ্রমণ category
      let query = supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "ভ্রমণ")
        .order("published_at", { ascending: false })
        .limit(8);

      if (division) query = query.eq("location_division", division);
      if (district) query = query.eq("location_district", district);

      let { data } = await query;

      // Fallback if no travel posts
      if (!data || data.length === 0) {
        const { data: fallback } = await supabase
          .from("rss_articles")
          .select("*")
          .eq("is_published", true)
          .not("image_url", "is", null)
          .order("published_at", { ascending: false })
          .limit(6);
        data = fallback;
      }
      setArticles(data || []);
    };
    load();
  }, [division, district]);

  const hero = articles[0];
  const rest = articles.slice(1, 7);

  return (
    <section>
      <SectionLabel label="ভ্রমণ গাইড" />

      {/* Location Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <select
            value={division}
            onChange={(e) => { setDivision(e.target.value); setDistrict(""); }}
            className="appearance-none bg-card border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">সকল বিভাগ</option>
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        {division && (
          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="appearance-none bg-card border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">সকল জেলা</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl border border-border">
          <Compass className="w-10 h-10 mx-auto text-primary/40 mb-2" />
          <p className="text-sm text-muted-foreground">এই অঞ্চলে এখনো কোনো ভ্রমণ গাইড নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Hero */}
          {hero && (
            <Link to={`/post/${hero.id}`}
              className="md:col-span-2 md:row-span-2 block rounded-xl overflow-hidden group relative">
              <div className="aspect-[4/3] md:aspect-auto md:h-full bg-muted">
                {hero.image_url && (
                  <img src={hero.image_url} alt={hero.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> ভ্রমণ
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-base md:text-lg font-black text-white leading-relaxed group-hover:text-emerald-300 transition-colors line-clamp-3">
                  {hero.title}
                </h3>
                {hero.location_division && (
                  <p className="text-[10px] text-white/60 mt-1 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {hero.location_division} {hero.location_district && `› ${hero.location_district}`}
                  </p>
                )}
              </div>
            </Link>
          )}

          {/* Side cards */}
          {rest.map(a => (
            <Link key={a.id} to={`/post/${a.id}`}
              className="flex gap-3 bg-card rounded-lg p-2.5 group border border-border/50 hover:border-emerald-300/50 hover:shadow-md transition-all">
              {a.image_url && (
                <div className="w-24 h-[68px] rounded-lg overflow-hidden shrink-0">
                  <img src={a.image_url} alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors line-clamp-2 leading-relaxed">
                  {a.title}
                </h4>
                {a.location_division && (
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-1">
                    <MapPin className="w-2 h-2" /> {a.location_division}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
