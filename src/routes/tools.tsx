import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toFaDigits, faNumber } from "@/lib/fa";
import { Calculator, Beaker, Thermometer, Droplets, FlaskConical } from "lucide-react";
import { parseChemicalFormula, calculateFormulaMolarMass } from "@/lib/chemistry-calculators";

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
  // Mole Calculator
  const [molarMassInput, setMolarMassInput] = useState<string>("18.015");
  const [massInput, setMassInput] = useState<string>("18.015");
  const [moleResult, setMoleResult] = useState<string>("1");

  // pH Calculator
  const [hPlus, setHPlus] = useState<string>("0.001");
  const [phResult, setPhResult] = useState<string>("3.00");

  // Molar Mass Calculator
  const [formulaInput, setFormulaInput] = useState<string>("H2O");
  
  const formulaMolarMass = useMemo(() => {
    try {
      const parsed = parseChemicalFormula(formulaInput);
      const mass = calculateFormulaMolarMass(parsed);
      return mass > 0 ? mass.toFixed(3) : "0";
    } catch {
      return "خطا";
    }
  }, [formulaInput]);

  // Dilution C1V1 = C2V2
  const [c1, setC1] = useState("1");
  const [v1, setV1] = useState("100");
  const [c2, setC2] = useState("0.1");
  const [v2, setV2] = useState("");

  const calcMoles = () => {
    const n = parseFloat(massInput) / parseFloat(molarMassInput);
    setMoleResult(isNaN(n) || !isFinite(n) ? "خطا" : n.toFixed(4));
  };

  const calcPh = () => {
    const h = parseFloat(hPlus);
    if (h <= 0) {
      setPhResult("نامعتبر");
      return;
    }
    const val = -Math.log10(h);
    setPhResult(isNaN(val) ? "خطا" : val.toFixed(2));
  };

  const calcDilution = () => {
    const nC1 = parseFloat(c1);
    const nV1 = parseFloat(v1);
    const nC2 = parseFloat(c2);
    if (nC2 === 0) return;
    const resV2 = (nC1 * nV1) / nC2;
    setV2(resV2.toFixed(2));
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
          {/* Molar Mass & Formula Parser */}
          <section className="card-surface p-6 border-accent/20 bg-accent/5">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Beaker className="size-5 text-accent" /> جرم مولی فرمول
            </h2>
            <div className="space-y-4">
              <div>
                <Label>فرمول شیمیایی (مثلاً H2O)</Label>
                <Input 
                  value={formulaInput} 
                  onChange={(e) => setFormulaInput(e.target.value)}
                  className="mt-1 font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div className="mt-4 p-4 bg-card border rounded-lg text-center">
                <span className="text-sm text-muted-foreground block">جرم مولی محاسبه شده:</span>
                <span className="text-2xl font-black text-accent">{toFaDigits(formulaMolarMass)} g/mol</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-5">
                نکته: برای عناصری مثل H, C, O, N, Na, Cl و ... پشتیبانی می‌شود.
              </p>
            </div>
          </section>

          {/* Mole Calculator */}
          <section className="card-surface p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Calculator className="size-5 text-primary" /> محاسبه مول (n = m/M)
            </h2>
            <div className="space-y-4">
              <div>
                <Label>جرم ماده (گرم)</Label>
                <Input 
                  type="number" 
                  value={massInput} 
                  onChange={(e) => setMassInput(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>جرم مولی (g/mol)</Label>
                <Input 
                  type="number" 
                  value={molarMassInput} 
                  onChange={(e) => setMolarMassInput(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={calcMoles} className="w-full">محاسبه</Button>
              <div className="mt-4 p-4 bg-secondary rounded-lg text-center">
                <span className="text-sm text-muted-foreground block">تعداد مول:</span>
                <span className="text-2xl font-extrabold text-primary">{toFaDigits(moleResult)} mol</span>
              </div>
            </div>
          </section>

          {/* pH Calculator */}
          <section className="card-surface p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <FlaskConical className="size-5 text-destructive" /> محاسبه pH
            </h2>
            <div className="space-y-4">
              <div>
                <Label>غلظت یون هیدرونیوم [H⁺]</Label>
                <Input 
                  type="number" 
                  step="0.0001"
                  value={hPlus} 
                  onChange={(e) => setHPlus(e.target.value)}
                  placeholder="مثال: 0.001"
                  className="mt-1"
                />
              </div>
              <Button onClick={calcPh} className="w-full bg-destructive hover:bg-destructive/90">محاسبه pH</Button>
              <div className="mt-4 p-4 bg-secondary rounded-lg text-center">
                <span className="text-sm text-muted-foreground block">مقدار pH:</span>
                <span className="text-2xl font-extrabold text-destructive">{toFaDigits(phResult)}</span>
                <div className="mt-2 text-[10px] font-bold">
                  {parseFloat(phResult) < 7 ? "محیط اسیدی" : parseFloat(phResult) > 7 ? "محیط بازی" : "محیط خنثی"}
                </div>
              </div>
            </div>
          </section>

          {/* Dilution Calculator */}
          <section className="card-surface p-6 border-success/20">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Droplets className="size-5 text-success" /> رقیق‌سازی (C1V1 = C2V2)
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">غلظت اولیه (C1)</Label>
                  <Input type="number" value={c1} onChange={(e) => setC1(e.target.value)} size={1} />
                </div>
                <div>
                  <Label className="text-[10px]">حجم اولیه (V1)</Label>
                  <Input type="number" value={v1} onChange={(e) => setV1(e.target.value)} size={1} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">غلظت نهایی (C2)</Label>
                  <Input type="number" value={c2} onChange={(e) => setC2(e.target.value)} size={1} />
                </div>
                <div>
                  <Label className="text-[10px]">حجم نهایی (V2)</Label>
                  <Input type="text" value={toFaDigits(v2)} readOnly className="bg-secondary" />
                </div>
              </div>
              <Button onClick={calcDilution} className="w-full bg-success hover:bg-success/90 mt-2">محاسبه حجم نهایی</Button>
            </div>
          </section>

          {/* Unit Converter */}
          <section className="card-surface p-6 border-warning/20">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Thermometer className="size-5 text-orange-500" /> تبدیل واحد دما
            </h2>
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground italic">به‌زودی: تبدیل سلسیوس به کلوین و فارنهایت</p>
              <div className="h-20 flex items-center justify-center border rounded-lg border-dashed">
                <span className="text-[10px] text-muted-foreground">در حال توسعه...</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
