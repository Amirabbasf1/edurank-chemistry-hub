import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const awardXP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { amount: number; reason: string; metadata?: any }) => 
    z.object({ 
      amount: z.number().int().positive(), 
      reason: z.string(),
      metadata: z.any().optional()
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Update Profile XP
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("xp, last_active_date, current_streak")
      .eq("id", userId)
      .single();

    if (!profile) throw new Error("Profile not found");

    const newXP = (profile.xp || 0) + data.amount;
    
    // 2. Streak logic
    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.last_active_date;
    let newStreak = profile.current_streak || 0;

    if (lastActive === today) {
      // Already active today
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActive === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    await supabaseAdmin
      .from("profiles")
      .update({ 
        xp: newXP, 
        current_streak: newStreak,
        last_active_date: today,
        updated_at: new Date().toISOString()
      } as any)
      .eq("id", userId);

    // 3. Log notification
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title: "امتیاز جدید!",
      content: `شما ${data.amount} امتیاز برای "${data.reason}" دریافت کردید.`,
      type: "achievement"
    } as any);

    return { success: true, newXP, newStreak };
  });
