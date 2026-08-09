import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sparkles,
  LineChart,
  Video,
  Bot,
  Route as RouteIcon,
  ClipboardCheck,
  Star,
  Quote,
} from "lucide-react";
import { getHomeData } from "@/lib/public.functions";
import { Hero3D } from "@/components/edurank/hero-3d";
import { CourseCard } from "@/components/edurank/course-card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faNumber, faDate, toFaDigits } from "@/lib/fa";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: "ادیورَنک | یادگیری مفهومی شیمی دهم تا کنکور" },
      {
        name: "description",
        content:
          "دوره‌های ویدیویی شیمی، آزمون آنلاین استاندارد، بانک سوال و تحلیل پیشرفت؛ مسیر کامل یادگیری شیمی برای دانش‌آموزان ایرانی.",
      },
      { property: "og:title", content: "ادیورَنک | یادگیری مفهومی شیمی دهم تا کنکور" },
      {
        property: "og:description",
        content: "شیمی را مفهومی یاد بگیر، حرفه‌ای پیش برو — دوره، تمرین، آزمون و تحلیل پیشرفت.",
      },
    ],
  }),
  component: Home,
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <p className="text-muted-foreground">بارگذاری صفحه با مشکل مواجه شد. لطفاً دوباره تلاش کنید.</p>
    </div>
  ),
});

const WHY = [
  { icon: Sparkles, title: "یادگیری مفهومی", body: "به جای حفظ کردن، زنجیره مفاهیم شیمی را می‌سازیم." },
  { icon: RouteIcon, title: "مسیر یادگیری ساختارمند", body: "از پایه دهم تا کنکور، قدم‌به‌قدم و بدون سردرگمی." },
  { icon: ClipboardCheck, title: "آزمون حرفه‌ای", body: "آزمون‌های استاندارد فصلی، جامع و شبیه‌ساز کنکور." },
  { icon: LineChart, title: "تحلیل پیشرفت", body: "نقاط قوت و ضعف شما پس از هر آزمون مشخص می‌شود." },
  { icon: Video, title: "آموزش ویدیویی", body: "ویدیوهای کوتاه و دقیق با قابلیت ادامه از محل توقف." },
  { icon: Bot, title: "دستیار هوشمند", body: "معماری آماده برای پاسخ‌گویی هوشمند به سوالات شیمی." },
];

const PATH = ["پایه دهم", "پایه یازدهم", "پایه دوازدهم", "کنکور"];

function Home() {
  const data = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-subtle-gradient">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <Badge variant="secondary" className="mb-5">پلتفرم تخصصی آموزش شیمی</Badge>
              <h1 className="text-3xl font-extrabold leading-[1.5] sm:text-4xl lg:text-5xl lg:leading-[1.4]">
                شیمی را مفهومی یاد بگیر، <span className="text-primary">حرفه‌ای پیش برو</span>
              </h1>
              <p className="mt-5 max-w-xl text-balance-fa text-muted-foreground">
                یک مسیر آموزشی کامل برای یادگیری شیمی، حل تمرین، شرکت در آزمون و رسیدن به تسلط واقعی.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth">
                  <Button size="lg">
                    شروع یادگیری <ArrowLeft className="size-4" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline">مشاهده دوره‌ها</Button>
                </Link>
              </div>
            </div>
            <div className="order-first lg:order-none">
              <Hero3D />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-5">
            {[
              { label: "دانش‌آموز", value: data.stats.students },
              { label: "دوره", value: data.stats.courses },
              { label: "درس", value: data.stats.lessons },
              { label: "آزمون", value: data.stats.exams },
              { label: "سوال", value: data.stats.questions },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-primary sm:text-3xl">{faNumber(s.value)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LEVELS */}
        <Section title="پایه تحصیلی خود را انتخاب کنید" subtitle="محتوای هر پایه بر اساس بودجه‌بندی کتاب درسی تنظیم شده است.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.categories.map((c) => (
              <Link
                key={c.id}
                to="/courses"
                className="card-surface group p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Sparkles className="size-5" />
                </span>
                <h3 className="mt-4 font-bold group-hover:text-primary">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{c.description}</p>
              </Link>
            ))}
          </div>
        </Section>

        {/* FEATURED */}
        <Section title="دوره‌های منتخب" subtitle="پرطرفدارترین دوره‌های ادیورَنک" action={{ to: "/courses", label: "همه دوره‌ها" }}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </Section>

        {/* WHY */}
        <section className="bg-surface py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold sm:text-3xl">چرا ادیورَنک؟</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHY.map((f) => (
                <div key={f.title} className="card-surface p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PATH */}
        <Section title="مسیر یادگیری شیمی" subtitle="از مفاهیم پایه تا تسلط کامل برای کنکور">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PATH.map((step, i) => (
              <li key={step} className="card-surface relative p-6">
                <span className="text-sm font-bold text-accent">مرحله {toFaDigits(i + 1)}</span>
                <p className="mt-2 text-lg font-bold">{step}</p>
                <span className="absolute bottom-4 end-5 text-3xl font-black text-secondary">{toFaDigits(i + 1)}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* TESTIMONIALS */}
        <section className="bg-surface py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold sm:text-3xl">تجربه دانش‌آموزان</h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {data.testimonials.map((t) => (
                <figure key={t.id} className="card-surface p-6">
                  <Quote className="size-6 text-accent" aria-hidden />
                  <blockquote className="mt-3 text-sm leading-8 text-foreground">{t.body}</blockquote>
                  <figcaption className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span>
                      <span className="block text-sm font-bold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.role}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-warning">
                      <Star className="size-3.5 fill-current" /> {toFaDigits(t.rating)}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ARTICLES */}
        <Section title="آخرین مقالات" subtitle="دانشنامه شیمی ادیورَنک" action={{ to: "/articles", label: "همه مقالات" }}>
          <div className="grid gap-5 lg:grid-cols-3">
            {data.articles.map((a) => (
              <Link
                key={a.id}
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="card-surface group flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <h3 className="font-bold leading-7 group-hover:text-primary">{a.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{a.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {faDate(a.published_at)} · {toFaDigits(a.reading_minutes)} دقیقه مطالعه
                </p>
              </Link>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="سوالات متداول" subtitle="پاسخ پرتکرارترین پرسش‌های شما">
          <Accordion type="single" collapsible className="card-surface px-5">
            {data.faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-start text-sm font-bold">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-8 text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-hero-gradient px-6 py-14 text-center text-primary-foreground">
            <h2 className="text-2xl font-extrabold sm:text-3xl">یادگیری شیمی را از همین امروز شروع کن.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-8 opacity-90">
              ثبت‌نام رایگان است؛ درس‌های پیش‌نمایش را ببینید و مسیر یادگیری خود را انتخاب کنید.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" variant="secondary">ساخت حساب کاربری</Button>
              </Link>
              <Link to="/exams">
                <Button size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  شرکت در آزمون نمونه
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && (
          <Link to={action.to} className="text-sm font-bold text-primary hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
