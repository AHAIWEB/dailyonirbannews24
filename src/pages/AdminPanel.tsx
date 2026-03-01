import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { Shield, Users, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";

interface ReporterRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  nid: string;
  reporter_id: string;
  status: string;
  designation: string;
  created_at: string;
  photo_url: string;
}

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reporters, setReporters] = useState<ReporterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchReporters();
  }, [isAdmin, tab]);

  const fetchReporters = async () => {
    setLoading(true);
    let query = supabase.from("reporters").select("*").order("created_at", { ascending: false });
    if (tab === "pending") query = query.eq("status", "pending");
    else if (tab === "approved") query = query.eq("status", "approved");
    const { data } = await query;
    setReporters((data as ReporterRow[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reporters").update({ status }).eq("id", id);
    fetchReporters();
  };

  if (authLoading) return <div className="min-h-screen bg-background" />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-6 mb-10">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black text-foreground">এডমিন প্যানেল</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {([["pending", "অপেক্ষমান"], ["approved", "অনুমোদিত"], ["all", "সকল"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as any)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Reporter list */}
          {loading ? (
            <p className="text-center text-muted-foreground py-10">লোড হচ্ছে...</p>
          ) : reporters.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">কোনো রিপোর্টার পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3">
              {reporters.map((r) => (
                <div key={r.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-border shrink-0">
                    {r.photo_url ? <img src={r.photo_url} className="w-full h-full object-cover" /> : <Users className="w-full h-full p-3 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground">{r.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{r.designation} · {r.reporter_id}</p>
                    <p className="text-xs text-muted-foreground">📞 {r.phone} · 📧 {r.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(r.id, "approved")}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90">
                          <CheckCircle2 className="w-3 h-3" /> অনুমোদন
                        </button>
                        <button onClick={() => updateStatus(r.id, "rejected")}
                          className="flex items-center gap-1 bg-destructive text-destructive-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90">
                          <XCircle className="w-3 h-3" /> বাতিল
                        </button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <button onClick={() => updateStatus(r.id, "suspended")}
                        className="flex items-center gap-1 bg-destructive/80 text-destructive-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90">
                        <XCircle className="w-3 h-3" /> স্থগিত
                      </button>
                    )}
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                      r.status === "approved" ? "bg-green-100 text-green-700" :
                      r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {r.status === "approved" ? "অনুমোদিত" : r.status === "pending" ? "অপেক্ষমান" : r.status === "rejected" ? "প্রত্যাখ্যাত" : "স্থগিত"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
