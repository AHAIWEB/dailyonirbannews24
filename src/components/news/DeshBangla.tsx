import { useState, useEffect } from "react";
import { getAllDivisions, getDistricts, getUpazilas } from "@/data/bangladeshLocations";
import { generatePosts } from "@/data/mockData";
import SectionLabel from "./SectionLabel";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function DeshBangla() {
  const divisions = getAllDivisions();
  const [div, setDiv] = useState(divisions[0]);
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [dist, setDist] = useState("");
  const [upazilaList, setUpazilaList] = useState<string[]>([]);
  const [upa, setUpa] = useState("");

  useEffect(() => {
    const districts = getDistricts(div);
    setDistrictList(districts);
    setDist(districts[0] || "");
  }, [div]);

  useEffect(() => {
    if (div && dist) {
      const upas = getUpazilas(div, dist);
      setUpazilaList(upas);
      setUpa(upas[0] || "");
    }
  }, [div, dist]);

  const posts = generatePosts("দেশ বাংলা", 8);

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

  // Screenshot-matched: hero left + right col with 3 small, bottom row 4 cards
  const hero = posts[0];
  const rightTop = posts[1];
  const rightList = posts.slice(2, 5);
  const bottomRow = posts.slice(4, 8);

  return (
    <section>
      <SectionLabel label="দেশ বাংলা" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Dropdown value={div} onChange={setDiv} options={divisions} label="বিভাগ" />
        <Dropdown value={dist} onChange={setDist} options={districtList} label="জেলা" />
        <Dropdown value={upa} onChange={setUpa} options={upazilaList} label="উপজেলা" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Hero - left 2 cols */}
        <Link to={`/post/${hero.id}`} className="md:col-span-2 block relative rounded-lg overflow-hidden group">
          <div className="aspect-[16/10] bg-muted">
            <img src={hero.image} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">দেশ বাংলা</span>
            <h3 className="text-base md:text-lg font-black text-white mt-2 leading-relaxed group-hover:text-primary transition-colors line-clamp-3">
              {hero.title}
            </h3>
            <p className="text-[10px] text-white/60 mt-1 line-clamp-1">{hero.excerpt}</p>
          </div>
        </Link>

        {/* Right column */}
        <div className="space-y-3">
          {/* Top image card */}
          <Link to={`/post/${rightTop.id}`} className="block relative rounded-lg overflow-hidden group">
            <div className="aspect-video bg-muted">
              <img src={rightTop.image} alt={rightTop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                {rightTop.title}
              </h4>
            </div>
          </Link>
          {/* List items */}
          {rightList.map(post => (
            <Link key={post.id} to={`/post/${post.id}`} className="flex gap-2 group">
              <div className="w-20 h-14 rounded overflow-hidden shrink-0 bg-muted">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed flex-1">
                {post.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        {bottomRow.map(post => (
          <Link key={post.id} to={`/post/${post.id}`} className="block rounded-lg overflow-hidden group relative">
            <div className="aspect-[4/3] bg-muted">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h4 className="text-[11px] font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                {post.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
