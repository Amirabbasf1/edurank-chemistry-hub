import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/ai-tutor")({
  ssr: false,
  component: AITutorPage,
});

function AITutorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "سلام! من دستیار هوشمند ادیورَنک هستم. چطور می‌تونم در یادگیری شیمی بهت کمک کنم؟" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Mock response for now, in a real scenario we'd call a server function
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "من در حال یادگیری سرفصل‌های شیمی شما هستم. به‌زودی می‌تونم به تمام سؤالات علمی شما پاسخ دقیق بدم!" 
      }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-2xl bg-hero-gradient flex items-center justify-center text-primary-foreground shadow-lg">
            <Bot className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">دستیار هوشمند شیمی</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3 text-accent" /> قدرت گرفته از هوش مصنوعی اختصاصی ادیورَنک
            </p>
          </div>
        </div>

        <div className="flex-1 card-surface flex flex-col overflow-hidden min-h-[500px]">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {m.role === 'assistant' ? <Bot className="size-4" /> : <User className="size-4" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-8 ${
                    m.role === 'assistant' 
                      ? 'bg-secondary/50 rounded-tr-none' 
                      : 'bg-primary text-primary-foreground rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                    <Bot className="size-4" />
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-2xl rounded-tr-none animate-pulse">
                    <div className="flex gap-1">
                      <div className="size-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
                      <div className="size-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="size-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border bg-card">
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="سؤال شیمی خود را بپرسید..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
            <p className="text-[10px] text-center mt-3 text-muted-foreground">
              دستیار هوشمند ممکن است اشتباه کند. لطفاً اطلاعات حیاتی را با کتاب درسی تطبیق دهید.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
