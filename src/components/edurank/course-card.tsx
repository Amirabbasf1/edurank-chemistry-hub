import { Link } from "@tanstack/react-router";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { faNumber, faPrice, faMinutes, toFaDigits, DIFFICULTY_FA } from "@/lib/fa";

export type CourseCardData = {
  slug: string;
  title: string;
  short_description: string | null;
  grade: string | null;
  difficulty?: string | null;
  duration_minutes?: number | null;
  lesson_count?: number | null;
  rating: number | null;
  students_count: number | null;
  price: number | null;
  discount_price: number | null;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const final = course.discount_price ?? course.price ?? 0;
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group card-surface flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="relative h-36 overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,white_1px,transparent_1px),radial-gradient(circle_at_70%_60%,white_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="absolute bottom-3 start-4 flex gap-2">
          {course.grade && <Badge variant="secondary">{course.grade}</Badge>}
          {course.difficulty && (
            <Badge variant="secondary">{DIFFICULTY_FA[course.difficulty] ?? course.difficulty}</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-bold leading-7 group-hover:text-primary">{course.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{course.short_description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 text-warning" /> {toFaDigits(Number(course.rating ?? 0).toFixed(1))}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {faNumber(course.students_count ?? 0)}
          </span>
          {course.lesson_count ? (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" /> {faNumber(course.lesson_count)} درس
            </span>
          ) : null}
          {course.duration_minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {faMinutes(course.duration_minutes)}
            </span>
          ) : null}
        </div>
        <div className="flex items-baseline gap-2 border-t border-border pt-3">
          <span className="text-base font-extrabold text-primary">{faPrice(final)}</span>
          {course.discount_price && course.price ? (
            <span className="text-xs text-muted-foreground line-through">{faPrice(course.price)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
