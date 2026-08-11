import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const updateLessonProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string; courseId: string; isCompleted: boolean; watchedSeconds?: number }) => 
    z.object({
      lessonId: z.string().uuid(),
      courseId: z.string().uuid(),
      isCompleted: z.boolean(),
      watchedSeconds: z.number().int().optional()
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Update lesson progress
    await supabaseAdmin
      .from("lesson_progress")
      .upsert({
        user_id: userId,
        lesson_id: data.lessonId,
        course_id: data.courseId,
        is_completed: data.isCompleted,
        watched_seconds: data.watchedSeconds || 0,
        completed_at: data.isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      } as any, { onConflict: 'user_id,lesson_id' });

    // 2. Recalculate course progress
    const { data: lessons } = await supabaseAdmin
      .from("lessons")
      .select("id")
      .eq("course_id", data.courseId);
    
    const { data: completed } = await supabaseAdmin
      .from("lesson_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .eq("is_completed", true);

    const total = lessons?.length || 0;
    const done = completed?.length || 0;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    await supabaseAdmin
      .from("enrollments")
      .update({ 
        progress_percent: percent, 
        last_lesson_id: data.lessonId,
        completed_at: percent === 100 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      } as any)
      .eq("user_id", userId)
      .eq("course_id", data.courseId);

    return { progress: percent };
  });
