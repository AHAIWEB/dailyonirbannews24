import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { Briefcase, Clock, ArrowRight, Building2 } from "lucide-react";

export default function JobSection() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", "চাকরি")
        .order("published_at", { ascending: false })
        .limit(8);
      setArticles(data || []);
    };
    load();
  }, []);

  if (articles.length === 0) return null;

  const featured = articles[0];
  const list = articles.slice(1);

  return (
    <section>
      <SectionLabel label="চাকরি" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Featured job */}
        {featured && (
          <Link to={`/post/${featured.id}`}
            className="md:col-span-5 block rounded-xl overflow-hidden group relative bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 bg-white/20 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
                <Briefcase className="w-3 h-3" /> নতুন চাকরি
              </span>
              {featured.image_url && (
                <div className="rounded-lg overflow-hidden mb-3 aspect-[16/9]">
                  <img src={featured.image_url} alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <h3 className="text-sm md:text-base font-black leading-relaxed group-hover:text-blue-200 transition-colors line-clamp-3">
                {featured.title}
              </h3>
              {featured.source_name && (
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/70">
                  <Building2 className="w-3 h-3" />
                  <span>{featured.source_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-white/60">
                <Clock className="w-3 h-3" />
                <span>{new Date(featured.published_at || featured.created_at).toLocaleDateString("bn-BD")}</span>
              </div>
              <span className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                বিস্তারিত <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        )}

        {/* Job list */}
        <div className="md:col-span-7 space-y-2">
          {list.map((a, i) => (
            <Link key={a.id} to={`/post/${a.id}`}
              className="flex items-center gap-3 bg-card rounded-lg p-3 group border border-border/50 hover:border-blue-300/50 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-bold text-xs">
                {String(i + 1).padStart(2, '0')}
              </div>
              {a.image_url && (
                <div className="w-16 h-12 rounded-md overflow-hidden shrink-0">
                  <img src={a.image_url} alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                  {a.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                  {a.source_name && <span className="flex items-center gap-0.5"><Building2 className="w-2 h-2" />{a.source_name}</span>}
                  <span className="flex items-center gap-0.5"><Clock className="w-2 h-2" />{new Date(a.published_at || a.created_at).toLocaleDateString("bn-BD")}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
