import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const adminUpdateChapterOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; sort_order: number }[]) => data)
  .handler(async ({ data }) => {
    for (const item of data) {
      await supabase.from("chapters").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    return { success: true };
  });

export const adminUpdateTopicOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; sort_order: number }[]) => data)
  .handler(async ({ data }) => {
    for (const item of data) {
      await supabase.from("topics").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    return { success: true };
  });

export const adminDeleteChapter = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("chapters").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const adminDeleteTopic = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("topics").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const adminDuplicateLesson = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { data: original } = await supabase.from("lessons").select("*").eq("id", data.id).single();
    if (!original) throw new Error("Lesson not found");
    const { id, created_at, updated_at, ...rest } = original;
    const { data: res, error } = await supabase.from("lessons").insert([{ ...rest, title: `${rest.title} (کپی)`, slug: `${rest.slug}-copy` }]).select().single();
    if (error) throw error;
    return res;
  });
