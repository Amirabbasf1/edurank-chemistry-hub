import { createFileRoute, Link } from "@tanstack/react-router";
import { Timer, ListChecks } from "lucide-react";
import { listExams } from "@/lib/public.functions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { faNumber, DIFFICULTY_FA } from "@/lib/fa";

export const Route = createFileRoute("/exams/")({
  loader: () => listExams(),
  head: () => ({
    meta: [
      { title: "آزمون‌های آنلاین شیمی | ادیورَنک" },
      { name: "description", content: "آزمون‌های تستی شیمی با تصحیح آنی، تحلیل پاسخ و پاسخ تشریحی." },
      { property: "og:title", content: "آزمون‌های آنلاین شیمی | ادیورَنک" },
      { property: "og:description", content: "آزمون آنلاین شیمی با تصحیح آنی و پاسخ تشریحی." },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  const exams = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold">آزمون‌های آنلاین شیمی</h1>
        <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
          سطح خود را بسنجید: تصحیح آنی، کارنامه تحلیلی و پاسخ تشریحی هر سؤال.
        </p>

        {exams.length === 0 ? (
          <div className="card-surface mt-10 p-12 text-center">
            <p className="font-bold">هنوز آزمونی منتشر نشده است.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((e) => (
              <div key={e.id} className="card-surface flex flex-col p-6">
                <div className="flex flex-wrap gap-2">
                  {e.grade && <Badge variant="secondary">{e.grade}</Badge>}
                  <Badge variant="secondary">{DIFFICULTY_FA[e.difficulty] ?? e.difficulty}</Badge>
                </div>
                <h2 className="mt-4 font-bold leading-7">{e.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{e.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ListChecks className="size-3.5" /> {faNumber(e.question_count)} سؤال</span>
                  <span className="inline-flex items-center gap-1"><Timer className="size-3.5" /> {faNumber(e.duration_minutes)} دقیقه</span>
                </div>
                <Link to="/exams/$slug" params={{ slug: e.slug }} className="mt-5">
                  <Button className="w-full">شروع آزمون</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
