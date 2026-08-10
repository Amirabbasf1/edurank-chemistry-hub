import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Timer, CheckCircle2, XCircle, Bookmark, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getExam } from "@/lib/public.functions";
import { submitExam, type ExamResult } from "@/lib/exam.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { faNumber, toFaDigits } from "@/lib/fa";

export const Route = createFileRoute("/exams/$slug")({
  loader: async ({ params }) => {
    const data = await getExam({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "آزمون یافت نشد | ادیورَنک" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.exam.title} | آزمون آنلاین ادیورَنک`;
    const description = loaderData.exam.description ?? "آزمون آنلاین شیمی با تصحیح آنی.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ExamPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-bold">این آزمون پیدا نشد</h1>
        <Link to="/exams" className="mt-4 inline-block text-primary hover:underline">بازگشت به آزمون‌ها</Link>
      </div>
    </div>
  ),
});

function ExamPage() {
  const { exam, questions } = Route.useLoaderData();
  const { user } = useAuth();
  const grade = useServerFn(submitExam);

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(exam.duration_minutes * 60);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [busy, setBusy] = useState(false);

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  async function finish() {
    if (busy || result) return;
    setBusy(true);
    try {
      const payload = {
        examId: exam.id,
        timeSpentSeconds: exam.duration_minutes * 60 - seconds,
        answers: questions.map((q: any) => ({ questionId: q.id, optionId: answers[q.id] ?? null })),
      };
      const res = await grade({ data: payload });
      setResult(res);
      // Backend handling is now inside submitExam server function.
      // We removed redundant client-side insert to exam_attempts.
    } catch {
      toast.error("ثبت آزمون انجام نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!started || result) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [started, result]);

  useEffect(() => {
    if (started && seconds === 0 && !result) void finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, started]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const q = questions[current];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <nav aria-label="مسیر صفحه" className="text-xs text-muted-foreground">
          <Link to="/exams" className="hover:text-primary">آزمون‌ها</Link> ／ <span>{exam.title}</span>
        </nav>
        <h1 className="mt-4 text-2xl font-extrabold">{exam.title}</h1>

        {!started && !result && (
          <div className="card-surface mt-8 p-7">
            <p className="leading-8 text-muted-foreground">{exam.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li>تعداد سؤال: {faNumber(questions.length)}</li>
              <li>مدت آزمون: {faNumber(exam.duration_minutes)} دقیقه</li>
              <li>پس از پایان، کارنامه و پاسخ تشریحی نمایش داده می‌شود.</li>
            </ul>
            {!user && (
              <p className="mt-4 text-sm text-warning">
                برای ذخیره کارنامه در پروفایل، ابتدا <Link to="/auth" className="underline">وارد شوید</Link>.
              </p>
            )}
            <Button className="mt-6" size="lg" onClick={() => setStarted(true)} disabled={questions.length === 0}>
              شروع آزمون
            </Button>
          </div>
        )}

        {started && !result && q && (
          <>
            <div className="card-surface mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-2 font-bold text-primary">
                  <Timer className="size-4" /> {toFaDigits(mm)}:{toFaDigits(ss)}
                </span>
                <span className="text-sm text-muted-foreground">
                  پاسخ‌داده: {faNumber(answeredCount)} از {faNumber(questions.length)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={flags[q.id] ? "destructive" : "outline"}
                  onClick={() => setFlags(f => ({ ...f, [q.id]: !f[q.id] }))}
                >
                  <Flag className={`size-4 ${flags[q.id] ? 'fill-current' : ''}`} />
                  {flags[q.id] ? "پرچم‌گذاری شده" : "شک دارم"}
                </Button>
                <Button 
                  size="sm" 
                  variant={bookmarks[q.id] ? "secondary" : "outline"}
                  onClick={() => setBookmarks(b => ({ ...b, [q.id]: !b[q.id] }))}
                >
                  <Bookmark className={`size-4 ${bookmarks[q.id] ? 'fill-current' : ''}`} />
                  نشان‌گذاری
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {questions.map((item: any, i: number) => (
                <button
                  key={item.id}
                  onClick={() => setCurrent(i)}
                  aria-label={`سؤال ${i + 1}`}
                  className={`relative size-10 rounded-xl text-xs font-bold transition-all ${
                    i === current
                      ? "ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground"
                      : answers[item.id]
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {toFaDigits(i + 1)}
                  {flags[item.id] && (
                    <span className="absolute -top-1 -end-1 size-3 rounded-full bg-destructive border-2 border-background" />
                  )}
                  {bookmarks[item.id] && (
                    <span className="absolute -bottom-1 -end-1 size-3 rounded-full bg-accent border-2 border-background" />
                  )}
                </button>
              ))}
            </div>

            <div className="card-surface mt-6 p-7">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">سؤال {toFaDigits(current + 1)}</p>
                {/* {q.source && (
                  <Badge variant="outline" className="text-[10px]">{q.source}</Badge>
                )} */}
              </div>
              <h2 className="mt-3 text-lg font-bold leading-9">{q.body}</h2>
              <ul className="mt-6 space-y-3">
                {q.question_options.map((o: any) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: a[q.id] === o.id ? null : o.id }))}
                      className={`w-full rounded-xl border p-4 text-start text-sm leading-7 transition-colors ${
                        answers[q.id] === o.id ? "border-primary bg-primary/10 font-bold" : "border-border hover:bg-secondary"
                      }`}
                    >
                      {o.body}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex items-center justify-between gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))} 
                  disabled={current === 0}
                  className="gap-2"
                >
                  <ChevronRight className="size-4" /> قبلی
                </Button>
                {current === questions.length - 1 ? (
                  <Button onClick={finish} disabled={busy} className="bg-success hover:bg-success/90">پایان آزمون</Button>
                ) : (
                  <Button 
                    onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                    className="gap-2"
                  >
                    بعدی <ChevronLeft className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="card-surface p-7 text-center">
              <p className="text-sm text-muted-foreground">نمره شما</p>
              <p className="mt-2 text-4xl font-extrabold text-primary">
                {toFaDigits(result.score)} / {toFaDigits(result.maxScore)}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-success/10 p-4 text-sm font-bold text-success">
                  صحیح: {toFaDigits(result.correctCount)}
                </div>
                <div className="rounded-xl bg-destructive/10 p-4 text-sm font-bold text-destructive">
                  غلط: {toFaDigits(result.wrongCount)}
                </div>
                <div className="rounded-xl bg-secondary p-4 text-sm font-bold text-muted-foreground">
                  بی‌پاسخ: {toFaDigits(result.unansweredCount)}
                </div>
              </div>
            </div>

            <h2 className="text-xl font-extrabold">پاسخ تشریحی</h2>
            {questions.map((item: any, i: number) => {
              const detail = result.perQuestion.find((p: any) => p.questionId === item.id);
              return (
                <div key={item.id} className="card-surface p-6">
                  <div className="flex items-start gap-2">
                    {detail?.isCorrect ? (
                      <CheckCircle2 className="mt-1 size-5 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-1 size-5 shrink-0 text-destructive" />
                    )}
                    <h3 className="font-bold leading-8">{toFaDigits(i + 1)}. {item.body}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {item.question_options.map((o: any) => {
                      const isKey = detail?.correctOptionId === o.id;
                      const chosen = answers[item.id] === o.id;
                      return (
                        <li
                          key={o.id}
                          className={`rounded-lg p-3 leading-7 ${
                            isKey ? "bg-success/10 font-bold text-success" : chosen ? "bg-destructive/10 text-destructive" : "bg-secondary"
                          }`}
                        >
                          {o.body}
                          {isKey && <Badge variant="secondary" className="ms-2">پاسخ صحیح</Badge>}
                        </li>
                      );
                    })}
                  </ul>
                  {item.explanation && (
                    <p className="mt-4 text-sm leading-8 text-muted-foreground">{item.explanation}</p>
                  )}
                </div>
              );
            })}
            <div className="flex gap-3">
              <Link to="/exams"><Button variant="outline">آزمون‌های دیگر</Button></Link>
              <Link to="/dashboard"><Button>مشاهده پیشرفت من</Button></Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
