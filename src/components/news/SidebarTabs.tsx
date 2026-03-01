import { generatePosts } from "@/data/mockData";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  tabs: { label: string; postLabel: string; count: number }[];
  title?: string;
}

export default function SidebarTabs({ tabs, title }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const posts = generatePosts(tabs[activeTab].postLabel, tabs[activeTab].count);

  return (
    <div className="bg-card rounded shadow-sm overflow-hidden">
      {title && (
        <div className="bg-secondary text-secondary-foreground px-3 py-2 text-sm font-bold">{title}</div>
      )}
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 text-xs font-semibold py-2.5 transition-colors ${
              i === activeTab ? "tab-active bg-card" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-3 space-y-3">
        {posts.map((post, i) => (
          <Link to={`/post/${post.id}`} key={post.id} className="flex gap-3 group">
            <span className="text-lg font-black text-primary/30 leading-none mt-0.5 shrink-0">
              {"০১২৩৪৫৬৭৮৯"[i + 1] || (i + 1)}
            </span>
            <div className="flex gap-2 flex-1">
              <div className="w-16 h-12 rounded overflow-hidden shrink-0">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[11px] font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
