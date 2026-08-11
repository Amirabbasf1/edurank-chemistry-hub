import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود و ثبت‌نام | ادیورَنک" },
      { name: "description", content: "وارد حساب کاربری ادیورَنک شوید و یادگیری شیمی را ادامه دهید." },
      { property: "og:title", content: "ورود و ثبت‌نام | ادیورَنک" },
      { property: "og:description", content: "ورود به پنل دانش‌آموزی ادیورَنک." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "ایمیل معتبر وارد کنید" }).max(255),
  password: z.string().min(6, { message: "رمز عبور حداقل ۶ کاراکتر است" }).max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(3, { message: "نام و نام خانوادگی را کامل وارد کنید" }).max(80),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (roles.includes("instructor")) {
        navigate({ to: "/instructor", replace: true });
      } else if (roles.some(r => ["admin", "super_admin", "content_manager", "exam_manager"].includes(r))) {
        navigate({ to: "/admin", replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [user, loading, navigate]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error("ایمیل یا رمز عبور نادرست است.");
      return;
    }
    toast.success("خوش آمدید!");
    if (roles.includes("instructor")) {
      navigate({ to: "/instructor" });
    } else if (roles.some(r => ["admin", "super_admin", "content_manager", "exam_manager"].includes(r))) {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
      fullName: form.get("fullName"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("already") ? "این ایمیل قبلاً ثبت شده است." : "ثبت‌نام انجام نشد.");
      return;
    }
    if (!data.session) {
      setSent(true);
      toast.success("ایمیل تأیید برای شما ارسال شد.");
      return;
    }
    if (roles.includes("instructor")) {
      navigate({ to: "/instructor" });
    } else if (roles.some(r => ["admin", "super_admin", "content_manager", "exam_manager"].includes(r))) {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setBusy(false);
      toast.error("ورود با گوگل انجام نشد.");
      return;
    }
    if (result.redirected) return;
    if (roles.includes("instructor")) {
      navigate({ to: "/instructor" });
    } else if (roles.some(r => ["admin", "super_admin", "content_manager", "exam_manager"].includes(r))) {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-hero-gradient p-12 text-primary-foreground lg:block">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_25%_25%,white_1.5px,transparent_1.5px)] [background-size:32px_32px]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-extrabold">
            <FlaskConical className="size-6" /> ادیورَنک
          </Link>
          <h2 className="mt-24 text-3xl font-extrabold leading-[1.7]">
            شیمی را مفهومی یاد بگیر،
            <br /> رتبه‌ات را بساز.
          </h2>
          <p className="mt-6 max-w-md leading-9 opacity-90">
            دسترسی به دوره‌های ویدیویی، آزمون‌های هوشمند، دستیار هوش مصنوعی و گزارش پیشرفت شخصی.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-extrabold lg:hidden">
            <FlaskConical className="size-5 text-primary" /> ادیورَنک
          </Link>
          <h1 className="text-2xl font-extrabold">ورود به حساب کاربری</h1>
          <p className="mt-2 text-sm text-muted-foreground">برای ادامه یادگیری وارد شوید یا حساب بسازید.</p>

          {sent ? (
            <div className="card-surface mt-8 p-6 text-sm leading-8">
              لینک تأیید به ایمیل شما ارسال شد. پس از تأیید، می‌توانید وارد شوید.
            </div>
          ) : (
            <Tabs defaultValue="signin" className="mt-8">
              <TabsList className="w-full">
                <TabsTrigger value="signin" className="flex-1">ورود</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">ثبت‌نام</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">ایمیل</Label>
                    <Input id="si-email" name="email" type="email" dir="ltr" autoComplete="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-pass">رمز عبور</Label>
                    <Input id="si-pass" name="password" type="password" dir="ltr" autoComplete="current-password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>ورود</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">نام و نام خانوادگی</Label>
                    <Input id="su-name" name="fullName" required maxLength={80} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">ایمیل</Label>
                    <Input id="su-email" name="email" type="email" dir="ltr" autoComplete="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pass">رمز عبور</Label>
                    <Input id="su-pass" name="password" type="password" dir="ltr" autoComplete="new-password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>ساخت حساب</Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> یا <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
            ورود با گوگل
          </Button>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">بازگشت به صفحه اصلی</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
