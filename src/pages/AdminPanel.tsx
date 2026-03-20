import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getReporterPhotoUrl } from "@/lib/storageUtils";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { Shield, Users, CheckCircle2, XCircle, FileText, Settings, UserCog, Eye, Trash2, Save, RefreshCw, Rss, LayoutDashboard, Send, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RssFeedManager from "@/components/admin/RssFeedManager";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import PostManager from "@/components/admin/PostManager";
import SiteCustomizer from "@/components/admin/SiteCustomizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

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

interface UserRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  roles: string[];
}

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [authLoading, isAdmin, navigate]);

  if (authLoading) return <div className="min-h-screen bg-background" />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-4 mb-10 px-3 md:px-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black text-foreground">এডমিন প্যানেল</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-opacity">
              🏠 হোম পেইজ
            </a>
            <a href="https://belabhuminews.lovable.app" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-opacity">
              🌐 মূল সাইট
            </a>
          </div>
        </div>

        {/* Dashboard Stats */}
        <AdminDashboardStats />

        <Tabs defaultValue="rss" className="w-full mt-4">
          <TabsList className="w-full flex flex-wrap gap-1 mb-4 h-auto p-1">
            <TabsTrigger value="rss" className="flex items-center gap-1 text-[10px] md:text-xs px-2 py-1.5">
              <Rss className="w-3 h-3" /> RSS ফিড
            </TabsTrigger>
            <TabsTrigger value="post" className="flex items-center gap-1 text-[10px] md:text-xs px-2 py-1.5">
              <Send className="w-3 h-3" /> পোস্ট
            </TabsTrigger>
            <TabsTrigger value="reporters" className="flex items-center gap-1 text-[10px] md:text-xs px-2 py-1.5">
              <Users className="w-3 h-3" /> রিপোর্টার
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 text-[10px] md:text-xs px-2 py-1.5">
              <UserCog className="w-3 h-3" /> ইউজার
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-1 text-[10px] md:text-xs px-2 py-1.5">
              <Palette className="w-3 h-3" /> কাস্টমাইজ
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-[10px] md:text-xs px-2 py-1.5">
              <Settings className="w-3 h-3" /> সেটিংস
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rss"><RssFeedManager /></TabsContent>
          <TabsContent value="post"><PostManager /></TabsContent>
          <TabsContent value="reporters"><ReporterManagement /></TabsContent>
          <TabsContent value="users"><UserManagement /></TabsContent>
          <TabsContent value="customize"><SiteCustomizer /></TabsContent>
          <TabsContent value="settings"><SiteSettings /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

