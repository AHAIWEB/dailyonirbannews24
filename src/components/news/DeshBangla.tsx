import { generatePosts, divisions, districts, upazilas } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DeshBangla() {
  const posts = generatePosts("দেশ বাংলা", 4);
  const [div, setDiv] = useState(divisions[0]);
  const [dist, setDist] = useState(districts[0]);
  const [upa, setUpa] = useState(upazilas[0]);

  const Dropdown = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-muted text-foreground text-xs px-3 py-1.5 pr-7 rounded border border-border cursor-pointer focus:ring-1 focus:ring-primary focus:outline-none"
      >
        <option disabled>{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );

  return (
    <section>
      <SectionLabel label="দেশ বাংলা" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Dropdown value={div} onChange={setDiv} options={divisions} label="বিভাগ" />
        <Dropdown value={dist} onChange={setDist} options={districts} label="জেলা" />
        <Dropdown value={upa} onChange={setUpa} options={upazilas} label="উপজেলা" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <div key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm">
            <div className="overflow-hidden aspect-video">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="p-2">
              <h3 className="text-xs font-bold leading-relaxed text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
