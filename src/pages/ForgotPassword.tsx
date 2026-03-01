import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { KeyRound, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-8 mb-12">
        <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 text-center">
          {sent ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">ইমেইল পাঠানো হয়েছে</h2>
              <p className="text-sm text-muted-foreground">আপনার ইমেইলে পাসওয়ার্ড রিসেটের লিংক পাঠানো হয়েছে।</p>
            </>
          ) : (
            <>
              <KeyRound className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-xl font-black text-foreground mb-2">পাসওয়ার্ড রিসেট</h1>
              <p className="text-xs text-muted-foreground mb-6">আপনার রেজিস্টার্ড ইমেইল দিন</p>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                {error && <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded font-bold text-sm hover:opacity-90 disabled:opacity-50">
                  {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
                </button>
              </form>
            </>
          )}
          <Link to="/login" className="text-xs text-primary hover:underline mt-4 inline-block">← লগইন পেজে ফিরে যান</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
