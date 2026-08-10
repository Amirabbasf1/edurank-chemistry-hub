import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Users, BookOpen, ClipboardList, FileText, Image as ImageIcon, 
  Settings, ShieldAlert, Plus, Monitor, GraduationCap, Package, Search, Trash2, CheckCircle2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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
  adminGetHomepageSections, adminUpdateHomepageSection,
  adminGetLessons, adminUpsertLesson, adminDeleteLesson
} from "@/lib/admin.functions";
import { adminCreateMediaRecord } from "@/lib/admin-media.functions";
import { supabase } from "@/integrations/supabase/client";
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
    case 'lessons': return <AdminLessons />;
    case 'questions': return <AdminQuestions />;
    case 'exams': return <AdminExams />;
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
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useQuery({ queryKey: ['admin-courses'], queryFn: adminGetCourses });
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return adminUpdateCourse({ data: { id: data.id, updates: data } });
      return adminCreateCourse({ data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setIsDialogOpen(false);
      setEditingCourse(null);
      toast.success('دوره با موفقیت ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت دوره‌ها</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)} size="sm" className="font-bold gap-2">
              <Plus className="size-4" /> افزودن دوره جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-black">{editingCourse ? 'ویرایش دوره' : 'ایجاد دوره جدید'}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              mutation.mutate({ 
                ...editingCourse, 
                ...data, 
                price: Number(data['price']), 
                discount_price: Number(data['discount_price']) 
              });
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">عنوان دوره</label>
                  <Input name="title" defaultValue={editingCourse?.title} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">نامک (Slug)</label>
                  <Input name="slug" defaultValue={editingCourse?.slug} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">توضیح کوتاه</label>
                <Input name="short_description" defaultValue={editingCourse?.short_description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">قیمت (تومان)</label>
                  <Input name="price" type="number" defaultValue={editingCourse?.price} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">قیمت با تخفیف</label>
                  <Input name="discount_price" type="number" defaultValue={editingCourse?.discount_price} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">پایه تحصیلی</label>
                  <Select name="grade" defaultValue={editingCourse?.grade || 'دهم'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="دهم">دهم</SelectItem>
                      <SelectItem value="یازدهم">یازدهم</SelectItem>
                      <SelectItem value="دوازدهم">دوازدهم</SelectItem>
                      <SelectItem value="کنکور">کنکور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">وضعیت انتشار</label>
                  <Select name="status" defaultValue={editingCourse?.status || 'draft'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">پیش‌نویس</SelectItem>
                      <SelectItem value="published">منتشر شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full font-bold" disabled={mutation.isPending}>
                  {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Table remains identical... */}


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
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-xs">درحال بارگذاری...</TableCell></TableRow>
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
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingCourse(course);
                    setIsDialogOpen(true);
                  }}>ویرایش</Button>
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
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const { data: courses } = useQuery({ queryKey: ['admin-courses'], queryFn: adminGetCourses });
  const { data: curriculum, isLoading } = useQuery({ 
    queryKey: ['admin-curriculum', selectedCourse], 
    queryFn: () => adminGetCurriculum({ data: { courseId: selectedCourse } }),
    enabled: !!selectedCourse
  });

  const upsertChapter = useMutation({
    mutationFn: (data: any) => adminUpsertChapter({ data: { ...data, course_id: selectedCourse } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] });
      toast.success('فصل با موفقیت ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
       <div className="flex items-center justify-between">
         <h2 className="text-xl font-black">مدیریت سرفصل‌ها</h2>
         <div className="w-64">
           <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger>
                 <SelectValue placeholder="انتخاب دوره..." />
              </SelectTrigger>
              <SelectContent>
                 {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
           </Select>
         </div>
       </div>

       {!selectedCourse ? (
         <div className="p-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
           <GraduationCap className="size-12 mb-4 opacity-20" />
           <p>لطفاً یک دوره را برای مدیریت سرفصل‌های آن انتخاب کنید</p>
         </div>
       ) : isLoading ? (
         <div className="py-20 text-center">درحال بارگذاری سرفصل‌ها...</div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><BookOpen className="size-4" /> لیست فصل‌ها</h3>
                <Button size="sm" variant="outline" onClick={() => {
                  const title = prompt('عنوان فصل جدید:');
                  if (title) upsertChapter.mutate({ title, sort_order: (curriculum?.chapters?.length || 0) + 1 });
                }}>افزودن فصل</Button>
              </div>
              <div className="space-y-2">
                {curriculum?.chapters?.map(ch => (
                  <div key={ch.id} className="p-4 rounded-xl border bg-white flex items-center justify-between hover:border-primary/50 transition-colors">
                    <span className="font-bold text-sm">{ch.title}</span>
                    <Badge variant="outline" className="text-[10px]">فصل {faNumber(ch.sort_order)}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
             <div className="p-8 rounded-2xl border bg-white flex flex-col items-center justify-center text-center text-muted-foreground border-primary/20">
               <h3 className="font-bold text-primary mb-2">مدیریت سلسله‌مراتب</h3>
               <p className="text-xs">در این بخش می‌توانید موضوعات و زیرمجموعه‌ها را مدیریت کنید.</p>
               <div className="flex gap-2 mt-4">
                 <Button size="sm" variant="outline" onClick={() => {
                   const title = prompt('عنوان موضوع جدید:');
                   if (title) adminUpsertTopic({ data: { title, sort_order: (curriculum?.topics?.length || 0) + 1 } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] }));
                 }}>افزودن موضوع</Button>
               </div>
             </div>
         </div>
       )}
    </div>
  );
}

function AdminQuestions() {
  const queryClient = useQueryClient();
  const { data: questions, isLoading } = useQuery({ queryKey: ['admin-questions'], queryFn: () => adminGetQuestions({ data: {} }) });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => adminUpsertQuestion({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      setIsDialogOpen(false);
      toast.success('سؤال با موفقیت ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">بانک سؤالات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingQuestion(null)} size="sm" className="font-bold gap-2"><Plus className="size-4" /> افزودن سؤال</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-black">طراحی سؤال جدید</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const body = fd.get('body') as string;
              const difficulty = fd.get('difficulty') as any;
              mutation.mutate({ 
                question: { ...editingQuestion, body, difficulty, type: 'multiple_choice', grade: 'دهم' },
                options: [
                  { body: fd.get('opt1'), is_correct: true, sort_order: 1 },
                  { body: fd.get('opt2'), is_correct: false, sort_order: 2 },
                  { body: fd.get('opt3'), is_correct: false, sort_order: 3 },
                  { body: fd.get('opt4'), is_correct: false, sort_order: 4 },
                ]
              });
            }}>
              <div className="space-y-2">
                <label className="text-xs font-bold">متن سؤال</label>
                <Input name="body" defaultValue={editingQuestion?.body} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">گزینه صحیح (۱)</label>
                  <Input name="opt1" required placeholder="پاسخ درست را اینجا بنویسید" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">گزینه ۲</label>
                  <Input name="opt2" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">گزینه ۳</label>
                  <Input name="opt3" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">گزینه ۴</label>
                  <Input name="opt4" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">درجه سختی</label>
                <Select name="difficulty" defaultValue={editingQuestion?.difficulty || 'medium'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">آسان</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">سخت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full font-bold">ذخیره در بانک سؤالات</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">سؤال</TableHead>
              <TableHead className="text-right">سطح</TableHead>
              <TableHead className="text-right">نوع</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={4} className="text-center py-10 text-xs">در حال بارگذاری...</TableCell></TableRow>
            ) : questions?.map(q => (
              <TableRow key={q.id}>
                <TableCell className="max-w-md truncate text-xs font-bold">{q.body}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge></TableCell>
                <TableCell className="text-xs">{q.type}</TableCell>
                <TableCell><Button variant="ghost" size="sm" className="text-xs">ویرایش</Button></TableCell>
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
        <Button 
          size="sm" 
          className="font-bold gap-2"
          onClick={async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = async (e: any) => {
              const file = e.target.files[0];
              if (!file) return;
              const { supabase } = await import('@/integrations/supabase/client');
              const { adminCreateMediaRecord } = await import('@/lib/admin-media.functions');
              const { data, error } = await supabase.storage.from('media').upload(`${Date.now()}-${file.name}`, file);
              if (error) { toast.error('خطا در آپلود'); return; }
              const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);
              await adminCreateMediaRecord({ data: { filename: file.name, file_url: publicUrl, file_type: file.type, file_size: file.size } });
              toast.success('فایل با موفقیت آپلود شد');
              window.location.reload();
            };
            input.click();
          }}
        >
          <Plus className="size-4" /> آپلود فایل
        </Button>
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
  const queryClient = useQueryClient();
  const { data: articles, isLoading } = useQuery({ queryKey: ['admin-articles'], queryFn: adminGetArticles });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => adminUpsertArticle({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsDialogOpen(false);
      toast.success('مقاله با موفقیت ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت مقالات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingArticle(null)} size="sm" className="font-bold gap-2"><Plus className="size-4" /> مقاله جدید</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-black">انتشار مقاله جدید</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              mutation.mutate({ 
                ...editingArticle, 
                title: fd.get('title'),
                slug: fd.get('slug'),
                excerpt: fd.get('excerpt'),
                content: fd.get('content'),
                author_name: 'مدیریت',
                is_published: fd.get('published') === 'on'
              });
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">عنوان مقاله</label>
                  <Input name="title" defaultValue={editingArticle?.title} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">نامک (Slug)</label>
                  <Input name="slug" defaultValue={editingArticle?.slug} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">خلاصه مقاله</label>
                <Input name="excerpt" defaultValue={editingArticle?.excerpt} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">متن محتوا (Markdown)</label>
                <textarea 
                  name="content" 
                  className="w-full min-h-[200px] p-3 rounded-lg border text-sm font-sans" 
                  defaultValue={editingArticle?.content}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="published" defaultChecked={editingArticle?.is_published} />
                <label className="text-xs font-bold">انتشار فوری</label>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full font-bold">ذخیره و انتشار</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            {isLoading ? (
               <TableRow><TableCell colSpan={4} className="text-center py-10 text-xs">در حال بارگذاری...</TableCell></TableRow>
            ) : articles?.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-bold text-xs">{a.title}</TableCell>
                <TableCell className="text-xs">{a.author_name}</TableCell>
                <TableCell><Badge className="text-[10px]">{a.is_published ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm" className="text-xs">ویرایش</Button></TableCell>
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

function AdminLessons() {
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const { data: courses } = useQuery({ queryKey: ['admin-courses'], queryFn: adminGetCourses });
  const { data: lessons, isLoading } = useQuery({ 
    queryKey: ['admin-lessons', courseId], 
    queryFn: () => adminGetLessons({ data: { courseId } }),
    enabled: !!courseId 
  });
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => adminUpsertLesson({ data: { ...data, course_id: courseId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
      setIsDialogOpen(false);
      toast.success('درس با موفقیت ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت دروس</h2>
        <div className="flex gap-4">
          <Select onValueChange={setCourseId} value={courseId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="انتخاب دوره..." /></SelectTrigger>
            <SelectContent>{courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
          <Button disabled={!courseId} onClick={() => { setEditingLesson(null); setIsDialogOpen(true); }} size="sm" className="font-bold gap-2">
            <Plus className="size-4" /> درس جدید
          </Button>
        </div>
      </div>
      
      {!courseId ? (
        <div className="p-20 border-2 border-dashed rounded-2xl text-center text-muted-foreground">دوره ای را انتخاب کنید</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead className="text-right">عنوان</TableHead><TableHead className="text-right">نوع</TableHead><TableHead className="text-right">عملیات</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="text-center">بارگذاری...</TableCell></TableRow> :
                lessons?.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-bold">{l.title}</TableCell>
                    <TableCell><Badge variant="outline">{l.type}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => { setEditingLesson(l); setIsDialogOpen(true); }}>ویرایش</Button></TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="font-black text-right">ویرایش درس</DialogTitle></DialogHeader>
          <form className="space-y-4 py-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            mutation.mutate({
              ...editingLesson,
              title: fd.get('title'),
              slug: fd.get('slug'),
              type: fd.get('type'),
              content: fd.get('content'),
              video_url: fd.get('video_url'),
              is_free_preview: fd.get('is_free') === 'on'
            });
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-xs font-bold">عنوان</label><Input name="title" defaultValue={editingLesson?.title} required /></div>
              <div className="space-y-2"><label className="text-xs font-bold">نامک</label><Input name="slug" defaultValue={editingLesson?.slug} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">نوع محتوا</label>
                <Select name="type" defaultValue={editingLesson?.type || 'video'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">ویدیو</SelectItem>
                    <SelectItem value="article">نوشتاری</SelectItem>
                    <SelectItem value="quiz">آزمونک</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><label className="text-xs font-bold">لینک ویدیو (در صورت وجود)</label><Input name="video_url" defaultValue={editingLesson?.video_url} /></div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">محتوای متنی (Rich-text Markdown)</label>
              <textarea name="content" className="w-full min-h-[200px] border p-3 rounded-lg text-sm" defaultValue={editingLesson?.content} />
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" name="is_free" defaultChecked={editingLesson?.is_free_preview} /> <label className="text-xs font-bold">پیش‌نمایش رایگان</label></div>
            <DialogFooter><Button type="submit" className="w-full font-bold">ذخیره درس</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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


