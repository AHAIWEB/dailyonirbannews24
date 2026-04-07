import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchiveDashboard } from "./ArchiveDashboard";
import { ArchiveScraper } from "./ArchiveScraper";
import { ArchiveSchedule } from "./ArchiveSchedule";
import { Database, Globe, Clock, BarChart3 } from "lucide-react";

interface ArchiveHubProps {
  showHeader?: boolean;
  showDashboard?: boolean;
  showScraper?: boolean;
  showSchedule?: boolean;
  className?: string;
}

export function ArchiveHub({
  showHeader = true,
  showDashboard = true,
  showScraper = true,
  showSchedule = true,
  className = "",
}: ArchiveHubProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        অ্যাডমিন অ্যাক্সেস প্রয়োজন
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-lg font-black text-foreground">আর্কাইভ হাব</h2>
            <p className="text-xs text-muted-foreground">ওয়েব স্ক্র্যাপিং, আর্কাইভ ও AI প্রসেসিং</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          {showDashboard && (
            <TabsTrigger value="dashboard" className="gap-1 text-xs">
              <BarChart3 className="w-3 h-3" /> ড্যাশবোর্ড
            </TabsTrigger>
          )}
          {showScraper && (
            <TabsTrigger value="scraper" className="gap-1 text-xs">
              <Globe className="w-3 h-3" /> স্ক্র্যাপার
            </TabsTrigger>
          )}
          {showSchedule && (
            <TabsTrigger value="schedule" className="gap-1 text-xs">
              <Clock className="w-3 h-3" /> শিডিউল
            </TabsTrigger>
          )}
        </TabsList>

        {showDashboard && (
          <TabsContent value="dashboard">
            <ArchiveDashboard />
          </TabsContent>
        )}
        {showScraper && (
          <TabsContent value="scraper">
            <ArchiveScraper />
          </TabsContent>
        )}
        {showSchedule && (
          <TabsContent value="schedule">
            <ArchiveSchedule />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default ArchiveHub;
