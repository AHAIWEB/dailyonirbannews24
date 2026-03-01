interface SectionLabelProps {
  label: string;
  moreLink?: string;
}

export default function SectionLabel({ label, moreLink = "#" }: SectionLabelProps) {
  return (
    <div className="flex items-center justify-between mb-4 border-b-2 border-primary pb-0">
      <div className="section-label">{label}</div>
      <a href={moreLink} className="text-xs text-primary hover:underline font-medium">
        আরও →
      </a>
    </div>
  );
}
