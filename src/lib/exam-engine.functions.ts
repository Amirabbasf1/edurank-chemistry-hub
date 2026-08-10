import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Creates a new exam attempt for a student.
 */
export const startExamAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { examId: string }) => z.object({ examId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Fetch exam details
    const { data: exam, error: examError } = await supabaseAdmin
      .from("exams")
      .select("*, exam_questions(question_id, sort_order)")
      .eq("id", data.examId)
      .single();

    if (examError || !exam) throw new Error("آزمون یافت نشد");
    if (!exam.is_published && !context.claims.role?.includes('admin')) {
      throw new Error("این آزمون هنوز منتشر نشده است");
    }

    // 2. Prepare question order
    let questionIds = (exam.exam_questions as any[]).map(q => q.question_id);
    if ((exam as any).randomize_questions) {
      questionIds = [...questionIds].sort(() => Math.random() - 0.5);
    }

    // 3. Create attempt
    const durationMinutes = (exam as any).duration_minutes || 60;
    const expectedEndAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("exam_attempts")
      .insert({
        user_id: userId,
        exam_id: data.examId,
        started_at: new Date().toISOString(),
        expected_end_at: expectedEndAt,
        question_order: questionIds,
        status: 'in_progress',
        score: 0,
        max_score: (exam as any).question_count || questionIds.length,
      } as any)
      .select()
      .single();

    if (attemptError) throw attemptError;
    return attempt;
  });

/**
 * Saves a single answer during an exam attempt.
 */
export const saveExamAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { attemptId: string; questionId: string; optionId: string | null }) => 
    z.object({
      attemptId: z.string().uuid(),
      questionId: z.string().uuid(),
      optionId: z.string().uuid().nullable()
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Verify attempt ownership and status
    const { data: attempt } = await supabaseAdmin
      .from("exam_attempts")
      .select("status, user_id")
      .eq("id", data.attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId) throw new Error("دسترسی غیرمجاز");
    if (attempt.status !== 'in_progress') throw new Error("این آزمون به پایان رسیده است");

    const { error } = await supabaseAdmin
      .from("exam_answers")
      .upsert({
        attempt_id: data.attemptId,
        question_id: data.questionId,
        selected_option_id: data.optionId,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'attempt_id,question_id' });

    if (error) throw error;
    return { success: true };
  });

/**
 * Toggles a flag on a question during an exam.
 */
export const toggleQuestionFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { attemptId: string; questionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: attempt } = await supabaseAdmin
      .from("exam_attempts")
      .select("flagged_questions, user_id, status")
      .eq("id", data.attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId || (attempt as any).status !== 'in_progress') {
      throw new Error("Unauthorized");
    }

    const currentFlags = (attempt as any).flagged_questions || [];
    const newFlags = currentFlags.includes(data.questionId)
      ? currentFlags.filter((id: string) => id !== data.questionId)
      : [...currentFlags, data.questionId];

    await supabaseAdmin
      .from("exam_attempts")
      .update({ flagged_questions: newFlags } as any)
      .eq("id", data.attemptId);

    return { flagged: newFlags.includes(data.questionId) };
  });

/**
 * Finalizes grading for an exam attempt.
 */
export const finalizeExamGrading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { attemptId: string }) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Get attempt and answers
    const { data: attempt } = await supabaseAdmin
      .from("exam_attempts")
      .select("*, exams(*)")
      .eq("id", data.attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId) throw new Error("Unauthorized");
    if ((attempt as any).status === 'completed') return { status: 'already_completed' };

    const { data: answers } = await supabaseAdmin
      .from("exam_answers")
      .select("question_id, selected_option_id")
      .eq("attempt_id", data.attemptId);

    const questionIds = (attempt as any).question_order || [];
    
    // 2. Fetch correct answers
    const [{ data: questions }, { data: options }] = await Promise.all([
      supabaseAdmin.from("questions").select("id, points, topic_id").in("id", questionIds),
      supabaseAdmin.from("question_options").select("id, question_id, is_correct").in("question_id", questionIds),
    ]);

    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const negativeMarking = (attempt as any).exams?.negative_marking || false;

    const topicStats: Record<string, { correct: number; total: number }> = {};

    for (const qId of questionIds) {
      const q = questions?.find(q => q.id === qId);
      const points = (q as any)?.points || 1;
      maxScore += points;
      
      const userAns = answers?.find(a => a.question_id === qId);
      const correctOpt = options?.find(o => o.question_id === qId && o.is_correct);
      
      const tId = (q as any)?.topic_id;
      if (tId && !topicStats[tId]) topicStats[tId] = { correct: 0, total: 0 };
      if (tId && topicStats[tId]) topicStats[tId].total += 1;

      if (!userAns?.selected_option_id) {
        unansweredCount++;
      } else if (userAns.selected_option_id === correctOpt?.id) {
        correctCount++;
        score += points;
        if (tId && topicStats[tId]) topicStats[tId].correct += 1;
      } else {
        wrongCount++;
        if (negativeMarking) score -= (points / 3);
        
        // Log mistake
        await supabaseAdmin.from("mistake_notebook").upsert({
          user_id: userId,
          question_id: qId,
          last_attempt_at: new Date().toISOString(),
        } as any, { onConflict: 'user_id,question_id' });
      }
    }

    // 3. Update Mastery
    for (const [tId, stats] of Object.entries(topicStats)) {
      const performance = (stats.correct / stats.total) * 100;
      const { data: current } = await supabaseAdmin
        .from("topic_mastery")
        .select("mastery_score")
        .eq("user_id", userId)
        .eq("topic_id", tId)
        .maybeSingle();
      
      const currentScore = (current as any)?.mastery_score || 50;
      // Simple moving average or weighted update
      const newScore = Math.min(100, Math.max(0, (currentScore * 0.7) + (performance * 0.3)));
      
      await supabaseAdmin.from("topic_mastery").upsert({
        user_id: userId,
        topic_id: tId,
        mastery_score: newScore,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'user_id,topic_id' });
    }

    // 4. Update attempt
    const now = new Date();
    const startTime = new Date(attempt?.started_at || new Date());
    const timeSpent = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    const { data: updatedAttempt, error: updateError } = await supabaseAdmin
      .from("exam_attempts")
      .update({
        score: Math.max(0, score),
        max_score: maxScore,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        status: 'completed',
        submitted_at: now.toISOString(),
        time_spent_seconds: timeSpent,
      } as any)
      .eq("id", data.attemptId)
      .select()
      .single();

    if (updateError || !updatedAttempt) throw new Error("Grading failed");

    return updatedAttempt;
  });
