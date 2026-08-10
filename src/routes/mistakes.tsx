import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
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

  const { data: mistakes, isLoading, refetch } = useQuery({
    queryKey: ["mistakes", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("mistake_notebook")
        .select("*, questions(*, topics(*), question_options(*))")
        .eq("user_id", user!.id)
        .eq("is_resolved", false)
        .order("last_attempt_at", { ascending: false });
      return data ?? [];
    },
  });

  const resolveMistake = async (id: string) => {
    const { error } = await supabase
      .from("mistake_notebook")
      .update({ is_resolved: true })
      .eq("id", id);
    
    if (!error) {
      toast.success("سؤال به عنوان یادگرفته شده علامت‌گذاری شد.");
      refetch();
    }
  };

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
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-destructive px-2 py-0.5 rounded bg-destructive/10">
                        {toFaDigits(m.attempts_count)} بار خطا
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="size-3" /> {m.questions?.topics?.title}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-8 mb-4">{m.questions?.body}</h3>
                    
                    <div className="space-y-2 mb-6">
                      {m.questions?.question_options?.map((o: any) => (
                        <div 
                          key={o.id} 
                          className={`p-3 rounded-lg text-sm ${o.is_correct ? 'bg-success/10 border border-success/20 font-bold' : 'bg-secondary'}`}
                        >
                          {o.body}
                          {o.is_correct && <span className="ms-2 text-xs text-success">(پاسخ صحیح)</span>}
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-sm leading-8 text-foreground">
                      <div className="flex items-center gap-2 mb-2 text-primary font-bold">
                        <CheckCircle className="size-4" /> پاسخ تشریحی و نکته
                      </div>
                      <p className="mb-2">{m.questions?.explanation}</p>
                      {m.questions?.explanation_tips && (
                        <div className="mt-2 pt-2 border-t border-primary/10 italic text-muted-foreground">
                          نکته: {m.questions?.explanation_tips}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button 
                      className="bg-success hover:bg-success/90 gap-2"
                      onClick={() => resolveMistake(m.id)}
                    >
                      <CheckCircle className="size-4" /> یاد گرفتم
                    </Button>
                    <Button variant="outline" size="sm">تمرین مجدد</Button>
                  </div>
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
