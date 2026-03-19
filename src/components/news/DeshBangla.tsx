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

  const posts = generatePosts("দেশ বাংলা", 4);

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
        <Dropdown value={dist} onChange={setDist} options={districtList} label="জেলা" />
        <Dropdown value={upa} onChange={setUpa} options={upazilaList} label="উপজেলা" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <Link to={`/post/${post.id}`} key={post.id} className="post-card bg-card rounded overflow-hidden shadow-sm block">
            <div className="overflow-hidden aspect-video">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover post-image" />
            </div>
            <div className="p-2">
              <h3 className="text-xs font-bold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
