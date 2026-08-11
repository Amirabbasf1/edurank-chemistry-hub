import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const chatWithAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    message: z.string(),
    conversationId: z.string().uuid().optional(),
    context: z.object({
      courseId: z.string().optional(),
      lessonId: z.string().optional(),
      topicId: z.string().optional(),
    }).optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    
    let conversationId = data.conversationId;
    
    if (!conversationId) {
      const { data: conv, error } = await supabaseAdmin.from("ai_tutor_conversations").insert({
        user_id: userId,
        topic_id: data.context?.topicId || null,
        context_type: data.context?.lessonId ? 'lesson' : 'general',
        context_id: data.context?.lessonId || null,
      } as any).select('id').single();
      
      if (error) throw new Error("Failed to create conversation");
      conversationId = conv.id;
    }
    
    await supabaseAdmin.from("ai_tutor_messages").insert({
      conversation_id: conversationId!,
      role: 'user',
      content: data.message,
    } as any);
    
    // Implementation of AI logic with grounding
    const { getCurriculumContext } = await import("./ai-grounding.server");
    const curriculumContext = await getCurriculumContext(data.message);
    
    // In a real production scenario, we would send this context to a LLM (like GPT-4o) via AI Gateway.
    // For now, we simulate a curriculum-aware response.
    const msg = data.message.toLowerCase();
    let response = "من به عنوان دستیار شیمی ادیورَنک اینجا هستم تا به شما کمک کنم. ";
    
    if (curriculumContext.length > 50) {
      response += "بر اساس منابع درسی ما:\n" + curriculumContext.substring(0, 500);
    } else if (msg.includes("غلظت") || msg.includes("مول")) {
      response = "غلظت مولی (M) یکی از مهم‌ترین مفاهیم شیمی است. فرمول آن M = n / V است، که n تعداد مول حل‌شونده و V حجم محلول به لیتر است.";
    } else if (msg.includes("اسید") || msg.includes("ph")) {
      response = "pH مقیاسی برای سنجش میزان اسیدی یا بازی بودن یک محلول است. محلول‌های با pH کمتر از ۷ اسیدی و بیشتر از ۷ بازی هستند.";
    } else {
      response += "چه مبحثی از شیمی دهم، یازدهم یا دوازدهم مد نظر شماست؟";
    }
    
    const { data: savedMsg } = await supabaseAdmin.from("ai_tutor_messages").insert({
      conversation_id: conversationId!,
      role: 'assistant',
      content: response,
    } as any).select('*').single();
    
    return {
      message: savedMsg,
      conversationId,
    };
  });