/* ==================== REPORTER MANAGEMENT ==================== */
function ReporterManagement() {
  const [reporters, setReporters] = useState<ReporterRow[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  useEffect(() => { fetchReporters(); }, [filter]);

  const fetchReporters = async () => {
    setLoading(true);
    let query = supabase.from("reporters").select("*").order("created_at", { ascending: false });
    if (filter === "pending") query = query.eq("status", "pending");
    else if (filter === "approved") query = query.eq("status", "approved");
    const { data } = await query;
    const rows = (data as ReporterRow[]) || [];
    setReporters(rows);
    // Resolve signed URLs for photos
    const urls: Record<string, string> = {};
    await Promise.all(rows.map(async (r) => {
      if (r.photo_url) {
        urls[r.id] = await getReporterPhotoUrl(r.photo_url);
      }
    }));
    setPhotoUrls(urls);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reporters").update({ status }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else toast({ title: "সফল", description: `স্ট্যাটাস ${status} করা হয়েছে` });
    fetchReporters();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">রিপোর্টার ম্যানেজমেন্ট</CardTitle>
          <div className="flex gap-1.5">
            {(["pending", "approved", "all"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="text-xs">
                {f === "pending" ? "অপেক্ষমান" : f === "approved" ? "অনুমোদিত" : "সকল"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
        ) : reporters.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">কোনো রিপোর্টার পাওয়া যায়নি</p>
        ) : (
          <div className="space-y-3">
            {reporters.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-border shrink-0">
                  {photoUrls[r.id] ? <img src={photoUrls[r.id]} className="w-full h-full object-cover" alt={r.full_name} /> : <Users className="w-full h-full p-2 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground">{r.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{r.designation} · {r.reporter_id}</p>
                  <p className="text-xs text-muted-foreground">📞 {r.phone} · 📧 {r.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {r.status === "pending" && (
                    <>
                      <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateStatus(r.id, "approved")}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> অনুমোদন
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateStatus(r.id, "rejected")}>
                        <XCircle className="w-3 h-3 mr-1" /> বাতিল
                      </Button>
                    </>
                  )}
                  {r.status === "approved" && (
                    <Button size="sm" variant="destructive" className="h-7 text-xs opacity-80" onClick={() => updateStatus(r.id, "suspended")}>
                      <XCircle className="w-3 h-3 mr-1" /> স্থগিত
                    </Button>
                  )}
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ==================== USER MANAGEMENT ==================== */
function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: allRoles } = await supabase.from("user_roles").select("*");

    const usersWithRoles: UserRow[] = (profiles || []).map((p: any) => ({
      ...p,
      roles: (allRoles || []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
    }));
    setUsers(usersWithRoles);
    setLoading(false);
  };

  const toggleRole = async (userId: string, role: string, hasRole: boolean) => {
    if (hasRole) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    }
    toast({ title: "সফল", description: `রোল আপডেট করা হয়েছে` });
    fetchUsers();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ইউজার ম্যানেজমেন্ট</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> রিফ্রেশ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">কোনো ইউজার পাওয়া যায়নি</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>ফোন</TableHead>
                    <TableHead>যোগদান</TableHead>
                    <TableHead>রোল</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-sm">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.phone || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("bn-BD")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map((r) => (
                            <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              r === "admin" ? "bg-primary/10 text-primary" : r === "reporter" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                            }`}>{r === "admin" ? "এডমিন" : r === "reporter" ? "রিপোর্টার" : "পাঠক"}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {!u.roles.includes("admin") && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => toggleRole(u.user_id, "admin", false)}>
                              +এডমিন
                            </Button>
                          )}
                          {u.roles.includes("admin") && (
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={() => toggleRole(u.user_id, "admin", true)}>
                              -এডমিন
                            </Button>
                          )}
                          {!u.roles.includes("reporter") && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => toggleRole(u.user_id, "reporter", false)}>
                              +রিপোর্টার
                            </Button>
                          )}
                          {u.roles.includes("reporter") && (
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={() => toggleRole(u.user_id, "reporter", true)}>
                              -রিপোর্টার
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">{u.full_name || "—"}</h3>
                    <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString("bn-BD")}</span>
                  </div>
                  {u.phone && <p className="text-xs text-muted-foreground">📞 {u.phone}</p>}
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r === "admin" ? "bg-primary/10 text-primary" : r === "reporter" ? "bg-green-100 text-green-700" : "bg-muted-foreground/10 text-muted-foreground"
                      }`}>{r === "admin" ? "এডমিন" : r === "reporter" ? "রিপোর্টার" : "পাঠক"}</span>
                    ))}
                  </div>
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {!u.roles.includes("admin") ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleRole(u.user_id, "admin", false)}>+এডমিন</Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => toggleRole(u.user_id, "admin", true)}>-এডমিন</Button>
                    )}
                    {!u.roles.includes("reporter") ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleRole(u.user_id, "reporter", false)}>+রিপোর্টার</Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => toggleRole(u.user_id, "reporter", true)}>-রিপোর্টার</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ==================== SITE SETTINGS ==================== */
function SiteSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const labels: Record<string, string> = {
    site_name: "সাইটের নাম",
    site_tagline: "ট্যাগলাইন",
    contact_email: "যোগাযোগ ইমেইল",
    contact_phone: "যোগাযোগ ফোন",
    facebook_url: "ফেসবুক লিংক",
    youtube_url: "ইউটিউব লিংক",
    twitter_url: "টুইটার লিংক",
  };

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").order("key");
    setSettings((data as SiteSetting[]) || []);
    setLoading(false);
  };

  const updateValue = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const saveSettings = async () => {
    setSaving(true);
    for (const s of settings) {
      await supabase.from("site_settings").update({ value: s.value, updated_at: new Date().toISOString() }).eq("key", s.key);
    }
    setSaving(false);
    toast({ title: "সফল", description: "সেটিংস সেভ করা হয়েছে" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">সাইট সেটিংস</CardTitle>
          <Button size="sm" onClick={saveSettings} disabled={saving} className="text-xs">
            <Save className="w-3 h-3 mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
        ) : (
          <div className="space-y-4">
            {settings.map((s) => (
              <div key={s.key}>
                <label className="text-xs font-semibold text-foreground mb-1 block">{labels[s.key] || s.key}</label>
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => updateValue(s.key, e.target.value)}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ==================== STATUS BADGE ==================== */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; label: string }> = {
    approved: { bg: "bg-green-100 text-green-700", label: "অনুমোদিত" },
    pending: { bg: "bg-yellow-100 text-yellow-700", label: "অপেক্ষমান" },
    rejected: { bg: "bg-red-100 text-red-700", label: "প্রত্যাখ্যাত" },
    suspended: { bg: "bg-red-100 text-red-700", label: "স্থগিত" },
  };
  const c = config[status] || { bg: "bg-muted text-muted-foreground", label: status };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg}`}>{c.label}</span>;
}
