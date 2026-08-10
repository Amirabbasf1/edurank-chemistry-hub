import { Link } from "@tanstack/react-router";
import { Atom } from "lucide-react";
import { toFaDigits } from "@/lib/fa";

const GROUPS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "آموزش",
    links: [
      { label: "شیمی دهم", to: "/courses" },
      { label: "شیمی یازدهم", to: "/courses" },
      { label: "شیمی دوازدهم", to: "/courses" },
      { label: "شیمی کنکور", to: "/courses" },
      { label: "آزمون‌ها", to: "/exams" },
    ],
  },
  {
    title: "پلتفرم",
    links: [
      { label: "همه دوره‌ها", to: "/courses" },
      { label: "مقالات", to: "/articles" },
      { label: "اتصال هوش مصنوعی", to: "/connect" },
      { label: "داشبورد", to: "/dashboard" },
      { label: "درباره ما", to: "/about" },
    ],
  },
  {
    title: "پشتیبانی",
    links: [
      { label: "تماس با ما", to: "/contact" },
      { label: "سوالات متداول", to: "/about" },
      { label: "قوانین و مقررات", to: "/legal" },
      { label: "حریم خصوصی", to: "/legal" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-hero-gradient text-primary-foreground">
              <Atom className="size-5" aria-hidden />
            </span>
            <span className="text-lg font-extrabold">ادیورَنک</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
            پلتفرم تخصصی یادگیری شیمی برای دانش‌آموزان ایرانی؛ آموزش مفهومی، تمرین هدفمند، آزمون استاندارد و تحلیل
            پیشرفت.
          </p>
        </div>
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © {toFaDigits(1404)} ادیورَنک — تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
}