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
    
    const msg = data.message.toLowerCase();
    let response = "ببخشید، من هنوز در حال یادگیری مفاهیم پیشرفته شیمی هستم. اما می‌تونم در مورد مسائل پایه بهت کمک کنم.";
    
    if (msg.includes("غلظت") || msg.includes("مول")) {
      response = "غلظت مولی (M) یکی از مهم‌ترین مفاهیم شیمی است. فرمول آن M = n / V است، که n تعداد مول حل‌شونده و V حجم محلول به لیتر است.";
    } else if (msg.includes("اسید") || msg.includes("ph")) {
      response = "pH مقیاسی برای سنجش میزان اسیدی یا بازی بودن یک محلول است. محلول‌های با pH کمتر از ۷ اسیدی و بیشتر از ۷ بازی هستند.";
    } else if (msg.includes("سلام") || msg.includes("خوبی")) {
      response = "سلام! من عالی هستم و آماده‌ام تا بهت کمک کنم شیمی رو بهتر یاد بگیری. چه مبحثی رو امروز با هم بخونیم؟";
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
