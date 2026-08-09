import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ادیورَنک | پشتیبانی و مشاوره" },
      { name: "description", content: "سؤال، پیشنهاد یا نیاز به مشاوره آموزشی دارید؟ با تیم پشتیبانی ادیورَنک در تماس باشید." },
      { property: "og:title", content: "تماس با ادیورَنک" },
      { property: "og:description", content: "پشتیبانی و مشاوره آموزشی ادیورَنک." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(3, { message: "نام را کامل وارد کنید" }).max(80),
  email: z.string().trim().email({ message: "ایمیل معتبر وارد کنید" }).max(255),
  message: z.string().trim().min(10, { message: "متن پیام حداقل ۱۰ کاراکتر است" }).max(1000),
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      message: form.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setSent(true);
    toast.success("پیام شما ثبت شد. به‌زودی پاسخ می‌دهیم.");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="text-3xl font-extrabold">تماس با ما</h1>
          <p className="mt-4 max-w-2xl text-balance-fa leading-9 text-muted-foreground">
            سؤالی درباره دوره‌ها دارید یا برای انتخاب مسیر مطالعه به مشاوره نیاز دارید؟ فرم را پر کنید،
            کارشناسان آموزشی ادیورَنک در اولین فرصت پاسخ می‌دهند.
          </p>

          {sent ? (
            <div className="card-surface mt-8 p-8 text-sm leading-8">
              پیام شما با موفقیت ثبت شد. تیم پشتیبانی طی یک روز کاری با شما تماس می‌گیرد.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="card-surface mt-8 space-y-5 p-7">
              <div className="space-y-2">
                <Label htmlFor="name">نام و نام خانوادگی</Label>
                <Input id="name" name="name" maxLength={80} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" name="email" type="email" dir="ltr" maxLength={255} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">پیام شما</Label>
                <Textarea id="message" name="message" rows={6} maxLength={1000} required />
              </div>
              <Button type="submit" size="lg">ارسال پیام</Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          {[
            { icon: Mail, title: "ایمیل پشتیبانی", text: "support@edurank.ir" },
            { icon: MessageCircle, title: "پاسخگویی آنلاین", text: "از طریق پنل دانش‌آموزی" },
            { icon: Clock, title: "ساعات کاری", text: "شنبه تا پنجشنبه، ۹ تا ۱۸" },
          ].map((c) => (
            <div key={c.title} className="card-surface p-6">
              <c.icon className="size-5 text-primary" />
              <h2 className="mt-3 font-bold">{c.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground" dir="auto">{c.text}</p>
            </div>
          ))}
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
