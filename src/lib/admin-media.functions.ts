import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

// Browser-side logic will use Supabase client directly for large file uploads.
// These functions are for metadata management and storage interaction rules.

export const adminCreateMediaRecord = createServerFn({ method: "POST" })
  .inputValidator((data: { filename: string; file_url: string; file_type: string; file_size: number }) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase
      .from("media_library")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return res;
  });
