import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/news/Header";
import Footer from "@/components/news/Footer";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Reporter {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  nid: string;
  address: string;
  designation: string;
  photo_url: string;
  reporter_id: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;
}

export default function ReporterIdCard() {
  const { user } = useAuth();
  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reporters")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setReporter(data as Reporter | null);
        setLoading(false);
      });
  }, [user]);

  const handlePrint = () => window.print();

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: any; text: string; cls: string }> = {
      approved: { icon: CheckCircle2, text: "অনুমোদিত", cls: "bg-green-100 text-green-700" },
      pending: { icon: Clock, text: "অপেক্ষমান", cls: "bg-yellow-100 text-yellow-700" },
      rejected: { icon: XCircle, text: "প্রত্যাখ্যাত", cls: "bg-red-100 text-red-700" },
      suspended: { icon: XCircle, text: "স্থগিত", cls: "bg-red-100 text-red-700" },
    };
    const s = map[status] || map.pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
        <Icon className="w-3 h-3" /> {s.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto mt-8 text-center py-20 text-muted-foreground">লোড হচ্ছে...</div>
        <Footer />
      </div>
    );
  }

  if (!reporter) {
    return (
      <div className="min-h-screen bg-background font-bangla">
        <Header />
        <div className="container mx-auto mt-8 mb-12">
          <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-lg font-bold text-foreground mb-4">রিপোর্টার প্রোফাইল পাওয়া যায়নি</h2>
            <a href="/reporter-register" className="bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-bold inline-block">
              রেজিস্ট্রেশন করুন
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/reporter-id?verify=${reporter.reporter_id}`;

  return (
    <div className="min-h-screen bg-background font-bangla">
      <Header />
      <div className="container mx-auto mt-6 mb-10">
        <div className="max-w-lg mx-auto">
          {/* Status */}
          <div className="text-center mb-4">{statusBadge(reporter.status)}</div>

          {/* ID Card */}
          <div ref={cardRef} className="bg-card rounded-xl shadow-lg overflow-hidden border border-border print:shadow-none" id="reporter-id-card">
            {/* Card Header */}
            <div className="bg-primary px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">বা</span>
                </div>
                <h2 className="text-lg font-black text-primary-foreground">বাংলাখবর</h2>
              </div>
              <p className="text-[10px] text-primary-foreground/80 tracking-widest">প্রেস আইডি কার্ড</p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <div className="flex gap-5">
                {/* Photo */}
                <div className="shrink-0">
                  <div className="w-28 h-32 rounded-lg overflow-hidden border-2 border-primary/30 bg-muted">
                    {reporter.photo_url ? (
                      <img src={reporter.photo_url} alt={reporter.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">ছবি নেই</div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black text-foreground leading-tight">{reporter.full_name}</h3>
                  <p className="text-sm font-semibold text-primary">{reporter.designation}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📞 {reporter.phone}</p>
                    <p>📧 {reporter.email}</p>
                    {reporter.address && <p>📍 {reporter.address}</p>}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-border my-4" />

              {/* Bottom row */}
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="text-muted-foreground">আইডি: </span>
                    <span className="font-bold text-foreground">{reporter.reporter_id}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">NID: </span>
                    <span className="font-medium text-foreground">{reporter.nid}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    ইস্যু: {reporter.issue_date} — মেয়াদ: {reporter.expiry_date}
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-1.5 rounded border border-border">
                  <QRCodeSVG value={verifyUrl} size={72} />
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-secondary px-6 py-2 text-center">
              <p className="text-[9px] text-secondary-foreground/70">
                এই কার্ড বাংলাখবর কর্তৃক প্রদত্ত। QR কোড স্ক্যান করে যাচাই করুন।
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 mt-6 print:hidden">
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded text-sm font-bold hover:opacity-90">
              <Printer className="w-4 h-4" /> প্রিন্ট করুন
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-muted text-foreground px-5 py-2.5 rounded text-sm font-semibold hover:bg-accent">
              <Download className="w-4 h-4" /> ডাউনলোড
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
