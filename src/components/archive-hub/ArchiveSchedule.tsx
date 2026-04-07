import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface Schedule {
  id: string;
  url: string;
  interval: string;
  is_active: boolean;
  last_run: string | null;
  created_at: string;
}

export function ArchiveSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newInterval, setNewInterval] = useState("24h");

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scrape_schedules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSchedules(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const addSchedule = async () => {
    if (!newUrl.trim()) return;
    try {
      const { error } = await supabase.from("scrape_schedules").insert({
        url: newUrl.trim(),
        interval: newInterval,
      });
      if (error) throw error;
      setNewUrl("");
      fetchSchedules();
      toast.success("শিডিউল যোগ হয়েছে");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleSchedule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("scrape_schedules")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !isActive } : s)));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from("scrape_schedules").delete().eq("id", id);
      if (error) throw error;
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("শিডিউল ডিলিট হয়েছে");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" /> স্ক্র্যাপ শিডিউল
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://example.com" className="text-sm flex-1" />
          <select
            value={newInterval}
            onChange={(e) => setNewInterval(e.target.value)}
            className="bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
          >
            <option value="1h">১ ঘণ্টা</option>
            <option value="6h">৬ ঘণ্টা</option>
            <option value="12h">১২ ঘণ্টা</option>
            <option value="24h">২৪ ঘণ্টা</option>
            <option value="7d">৭ দিন</option>
          </select>
          <Button size="sm" onClick={addSchedule} className="gap-1 shrink-0">
            <Plus className="w-3 h-3" /> যোগ
          </Button>
        </div>

        <div className="space-y-2">
          {schedules.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground text-center py-6">কোনো শিডিউল নেই</p>
          )}
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{schedule.url}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={schedule.is_active ? "default" : "secondary"} className="text-[9px]">
                    {schedule.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">প্রতি {schedule.interval}</span>
                  {schedule.last_run && (
                    <span className="text-[9px] text-muted-foreground">
                      শেষ: {new Date(schedule.last_run).toLocaleDateString("bn-BD")}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => toggleSchedule(schedule.id, schedule.is_active)} className="text-primary hover:text-primary/80">
                {schedule.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => deleteSchedule(schedule.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
