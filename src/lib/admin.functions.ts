import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// --- UTILS ---
const logAudit = async (userId: string, action: string, type: string, id: string, prev?: any, next?: any) => {
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    target_type: type,
    target_id: id,
    previous_values: prev,
    new_values: next,
  });
};

// --- USERS & ROLES ---
export const adminGetUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, user_roles(role)");
    if (error) throw error;
    return data;
  });

export const adminUpdateUserRole = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; roles: string[] }) => data)
  .handler(async ({ data }) => {
    await supabase.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabase.from("user_roles").insert(
      data.roles.map(r => ({ user_id: data.userId, role: r as any }))
    );
    if (error) throw error;
    return { success: true };
  });

// --- COURSES ---
export const adminGetCourses = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminCreateCourse = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: course, error } = await supabase
      .from("courses")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return course;
  });

export const adminUpdateCourse = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; updates: any }) => data)
  .handler(async ({ data }) => {
    const { data: course, error } = await supabase
      .from("courses")
      .update(data.updates)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    if (!course) throw new Error("Course not found");
    return course;
  });

// --- CURRICULUM (Chapters, Topics, Subtopics) ---
export const adminGetCurriculum = createServerFn({ method: "GET" })
  .inputValidator((data: { courseId: string }) => data)
  .handler(async ({ data }) => {
    const [chapters, topics, subtopics] = await Promise.all([
      supabase.from("chapters").select("*").eq("course_id", data.courseId).order("sort_order"),
      supabase.from("topics").select("*").order("sort_order"),
      supabase.from("subtopics").select("*").order("sort_order"),
    ]);
    return {
      chapters: chapters.data ?? [],
      topics: topics.data ?? [],
      subtopics: subtopics.data ?? [],
    };
  });

export const adminUpsertChapter = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("chapters").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

export const adminUpsertTopic = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("topics").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

export const adminUpsertSubtopic = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("subtopics").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

// --- LESSONS ---
export const adminGetLessons = createServerFn({ method: "GET" })
  .inputValidator((data: { courseId?: string; chapterId?: string; topicId?: string; subtopicId?: string }) => data)
  .handler(async ({ data }) => {
    let query = supabase.from("lessons").select("*").order("sort_order");
    if (data.courseId) query = query.eq("course_id", data.courseId);
    if (data.chapterId) query = query.eq("chapter_id", data.chapterId);
    if (data.topicId) query = query.eq("topic_id", data.topicId);
    if (data.subtopicId) query = query.eq("subtopic_id", data.subtopicId);
    
    const { data: lessons, error } = await query;
    if (error) throw error;
    return lessons;
  });

export const adminDeleteSubtopic = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("subtopics").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const adminUpsertLesson = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("lessons").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

export const adminDeleteLesson = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("lessons").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

