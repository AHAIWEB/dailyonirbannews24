import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a reporter photo URL. Handles both:
 * - Legacy full URLs (passthrough)
 * - Storage paths (generates signed URL)
 */
export async function getReporterPhotoUrl(photoUrl: string | null): Promise<string> {
  if (!photoUrl) return "";
  // Legacy full URLs (already a complete URL)
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }
  // Storage path — generate a signed URL (valid for 1 year)
  const { data } = await supabase.storage
    .from("reporter-photos")
    .createSignedUrl(photoUrl, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? "";
}
