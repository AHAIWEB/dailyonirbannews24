import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { Lock, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check for recovery type in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto mt-8 mb-12">
          <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold">পাসওয়ার্ড আপডেট হয়েছে!</h2>
            <button onClick={() => navigate("/")} className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-bold">
              হোমে যান
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-8 mb-12">
        <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8">
          <h1 className="text-xl font-black text-foreground text-center mb-6">নতুন পাসওয়ার্ড সেট করুন</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            {error && <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded font-bold text-sm hover:opacity-90 disabled:opacity-50">
              {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
