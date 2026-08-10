import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Read-only server client used for SSR of public content (courses, lessons,
 * articles). It uses the publishable key, so RLS still applies as `anon`.
 */
function publicClient(): SupabaseClient<Database> {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [categories, featured, latest, articles, faqs, testimonials, counts] = await Promise.all([
    db.from("course_categories").select("*").order("sort_order"),
    db
      .from("courses")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("students_count", { ascending: false })
      .limit(4),
    db
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3),
    db
      .from("articles")
      .select("id,slug,title,excerpt,reading_minutes,published_at,author_name,tags")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    db.from("faqs").select("*").eq("is_published", true).order("sort_order"),
    db.from("testimonials").select("*").eq("is_published", true).order("sort_order"),
    Promise.all([
      db.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
      db.from("lessons").select("*", { count: "exact", head: true }),
      db.from("exams").select("*", { count: "exact", head: true }),
      db.from("questions").select("*", { count: "exact", head: true }),
    ]),
  ]);

  const students = (featured.data ?? []).reduce((sum, c) => sum + (c.students_count ?? 0), 0);

  return {
    categories: categories.data ?? [],
    featured: featured.data ?? [],
    latest: latest.data ?? [],
    articles: articles.data ?? [],
    faqs: faqs.data ?? [],
    testimonials: testimonials.data ?? [],
    stats: {
      students,
      courses: counts[0].count ?? 0,
      lessons: counts[1].count ?? 0,
      exams: counts[2].count ?? 0,
      questions: counts[3].count ?? 0,
    },
  };
});

export const listCourses = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [courses, categories] = await Promise.all([
    db.from("courses").select("*").eq("status", "published").order("students_count", { ascending: false }),
    db.from("course_categories").select("*").order("sort_order"),
  ]);
  return { courses: courses.data ?? [], categories: categories.data ?? [] };
});

export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string; staffMode?: boolean }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    let query = db.from("courses").select("*").eq("slug", data.slug);
    if (!data.staffMode) {
      query = query.eq("status", "published");
    }
    const { data: course } = await query.maybeSingle();
    if (!course) return null;
    const [chapters, lessons, reviews, related] = await Promise.all([
      db.from("chapters").select("*").eq("course_id", course.id).order("sort_order"),
      db.from("lessons").select("*").eq("course_id", course.id).order("sort_order"),
      db.from("reviews").select("*").eq("course_id", course.id).eq("is_approved", true),
      db
        .from("courses")
        .select("id,slug,title,short_description,grade,rating,students_count,price,discount_price")
        .eq("status", "published")
        .neq("id", course.id)
        .limit(3),
    ]);
    return {
      course,
      chapters: chapters.data ?? [],
      lessons: lessons.data ?? [],
      reviews: reviews.data ?? [],
      related: related.data ?? [],
    };
  });

export const getLesson = createServerFn({ method: "GET" })
  .inputValidator((data: { courseSlug: string; lessonSlug: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: course } = await db
      .from("courses")
      .select("*")
      .eq("slug", data.courseSlug)
      .eq("status", "published")
      .maybeSingle();
    if (!course) return null;
    const [lessonRes, chapters, lessons] = await Promise.all([
      db.from("lessons").select("*").eq("course_id", course.id).eq("slug", data.lessonSlug).maybeSingle(),
      db.from("chapters").select("*").eq("course_id", course.id).order("sort_order"),
      db.from("lessons").select("*").eq("course_id", course.id).order("sort_order"),
    ]);
    if (!lessonRes.data) return null;
    return {
      course,
      lesson: lessonRes.data,
      chapters: chapters.data ?? [],
      lessons: lessons.data ?? [],
    };
  });

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [articles, categories] = await Promise.all([
    db.from("articles").select("*").eq("is_published", true).order("published_at", { ascending: false }),
    db.from("article_categories").select("*").order("sort_order"),
  ]);
  return { articles: articles.data ?? [], categories: categories.data ?? [] };
});

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: article } = await db
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!article) return null;
    const [related, course, category] = await Promise.all([
      db
        .from("articles")
        .select("id,slug,title,excerpt,reading_minutes,published_at")
        .eq("is_published", true)
        .neq("id", article.id)
        .limit(3),
      article.related_course_id
        ? db.from("courses").select("id,slug,title,short_description,price,discount_price").eq("id", article.related_course_id).maybeSingle()
        : Promise.resolve({ data: null }),
      article.category_id
        ? db.from("article_categories").select("*").eq("id", article.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    return { article, related: related.data ?? [], course: course.data, category: category.data };
  });

export const listExams = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const { data } = await db.from("exams").select("*").eq("is_published", true).order("created_at");
  return data ?? [];
});

export const getExam = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: exam } = await db
      .from("exams")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!exam) return null;
    const { data: rows } = await db
      .from("exam_questions")
      .select("sort_order, questions(id, body, explanation, type, difficulty, points, question_options(id, body, sort_order))")
      .eq("exam_id", exam.id)
      .order("sort_order");
    const questions = (rows ?? [])
      .map((r) => r.questions)
      .filter(Boolean)
      .map((q) => ({
        ...q!,
        question_options: [...(q!.question_options ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      }));
    return { exam, questions };
  });

export const getPeriodicTable = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const { data } = await db.from("periodic_table").select("*").order("atomic_number");
  return data ?? [];
});

export const getTopicsMastery = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: mastery } = await db
      .from("topic_mastery")
      .select("*, topics(*)")
      .eq("user_id", data.userId);
    return mastery ?? [];
  });

export const getMistakeNotebook = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: mistakes } = await db
      .from("mistake_notebook")
      .select("*, questions(*, topics(*))")
      .eq("user_id", data.userId)
      .eq("is_resolved", false)
      .order("last_attempt_at", { ascending: false });
    return mistakes ?? [];
  });

export const getNotifications = createServerFn({ method: "GET" })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: notifications } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", data.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return notifications ?? [];
  });
