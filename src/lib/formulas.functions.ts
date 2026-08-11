import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getFormulas = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => 
    z.object({ 
      grade: z.string().optional(), 
      topicId: z.string().uuid().optional() 
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = (supabaseAdmin as any).from("formulas").select("*, topics(title)");
    
    if (data.grade) query = query.eq("grade", data.grade);
    if (data.topicId) query = query.eq("topic_id", data.topicId);
    
    const { data: formulas } = await query.order("created_at");
    return (formulas as any[]) ?? [];
  });
