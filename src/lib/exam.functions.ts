import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const submitSchema = z.object({
  examId: z.string().uuid(),
  timeSpentSeconds: z.number().int().min(0).max(60 * 60 * 12),
  answers: z
    .array(z.object({ questionId: z.string().uuid(), optionId: z.string().uuid().nullable() }))
    .max(200),
});

export type ExamResult = {
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  perQuestion: { questionId: string; correctOptionId: string | null; isCorrect: boolean }[];
};

/**
 * Grades an exam server-side so correct answers are never shipped to the browser.
 * Reads answer keys with elevated access, but only ever returns grading output.
 */
export const submitExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data, context }): Promise<ExamResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const questionIds = data.answers.map((a) => a.questionId);
    const [{ data: questions }, { data: options }] = await Promise.all([
      supabaseAdmin.from("questions").select("id, points, topic_id").in("id", questionIds),
      supabaseAdmin.from("question_options").select("id, question_id, is_correct").in("question_id", questionIds),
    ]);

    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const perQuestion: ExamResult["perQuestion"] = [];

    const incorrectTopicIds: string[] = [];

    for (const answer of data.answers) {
      const question = (questions ?? []).find((q) => q.id === answer.questionId);
      const points = (question as any)?.points ?? 1;
      maxScore += points;
      const correct = (options ?? []).find((o) => o.question_id === answer.questionId && o.is_correct);
      const isCorrect = Boolean(answer.optionId && correct && answer.optionId === correct.id);
      
      if (!answer.optionId) unansweredCount += 1;
      else if (isCorrect) {
        correctCount += 1;
        score += points;
      } else {
        wrongCount += 1;
        if (userId && answer.questionId) {
          await supabaseAdmin.from("mistake_notebook").upsert({
            user_id: userId,
            question_id: answer.questionId,
          } as any, { onConflict: "user_id,question_id" });

          if ((question as any)?.topic_id) {
            incorrectTopicIds.push((question as any).topic_id);
          }
        }
      }
      perQuestion.push({ questionId: answer.questionId, correctOptionId: correct?.id ?? null, isCorrect });
    }

    if (userId) {
      await supabaseAdmin.from("exam_attempts").insert({
        user_id: userId,
        exam_id: data.examId,
        score,
        max_score: maxScore,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        time_spent_seconds: data.timeSpentSeconds,
      } as any);

      if (incorrectTopicIds.length > 0) {
        for (const tid of [...new Set(incorrectTopicIds)]) {
          const { data: currentMastery } = await supabaseAdmin
            .from("topic_mastery")
            .select("mastery_score")
            .eq("user_id", userId)
            .eq("topic_id", tid)
            .maybeSingle();
          
          const newScore = Math.max(0, ((currentMastery as any)?.mastery_score ?? 50) - 5);
          await supabaseAdmin.from("topic_mastery").upsert({
            user_id: userId,
            topic_id: tid,
            mastery_score: newScore,
          } as any, { onConflict: "user_id,topic_id" });
        }
      }
    }

    return { score, maxScore, correctCount, wrongCount, unansweredCount, perQuestion };
  });
