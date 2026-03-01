import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে"
        : error.message === "Email not confirmed"
          ? "আপনার ইমেইল ভেরিফাই করুন। ইনবক্স চেক করুন।"
          : error.message);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-8 mb-12">
        <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-black text-foreground">লগইন করুন</h1>
            <p className="text-xs text-muted-foreground mt-1">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "লোড হচ্ছে..." : "লগইন"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline block">পাসওয়ার্ড ভুলে গেছেন?</Link>
            <p className="text-xs text-muted-foreground">
              অ্যাকাউন্ট নেই? <Link to="/register" className="text-primary font-semibold hover:underline">রেজিস্টার করুন</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
