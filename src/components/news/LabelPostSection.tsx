import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { Link } from "react-router-dom";
import { Clock, ExternalLink, TrendingUp, Heart, Bookmark, ChevronRight } from "lucide-react";

interface Props {
  label: string;
  count: number;
  layout?: "list" | "grid" | "highlight" | "magazine";
}

interface RssArticle {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source_url: string;
  source_name: string | null;
  category: string;
  published_at: string;
}

export default function LabelPostSection({ label, count, layout = "list" }: Props) {
  const [rssArticles, setRssArticles] = useState<RssArticle[]>([]);
  const mockPosts = generatePosts(label, count);

  useEffect(() => {
    const loadRss = async () => {
      const { data } = await supabase
        .from("rss_articles")
        .select("*")
        .eq("is_published", true)
        .eq("category", label)
        .order("published_at", { ascending: false })
        .limit(count);
      setRssArticles((data as any[]) || []);
    };
    loadRss();
  }, [label, count]);

  const hasRss = rssArticles.length > 0;
  const posts = hasRss ? [] : mockPosts;

  // ===== জাতীয় (National) — Screenshot-matched layout =====
  if (label === "জাতীয়") {
    const items = hasRss
      ? rssArticles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: `/post/${a.id}`, date: new Date(a.published_at).toLocaleDateString("bn-BD"), source: a.source_name, excerpt: a.content || "", isExternal: false }))
      : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, date: p.date, source: "", excerpt: p.excerpt, isExternal: false }));

    const hero = items[0];
    const side = items[1];
    const bottom = items.slice(2, 6);

    const ItemLink = ({ item, children, className }: { item: typeof hero; children: React.ReactNode; className?: string }) =>
      item.isExternal
        ? <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
        : <Link to={item.url} className={className}>{children}</Link>;

    return (
      <section>
        <SectionLabel label={label} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Hero - left 2 cols */}
          {hero && (
            <ItemLink item={hero} className="md:col-span-2 md:row-span-2 block relative rounded-lg overflow-hidden group">
              <div className="aspect-[4/3] md:aspect-auto md:h-full bg-muted">
                <img src={hero.image} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">জাতীয়</span>
                <h3 className="text-base md:text-lg font-black text-white mt-2 leading-relaxed group-hover:text-primary transition-colors line-clamp-3">
                  {hero.title}
                </h3>
                {hero.excerpt && <p className="text-[11px] text-white/70 mt-1 line-clamp-2">{hero.excerpt}</p>}
              </div>
            </ItemLink>
          )}
          {/* Side article - right col top */}
          {side && (
            <ItemLink item={side} className="block rounded-lg overflow-hidden group relative">
              <div className="aspect-[4/3] bg-muted">
                <img src={side.image} alt={side.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-3 leading-relaxed">
                  {side.title}
                </h4>
              </div>
            </ItemLink>
          )}
          {/* Side article - right col bottom (list items) */}
          {items[2] && (
            <div className="space-y-2">
              {items.slice(2, 5).map(item => (
                <ItemLink key={item.id} item={item} className="flex gap-2 group">
                  <div className="w-20 h-14 rounded overflow-hidden shrink-0 bg-muted">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed flex-1">
                    {item.title}
                  </h4>
                </ItemLink>
              ))}
            </div>
          )}
        </div>
        {/* Bottom row - 4 cards */}
        {bottom.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {items.slice(2, 6).map(item => (
              <ItemLink key={item.id} item={item} className="block rounded-lg overflow-hidden group relative">
                <div className="aspect-[4/3] bg-muted">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h4 className="text-[11px] font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                    {item.title}
                  </h4>
                </div>
              </ItemLink>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ===== রাজনীতি (Politics) — Magazine style =====
  if (label === "রাজনীতি") {
    return (
      <section>
        <SectionLabel label={label} />
        {hasRss ? (
          <div className="space-y-4">
            {rssArticles[0] && (
              <Link to={`/post/${rssArticles[0].id}`}
                className="block relative rounded-xl overflow-hidden group">
                <div className="aspect-[21/9] bg-muted">
                  {rssArticles[0].image_url && (
                    <img src={rssArticles[0].image_url} alt={rssArticles[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">রাজনীতি</span>
                    <span className="text-white/60 text-[10px] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(rssArticles[0].published_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white leading-relaxed group-hover:text-primary transition-colors">
                    {rssArticles[0].title}
                  </h3>
                </div>
              </a>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rssArticles.slice(1).map((article) => (
                <Link key={article.id} to={`/post/${article.id}`}
                  className="flex gap-3 bg-card rounded-lg p-3 group border-l-4 border-red-600 hover:shadow-lg transition-all">
                  {article.image_url && (
                    <div className="w-24 h-20 rounded overflow-hidden shrink-0">
                      <img src={article.image_url} alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(article.published_at).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Link to={`/post/${posts[0].id}`} className="block relative rounded-xl overflow-hidden group">
              <div className="aspect-[21/9]">
                <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm">রাজনীতি</span>
                <h3 className="text-lg md:text-xl font-black text-white mt-2 leading-relaxed group-hover:text-primary transition-colors">
                  {posts[0].title}
                </h3>
              </div>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts.slice(1).map((post) => (
                <Link key={post.id} to={`/post/${post.id}`}
                  className="flex gap-3 bg-card rounded-lg p-3 group border-l-4 border-red-600 hover:shadow-lg transition-all">
                  <div className="w-24 h-20 rounded overflow-hidden shrink-0">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[9px]">{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // ===== স্বাস্থ্যসেবা (Healthcare) — Screenshot: green accent grid =====
  if (label === "স্বাস্থ্যসেবা") {
    const items = hasRss
      ? rssArticles.map(a => ({ id: a.id, title: a.title, image: a.image_url || "", url: `/post/${a.id}`, date: new Date(a.published_at).toLocaleDateString("bn-BD"), source: a.source_name, excerpt: a.content || "", isExternal: false }))
      : mockPosts.map(p => ({ id: String(p.id), title: p.title, image: p.image, url: `/post/${p.id}`, date: p.date, source: "", excerpt: p.excerpt, isExternal: false }));

    const ItemLink = ({ item, children, className }: { item: typeof items[0]; children: React.ReactNode; className?: string }) =>
      item.isExternal
        ? <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
        : <Link to={item.url} className={className}>{children}</Link>;

    return (
      <section>
        <SectionLabel label={label} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Featured large card */}
          {items[0] && (
            <ItemLink item={items[0]} className="col-span-2 md:col-span-1 md:row-span-2 block rounded-xl overflow-hidden group relative bg-card shadow-sm hover:shadow-xl transition-all border border-emerald-200">
              <div className="aspect-[3/4] bg-muted">
                <img src={items[0].image} alt={items[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5" /> স্বাস্থ্য
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-sm md:text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-relaxed line-clamp-3">
                  {items[0].title}
                </h3>
                {items[0].excerpt && <p className="text-[10px] text-white/70 mt-1 line-clamp-2">{items[0].excerpt}</p>}
              </div>
            </ItemLink>
          )}
          {/* Grid cards */}
          {items.slice(1, 5).map(item => (
            <ItemLink key={item.id} item={item} className="block rounded-lg overflow-hidden group bg-card shadow-sm hover:shadow-lg transition-all border border-border/50">
              <div className="aspect-video bg-muted relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2">
                  <span className="bg-emerald-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    <Heart className="w-2 h-2 inline mr-0.5" />স্বাস্থ্য
                  </span>
                </div>
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors line-clamp-2 leading-relaxed">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[9px]">{item.date}</span>
                </div>
              </div>
            </ItemLink>
          ))}
        </div>
      </section>
    );
  }

  // ===== Highlight layout =====
  if (layout === "highlight") {
    return (
      <section>
        <SectionLabel label={label} />
        {hasRss ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={`/post/${rssArticles[0]?.id}`}
              className="md:col-span-2 post-card group bg-card rounded-lg overflow-hidden shadow-sm block relative">
              <div className="overflow-hidden aspect-video">
                {rssArticles[0]?.image_url && <img src={rssArticles[0].image_url} alt={rssArticles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-2">{label}</span>
                <h3 className="text-base md:text-lg font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
                  {rssArticles[0]?.title}
                </h3>
              </div>
            </Link>
            <div className="space-y-3">
              {rssArticles.slice(1).map((article) => (
                <Link key={article.id} to={`/post/${article.id}`}
                  className="post-card flex gap-3 bg-card rounded-lg p-2 shadow-sm group border border-border/50 hover:border-primary/30 transition-colors">
                  {article.image_url && (
                    <div className="w-24 h-[68px] rounded-md overflow-hidden shrink-0">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-3">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[9px]">{new Date(article.published_at).toLocaleDateString("bn-BD")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={`/post/${posts[0].id}`} className="md:col-span-2 post-card group bg-card rounded-lg overflow-hidden shadow-sm block relative">
              <div className="overflow-hidden aspect-video">
                <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-2">{label}</span>
                <h3 className="text-base md:text-lg font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
                  {posts[0].title}
                </h3>
              </div>
            </Link>
            <div className="space-y-3">
              {posts.slice(1).map((post, i) => (
                <Link to={`/post/${post.id}`} key={post.id} className="post-card flex gap-3 bg-card rounded-lg p-2 shadow-sm group border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-24 h-[68px] rounded-md overflow-hidden shrink-0 relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-3">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[9px]">{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // ===== Grid layout =====
  if (layout === "grid") {
    return (
      <section>
        <SectionLabel label={label} />
        {hasRss ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rssArticles.map((article) => (
              <Link key={article.id} to={`/post/${article.id}`}
                className="post-card bg-card rounded-lg overflow-hidden shadow-sm block group border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="overflow-hidden aspect-[4/3] relative">
                  {article.image_url && <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                </div>
                <div className="p-2.5">
                  <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">{article.category}</span>
                  <h3 className="text-xs font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {posts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id} className="post-card bg-card rounded-lg overflow-hidden shadow-sm block group border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="overflow-hidden aspect-[4/3] relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                </div>
                <div className="p-2.5">
                  <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">{label}</span>
                  <h3 className="text-xs font-bold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ===== Default list layout =====
  return (
    <section>
      <SectionLabel label={label} />
      {hasRss ? (
        <div className="space-y-3">
          {rssArticles[0] && (
            <a href={rssArticles[0].source_url} target="_blank" rel="noopener noreferrer"
              className="post-card bg-card rounded-lg overflow-hidden shadow-sm block group relative">
              <div className="overflow-hidden aspect-video">
                {rssArticles[0].image_url && <img src={rssArticles[0].image_url} alt={rssArticles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-2">{label}</span>
                <h3 className="text-base md:text-lg font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
                  {rssArticles[0].title}
                </h3>
              </div>
            </a>
          )}
          <div className="grid grid-cols-1 gap-2">
            {rssArticles.slice(1).map((article) => (
              <a key={article.id} href={article.source_url} target="_blank" rel="noopener noreferrer"
                className="post-card flex gap-3 bg-card rounded-lg p-2 shadow-sm group border border-border/50 hover:border-primary/30 transition-all">
                {article.image_url && (
                  <div className="w-28 h-20 rounded-md overflow-hidden shrink-0">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[9px]">{new Date(article.published_at).toLocaleDateString("bn-BD")}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Link to={`/post/${posts[0].id}`} className="post-card bg-card rounded-lg overflow-hidden shadow-sm block group relative">
            <div className="overflow-hidden aspect-video">
              <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-2">{label}</span>
              <h3 className="text-base md:text-lg font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
                {posts[0].title}
              </h3>
            </div>
          </Link>
          <div className="grid grid-cols-1 gap-2">
            {posts.slice(1).map((post) => (
              <Link to={`/post/${post.id}`} key={post.id} className="post-card flex gap-3 bg-card rounded-lg p-2 shadow-sm group border border-border/50 hover:border-primary/30 transition-all">
                <div className="w-28 h-20 rounded-md overflow-hidden shrink-0">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded w-fit mb-1">{label}</span>
                  <h4 className="text-sm font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[9px]">{post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
