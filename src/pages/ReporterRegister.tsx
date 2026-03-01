import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { Camera, Phone, Mail, CreditCard, MapPin, Briefcase, Facebook, Twitter, Youtube, CheckCircle2 } from "lucide-react";

export default function ReporterRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    nid: "",
    address: "",
    designation: "সংবাদদাতা",
    social_facebook: "",
    social_twitter: "",
    social_youtube: "",
  });

  const updateForm = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("প্রথমে লগইন করুন"); return; }
    if (!form.phone || !form.email || !form.nid) { setError("ফোন, ইমেইল এবং NID বাধ্যতামূলক"); return; }

    setLoading(true);
    setError("");

    try {
      // Generate reporter ID
      const { data: idData, error: idError } = await supabase.rpc("generate_reporter_id");
      if (idError) throw idError;
      const reporterId = idData;

      // Upload photo
      let photoUrl = "";
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/${reporterId}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("reporter-photos").upload(path, photoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("reporter-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error: insertErr } = await supabase.from("reporters").insert({
        user_id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        nid: form.nid,
        address: form.address,
        designation: form.designation,
        photo_url: photoUrl,
        social_facebook: form.social_facebook,
        social_twitter: form.social_twitter,
        social_youtube: form.social_youtube,
        reporter_id: reporterId,
      });

      if (insertErr) throw insertErr;

      // Add reporter role
      await supabase.from("user_roles").insert({ user_id: user.id, role: "reporter" as any });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto mt-8 mb-12">
          <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-lg font-bold text-foreground mb-4">রিপোর্টার রেজিস্ট্রেশনের জন্য প্রথমে লগইন করুন</h2>
            <button onClick={() => navigate("/login")} className="bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-bold">
              লগইন করুন
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto mt-8 mb-12">
          <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">আবেদন জমা হয়েছে!</h2>
            <p className="text-sm text-muted-foreground mb-4">এডমিন অনুমোদনের পর আপনার আইডি কার্ড জেনারেট হবে।</p>
            <button onClick={() => navigate("/reporter-id")} className="bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-bold">
              আইডি কার্ড দেখুন
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
      <div className="container mx-auto mt-6 mb-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-xl font-black text-foreground mb-1">রিপোর্টার রেজিস্ট্রেশন</h1>
            <p className="text-xs text-muted-foreground mb-6">বাংলাখবর সংবাদদাতা হিসেবে যোগ দিন</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo */}
              <div className="text-center">
                <label className="cursor-pointer inline-block">
                  <div className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <span className="text-xs text-primary mt-2 block">ছবি আপলোড করুন</span>
                </label>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">পূর্ণ নাম *</label>
                  <input type="text" required value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)}
                    className="w-full bg-muted border border-border rounded px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">পদবী</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={form.designation} onChange={(e) => updateForm("designation", e.target.value)}
                      className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">ফোন নম্বর * <span className="text-destructive">(বাধ্যতামূলক)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" required value={form.phone} onChange={(e) => updateForm("phone", e.target.value)}
                      placeholder="01XXXXXXXXX" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">ইমেইল * <span className="text-destructive">(বাধ্যতামূলক)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" required value={form.email} onChange={(e) => updateForm("email", e.target.value)}
                      className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* NID & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">NID নম্বর * <span className="text-destructive">(বাধ্যতামূলক)</span></label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" required value={form.nid} onChange={(e) => updateForm("nid", e.target.value)}
                      placeholder="জাতীয় পরিচয়পত্র নম্বর" className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">ঠিকানা</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={form.address} onChange={(e) => updateForm("address", e.target.value)}
                      className="w-full bg-muted border border-border rounded px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">সোশ্যাল মিডিয়া (ঐচ্ছিক)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="url" value={form.social_facebook} onChange={(e) => updateForm("social_facebook", e.target.value)}
                      placeholder="Facebook URL" className="w-full bg-muted border border-border rounded px-3 py-2 pl-10 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="url" value={form.social_twitter} onChange={(e) => updateForm("social_twitter", e.target.value)}
                      placeholder="Twitter/X URL" className="w-full bg-muted border border-border rounded px-3 py-2 pl-10 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="url" value={form.social_youtube} onChange={(e) => updateForm("social_youtube", e.target.value)}
                      placeholder="YouTube URL" className="w-full bg-muted border border-border rounded px-3 py-2 pl-10 text-xs focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
              </div>

              {error && <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded font-bold text-sm hover:opacity-90 disabled:opacity-50">
                {loading ? "সাবমিট হচ্ছে..." : "আবেদন জমা দিন"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
