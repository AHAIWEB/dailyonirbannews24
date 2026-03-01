import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { UserPlus, Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto mt-8 mb-12">
          <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">রেজিস্ট্রেশন সফল!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। ইমেইল ভেরিফাই করার পর লগইন করতে পারবেন।
            </p>
            <Link to="/login" className="text-primary font-semibold text-sm hover:underline">
              লগইন পেজে যান →
            </Link>
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
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-black text-foreground">রেজিস্টার করুন</h1>
            <p className="text-xs text-muted-foreground mt-1">নতুন অ্যাকাউন্ট তৈরি করুন</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">পূর্ণ নাম</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার নাম" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "অপেক্ষা করুন..." : "রেজিস্টার করুন"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            অ্যাকাউন্ট আছে? <Link to="/login" className="text-primary font-semibold hover:underline">লগইন করুন</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
