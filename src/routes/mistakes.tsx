import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, CheckCircle, RefreshCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toFaDigits } from "@/lib/fa";

export const Route = createFileRoute("/mistakes")({
  ssr: false,
  component: MistakesPage,
});

function MistakesPage() {
  const { user } = useAuth();

  const { data: mistakes, isLoading } = useQuery({
    queryKey: ["mistakes", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("mistake_notebook")
        .select("*, questions(*, topics(*))")
        .eq("user_id", user!.id)
        .eq("is_resolved", false)
        .order("last_attempt_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <SiteHeader />
        <main className="mx-auto max-w-md py-32 text-center">
          <h1 className="text-2xl font-bold">برای دسترسی به دفترچه اشتباهات وارد شوید</h1>
          <Link to="/auth"><Button className="mt-6">ورود / ثبت‌نام</Button></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <AlertCircle className="size-8 text-destructive" />
              دفترچه اشتباهات من
            </h1>
            <p className="text-muted-foreground mt-2">سؤالاتی که در آزمون‌ها اشتباه پاسخ داده‌اید، اینجا جمع‌آوری می‌شوند تا دوباره آن‌ها را تمرین کنید.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCcw className="size-4" /> شروع تمرین اشتباهات
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => <div key={i} className="card-surface h-32 animate-pulse" />)}
          </div>
        ) : mistakes?.length === 0 ? (
          <div className="card-surface p-20 text-center">
            <CheckCircle className="size-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold">آفرین! سؤال اشتباهی ندارید.</h2>
            <p className="text-muted-foreground mt-2">با شرکت در آزمون‌های بیشتر، سطح خود را بسنجید.</p>
            <Link to="/exams"><Button className="mt-6">مشاهده آزمون‌ها</Button></Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {mistakes?.map((m: any) => (
              <div key={m.id} className="card-surface p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-destructive px-2 py-0.5 rounded bg-destructive/10">
                        {toFaDigits(m.attempts_count)} بار خطا
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="size-3" /> {m.questions?.topics?.title}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-8">{m.questions?.body}</h3>
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg text-sm italic leading-7 text-muted-foreground">
                      <span className="font-bold text-foreground">نکته آموزشی:</span> {m.questions?.explanation_tips || "نکته‌ای برای این سؤال ثبت نشده است."}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">حذف</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
