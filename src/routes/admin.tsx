import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  ShieldAlert,
  Search,
  Plus,
  Filter,
  Monitor
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  adminGetUsers, 
  adminGetCourses, 
  adminGetMedia, 
  adminGetAuditLogs,
  adminGetHomepageSections 
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'courses', label: 'دوره‌ها', icon: BookOpen },
  { id: 'questions', label: 'بانک سؤالات', icon: ClipboardList },
  { id: 'articles', label: 'مقالات', icon: FileText },
  { id: 'media', label: 'رسانه', icon: ImageIcon },
  { id: 'homepage', label: 'مدیریت صفحه اصلی', icon: Monitor },
  { id: 'logs', label: 'گزارشات امنیت', icon: ShieldAlert },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
];

function AdminLayout() {
  const { roles, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  if (authLoading) return <div className="flex h-screen items-center justify-center">درحال بارگذاری...</div>;
  
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/10">
        <div className="text-center p-8 bg-background rounded-2xl border shadow-xl max-w-sm">
          <ShieldAlert className="size-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-black">دسترسی غیرمجاز</h1>
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>مشاهده سایت</Button>
        </div>
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
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900">{navItems.find(i => i.id === activeTab)?.label}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="font-bold">
                  <Plus className="ml-2 size-4" /> افزودن جدید
                </Button>
              </div>
            </header>

            <AdminContent tab={activeTab} />
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminContent({ tab }: { tab: string }) {
  if (tab === 'dashboard') return <AdminDashboard />;
  if (tab === 'courses') return <AdminCourses />;
  if (tab === 'users') return <AdminUsers />;
  if (tab === 'homepage') return <AdminHomepage />;
  return <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-slate-300">بخش {tab} در حال توسعه است...</div>;
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'کل دانشجویان', value: '۱,۲۸۴' },
        { label: 'فروش ماهانه', value: '۴۲.۵M' },
        { label: 'دوره‌های فعال', value: '۱۲' },
        { label: 'آزمون‌ها', value: '۸۶' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
          <h3 className="text-2xl font-black mt-2">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
}

function AdminCourses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminGetCourses()
  });

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {isLoading ? <p className="p-10 text-center">بارگذاری...</p> : (
        <table className="w-full text-right">
          <tbody className="divide-y">
            {(courses ?? []).map((course: any) => (
              <tr key={course.id}>
                <td className="px-6 py-4 font-bold text-sm">{course.title}</td>
                <td className="px-6 py-4 text-xs">{course.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminGetUsers()
  });

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {isLoading ? <p className="p-10 text-center">بارگذاری...</p> : (
        <table className="w-full text-right">
          <tbody className="divide-y">
            {(users ?? []).map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 font-bold text-sm">{user.full_name}</td>
                <td className="px-6 py-4 text-xs">{user.user_roles?.map((r: any) => r.role).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminHomepage() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin-homepage'],
    queryFn: () => adminGetHomepageSections()
  });

  return (
    <div className="grid gap-4">
      {sections?.map((section: any) => (
        <div key={section.id} className="bg-white p-6 rounded-2xl border flex items-center justify-between">
          <div>
            <h3 className="font-bold">{section.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">شناسه: {section.section_slug}</p>
          </div>
          <Button variant="outline" size="sm">ویرایش محتوا</Button>
        </div>
      ))}
    </div>
  );
}
