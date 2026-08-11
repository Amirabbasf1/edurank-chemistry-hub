import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * SM-2 Algorithm implementation
 */
function calculateSM2(quality: number, previousInterval: number, previousEase: number) {
  let interval: number;
  let ease: number;

  if (quality >= 3) {
    if (previousInterval === 0) {
      interval = 1;
    } else if (previousInterval === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * previousEase);
    }
    ease = previousEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    interval = 1;
    ease = previousEase;
  }

  if (ease < 1.3) ease = 1.3;
  return { interval, ease };
}

export const scheduleReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { itemType: 'topic' | 'question'; itemId: string; quality: number }) => 
    z.object({
      itemType: z.enum(['topic', 'question']),
      itemId: z.string().uuid(),
      quality: z.number().int().min(0).max(5)
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("spaced_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("item_type", data.itemType)
      .eq("item_id", data.itemId)
      .maybeSingle();

    const prevInterval = existing?.last_interval_days || 0;
    const prevEase = existing?.ease_factor || 2.5;

    const { interval, ease } = calculateSM2(data.quality, prevInterval, prevEase);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const { error } = await supabaseAdmin
      .from("spaced_reviews")
      .upsert({
        user_id: userId,
        item_type: data.itemType,
        item_id: data.itemId,
        next_review_at: nextReview.toISOString(),
        last_interval_days: interval,
        ease_factor: ease,
      } as any, { onConflict: 'user_id,item_type,item_id' });

    if (error) throw error;
    return { nextReview, interval };
  });
