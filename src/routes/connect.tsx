import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Terminal, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/connect")({
  component: ConnectAgentPage,
});

function ConnectAgentPage() {
  const [copied, setCopied] = useState(false);
  const mcpUrl = typeof window !== 'undefined' ? new URL("/mcp", window.location.origin).toString() : "";
  const appSlug = "edurank-app";
  const claudeCodeCmd = `claude mcp add --scope user --transport http ${appSlug} '${mcpUrl}'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("کپی شد!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">اتصال دستیار هوش مصنوعی</h1>
          <p className="text-lg text-slate-600">پلتفرم ادیورَنک را به ChatGPT، Claude یا دستیارهای دیگر متصل کنید تا به سرفصل‌ها، بانک سوالات و داده‌های آموزشی شما دسترسی داشته باشند.</p>
        </div>

        <Card className="mb-8 border-2 border-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-bold">لینک سرور MCP اختصاصی شما</CardTitle>
            <CardDescription>این آدرس را در تنظیمات دستیار هوش مصنوعی خود وارد کنید.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-slate-200">
              <code className="flex-1 font-mono text-sm break-all text-left" dir="ltr">{mcpUrl}</code>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(mcpUrl)}>
                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chatgpt" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-slate-200/50 rounded-xl">
            <TabsTrigger value="chatgpt" className="rounded-lg font-bold py-3">ChatGPT</TabsTrigger>
            <TabsTrigger value="claude" className="rounded-lg font-bold py-3">Claude.ai</TabsTrigger>
            <TabsTrigger value="claudecode" className="rounded-lg font-bold py-3">Claude Code</TabsTrigger>
            <TabsTrigger value="other" className="rounded-lg font-bold py-3">سایر کلاینت‌ها</TabsTrigger>
          </TabsList>

          <TabsContent value="chatgpt">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  اتصال به ChatGPT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ol className="list-decimal list-inside space-y-4 text-slate-700 leading-relaxed">
                  <li>
                    وارد <a href="https://chatgpt.com/#settings/Connectors/Advanced" target="_blank" className="text-primary hover:underline font-bold">تنظیمات ChatGPT</a> شوید و بخش <strong>Developer mode</strong> را فعال کنید.
                  </li>
                  <li>
                    بر روی این لینک کلیک کنید تا پنل اتصال باز شود: <a href={`https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins`} target="_blank" className="text-primary hover:underline font-bold">ایجاد کانکتور جدید <ExternalLink className="inline size-3" /></a>
                  </li>
                  <li>نام اپلیکیشن را <strong>EduRank</strong> و لینک سرور را آدرس بالا قرار دهید.</li>
                  <li>تیک گزینه تایید را بزنید و دکمه <strong>Create</strong> را کلیک کنید.</li>
                  <li>حالا در چت جدید، ادیورَنک را فعال کرده و سوالات خود را بپرسید.</li>
                </ol>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                  <RefreshCw className="size-5 text-amber-600 shrink-0 mt-1" />
                  <div className="text-sm text-amber-900">
                    <strong>بروزرسانی:</strong> اگر تغییری در اپلیکیشن ایجاد کردید، در بخش Plugins روی ادیورَنک کلیک کرده و <strong>Refresh</strong> را بزنید.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claude">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>اتصال به Claude.ai</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ol className="list-decimal list-inside space-y-4 text-slate-700 leading-relaxed">
                  <li>
                    مستقیماً از این لینک استفاده کنید: <a href={`https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=EduRank&connectorUrl=${encodeURIComponent(mcpUrl)}`} target="_blank" className="text-primary hover:underline font-bold">افزودن ادیورَنک به Claude <ExternalLink className="inline size-3" /></a>
                  </li>
                  <li>مشخصات را بررسی کرده و بر روی <strong>Add</strong> کلیک کنید.</li>
                  <li>اگر لینک بالا باز نشد، در تنظیمات Claude بخش <strong>Connectors</strong> را باز کرده و <strong>Add custom connector</strong> را بزنید.</li>
                  <li>از منوی چت، کانکتور ادیورَنک را فعال کنید.</li>
                </ol>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                  <RefreshCw className="size-5 text-amber-600 shrink-0 mt-1" />
                  <div className="text-sm text-amber-900">
                    <strong>بروزرسانی:</strong> در صفحه Connectors، روی این کانکتور کلیک کرده و لیست ابزارها را رفرش کنید.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claudecode">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>اتصال به Claude Code (ترمینال)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-600">دستور زیر را کپی کرده و در ترمینال خود اجرا کنید:</p>
                <div className="relative group">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm overflow-x-auto text-left" dir="ltr">
                    {claudeCodeCmd}
                  </pre>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(claudeCodeCmd)}
                  >
                    کپی دستور
                  </Button>
                </div>
                <ol className="list-decimal list-inside space-y-4 text-slate-700 leading-relaxed">
                  <li>بعد از اجرای دستور، <code>claude</code> را اجرا کنید.</li>
                  <li>با استفاده از دستور <code>/mcp</code> مطمئن شوید اپلیکیشن متصل شده است.</li>
                  <li>حالا می‌توانید از هوش مصنوعی بخواهید با داده‌های ادیورَنک کار کند.</li>
                </ol>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                  <RefreshCw className="size-5 text-amber-600 shrink-0 mt-1" />
                  <div className="text-sm text-amber-900">
                    <strong>بروزرسانی:</strong> بعد از هر تغییر در اپلیکیشن، کافیست یک سشن جدید در Claude Code شروع کنید تا ابزارهای جدید لود شوند.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>سایر کلاینت‌های MCP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ol className="list-decimal list-inside space-y-4 text-slate-700 leading-relaxed">
                  <li>بخش تنظیمات MCP یا Custom Connectors کلاینت خود را باز کنید.</li>
                  <li>یک اتصال جدید از نوع <strong>Remote MCP Server</strong> (یا HTTP) ایجاد کنید.</li>
                  <li>آدرس URL سرور را که در ابتدای صفحه است در فیلد مربوطه وارد کنید.</li>
                  <li>اگر کلاینت نیاز به احراز هویت داشت، مراحل ورود را طی کنید.</li>
                  <li>کانکتور را فعال کرده و از دستیار بخواهید از آن استفاده کند.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
