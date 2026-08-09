import { createServerFn } from "@tanstack/react-start";
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
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }): Promise<ExamResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const questionIds = data.answers.map((a) => a.questionId);
    const [{ data: questions }, { data: options }] = await Promise.all([
      supabaseAdmin.from("questions").select("id, points").in("id", questionIds),
      supabaseAdmin.from("question_options").select("id, question_id, is_correct").in("question_id", questionIds),
    ]);

    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const perQuestion: ExamResult["perQuestion"] = [];

    for (const answer of data.answers) {
      const question = (questions ?? []).find((q) => q.id === answer.questionId);
      const points = question?.points ?? 1;
      maxScore += points;
      const correct = (options ?? []).find((o) => o.question_id === answer.questionId && o.is_correct);
      const isCorrect = Boolean(answer.optionId && correct && answer.optionId === correct.id);
      if (!answer.optionId) unansweredCount += 1;
      else if (isCorrect) {
        correctCount += 1;
        score += points;
      } else wrongCount += 1;
      perQuestion.push({ questionId: answer.questionId, correctOptionId: correct?.id ?? null, isCorrect });
    }

    return { score, maxScore, correctCount, wrongCount, unansweredCount, perQuestion };
  });
