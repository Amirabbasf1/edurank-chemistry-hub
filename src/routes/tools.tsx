import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toFaDigits } from "@/lib/fa";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "ابزارهای محاسباتی شیمی | ادیورَنک" },
      { name: "description", content: "ماشین‌حساب‌های تخصصی شیمی: تبدیل مول به جرم، غلظت مولی، محاسبات استوکیومتری و pH." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [molarMass, setMolarMass] = useState<string>("0");
  const [mass, setMass] = useState<string>("0");
  const [moles, setMoles] = useState<string>("0");

  const calcMoles = () => {
    const n = parseFloat(mass) / parseFloat(molarMass);
    setMoles(isNaN(n) ? "خطا" : n.toFixed(4));
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-8">
          <Calculator className="size-8 text-primary" />
          جعبه ابزار شیمی
        </h1>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <section className="card-surface p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">محاسبه مول (n = m/M)</h2>
            <div className="space-y-4">
              <div>
                <Label>جرم ماده (گرم)</Label>
                <Input 
                  type="number" 
                  value={mass} 
                  onChange={(e) => setMass(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>جرم مولی (g/mol)</Label>
                <Input 
                  type="number" 
                  value={molarMass} 
                  onChange={(e) => setMolarMass(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={calcMoles} className="w-full">محاسبه</Button>
              <div className="mt-4 p-4 bg-secondary rounded-lg text-center">
                <span className="text-sm text-muted-foreground block">تعداد مول:</span>
                <span className="text-2xl font-extrabold text-primary">{toFaDigits(moles)} mol</span>
              </div>
            </div>
          </section>

          <section className="card-surface p-6 flex flex-col items-center justify-center text-center opacity-60">
            <Calculator className="size-12 mb-4 text-muted-foreground" />
            <h2 className="text-lg font-bold">محاسبات غلظت</h2>
            <p className="text-xs mt-2">به‌زودی اضافه می‌شود...</p>
          </section>

          <section className="card-surface p-6 flex flex-col items-center justify-center text-center opacity-60">
            <Calculator className="size-12 mb-4 text-muted-foreground" />
            <h2 className="text-lg font-bold">محاسبات pH</h2>
            <p className="text-xs mt-2">به‌زودی اضافه می‌شود...</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
