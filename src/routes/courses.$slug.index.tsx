import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Users, Clock, BookOpen, PlayCircle, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getCourse } from "@/lib/public.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CourseCard } from "@/components/edurank/course-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faNumber, faPrice, faMinutes, faDuration, toFaDigits, DIFFICULTY_FA } from "@/lib/fa";

export const Route = createFileRoute("/courses/$slug/")({
  loader: async ({ params }) => {
    const data = await getCourse({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "دوره یافت نشد | ادیورَنک" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.course;
    const title = c.seo_title ?? `${c.title} | ادیورَنک`;
    const description = c.seo_description ?? c.short_description ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CoursePage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-bold">این دوره پیدا نشد</h1>
        <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">بازگشت به دوره‌ها</Link>
      </div>
    </div>
  ),
});

function LessonItem({ lesson: l, courseSlug }: { lesson: any; courseSlug: string }) {
  return (
    <li>
      <Link
        to="/courses/$slug/lessons/$lessonSlug"
        params={{ slug: courseSlug, lessonSlug: l.slug }}
        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-secondary transition-colors"
      >
        <span className="inline-flex items-center gap-2">
          {l.is_free_preview ? (
            <PlayCircle className="size-3.5 text-success" />
          ) : (
            <Lock className="size-3.5 text-muted-foreground" />
          )}
          {l.title}
        </span>
        <span className="text-[10px] text-muted-foreground">{faDuration(l.duration_seconds)}</span>
      </Link>
    </li>
  );
}

function CoursePage() {
  const { course, chapters, topics, subtopics, lessons, related } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", course.id, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", course.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const enroll = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ثبت‌نام شما در این دوره انجام شد.");
      qc.invalidateQueries({ queryKey: ["enrollment", course.id] });
    },
    onError: (e: Error) => {
      if (e.message === "auth") {
        toast.info("برای ثبت‌نام ابتدا وارد حساب خود شوید.");
        navigate({ to: "/auth" });
        return;
      }
      toast.error("ثبت‌نام انجام نشد. دوباره تلاش کنید.");
    },
  });

  const firstLesson = lessons[0];
  const price = course.discount_price ?? course.price;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-subtle-gradient">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr]">
            <div>
              <nav aria-label="مسیر صفحه" className="text-xs text-muted-foreground">
                <Link to="/" className="hover:text-primary">خانه</Link> ／{" "}
                <Link to="/courses" className="hover:text-primary">دوره‌ها</Link> ／ <span>{course.title}</span>
              </nav>
              <h1 className="mt-4 text-3xl font-extrabold leading-[1.5]">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-balance-fa text-muted-foreground">{course.short_description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 text-warning" /> {toFaDigits(Number(course.rating).toFixed(1))}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" /> {faNumber(course.students_count)} دانش‌آموز
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-4" /> {faNumber(lessons.length)} درس
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {faMinutes(course.duration_minutes)}
                </span>
                <Badge variant="secondary">{DIFFICULTY_FA[course.difficulty]}</Badge>
                <span>مدرس: {course.instructor_name}</span>
              </div>
            </div>

            <aside className="card-surface h-fit p-6 lg:sticky lg:top-24">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-primary">{faPrice(price)}</span>
                {course.discount_price ? (
                  <span className="text-sm text-muted-foreground line-through">{faPrice(course.price)}</span>
                ) : null}
              </div>
              {enrollment ? (
                <>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="size-4" /> شما در این دوره ثبت‌نام کرده‌اید
                  </p>
                  {firstLesson && (
                    <Link
                      to="/courses/$slug/lessons/$lessonSlug"
                      params={{ slug: course.slug, lessonSlug: (enrollment.last_lesson_id && lessons.find((l: any) => l.id === enrollment.last_lesson_id)?.slug) || firstLesson.slug }}
                    >
                      <Button className="mt-4 w-full" size="lg">ادامه یادگیری</Button>
                    </Link>
                  )}
                </>
              ) : (
                <Button className="mt-5 w-full" size="lg" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
                  {enroll.isPending ? "در حال ثبت‌نام..." : "ثبت‌نام در دوره"}
                </Button>
              )}
              {firstLesson && (
                <Link to="/courses/$slug/lessons/$lessonSlug" params={{ slug: course.slug, lessonSlug: firstLesson.slug }}>
                  <Button variant="outline" className="mt-3 w-full">مشاهده درس پیش‌نمایش</Button>
                </Link>
              )}
              <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
                <li>دسترسی دائمی به محتوای دوره</li>
                <li>آزمون و تمرین پس از هر فصل</li>
                <li>گواهی پایان دوره</li>
              </ul>
            </aside>
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-extrabold">درباره دوره</h2>
              <p className="mt-4 text-balance-fa text-muted-foreground">{course.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold">در این دوره یاد می‌گیرید</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.objectives.map((o: string) => (
                  <li key={o} className="card-surface flex items-start gap-2 p-4 text-sm leading-7">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" /> {o}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-extrabold">پیش‌نیازها</h2>
              <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-8 text-muted-foreground">
                {course.requirements.map((r: string) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-extrabold">سرفصل‌های دوره</h2>
              <Accordion type="multiple" className="card-surface mt-4 px-5">
                {chapters.map((ch: any) => {
                  const chTopics = (topics || []).filter((t: any) => t.chapter_id === ch.id);
                  const chLessons = lessons.filter((l: any) => l.chapter_id === ch.id && !l.topic_id);
                  
                  return (
                    <AccordionItem key={ch.id} value={ch.id}>
                      <AccordionTrigger className="text-start text-sm font-bold">
                        {ch.title}
                        <span className="ms-2 text-xs font-normal text-muted-foreground">
                          ({faNumber(lessons.filter((l: any) => l.chapter_id === ch.id).length)} درس)
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        {/* Lessons directly under Chapter */}
                        {chLessons.length > 0 && (
                          <ul className="space-y-1">
                            {chLessons.map((l: any) => (
                              <LessonItem key={l.id} lesson={l} courseSlug={course.slug} />
                            ))}
                          </ul>
                        )}

                        {/* Topics under Chapter */}
                        {chTopics.map((topic: any) => {
                          const topicSubs = (subtopics || []).filter((s: any) => s.topic_id === topic.id);
                          const topicLessons = lessons.filter((l: any) => l.topic_id === topic.id && !l.subtopic_id);
                          
                          return (
                            <div key={topic.id} className="mr-2 border-r pr-4 py-2">
                              <h4 className="text-xs font-black text-primary mb-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {topic.title}
                              </h4>
                              
                              {/* Lessons directly under Topic */}
                              {topicLessons.length > 0 && (
                                <ul className="space-y-1 mb-3">
                                  {topicLessons.map((l: any) => (
                                    <LessonItem key={l.id} lesson={l} courseSlug={course.slug} />
                                  ))}
                                </ul>
                              )}

                              {/* Subtopics under Topic */}
                              {topicSubs.map((sub: any) => {
                                const subLessons = lessons.filter((l: any) => l.subtopic_id === sub.id);
                                if (subLessons.length === 0) return null;
                                return (
                                  <div key={sub.id} className="mr-4 border-r pr-3 mb-2">
                                    <h5 className="text-[11px] font-bold text-muted-foreground mb-1">{sub.title}</h5>
                                    <ul className="space-y-1">
                                      {subLessons.map((l: any) => (
                                        <LessonItem key={l.id} lesson={l} courseSlug={course.slug} />
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="card-surface p-6">
              <h2 className="font-bold">مدرس دوره</h2>
              <p className="mt-3 text-sm text-muted-foreground">{course.instructor_name}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                مدرس شیمی با سال‌ها تجربه آموزش مفهومی و آماده‌سازی دانش‌آموزان برای امتحان نهایی و کنکور.
              </p>
            </div>
            <div>
              <h2 className="mb-4 font-bold">دوره‌های مرتبط</h2>
              <div className="grid gap-4">
                {related.map((r: any) => (
                  <CourseCard key={r.id} course={{ ...r, difficulty: null, duration_minutes: null, lesson_count: null }} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
