import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ROLE_FA } from "./fa";

/**
 * INSTRUCTOR SECURITY MIDDLEWARE
 * Verifies if the user is an instructor
 */
const requireInstructor = async (ctx: any) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const userId = ctx.userId;
  
  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "instructor")
    .maybeSingle();

  if (!roleData) {
    throw new Error("شما دسترسی به این بخش را ندارید.");
  }
};

/**
 * OWNERSHIP CHECK HELPER
 * Verifies if an instructor is assigned to a specific course
 */
async function verifyCourseAssignment(userId: string, courseId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: assignment } = await (supabaseAdmin.from("instructor_courses") as any)
    .select("id")
    .eq("instructor_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  
  if (!assignment) {
    throw new Error("شما به این دوره دسترسی ندارید.");
  }
}

// --- DASHBOARD & STATS ---

export const instructorGetStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);

    // Get assigned course IDs
    const { data: assignments } = await (supabaseAdmin.from("instructor_courses") as any)
      .select("course_id")
      .eq("instructor_id", userId);
    
    const courseIds = assignments?.map((a: any) => a.course_id) || [];
    
    if (courseIds.length === 0) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalLessons: 0,
        totalQuestions: 0,
        totalExams: 0,
        recentActivity: []
      };
    }

    const [
      { count: coursesCount },
      { count: studentsCount },
      { count: lessonsCount },
      { count: questionsCount },
      { count: examsCount }
    ] = await Promise.all([
      supabaseAdmin.from("courses").select("*", { count: 'exact', head: true }).in("id", courseIds),
      supabaseAdmin.from("enrollments").select("*", { count: 'exact', head: true }).in("course_id", courseIds),
      supabaseAdmin.from("lessons").select("*", { count: 'exact', head: true }).in("course_id", courseIds),
      (supabaseAdmin.from("questions") as any).select("*", { count: 'exact', head: true }).in("course_id", courseIds),
      (supabaseAdmin.from("exams") as any).select("*", { count: 'exact', head: true }).in("course_id", courseIds),
    ]);

    return {
      totalCourses: coursesCount || 0,
      totalStudents: studentsCount || 0,
      totalLessons: lessonsCount || 0,
      totalQuestions: questionsCount || 0,
      totalExams: examsCount || 0,
      recentActivity: [] // Could be populated with recent lesson views or exam attempts
    };
  });

// --- COURSES ---

export const instructorGetCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);

    const { data: assignments } = await (supabaseAdmin.from("instructor_courses") as any)
      .select("course_id")
      .eq("instructor_id", userId);
    
    const courseIds = assignments?.map((a: any) => a.course_id) || [];
    if (courseIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .in("id", courseIds)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

// --- LESSONS ---

export const instructorGetLessons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.courseId);

    const { data: lessons, error } = await supabaseAdmin
      .from("lessons")
      .select("*")
      .eq("course_id", data.courseId)
      .order("sort_order");
    
    if (error) throw error;
    return lessons;
  });

export const instructorUpsertLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.course_id);

    const { data: res, error } = await supabaseAdmin.from("lessons").upsert(data).select().single();
    if (error) throw error;
    return res;
  });

// --- QUESTIONS ---

export const instructorGetQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.courseId);

    const { data: questions, error } = await (supabaseAdmin.from("questions") as any)
      .select("*, question_options(*)")
      .eq("course_id", data.courseId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return questions;
  });

export const instructorUpsertQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { question: any; options: any[] }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    
    if (data.question.course_id) {
      await verifyCourseAssignment(userId, data.question.course_id);
    } else if (data.question.id) {
      // If editing existing, check ownership
      const { data: existing } = await (supabaseAdmin.from("questions") as any)
        .select("author_id, course_id")
        .eq("id", data.question.id)
        .single();
      
      if (existing?.author_id !== userId && existing?.course_id) {
        await verifyCourseAssignment(userId, existing.course_id);
      }
    }

    const { data: q, error } = await (supabaseAdmin.from("questions") as any)
      .upsert({ ...data.question, author_id: userId })
      .select()
      .single();
    if (error) throw error;
    
    if (data.options && data.options.length > 0) {
      const optionsToInsert = data.options.map(o => ({ ...o, question_id: q.id }));
      await supabaseAdmin.from("question_options").delete().eq("question_id", q.id);
      await supabaseAdmin.from("question_options").insert(optionsToInsert);
    }
    
    return q;
  });

// --- EXAMS ---

export const instructorGetExams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.courseId);

    const { data: exams, error } = await (supabaseAdmin.from("exams") as any)
      .select("*")
      .eq("course_id", data.courseId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return exams;
  });

export const instructorUpsertExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { exam: any; questionIds: string[] }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.exam.course_id);

    const { data: ex, error } = await (supabaseAdmin.from("exams") as any).upsert({
      ...data.exam,
      instructor_id: userId,
      question_count: data.questionIds.length,
      updated_at: new Date().toISOString(),
    }).select().single();
    
    if (error) throw error;
    
    await supabaseAdmin.from("exam_questions").delete().eq("exam_id", ex.id);
    if (data.questionIds.length > 0) {
      await supabaseAdmin.from("exam_questions").insert(
        data.questionIds.map((qid, idx) => ({ 
          exam_id: ex.id, 
          question_id: qid, 
          sort_order: idx + 1 
        }))
      );
    }
    
    return ex;
  });

// --- STUDENTS & ANALYTICS ---

export const instructorGetStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.courseId);

    const { data: enrollments, error } = await supabaseAdmin
      .from("enrollments")
      .select("*, profiles(*)")
      .eq("course_id", data.courseId);
    
    if (error) throw error;
    return enrollments;
  });

export const instructorGetStudentPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { studentId: string; courseId: string }) => 
    z.object({ studentId: z.string().uuid(), courseId: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    await requireInstructor(context);
    await verifyCourseAssignment(userId, data.courseId);

    // Get student's attempts for exams in this course
    const { data: exams } = await (supabaseAdmin.from("exams") as any).select("id").eq("course_id", data.courseId);
    const examIds = exams?.map((e: any) => e.id) || [];

    const { data: attempts } = await supabaseAdmin
      .from("exam_attempts")
      .select("*, exams(title)")
      .eq("user_id", data.studentId)
      .in("exam_id", examIds)
      .order("submitted_at", { ascending: false });

    return { attempts };
  });

// --- ADMIN INSTRUMENTATION ---

export const adminAssignInstructorToCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { instructorId: string; courseId: string }) => 
    z.object({ instructorId: z.string().uuid(), courseId: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Verify admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["admin", "super_admin"])
      .maybeSingle();
    
    if (!roleData) throw new Error("Unauthorized");

    const { data: res, error } = await (supabaseAdmin.from("instructor_courses") as any).insert({
      instructor_id: data.instructorId,
      course_id: data.courseId,
      assigned_by: context.userId
    }).select().single();

    if (error) throw error;
    return res;
  });

export const adminGetCourseInstructors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assignments, error } = await (supabaseAdmin.from("instructor_courses") as any)
      .select("*, profiles!instructor_id(*)")
      .eq("course_id", data.courseId);
    
    if (error) throw error;
    return assignments;
  });
