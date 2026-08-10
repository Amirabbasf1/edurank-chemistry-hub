import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    // Basic gate, ideally enhanced with server-side check
    // Here we rely on the component checking roles for now
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { roles, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">دسترسی غیرمجاز</h1>
          <p className="mt-2 text-muted-foreground">شما اجازه دسترسی به پنل مدیریت را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader />
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-background p-6 border-l border-border">
          <nav className="space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground mb-4">پنل مدیریت</h2>
            <div className="space-y-1">
              {['داشبورد', 'کاربران', 'دوره‌ها', 'بانک سؤالات', 'آزمون‌ها', 'مقالات', 'کتابخانه رسانه'].map(item => (
                <div key={item} className="px-4 py-2 hover:bg-primary/5 rounded-md cursor-pointer font-medium text-sm">
                  {item}
                </div>
              ))}
            </div>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-extrabold mb-6">به پنل مدیریت خوش آمدید</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
               <h3 className="font-bold">خلاصه وضعیت</h3>
               <p className="text-sm text-muted-foreground mt-2">مدیریت محتوا و کاربران از این بخش انجام می‌شود.</p>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
