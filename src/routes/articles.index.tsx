import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { listArticles } from "@/lib/public.functions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { faDate, toFaDigits, faNumber } from "@/lib/fa";

export const Route = createFileRoute("/articles/")({
  loader: () => listArticles(),
  head: () => ({
    meta: [
      { title: "مقالات آموزش شیمی | دانشنامه ادیورَنک" },
      {
        name: "description",
        content: "مقالات آموزشی شیمی دهم تا کنکور: استوکیومتری، جدول تناوبی، اسید و باز، نکات تستی و روش مطالعه.",
      },
      { property: "og:title", content: "مقالات آموزش شیمی | دانشنامه ادیورَنک" },
      { property: "og:description", content: "دانشنامه شیمی ادیورَنک؛ آموزش مفهومی و نکات کاربردی." },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { articles, categories } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const featured = articles.find((a) => a.is_featured) ?? articles[0];
  const list = useMemo(
    () =>
      articles.filter((a) => {
        const matchQ = q.trim() === "" || `${a.title} ${a.excerpt ?? ""} ${a.tags.join(" ")}`.includes(q.trim());
        return matchQ && (!cat || a.category_id === cat);
      }),
    [articles, q, cat],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold">دانشنامه شیمی ادیورَنک</h1>
        <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
          مقالات آموزشی، نکات تستی و روش‌های مطالعه؛ نوشته شده برای دانش‌آموزان ایرانی.
        </p>

        {featured && (
          <Link
            to="/articles/$slug"
            params={{ slug: featured.slug }}
            className="card-surface mt-8 grid gap-6 overflow-hidden p-7 transition-shadow hover:shadow-[var(--shadow-elevated)] lg:grid-cols-[2fr_1fr]"
          >
            <div>
              <Badge variant="secondary">مقاله ویژه</Badge>
              <h2 className="mt-4 text-2xl font-extrabold leading-9">{featured.title}</h2>
              <p className="mt-3 text-sm leading-8 text-muted-foreground">{featured.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {featured.author_name} · {faDate(featured.published_at)} · {toFaDigits(featured.reading_minutes)} دقیقه
              </p>
            </div>
            <div className="hidden rounded-2xl bg-hero-gradient lg:block" aria-hidden />
          </Link>
        )}

        <div className="card-surface mt-8 flex flex-col gap-4 p-5">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی مقاله..." aria-label="جستجوی مقاله" className="pe-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>
              همه دسته‌ها
            </Button>
            {categories.map((c) => (
              <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>
                {c.title}
              </Button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{faNumber(list.length)} مقاله</p>

        {list.length === 0 ? (
          <div className="card-surface mt-6 p-12 text-center">
            <p className="font-bold">مقاله‌ای پیدا نشد.</p>
            <p className="mt-2 text-sm text-muted-foreground">عبارت دیگری را جستجو کنید.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <Link
                key={a.id}
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="card-surface group flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <h2 className="font-bold leading-7 group-hover:text-primary">{a.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{a.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {a.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {faDate(a.published_at)} · {toFaDigits(a.reading_minutes)} دقیقه مطالعه
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
