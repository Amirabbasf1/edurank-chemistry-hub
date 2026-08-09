const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function faNumber(value: number): string {
  return toFaDigits(new Intl.NumberFormat("en-US").format(value));
}

export function faPrice(toman: number | null | undefined): string {
  if (!toman) return "رایگان";
  return `${faNumber(toman)} تومان`;
}

export function faDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function faDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${toFaDigits(m)}:${toFaDigits(String(s).padStart(2, "0"))}`;
}

export function faMinutes(minutes: number): string {
  if (minutes < 60) return `${faNumber(minutes)} دقیقه`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${faNumber(h)} ساعت و ${faNumber(m)} دقیقه` : `${faNumber(h)} ساعت`;
}

export const DIFFICULTY_FA: Record<string, string> = {
  beginner: "مقدماتی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

export const ROLE_FA: Record<string, string> = {
  student: "دانش‌آموز",
  instructor: "مدرس",
  admin: "مدیر",
  super_admin: "مدیر ارشد",
};