import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getPeriodicTable } from "@/lib/public.functions";
import { useState } from "react";
import { toFaDigits } from "@/lib/fa";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/periodic-table")({
  loader: () => getPeriodicTable(),
  head: () => ({
    meta: [
      { title: "جدول تناوبی تعاملی عناصر | ادیورَنک" },
      { name: "description", content: "جدول تناوبی هوشمند با اطلاعات کامل اتمی، آرایش الکترونی و خواص فیزیکی و شیمیایی به زبان فارسی." },
    ],
  }),
  component: PeriodicTablePage,
});

const GROUPS = Array.from({ length: 18 }, (_, i) => i + 1);
const PERIODS = Array.from({ length: 7 }, (_, i) => i + 1);

function PeriodicTablePage() {
  const elements = Route.useLoaderData();
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold mb-6">جدول تناوبی هوشمند</h1>
        
        <div className="grid grid-cols-[1fr_350px] gap-8">
          <div className="overflow-x-auto pb-4">
            <div 
              className="grid gap-1 min-w-[900px]"
              style={{ 
                gridTemplateColumns: "repeat(18, minmax(45px, 1fr))",
                gridTemplateRows: "repeat(7, minmax(55px, 1fr))"
              }}
            >
              {elements.map((el: any) => (
                <button
                  key={el.atomic_number}
                  onClick={() => setSelected(el)}
                  style={{ 
                    gridColumn: el.group_num, 
                    gridRow: el.period,
                  }}
                  className={`flex flex-col items-center justify-center p-1 rounded border transition-all hover:scale-105 ${
                    selected?.atomic_number === el.atomic_number 
                      ? "border-primary bg-primary/10 shadow-lg" 
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  <span className="text-[9px] text-muted-foreground">{toFaDigits(el.atomic_number)}</span>
                  <span className="text-lg font-bold">{el.symbol}</span>
                  <span className="text-[8px] truncate max-w-full">{el.name_fa}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="card-surface p-6 h-fit sticky top-24">
            {selected ? (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.name_fa}</h2>
                    <p className="text-muted-foreground">{selected.name_en}</p>
                  </div>
                  <Badge variant="outline" className="text-xl px-3 py-1">{selected.symbol}</Badge>
                </div>
                
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">عدد اتمی:</span>
                    <span className="font-bold">{toFaDigits(selected.atomic_number)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">جرم اتمی:</span>
                    <span className="font-bold">{toFaDigits(selected.atomic_mass)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">آرایش الکترونی:</span>
                    <span className="font-mono">{selected.electron_configuration}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">الکترونگاتیوی:</span>
                    <span className="font-bold">{toFaDigits(selected.electronegativity ?? "نامشخص")}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">حالت فیزیکی:</span>
                    <span className="font-bold">{selected.physical_state}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold mb-2">توضیحات:</h3>
                  <p className="text-xs leading-6 text-muted-foreground">{selected.description_fa}</p>
                </div>

                {selected.uses_fa && selected.uses_fa.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-bold mb-2">کاربردها:</h3>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      {selected.uses_fa.map((u: string, i: number) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground italic">برای مشاهده اطلاعات کامل، یک عنصر را از جدول انتخاب کنید.</p>
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
