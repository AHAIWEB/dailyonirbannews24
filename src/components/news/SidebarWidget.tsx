import { generatePosts } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Zap, AlertTriangle } from "lucide-react";

interface Props {
  label: string;
  title: string;
}

const widgetStyles: Record<string, { gradient: string; icon: React.ReactNode; badge: string }> = {
  "ভাইরাল": {
    gradient: "from-pink-600 via-rose-500 to-red-500",
    icon: <Zap className="w-3.5 h-3.5" />,
    badge: "🔥",
  },
  "জটিল": {
    gradient: "from-slate-800 via-gray-700 to-zinc-600",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badge: "⚡",
  },
};

export default function SidebarWidget({ label, title }: Props) {
  const post = generatePosts(label, 1)[0];
  const style = widgetStyles[label] || widgetStyles["ভাইরাল"];

  return (
    <Link to={`/post/${post.id}`} className="block rounded-xl overflow-hidden shadow-sm group relative">
      {/* Header badge */}
      <div className={`bg-gradient-to-r ${style.gradient} text-white px-3 py-2 flex items-center gap-2`}>
        {style.icon}
        <span className="text-sm font-black tracking-wider">❝ {title} ❞</span>
        <span className="ml-auto text-lg">{style.badge}</span>
      </div>

      {/* Image with 9:16 ratio */}
      <div className="relative overflow-hidden aspect-[9/16]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold leading-relaxed text-white group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-[10px] text-white/60 mt-1 line-clamp-2">{post.excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
