import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { listCourses } from "@/lib/public.functions";
import { CourseCard } from "@/components/edurank/course-card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { faNumber } from "@/lib/fa";

export const Route = createFileRoute("/courses/")({
  loader: () => listCourses(),
  head: () => ({
    meta: [
      { title: "دوره‌های آموزش شیمی | ادیورَنک" },
      {
        name: "description",
        content: "لیست کامل دوره‌های شیمی دهم، یازدهم، دوازدهم و کنکور همراه با ویدیو، تمرین و آزمون آنلاین.",
      },
      { property: "og:title", content: "دوره‌های آموزش شیمی | ادیورَنک" },
      { property: "og:description", content: "دوره‌های ویدیویی شیمی از پایه دهم تا کنکور." },
    ],
  }),
  component: CoursesPage,
});

const SORTS = [
  { key: "popular", label: "محبوب‌ترین" },
  { key: "newest", label: "جدیدترین" },
  { key: "rating", label: "بیشترین امتیاز" },
  { key: "cheap", label: "ارزان‌ترین" },
] as const;

function CoursesPage() {
  const { courses, categories } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("popular");

  const list = useMemo(() => {
    let out = courses.filter((c) => {
      const matchQ = q.trim() === "" || `${c.title} ${c.short_description ?? ""} ${c.tags.join(" ")}`.includes(q.trim());
      const matchCat = !cat || c.category_id === cat;
      return matchQ && matchCat;
    });
    out = [...out].sort((a, b) => {
      if (sort === "newest") return b.created_at.localeCompare(a.created_at);
      if (sort === "rating") return Number(b.rating) - Number(a.rating);
      if (sort === "cheap") return (a.discount_price ?? a.price) - (b.discount_price ?? b.price);
      return b.students_count - a.students_count;
    });
    return out;
  }, [courses, q, cat, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold">دوره‌های آموزش شیمی</h1>
        <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
          مسیر یادگیری خود را انتخاب کنید؛ هر دوره شامل ویدیو، جزوه، تمرین و آزمون است.
        </p>

        <div className="card-surface mt-8 flex flex-col gap-4 p-5">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی دوره..."
              aria-label="جستجوی دوره"
              className="pe-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>
              همه پایه‌ها
            </Button>
            {categories.map((c) => (
              <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>
                {c.title}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">مرتب‌سازی:</span>
            {SORTS.map((s) => (
              <Button key={s.key} size="sm" variant={sort === s.key ? "secondary" : "ghost"} onClick={() => setSort(s.key)}>
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{faNumber(list.length)} دوره یافت شد</p>

        {list.length === 0 ? (
          <div className="card-surface mt-6 p-12 text-center">
            <p className="font-bold">دوره‌ای با این فیلترها پیدا نشد.</p>
            <p className="mt-2 text-sm text-muted-foreground">فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
