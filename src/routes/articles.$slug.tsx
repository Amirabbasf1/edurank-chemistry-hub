import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticle } from "@/lib/public.functions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { faDate, toFaDigits, faPrice } from "@/lib/fa";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const data = await getArticle({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "مقاله یافت نشد | ادیورَنک" }, { name: "robots", content: "noindex" }] };
    const a = loaderData.article;
    const title = a.seo_title ?? `${a.title} | ادیورَنک`;
    const description = a.seo_description ?? a.excerpt ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description,
            inLanguage: "fa-IR",
            datePublished: a.published_at,
            author: { "@type": "Person", name: a.author_name },
            publisher: { "@type": "Organization", name: "ادیورَنک" },
          }),
        },
      ],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-bold">این مقاله پیدا نشد</h1>
        <Link to="/articles" className="mt-4 inline-block text-primary hover:underline">بازگشت به مقالات</Link>
      </div>
    </div>
  ),
});

/** Splits the stored markdown-ish body into headings and paragraphs for TOC + rendering. */
function parseBody(body: string) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      if (line.startsWith("## ")) return { kind: "h2" as const, text: line.slice(3), id: `section-${i}` };
      if (line.startsWith("### ")) return { kind: "h3" as const, text: line.slice(4), id: `section-${i}` };
      return { kind: "p" as const, text: line, id: `p-${i}` };
    });
}

function ArticlePage() {
  const { article, related, course, category } = Route.useLoaderData();
  const blocks = parseBody(article.content ?? "");
  const toc = blocks.filter((b) => b.kind === "h2");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <nav aria-label="مسیر صفحه" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">خانه</Link> ／{" "}
          <Link to="/articles" className="hover:text-primary">مقالات</Link>
          {category ? <> ／ <span>{category.title}</span></> : null}
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px]">
          <article>
            <h1 className="text-3xl font-extrabold leading-[1.6]">{article.title}</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              {article.author_name} · {faDate(article.published_at)} · {toFaDigits(article.reading_minutes)} دقیقه مطالعه
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
            <p className="card-surface mt-8 p-6 text-balance-fa font-medium leading-9">{article.excerpt}</p>

            <div className="mt-8 space-y-5">
              {blocks.map((b) =>
                b.kind === "h2" ? (
                  <h2 key={b.id} id={b.id} className="scroll-mt-24 pt-4 text-xl font-extrabold">{b.text}</h2>
                ) : b.kind === "h3" ? (
                  <h3 key={b.id} id={b.id} className="scroll-mt-24 text-lg font-bold">{b.text}</h3>
                ) : (
                  <p key={b.id} className="text-balance-fa leading-9 text-muted-foreground">{b.text}</p>
                ),
              )}
            </div>
          </article>

          <aside className="space-y-6">
            {toc.length > 0 && (
              <nav aria-label="فهرست مطالب" className="card-surface p-5 lg:sticky lg:top-24">
                <h2 className="text-sm font-bold">فهرست مطالب</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-muted-foreground hover:text-primary">{t.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {course && (
              <div className="card-surface p-5">
                <h2 className="text-sm font-bold">دوره مرتبط</h2>
                <p className="mt-3 font-bold leading-7">{course.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{course.short_description}</p>
                <p className="mt-3 text-sm font-extrabold text-primary">{faPrice(course.discount_price ?? course.price)}</p>
                <Link to="/courses/$slug" params={{ slug: course.slug }}>
                  <Button className="mt-4 w-full">مشاهده دوره</Button>
                </Link>
              </div>
            )}

            {related.length > 0 && (
              <div className="card-surface p-5">
                <h2 className="text-sm font-bold">مقالات مرتبط</h2>
                <ul className="mt-3 space-y-3">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link to="/articles/$slug" params={{ slug: r.slug }} className="text-sm leading-7 hover:text-primary">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
