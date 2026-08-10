import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Users, BookOpen, ClipboardList, FileText, Image as ImageIcon, 
  Settings, ShieldAlert, Plus, Monitor, GraduationCap, Package
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'courses', label: 'دوره‌ها', icon: BookOpen },
  { id: 'curriculum', label: 'سرفصل‌ها', icon: GraduationCap },
  { id: 'questions', label: 'بانک سؤالات', icon: ClipboardList },
  { id: 'exams', label: 'آزمون‌ها', icon: Package },
  { id: 'articles', label: 'مقالات', icon: FileText },
  { id: 'media', label: 'کتابخانه رسانه', icon: ImageIcon },
  { id: 'homepage', label: 'صفحه اصلی', icon: Monitor },
  { id: 'seo', label: 'سئو', icon: Search },
  { id: 'logs', label: 'گزارشات', icon: ShieldAlert },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
];

function AdminLayout() {
  const { roles, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  if (authLoading) return <div className="flex h-screen items-center justify-center">درحال بارگذاری...</div>;
  const isAdmin = roles.some(r => ['admin', 'super_admin', 'content_manager', 'exam_manager'].includes(r));
  
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/10 p-6">
        <div className="text-center p-8 bg-background rounded-2xl border shadow-xl max-w-sm">
          <ShieldAlert className="size-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-black">دسترسی محدود</h1>
          <p className="mt-4 text-muted-foreground leading-7">شما اجازه دسترسی به این بخش را ندارید.</p>
          <Button className="mt-6 w-full" variant="outline" onClick={() => window.location.href = '/'}>بازگشت به سایت</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white font-black">E</div>
          <span className="font-black text-lg tracking-tight">پنل مدیریت ادیورَنک</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>مشاهده سایت</Button>
      </div>

      <div className="flex">
        <aside className="w-64 fixed top-16 bottom-0 bg-white border-l px-4 py-6 hidden lg:block overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:pr-64 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
               <h1 className="text-2xl font-black mb-2">{navItems.find(i => i.id === activeTab)?.label}</h1>
               <p className="text-muted-foreground text-sm">مدیریت و پیکربندی بخش {navItems.find(i => i.id === activeTab)?.label.toLowerCase()} ادیورَنک.</p>
               <div className="mt-8">
                 <div className="bg-muted/20 p-20 rounded-xl border-2 border-dashed border-muted text-center text-muted-foreground">
                   این بخش به‌زودی با تمامی قابلیت‌های مدیریت داده و رابط کاربری اختصاصی تکمیل خواهد شد.
                 </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
