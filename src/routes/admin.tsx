import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Users, BookOpen, ClipboardList, FileText, Image as ImageIcon, 
  Settings, ShieldAlert, Plus, Monitor, GraduationCap, Package, Search
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  adminGetCourses, adminCreateCourse, adminUpdateCourse,
  adminGetCurriculum, adminUpsertChapter, adminUpsertTopic, adminUpsertSubtopic,
  adminGetMedia, adminDeleteMedia,
  adminGetUsers, adminUpdateUserRole,
  adminGetQuestions, adminUpsertQuestion,
  adminGetExams, adminUpsertExam,
  adminGetArticles, adminUpsertArticle,
  adminGetAuditLogs,
  adminGetHomepageSections, adminUpdateHomepageSection
} from "@/lib/admin.functions";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { faNumber, faPrice, faDate } from "@/lib/fa";

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
               <AdminContent tab={activeTab} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminContent({ tab }: { tab: string }) {
  switch (tab) {
    case 'dashboard': return <AdminDashboard />;
    case 'users': return <AdminUsers />;
    case 'courses': return <AdminCourses />;
    case 'curriculum': return <AdminCurriculum />;
    case 'questions': return <AdminQuestions />;
    case 'exams': return <AdminExams />;
    case 'articles': return <AdminArticles />;
    case 'media': return <AdminMedia />;
    case 'homepage': return <AdminHomepage />;
    case 'seo': return <AdminSEO />;
    case 'logs': return <AdminLogs />;
    case 'settings': return <AdminSettings />;
    default: return <div>بخش در حال توسعه...</div>;
  }
}

