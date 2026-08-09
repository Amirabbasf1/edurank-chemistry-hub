import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Atom, LayoutDashboard, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "خانه" },
  { to: "/courses", label: "دوره‌ها" },
  { to: "/exams", label: "آزمون‌ها" },
  { to: "/articles", label: "مقالات" },
  { to: "/about", label: "درباره ما" },
  { to: "/contact", label: "تماس" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-hero-gradient text-primary-foreground">
            <Atom className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-extrabold tracking-tight">ادیورَنک</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto hidden items-center gap-2 lg:flex">
          <Link to="/courses" search={{ q: "" }} aria-label="جستجو در دوره‌ها">
            <Button variant="ghost" size="icon">
              <Search className="size-4" />
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  <LayoutDashboard className="size-4" /> داشبورد
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" /> خروج
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "login" }}>
                <Button variant="ghost" size="sm">ورود</Button>
              </Link>
              <Link to="/auth" search={{ mode: "register" }}>
                <Button size="sm">ثبت‌نام رایگان</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
          className="ms-auto grid size-10 place-items-center rounded-lg border border-border lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3" aria-label="ناوبری موبایل">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full">داشبورد من</Button>
                  </Link>
                  <Button variant="ghost" onClick={handleSignOut}>خروج از حساب</Button>
                </>
              ) : (
                <>
                  <Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full">ورود</Button>
                  </Link>
                  <Link to="/auth" search={{ mode: "register" }} onClick={() => setOpen(false)}>
                    <Button className="w-full">ثبت‌نام رایگان</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}