import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getSEOSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", "seo_config")
      .maybeSingle();
    
    return (data?.value as any) || {
      siteName: "ادیورَنک",
      titleSeparator: "|",
      defaultDescription: "پلتفرم تخصصی آموزش شیمی هوشمند",
      defaultOGImage: "/og-image.jpg"
    };
  });
