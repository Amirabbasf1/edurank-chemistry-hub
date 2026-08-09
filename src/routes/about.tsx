import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Users, Sparkles, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره ادیورَنک | پلتفرم آموزش شیمی" },
      { name: "description", content: "ادیورَنک پلتفرم تخصصی آموزش شیمی برای دانش‌آموزان دهم تا کنکور با آموزش مفهومی و آزمون هوشمند." },
      { property: "og:title", content: "درباره ادیورَنک | پلتفرم آموزش شیمی" },
      { property: "og:description", content: "داستان، ماموریت و تیم ادیورَنک." },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Target, title: "آموزش مفهومی", text: "به جای حفظ کردن، مفهوم را می‌سازیم؛ از ساختار اتم تا محاسبات استوکیومتری." },
  { icon: Users, title: "همراهی مستمر", text: "پشتیبانی آموزشی، پاسخ به سؤالات و مسیر یادگیری شخصی‌سازی‌شده." },
  { icon: Sparkles, title: "فناوری هوشمند", text: "آزمون‌های تطبیقی، تحلیل خطا و دستیار هوش مصنوعی برای رفع اشکال." },
  { icon: ShieldCheck, title: "کیفیت تضمین‌شده", text: "محتوای بازبینی‌شده توسط مدرسان باتجربه و منطبق با کتاب درسی." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-subtle-gradient">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h1 className="text-3xl font-extrabold leading-[1.6]">درباره ادیورَنک</h1>
            <p className="mt-5 max-w-2xl text-balance-fa leading-9 text-muted-foreground">
              ادیورَنک با یک هدف ساده ساخته شد: شیمی نباید سخت باشد. ما آموزش ویدیویی مفهومی، تمرین هدفمند،
              آزمون آنلاین و تحلیل پیشرفت را در یک پلتفرم فارسی و روان کنار هم آورده‌ایم تا هر دانش‌آموزی
              بتواند مسیر خودش را تا امتحان نهایی و کنکور با اطمینان طی کند.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-xl font-extrabold">ارزش‌های ما</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card-surface p-6">
                <v.icon className="size-6 text-primary" />
                <h3 className="mt-4 font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-8 text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="card-surface mt-12 flex flex-wrap items-center justify-between gap-6 p-8">
            <div>
              <h2 className="text-xl font-extrabold">آماده شروع هستید؟</h2>
              <p className="mt-2 text-sm text-muted-foreground">اولین درس رایگان را همین امروز ببینید.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/courses"><Button size="lg">مشاهده دوره‌ها</Button></Link>
              <Link to="/contact"><Button size="lg" variant="outline">تماس با ما</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
