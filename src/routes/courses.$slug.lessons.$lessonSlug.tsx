import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  PlayCircle,
  Lock,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { getLesson } from "@/lib/public.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { faDuration, faNumber } from "@/lib/fa";

export const Route = createFileRoute("/courses/$slug/lessons/$lessonSlug")({
  loader: async ({ params }) => {
    const data = await getLesson({ data: { courseSlug: params.slug, lessonSlug: params.lessonSlug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "درس یافت نشد | ادیورَنک" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.lesson.title} | ${loaderData.course.title}`;
    const description = loaderData.lesson.summary ?? loaderData.course.short_description ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LessonPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-bold">این درس پیدا نشد</h1>
        <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">بازگشت به دوره‌ها</Link>
      </div>
    </div>
  ),
});

function LessonPage() {
  const { course, lesson, chapters, lessons } = Route.useLoaderData();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const index = lessons.findIndex((l: any) => l.id === lesson.id);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  const { data: progressRows } = useQuery({
    queryKey: ["progress", course.id, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("lesson_progress").select("*").eq("course_id", course.id).eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: bookmark } = useQuery({
    queryKey: ["bookmark", lesson.id, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("bookmarks").select("id").eq("lesson_id", lesson.id).eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", lesson.id, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("*").eq("lesson_id", lesson.id).eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const completed = progressRows?.some((p) => p.lesson_id === lesson.id && p.is_completed) ?? false;
  const completedCount = progressRows?.filter((p) => p.is_completed).length ?? 0;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Keep the enrollment's "continue learning" pointer in sync.
  useEffect(() => {
    if (!user) return;
    void supabase
      .from("enrollments")
      .update({ last_lesson_id: lesson.id })
      .eq("user_id", user.id)
      .eq("course_id", course.id);
  }, [user, lesson.id, course.id]);

  const markComplete = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          course_id: course.id,
          is_completed: !completed,
          completed_at: completed ? null : new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );
      if (error) throw error;
      const total = lessons.length;
      const done = (progressRows?.filter((p) => p.is_completed).length ?? 0) + (completed ? -1 : 1);
      await supabase
        .from("enrollments")
        .update({ progress_percent: Math.round((done / total) * 100) })
        .eq("user_id", user.id)
        .eq("course_id", course.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["progress", course.id] });
      toast.success(completed ? "علامت تکمیل برداشته شد." : "درس تکمیل شد. آفرین!");
    },
    onError: (e: Error) =>
      toast.error(e.message === "auth" ? "برای ثبت پیشرفت وارد حساب شوید." : "ثبت پیشرفت انجام نشد."),
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      if (bookmark) {
        await supabase.from("bookmarks").delete().eq("id", bookmark.id);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, lesson_id: lesson.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmark", lesson.id] }),
    onError: () => toast.error("برای ذخیره درس وارد حساب شوید."),
  });

  const addNote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      const value = note.trim();
      if (!value) throw new Error("empty");
      if (value.length > 1000) throw new Error("long");
      const { error } = await supabase.from("notes").insert({ user_id: user.id, lesson_id: lesson.id, content: value });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      qc.invalidateQueries({ queryKey: ["notes", lesson.id] });
      toast.success("یادداشت ذخیره شد.");
    },
    onError: (e: Error) => {
      const msg =
        e.message === "empty" ? "متن یادداشت خالی است." : e.message === "long" ? "یادداشت باید کمتر از ۱۰۰۰ کاراکتر باشد." : "برای ثبت یادداشت وارد حساب شوید.";
      toast.error(msg);
    },
  });

  const curriculum = (
    <nav aria-label="سرفصل دوره" className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground">پیشرفت شما</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{faNumber(percent)}٪ تکمیل شده</p>
      </div>
      {chapters.map((ch: any) => (
        <div key={ch.id}>
          <p className="mb-2 text-xs font-bold text-muted-foreground">{ch.title}</p>
          <ul className="space-y-1">
            {lessons
              .filter((l: any) => l.chapter_id === ch.id)
              .map((l: any) => {
                const done = progressRows?.some((p: any) => p.lesson_id === l.id && p.is_completed);
                const active = l.id === lesson.id;
                return (
                  <li key={l.id}>
                    <Link
                      to="/courses/$slug/lessons/$lessonSlug"
                      params={{ slug: course.slug, lessonSlug: l.slug }}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active ? "bg-primary/10 font-bold text-primary" : "hover:bg-secondary"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" />
                      ) : l.is_free_preview ? (
                        <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1">{l.title}</span>
                      <span className="text-[11px] text-muted-foreground">{faDuration(l.duration_seconds)}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const locked = !lesson.is_free_preview && !user;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="card-surface hidden h-fit p-5 lg:sticky lg:top-24 lg:block">{curriculum}</aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <nav aria-label="مسیر صفحه" className="text-xs text-muted-foreground">
              <Link to="/courses" className="hover:text-primary">دوره‌ها</Link> ／{" "}
              <Link to="/courses/$slug" params={{ slug: course.slug }} className="hover:text-primary">{course.title}</Link>
            </nav>
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSidebarOpen((v) => !v)}>
              <Menu className="size-4" /> سرفصل
            </Button>
          </div>
          {sidebarOpen && <div className="card-surface mt-4 p-5 lg:hidden">{curriculum}</div>}

          <h1 className="mt-4 text-2xl font-extrabold leading-9">{lesson.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{lesson.summary}</p>

          <div className="card-surface mt-6 overflow-hidden">
            <div className="relative grid aspect-video place-items-center bg-hero-gradient text-primary-foreground">
              {locked ? (
                <div className="text-center">
                  <Lock className="mx-auto size-8" />
                  <p className="mt-3 text-sm">این درس برای دانش‌آموزان ثبت‌نام‌شده است.</p>
                  <Link to="/auth">
                    <Button variant="secondary" className="mt-4">ورود / ثبت‌نام</Button>
                  </Link>
                </div>
              ) : lesson.video_url ? (
                <video className="size-full" controls playsInline preload="metadata" src={lesson.video_url} />
              ) : (
                <div className="text-center">
                  <PlayCircle className="mx-auto size-10 opacity-90" />
                  <p className="mt-3 text-sm opacity-90">ویدیوی این درس به‌زودی منتشر می‌شود.</p>
                  <p className="mt-1 text-xs opacity-70">مدت تقریبی: {faDuration(lesson.duration_seconds)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={() => markComplete.mutate()} disabled={markComplete.isPending} variant={completed ? "secondary" : "default"}>
              <CheckCircle2 className="size-4" />
              {completed ? "تکمیل شده" : "علامت‌گذاری به عنوان تکمیل‌شده"}
            </Button>
            <Button variant="outline" onClick={() => toggleBookmark.mutate()}>
              {bookmark ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
              {bookmark ? "ذخیره شد" : "ذخیره درس"}
            </Button>
            {lesson.is_free_preview && <Badge variant="secondary">پیش‌نمایش رایگان</Badge>}
          </div>

          <article className="card-surface mt-8 p-6">
            <h2 className="text-lg font-extrabold">متن درس</h2>
            <p className="mt-4 whitespace-pre-line text-balance-fa text-muted-foreground">{lesson.content}</p>
          </article>

          <section className="card-surface mt-6 p-6">
            <h2 className="text-lg font-extrabold">یادداشت‌های من</h2>
            {user ? (
              <>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                  placeholder="نکته مهم این درس را بنویسید..."
                  className="mt-4"
                />
                <Button className="mt-3" size="sm" onClick={() => addNote.mutate()} disabled={addNote.isPending}>
                  ذخیره یادداشت
                </Button>
                <ul className="mt-5 space-y-3">
                  {(notes ?? []).map((n) => (
                    <li key={n.id} className="rounded-xl bg-secondary p-4 text-sm leading-7">{n.content}</li>
                  ))}
                  {notes && notes.length === 0 && (
                    <li className="text-sm text-muted-foreground">هنوز یادداشتی برای این درس ثبت نکرده‌اید.</li>
                  )}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">برای ثبت یادداشت وارد حساب کاربری خود شوید.</p>
            )}
          </section>

          <div className="mt-8 flex items-center justify-between gap-3">
            {prev ? (
              <Link to="/courses/$slug/lessons/$lessonSlug" params={{ slug: course.slug, lessonSlug: prev.slug }}>
                <Button variant="outline"><ChevronRight className="size-4" /> درس قبلی</Button>
              </Link>
            ) : <span />}
            {next ? (
              <Link to="/courses/$slug/lessons/$lessonSlug" params={{ slug: course.slug, lessonSlug: next.slug }}>
                <Button>درس بعدی <ChevronLeft className="size-4" /></Button>
              </Link>
            ) : <span />}
          </div>
        </div>
      </div>
    </div>
  );
}
