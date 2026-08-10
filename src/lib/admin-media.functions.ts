import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const adminUploadMedia = createServerFn({ method: "POST" })
  .inputValidator((data: { file: File; name: string; bucket: string }) => data)
  .handler(async ({ data }) => {
    // In a real serverless env, file handling is usually through FormData or presigned URLs.
    // Assuming standard multipart/form-data support in TanStack Start.
    const { data: uploadData, error } = await supabase.storage
      .from(data.bucket)
      .upload(`${Date.now()}-${data.name}`, data.file);
      
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage.from(data.bucket).getPublicUrl(uploadData.path);
    
    const { data: record, error: recordError } = await supabase
      .from("media_library")
      .insert([{
        filename: data.name,
        file_url: publicUrl.publicUrl,
        file_type: data.file.type,
        size_bytes: data.file.size
      }])
      .select()
      .single();
      
    if (recordError) throw recordError;
    return record;
  });
