import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Trophy, Flame, ClipboardList } from "lucide-react";
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
      const [profile, enrollments, attempts] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("enrollments").select("*, courses(title, slug)").eq("user_id", user!.id),
        supabase.from("exam_attempts").select("*, exams(title, slug)").eq("user_id", user!.id).order("started_at", { ascending: false }).limit(10),
      ]);
      return { profile: profile.data, enrollments: enrollments.data ?? [], attempts: attempts.data ?? [] };
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

        <section className="mt-12">
          <h2 className="text-xl font-extrabold">دوره‌های من</h2>
          {data && data.enrollments.length === 0 ? (
            <div className="card-surface mt-4 p-10 text-center">
              <p className="text-sm text-muted-foreground">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>
              <Link to="/courses"><Button className="mt-4">مشاهده دوره‌ها</Button></Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(data?.enrollments ?? []).map((e) => (
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

        <section className="mt-12">
          <h2 className="text-xl font-extrabold">کارنامه آزمون‌ها</h2>
          {data && data.attempts.length === 0 ? (
            <div className="card-surface mt-4 p-10 text-center">
              <p className="text-sm text-muted-foreground">هنوز آزمونی نداده‌اید.</p>
              <Link to="/exams"><Button className="mt-4">شرکت در آزمون</Button></Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {(data?.attempts ?? []).map((a) => (
                <li key={a.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
                  <span className="font-bold">{a.exams?.title}</span>
                  <span className="text-sm text-muted-foreground">{faDate(a.started_at)}</span>
                  <span className="font-extrabold text-primary">
                    {faNumber(a.score)} / {faNumber(a.max_score)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
