import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Trophy, Flame, ClipboardList, Zap, Bell, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { faNumber, faDate, ROLE_FA } from "@/lib/fa";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "پنل من | ادیورَنک" },
      { name: "description", content: "پیشرفت دوره‌ها، کارنامه آزمون‌ها و امتیاز شما در ادیورَنک." },
      { property: "og:title", content: "پنل من | ادیورَنک" },
      { property: "og:description", content: "پیشرفت یادگیری خود را دنبال کنید." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, roles, loading } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [profile, enrollments, attempts, mastery, mistakes, notifications, spaced] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("enrollments").select("*, courses(title, slug, thumbnail_url, lesson_count)").eq("user_id", user!.id),
        supabase.from("exam_attempts").select("*, exams(title, slug)").eq("user_id", user!.id).order("started_at", { ascending: false }).limit(5),
        supabase.from("topic_mastery").select("*, topics(title, id)").eq("user_id", user!.id).order("mastery_score", { ascending: false }).limit(5),
        supabase.from("mistake_notebook").select("*, questions(id, body, topics(title))").eq("user_id", user!.id).eq("is_resolved", false).limit(5),
        supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("spaced_reviews").select("*").eq("user_id", user!.id).lte("next_review_at", new Date().toISOString()),
      ]);
      return { 
        profile: profile.data, 
        enrollments: enrollments.data ?? [], 
        attempts: attempts.data ?? [],
        mastery: mastery.data ?? [],
        mistakes: mistakes.data ?? [],
        notifications: notifications.data ?? [],
        spacedReviews: spaced.data ?? []
      };
    },
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto grid max-w-md place-items-center px-4 py-32 text-center">
          <div>
            <h1 className="text-2xl font-extrabold">برای دیدن پنل خود وارد شوید</h1>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              پیشرفت دوره‌ها، کارنامه آزمون‌ها و یادداشت‌های شما اینجا نمایش داده می‌شود.
            </p>
            <Link to="/auth"><Button className="mt-6" size="lg">ورود / ثبت‌نام</Button></Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const stats = [
    { icon: BookOpen, label: "دوره‌های من", value: faNumber(data?.enrollments.length ?? 0) },
    { icon: ClipboardList, label: "آزمون‌های داده‌شده", value: faNumber(data?.attempts.length ?? 0) },
    { icon: Trophy, label: "امتیاز (XP)", value: faNumber(data?.profile?.xp ?? 0) },
    { icon: Flame, label: "روزهای پیاپی", value: faNumber(data?.profile?.current_streak ?? 0) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold">سلام {data?.profile?.full_name ?? "دانش‌آموز"} 👋</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          نقش شما: {roles.map((r) => ROLE_FA[r] ?? r).join("، ") || ROLE_FA["student"]}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card-surface p-6">
              <s.icon className="size-5 text-primary" />
              <p className="mt-4 text-2xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <BookOpen className="size-5 text-primary" /> دوره‌های من
              </h2>
              {data && data.enrollments.length === 0 ? (
                <div className="card-surface mt-4 p-10 text-center">
                  <p className="text-sm text-muted-foreground">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>
                  <Link to="/courses"><Button className="mt-4">مشاهده دوره‌ها</Button></Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(data?.enrollments ?? []).map((e: any) => (
                    <div key={e.id} className="card-surface p-6">
                      <h3 className="font-bold leading-7">{e.courses?.title}</h3>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress_percent}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{faNumber(e.progress_percent)}٪ تکمیل شده</p>
                      {e.courses?.slug && (
                        <Link to="/courses/$slug" params={{ slug: e.courses.slug }}>
                          <Button variant="outline" size="sm" className="mt-4 w-full">ادامه دوره</Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Sparkles className="size-5 text-accent" /> تسلط بر مباحث (Mastery)
              </h2>
              {data && data.mastery.length === 0 ? (
                <div className="card-surface mt-4 p-8 text-center text-sm text-muted-foreground">
                  بعد از شرکت در آزمون‌ها، میزان تسلط شما بر مباحث اینجا نمایش داده می‌شود.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {(data?.mastery ?? []).map((m: any) => (
                    <div key={m.id} className="card-surface flex items-center gap-4 p-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold">{m.topics?.title}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div 
                            className={`h-full rounded-full transition-all ${m.mastery_score > 80 ? 'bg-success' : m.mastery_score > 50 ? 'bg-primary' : 'bg-destructive'}`} 
                            style={{ width: `${m.mastery_score}%` }} 
                          />
                        </div>
                      </div>
                      <span className="text-lg font-black text-primary">{faNumber(Math.round(m.mastery_score))}٪</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" /> آخرین آزمون‌ها
              </h2>
              {data && data.attempts.length === 0 ? (
                <div className="card-surface mt-4 p-10 text-center">
                  <p className="text-sm text-muted-foreground">هنوز آزمونی نداده‌اید.</p>
                  <Link to="/exams"><Button className="mt-4">شرکت در آزمون</Button></Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {(data?.attempts ?? []).map((a: any) => (
                    <li key={a.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5 transition-hover hover:bg-secondary/30">
                      <span className="font-bold">{a.exams?.title}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-xs text-muted-foreground">{faDate(a.started_at)}</span>
                        <span className="font-extrabold text-primary">
                          {faNumber(a.score)} / {faNumber(a.max_score)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <section className="card-surface p-6 bg-primary/5 border-primary/20">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Zap className="size-4 text-primary" /> پیشنهاد هوشمند
              </h2>
              <p className="text-xs leading-6 text-muted-foreground">
                بر اساس عملکرد شما، پیشنهاد می‌کنیم فصل <span className="font-bold text-foreground">استوکیومتری</span> را مرور کنید.
              </p>
              <Link to="/courses">
                <Button size="sm" className="mt-4 w-full">شروع مرور</Button>
              </Link>
            </section>

            <section className="card-surface p-5">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="size-4 text-destructive" /> دفترچه اشتباهات
              </h2>
              {data && data.mistakes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">سؤال اشتباهی ندارید. عالیه!</p>
              ) : (
                <div className="space-y-3">
                  {(data?.mistakes ?? []).map((m: any) => (
                    <div key={m.id} className="text-xs border-r-2 border-destructive pr-3 py-1">
                      <p className="font-bold truncate">{m.questions?.body}</p>
                      <p className="text-muted-foreground mt-1">{m.questions?.topics?.title}</p>
                    </div>
                  ))}
                  <Link to="/mistakes">
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">مشاهده همه اشتباهات</Button>
                  </Link>
                </div>
              )}
            </section>

            <section className="card-surface p-5">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Bell className="size-4 text-primary" /> اعلان‌ها
              </h2>
              {data && data.notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">اعلان جدیدی ندارید.</p>
              ) : (
                <div className="space-y-4">
                  {(data?.notifications ?? []).map((n: any) => (
                    <div key={n.id} className={`text-xs p-2 rounded-lg ${n.is_read ? 'opacity-60' : 'bg-primary/5'}`}>
                      <p className="font-bold">{n.title}</p>
                      <p className="text-muted-foreground mt-1 leading-5">{n.body || n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