function AdminDashboard() {
  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'کل دوره‌ها', value: '۱۲', color: 'bg-blue-500' },
          { label: 'دانشجویان فعال', value: '۱,۴۵۰', color: 'bg-green-500' },
          { label: 'فروش ماهانه', value: '۴۵.۲M', color: 'bg-purple-500' },
          { label: 'آزمون‌های امروز', value: '۱۲۸', color: 'bg-orange-500' },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
            </div>
            <div className={`size-10 rounded-xl ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>
      <div className="bg-muted/10 p-12 rounded-2xl border-2 border-dashed border-muted text-center">
        <Monitor className="size-12 text-muted mx-auto mb-4" />
        <h3 className="text-lg font-bold">نمای کلی سیستم</h3>
        <p className="text-muted-foreground text-sm mt-2">نمودارهای تحلیلی و آماری در این بخش قرار می‌گیرند.</p>
      </div>
    </div>
  );
}

function AdminCourses() {
  const { data: courses, isLoading } = useQuery({ queryKey: ['admin-courses'], queryFn: adminGetCourses });
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت دوره‌ها</h2>
        <Button onClick={() => setIsAdding(true)} size="sm" className="font-bold gap-2">
          <Plus className="size-4" /> افزودن دوره جدید
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">عنوان دوره</TableHead>
              <TableHead className="text-right">قیمت</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">دانشجو</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">درحال بارگذاری...</TableCell></TableRow>
            ) : courses?.map(course => (
              <TableRow key={course.id}>
                <TableCell className="font-bold">{course.title}</TableCell>
                <TableCell>{faPrice(course.price)}</TableCell>
                <TableCell>
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                  </Badge>
                </TableCell>
                <TableCell>{faNumber(course.students_count)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">ویرایش</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminCurriculum() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
       <h2 className="text-xl font-black">مدیریت سرفصل‌ها</h2>
       <p className="text-muted-foreground text-sm">ساختار درختی محتوا: پایه {">"} دوره {">"} فصل {">"} موضوع {">"} زیرموضوع {">"} درس</p>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-muted/5 flex flex-col items-center justify-center text-center">
             <GraduationCap className="size-10 text-muted mb-4" />
             <h3 className="font-bold">انتخاب دوره</h3>
             <p className="text-xs text-muted-foreground mt-2">ابتدا دوره‌ای را برای مدیریت سرفصل‌های آن انتخاب کنید.</p>
             <Select>
                <SelectTrigger className="mt-4 w-full">
                   <SelectValue placeholder="انتخاب دوره..." />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="c1">شیمی دهم</SelectItem>
                   <SelectItem value="c2">شیمی یازدهم</SelectItem>
                </SelectContent>
             </Select>
          </div>
       </div>
    </div>
  );
}

function AdminQuestions() {
  const { data: questions } = useQuery({ queryKey: ['admin-questions'], queryFn: () => adminGetQuestions({ data: {} }) });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">بانک سؤالات</h2>
        <Button size="sm" className="font-bold gap-2"><Plus className="size-4" /> افزودن سؤال</Button>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">سؤال</TableHead>
              <TableHead className="text-right">سطح</TableHead>
              <TableHead className="text-right">نوع</TableHead>
              <TableHead className="text-right">منبع</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions?.map(q => (
              <TableRow key={q.id}>
                <TableCell className="max-w-md truncate">{q.body}</TableCell>
                <TableCell><Badge variant="outline">{q.difficulty}</Badge></TableCell>
                <TableCell>{q.type}</TableCell>
                <TableCell>{q.source ?? '-'}</TableCell>
                <TableCell><Button variant="ghost" size="sm">ویرایش</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminMedia() {
  const { data: media } = useQuery({ queryKey: ['admin-media'], queryFn: adminGetMedia });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">کتابخانه رسانه</h2>
        <Button size="sm" className="font-bold gap-2"><Plus className="size-4" /> آپلود فایل</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media?.map(m => (
          <div key={m.id} className="group relative aspect-square rounded-xl border bg-muted/20 overflow-hidden hover:shadow-md transition-all">
            {m.file_type.startsWith('image') ? (
               <img src={m.file_url} alt={m.filename} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="size-8" /></div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white truncate">{m.filename}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: adminGetUsers });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت کاربران</h2>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">نام کامل</TableHead>
              <TableHead className="text-right">نقش‌ها</TableHead>
              <TableHead className="text-right">امتیاز (XP)</TableHead>
              <TableHead className="text-right">آخرین فعالیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-bold">{u.full_name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(u as any).user_roles?.map((r: any) => <Badge key={r.role} variant="secondary">{r.role}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>{faNumber(u.xp)}</TableCell>
                <TableCell>{faDate(u.last_active_date)}</TableCell>
                <TableCell><Button variant="ghost" size="sm">مدیریت</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminLogs() {
  const { data: logs } = useQuery({ queryKey: ['admin-logs'], queryFn: adminGetAuditLogs });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">گزارشات امنیت و تغییرات</h2>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">زمان</TableHead>
              <TableHead className="text-right">کاربر</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
              <TableHead className="text-right">هدف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground">{faDate(log.created_at)}</TableCell>
                <TableCell className="font-bold text-xs">{(log as any).profiles?.full_name ?? 'سیستم'}</TableCell>
                <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                <TableCell className="text-xs">{log.target_type} ({log.target_id})</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminExams() {
  const { data: exams } = useQuery({ queryKey: ['admin-exams'], queryFn: adminGetExams });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت آزمون‌ها</h2>
        <Button size="sm" className="font-bold gap-2"><Plus className="size-4" /> آزمون جدید</Button>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">مدت زمان</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams?.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-bold">{e.title}</TableCell>
                <TableCell>{faNumber(e.duration_minutes)} دقیقه</TableCell>
                <TableCell><Badge>{e.is_published ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm">ویرایش</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminArticles() {
  const { data: articles } = useQuery({ queryKey: ['admin-articles'], queryFn: adminGetArticles });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت مقالات</h2>
        <Button size="sm" className="font-bold gap-2"><Plus className="size-4" /> مقاله جدید</Button>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">نویسنده</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles?.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-bold">{a.title}</TableCell>
                <TableCell>{a.author_name}</TableCell>
                <TableCell><Badge>{a.is_published ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm">ویرایش</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminHomepage() {
  const { data: sections } = useQuery({ queryKey: ['admin-homepage'], queryFn: adminGetHomepageSections });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت صفحه اصلی</h2>
      <div className="grid gap-4">
        {sections?.map(s => (
          <div key={s.id} className="p-6 rounded-2xl border flex items-center justify-between hover:bg-muted/5 transition-colors">
            <div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{s.section_slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'فعال' : 'غیرفعال'}</Badge>
              <Button variant="outline" size="sm">ویرایش محتوا</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSEO() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت سئو (SEO)</h2>
      <div className="bg-muted/10 p-20 rounded-xl border-2 border-dashed border-muted text-center text-muted-foreground">
        ابزارهای مدیریت متادیتا، سایت‌مپ و بهینه‌سازی موتورهای جستجو در این بخش قرار می‌گیرند.
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">تنظیمات سیستم</h2>
      <div className="grid gap-6">
        <div className="p-6 rounded-2xl border space-y-4">
           <h3 className="font-bold border-b pb-2">تنظیمات عمومی</h3>
           <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-muted-foreground">نام پلتفرم</label>
                 <Input defaultValue="ادیورَنک" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-muted-foreground">ایمیل پشتیبانی</label>
                 <Input defaultValue="support@edurank.ir" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

  const { data: articles } = useQuery({ queryKey: ['admin-articles'], queryFn: adminGetArticles });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت مقالات</h2>
        <Button size="sm" className="font-bold gap-2"><Plus className="size-4" /> مقاله جدید</Button>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">نویسنده</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles?.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-bold">{a.title}</TableCell>
                <TableCell>{a.author_name}</TableCell>
                <TableCell><Badge>{a.is_published ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm">ویرایش</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminHomepage() {
  const { data: sections } = useQuery({ queryKey: ['admin-homepage'], queryFn: adminGetHomepageSections });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت صفحه اصلی</h2>
      <div className="grid gap-4">
        {sections?.map(s => (
          <div key={s.id} className="p-6 rounded-2xl border flex items-center justify-between hover:bg-muted/5 transition-colors">
            <div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{s.section_slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'فعال' : 'غیرفعال'}</Badge>
              <Button variant="outline" size="sm">ویرایش محتوا</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSEO() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت سئو (SEO)</h2>
      <div className="bg-muted/10 p-20 rounded-xl border-2 border-dashed border-muted text-center text-muted-foreground">
        ابزارهای مدیریت متادیتا، سایت‌مپ و بهینه‌سازی موتورهای جستجو در این بخش قرار می‌گیرند.
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">تنظیمات سیستم</h2>
      <div className="grid gap-6">
        <div className="p-6 rounded-2xl border space-y-4">
           <h3 className="font-bold border-b pb-2">تنظیمات عمومی</h3>
           <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-muted-foreground">نام پلتفرم</label>
                 <Input defaultValue="ادیورَنک" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-muted-foreground">ایمیل پشتیبانی</label>
                 <Input defaultValue="support@edurank.ir" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
