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
  ChevronLeft,
  Search,
  Plus,
  Filter
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { adminGetUsers, adminGetCourses, adminGetMedia, adminGetAuditLogs } from "@/lib/admin.functions";

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
          <p className="mt-4 text-muted-foreground leading-7">شما اجازه دسترسی به این بخش را ندارید. این تلاش برای دسترسی ثبت خواهد شد.</p>
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
          <div className="relative hidden sm:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="جستجو در همه بخش‌ها..." 
              className="bg-muted/50 border-none rounded-full pr-10 pl-4 py-1.5 text-xs w-64 focus:ring-2 ring-primary/20 transition-all"
            />
          </div>
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
          
          <div className="mt-10 pt-6 border-t">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">وضعیت سرور</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="size-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground">عملیاتی (Online)</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:pr-64 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900">{navItems.find(i => i.id === activeTab)?.label}</h1>
                <p className="text-sm text-muted-foreground mt-1">مدیریت و نظارت بر بخش {navItems.find(i => i.id === activeTab)?.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="font-bold">
                  <Plus className="ml-2 size-4" /> افزودن جدید
                </Button>
                <Button variant="outline" size="icon" className="size-9">
                  <Filter className="size-4" />
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
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center">
      <p className="text-muted-foreground font-medium italic">بخش {tab} در حال توسعه است...</p>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'کل دانشجویان', value: '۱,۲۸۴', trend: '+۱۲٪', color: 'primary' },
        { label: 'فروش ماهانه', value: '۴۲,۵۰۰,۰۰۰', trend: '+۸٪', color: 'success' },
        { label: 'دوره‌های فعال', value: '۱۲', trend: '۰', color: 'accent' },
        { label: 'آزمون‌های امروز', value: '۸۶', trend: '+۱۵٪', color: 'info' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm group hover:border-primary/50 transition-colors">
          <p className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</p>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-2xl font-black">{stat.value}</h3>
            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
              stat.trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {stat.trend}
            </span>
          </div>
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

  if (isLoading) return <div>درحال بارگذاری لیست دوره‌ها...</div>;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-right">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">عنوان دوره</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">مقطع</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">وضعیت</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-left">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(courses ?? []).map((course: any) => (
            <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-sm">{course.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{course.slug}</div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md">{course.grade}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  course.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {course.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                </span>
              </td>
              <td className="px-6 py-4 text-left">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">ویرایش</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-destructive hover:text-destructive">حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminGetUsers()
  });

  if (isLoading) return <div>درحال بارگذاری لیست کاربران...</div>;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-right">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">نام کاربر</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">نقش</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">امتیاز (XP)</th>
            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-left">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(users ?? []).map((user: any) => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-sm">{user.full_name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{user.id}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {(user.user_roles ?? []).map((r: any, idx: number) => (
                    <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {r.role}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-black">{user.xp?.toLocaleString('fa-IR')}</span>
              </td>
              <td className="px-6 py-4 text-left">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">مدیریت</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