// --- QUESTIONS ---
export const adminGetQuestions = createServerFn({ method: "GET" })
  .inputValidator((data: { 
    q?: string; 
    grade?: string; 
    difficulty?: string; 
    type?: string; 
    chapterId?: string; 
    topicId?: string; 
    subtopicId?: string;
    courseId?: string;
    conceptType?: string;
    status?: string;
    source?: string;
    page?: number;
    pageSize?: number;
  }) => data)
  .handler(async ({ data }) => {
    const pageSize = data.pageSize || 20;
    const page = data.page || 0;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("questions")
      .select("*, question_options(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (data.q) query = query.ilike("body", `%${data.q}%`);
    if (data.grade) query = query.eq("grade", data.grade);
    if (data.difficulty) query = query.eq("difficulty", data.difficulty as any);
    if (data.type) query = query.eq("type", data.type as any);
    if (data.chapterId) query = query.eq("chapter_id", data.chapterId);
    if (data.topicId) query = query.eq("topic_id", data.topicId);
    if (data.subtopicId) query = query.eq("subtopic_id", data.subtopicId);
    if (data.courseId) query = query.eq("course_id", data.courseId);
    if (data.conceptType) query = query.eq("concept_type", data.conceptType as any);
    if (data.status) query = query.eq("status", data.status as any);
    if (data.source) query = query.ilike("source", `%${data.source}%`);

    const { data: questions, error, count } = await query.range(from, to);
    if (error) throw error;
    return { questions, count };
  });

export const adminUpsertQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: { question: any; options: any[] }) => data)
  .handler(async ({ data }) => {
    // Validation
    if (!data.question.body) throw new Error("متن سوال الزامی است.");
    if (data.question.type === 'multiple_choice' && data.options.length < 2) {
      throw new Error("برای سوالات چهارگزینه‌ای حداقل ۲ گزینه نیاز است.");
    }
    
    const { data: q, error } = await supabase.from("questions").upsert(data.question).select().single();
    if (error) throw error;
    
    if (data.options && data.options.length > 0) {
      // Ensure all options have the correct question_id
      const optionsToInsert = data.options.map(o => {
        const { id, ...rest } = o; // Strip ID if it's new
        return { ...rest, question_id: q.id };
      });
      
      await supabase.from("question_options").delete().eq("question_id", q.id);
      const { error: optionsError } = await supabase.from("question_options").insert(optionsToInsert);
      if (optionsError) throw optionsError;
    }
    
    return q;
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("questions").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const adminBulkUpdateQuestionStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { ids: string[]; status: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("questions")
      .update({ status: data.status as any })
      .in("id", data.ids);
    if (error) throw error;
    return { success: true };
  });

// --- EXAMS ---
export const adminGetExams = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase.from("exams").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminUpsertExam = createServerFn({ method: "POST" })
  .inputValidator((data: { exam: any; questionIds: string[] }) => data)
  .handler(async ({ data }) => {
    const { data: ex, error } = await supabase.from("exams").upsert({
      ...data.exam,
      question_count: data.questionIds.length,
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    
    await supabase.from("exam_questions").delete().eq("exam_id", ex.id);
    if (data.questionIds.length > 0) {
      await supabase.from("exam_questions").insert(
        data.questionIds.map((qid, idx) => ({ exam_id: ex.id, question_id: qid, sort_order: idx }))
      );
    }
    
    return ex;
  });

export const adminDeleteExam = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("exams").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const adminSmartGenerateQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: { 
    count: number; 
    courseId?: string; 
    chapterId?: string; 
    topicId?: string; 
    difficulty?: string;
    conceptType?: string;
  }) => data)
  .handler(async ({ data }) => {
    let query = supabase.from("questions").select("id");
    if (data.courseId) query = query.eq("course_id", data.courseId);
    if (data.chapterId) query = query.eq("chapter_id", data.chapterId);
    if (data.topicId) query = query.eq("topic_id", data.topicId);
    if (data.difficulty) query = query.eq("difficulty", data.difficulty as any);
    if (data.conceptType) query = query.eq("concept_type", data.conceptType as any);
    
    const { data: ids, error } = await query.limit(500);
    if (error) throw error;
    if (!ids || ids.length < data.count) {
      throw new Error(`تعداد سوالات کافی یافت نشد (موجود: ${ids?.length || 0})`);
    }

    // Pick random questions
    const selected = ids.sort(() => Math.random() - 0.5).slice(0, data.count);
    return selected.map(q => q.id);
  });


// --- MEDIA LIBRARY ---
export const adminGetMedia = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminCheckFileUsage = createServerFn({ method: "POST" })
  .inputValidator((data: { fileUrl: string }) => data)
  .handler(async ({ data }) => {
    const { data: usage, error } = await supabase.rpc('check_file_usage', { file_url: data.fileUrl });
    if (error) throw error;
    return usage;
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { data: media } = await supabase.from("media_library").select("file_url").eq("id", data.id).single();
    if (media) {
      const { data: usage } = await supabase.rpc('check_file_usage', { file_url: media.file_url });
      if (usage && usage.length > 0) {
        throw new Error("این فایل در بخش‌های دیگر سیستم در حال استفاده است.");
      }
    }
    const { error } = await supabase.from("media_library").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const adminAddMediaRecord = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("media_library").insert([data]).select().single();
    if (error) throw error;
    return res;
  });

// --- ARTICLES ---
export const adminGetArticles = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminUpsertArticle = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("articles").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

// --- AUDIT LOGS ---
export const adminGetAuditLogs = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  });

// --- HOMEPAGE ---
export const adminGetHomepageSections = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  });

export const adminUpdateHomepageSection = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; updates: any }) => data)
  .handler(async ({ data }) => {
    const { data: section, error } = await supabase
      .from("homepage_sections")
      .update(data.updates)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return section;
  });

// --- PAGES ---
export const adminGetPages = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const adminUpsertPage = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase.from("pages").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

export const adminDeletePage = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { error } = await supabase.from("pages").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

// --- SITE SETTINGS ---
export const adminGetSiteSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    return data;
  });

export const adminUpdateSiteSetting = createServerFn({ method: "POST" })
  .inputValidator((data: { key: string; value: any; description?: string }) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase
      .from("site_settings")
      .upsert({ 
        key: data.key, 
        value: data.value, 
        description: data.description ?? null 
      })
      .select()
      .single();

    if (error) throw error;
    return res;
  });

// --- NAVIGATION ---
export const adminGetNavigationMenus = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase.from("navigation_menus").select("*");
    if (error) throw error;
    return data;
  });

export const adminUpdateNavigationMenu = createServerFn({ method: "POST" })
  .inputValidator((data: { location: string; items: any[]; name: string }) => data)
  .handler(async ({ data }) => {
    const { data: res, error } = await supabase
      .from("navigation_menus")
      .upsert({ location: data.location, items: data.items, name: data.name })
      .select()
      .single();
    if (error) throw error;
    return res;
  });

// --- ANALYTICS ---
export const adminGetSystemStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const [
      { count: students },
      { count: courses },
      { count: lessons },
      { count: questions },
      { count: exams },
      { count: attempts }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: 'exact', head: true }),
      supabase.from("courses").select("*", { count: 'exact', head: true }),
      supabase.from("lessons").select("*", { count: 'exact', head: true }),
      supabase.from("questions").select("*", { count: 'exact', head: true }),
      supabase.from("exams").select("*", { count: 'exact', head: true }),
      supabase.from("exam_attempts").select("*", { count: 'exact', head: true }),
    ]);

    return {
      totalStudents: students || 0,
      totalCourses: courses || 0,
      totalLessons: lessons || 0,
      totalQuestions: questions || 0,
      totalExams: exams || 0,
      totalAttempts: attempts || 0,
    };
  });

