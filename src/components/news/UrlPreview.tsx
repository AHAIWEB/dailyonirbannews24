import { useState } from "react";
import { Link2, Loader2, X, ExternalLink } from "lucide-react";

interface UrlMetadata {
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
  url: string;
}

export default function UrlPreview() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [error, setError] = useState("");

  const fetchMetadata = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setMetadata(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-url-metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMetadata(data.data);
      } else {
        setError(data.error || "মেটাডেটা আনতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError("সার্ভারের সাথে সংযোগ করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchMetadata();
    }
  };

  const clearPreview = () => {
    setMetadata(null);
    setUrl("");
    setError("");
  };

  return (
    <div className="bg-card rounded shadow-sm p-4 md:p-6">
      <h3 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-primary" />
        লিংক প্রিভিউ
      </h3>

      {/* URL Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="URL পেস্ট করুন (যেমন: https://example.com)"
          className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
        />
        <button
          onClick={fetchMetadata}
          disabled={loading || !url.trim()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
          {loading ? "লোড হচ্ছে..." : "প্রিভিউ"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded mb-3">
          {error}
        </div>
      )}

      {/* Preview Card */}
      {metadata && (
        <div className="border border-border rounded overflow-hidden relative group">
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 z-10 w-6 h-6 bg-background/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Image */}
          {metadata.image && (
            <div className="aspect-video overflow-hidden bg-muted">
              <img
                src={metadata.image}
                alt={metadata.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {/* Source */}
            <div className="flex items-center gap-2 mb-2">
              {metadata.favicon && (
                <img
                  src={metadata.favicon}
                  alt={metadata.siteName}
                  className="w-4 h-4 rounded-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                {metadata.siteName}
              </span>
            </div>

            {/* Title */}
            <a
              href={metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-foreground hover:text-primary transition-colors leading-relaxed line-clamp-2 flex items-start gap-1.5"
            >
              {metadata.title}
              <ExternalLink className="w-3 h-3 mt-1 shrink-0 text-muted-foreground" />
            </a>

            {/* Description */}
            {metadata.description && (
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                {metadata.description}
              </p>
            )}

            {/* URL */}
            <span className="text-[10px] text-muted-foreground/60 mt-2 block truncate">
              {metadata.url}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
