import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Users, BookOpen, ClipboardList, FileText, Image as ImageIcon, 
  Settings, ShieldAlert, Plus, Monitor, GraduationCap, Package, Search, Trash2, 
  CheckCircle2, Filter, MoreHorizontal, Eye, Copy, ArrowRight, Save, X, Beaker, Timer
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  adminGetCourses, adminCreateCourse, adminUpdateCourse,
  adminGetCurriculum, adminUpsertChapter, adminUpsertTopic, adminUpsertSubtopic, adminDeleteSubtopic,
  adminDeleteChapter, adminDeleteTopic,
  adminGetMedia, adminDeleteMedia, adminAddMediaRecord,
  adminGetUsers, adminUpdateUserRole,
  adminGetQuestions, adminUpsertQuestion, adminDeleteQuestion, adminBulkUpdateQuestionStatus,
  adminGetExams, adminUpsertExam, adminDeleteExam,
  adminGetArticles, adminUpsertArticle,
  adminGetAuditLogs,
  adminGetHomepageSections, adminUpdateHomepageSection,
  adminGetLessons, adminUpsertLesson, adminDeleteLesson,
  adminGetPages, adminUpsertPage, adminDeletePage,
  adminGetSiteSettings, adminUpdateSiteSetting,
  adminGetNavigationMenus, adminUpdateNavigationMenu,
  adminGetSystemStats
} from "@/lib/admin.functions";

import { adminDuplicateLesson } from "@/lib/admin-curriculum.functions";


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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { faNumber, faPrice, faDate } from "@/lib/fa";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'courses', label: 'دوره‌ها', icon: BookOpen },
  { id: 'curriculum', label: 'سرفصل‌ها', icon: GraduationCap },
  { id: 'lessons', label: 'دروس', icon: BookOpen },
  { id: 'questions', label: 'بانک سؤالات', icon: ClipboardList },
  { id: 'exams', label: 'آزمون‌ها', icon: Package },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'articles', label: 'مقالات', icon: FileText },
  { id: 'pages', label: 'برگه‌ها', icon: FileText },
  { id: 'media', label: 'کتابخانه رسانه', icon: ImageIcon },
  { id: 'homepage', label: 'صفحه اصلی', icon: Monitor },
  { id: 'menus', label: 'فهرست‌ها', icon: Monitor },
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
    case 'courses': return <AdminCourses />;
    case 'curriculum': return <AdminCurriculum />;
    case 'lessons': return <AdminLessons />;
    case 'questions': return <AdminQuestions />;
    case 'exams': return <AdminExams />;
    case 'users': return <AdminUsers />;
    case 'articles': return <AdminArticles />;
    case 'pages': return <AdminPages />;
    case 'media': return <AdminMedia />;
    case 'homepage': return <AdminHomepage />;
    case 'menus': return <AdminMenus />;
    case 'seo': return <AdminSEO />;
    case 'logs': return <AdminLogs />;
    case 'settings': return <AdminSettings />;
    default: return <div>بخش در حال توسعه...</div>;
  }
}


function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminGetSystemStats });

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'دانشجویان', value: stats?.totalStudents || 0, color: 'bg-blue-500', icon: Users },
          { label: 'دوره‌ها', value: stats?.totalCourses || 0, color: 'bg-green-500', icon: BookOpen },
          { label: 'دروس', value: stats?.totalLessons || 0, color: 'bg-indigo-500', icon: GraduationCap },
          { label: 'سوالات', value: stats?.totalQuestions || 0, color: 'bg-purple-500', icon: ClipboardList },
          { label: 'آزمون‌ها', value: stats?.totalExams || 0, color: 'bg-orange-500', icon: Package },
          { label: 'شرکت در آزمون', value: stats?.totalAttempts || 0, color: 'bg-red-500', icon: Timer },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center text-center justify-center gap-2">
            <div className={`size-10 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
              <stat.icon className={`size-5 text-${stat.color.split('-')[1]}-600`} />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-black mt-1">{isLoading ? '...' : faNumber(stat.value)}</h3>
            </div>
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
              <div className="space-y-4">
                {curriculum?.chapters?.map(ch => (
                  <div key={ch.id} className="space-y-2">
                    <div className="p-4 rounded-xl border bg-white flex items-center justify-between hover:border-primary/50 transition-colors group">
                      <span className="font-bold text-sm">{ch.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">فصل {faNumber(ch.sort_order)}</Badge>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => {
                          const title = prompt('عنوان موضوع جدید:');
                          if (title) adminUpsertTopic({ data: { title, chapter_id: ch.id, sort_order: (curriculum?.topics?.filter(t => t.chapter_id === ch.id).length || 0) + 1 } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] }));
                        }}>+ موضوع</Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                          if (confirm('حذف فصل و تمام محتویات آن؟')) adminDeleteChapter({ data: { id: ch.id } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] }));
                        }}><Trash2 className="size-3" /></Button>
                      </div>
                    </div>
                    
                    <div className="mr-6 space-y-2 border-r pr-4">
                      {curriculum?.topics?.filter(t => t.chapter_id === ch.id).map(topic => (
                        <div key={topic.id} className="space-y-2">
                          <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between text-xs group">
                            <span className="font-bold">{topic.title}</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" className="h-6 text-[9px]" onClick={() => {
                                const title = prompt('عنوان زیرمجموعه جدید:');
                                if (title) adminUpsertSubtopic({ data: { title, topic_id: topic.id, slug: title.toLowerCase().replace(/ /g, '-'), sort_order: (curriculum?.subtopics?.filter(s => s.topic_id === topic.id).length || 0) + 1 } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] }));
                              }}>+ زیرمجموعه</Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                                if (confirm('حذف موضوع؟')) adminDeleteTopic({ data: { id: topic.id } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] }));
                              }}><Trash2 className="size-3" /></Button>
                            </div>
                          </div>
                          
                          <div className="mr-4 space-y-1 border-r pr-3">
                            {curriculum?.subtopics?.filter(s => s.topic_id === topic.id).map(sub => (
                              <div key={sub.id} className="p-2 rounded border bg-white flex items-center justify-between text-[10px] group">
                                <span>{sub.title}</span>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                                    if (confirm('حذف شود؟')) adminDeleteSubtopic({ data: { id: sub.id } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-curriculum', selectedCourse] }));
                                  }}><Trash2 className="size-3" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
            
            <div className="p-8 rounded-2xl border bg-white flex flex-col items-center justify-center text-center text-muted-foreground border-primary/20 sticky top-4 h-fit">
              <GraduationCap className="size-12 mb-4 text-primary opacity-20" />
              <h3 className="font-bold text-primary mb-2">راهنمای سلسله‌مراتب</h3>
              <p className="text-xs leading-6">
                شما می‌توانید سرفصل‌های دوره را در ۴ سطح مدیریت کنید:<br/>
                فصل (Chapter) ← موضوع (Topic) ← زیرمجموعه (Subtopic) ← درس (Lesson)
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-xl text-[10px] text-right w-full">
                <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-primary" /> فصل: بخش‌های اصلی کتاب</div>
                <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> موضوع: تیترهای هر فصل</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> زیرمجموعه: نکات یا مفاهیم خرد</div>
              </div>
            </div>
          </div>
       )}
    </div>
  );
}

function AdminQuestions() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const { data, isLoading } = useQuery({ 
    queryKey: ['admin-questions', { q, page }], 
    queryFn: () => adminGetQuestions({ data: { q, page } }) 
  });
  
  const questions = data?.questions || [];
  const totalCount = data?.count || 0;
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteQuestion({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast.success('سؤال با موفقیت حذف شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">بانک سؤالات</h2>
        <div className="flex gap-2">
            <Input placeholder="جستجو در سؤالات..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
            <Button onClick={() => { setEditingQuestion(null); setIsDialogOpen(true); }} size="sm" className="font-bold gap-2"><Plus className="size-4" /> افزودن سؤال</Button>
        </div>
      </div>
      
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">سؤال</TableHead>
              <TableHead className="text-right">سختی</TableHead>
              <TableHead className="text-right">نوع</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center py-10 text-xs">در حال بارگذاری...</TableCell></TableRow>
            ) : questions.map(q => (
              <TableRow key={q.id}>
                <TableCell className="max-w-md truncate text-xs font-bold">{q.body}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge></TableCell>
                <TableCell className="text-xs">{q.type}</TableCell>
                <TableCell><Badge variant={q.status === 'published' ? 'default' : 'secondary'}>{q.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingQuestion(q); setIsDialogOpen(true); }}><Search className="size-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(q.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <QuestionBuilderDialog 
         isOpen={isDialogOpen} 
         onClose={() => setIsDialogOpen(false)} 
         question={editingQuestion} 
      />
    </div>
  );
}

function QuestionBuilderDialog({ isOpen, onClose, question }: { isOpen: boolean, onClose: () => void, question: any }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: any) => adminUpsertQuestion({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      onClose();
      toast.success('تغییرات ذخیره شد');
    }
  });

  const [options, setOptions] = useState<any[]>(question?.question_options || [{ body: '', is_correct: true, sort_order: 1 }, { body: '', is_correct: false, sort_order: 2 }]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader><DialogTitle>طراحی سؤال</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            mutation.mutate({ 
                question: { 
                    ...question, 
                    body: fd.get('body'),
                    difficulty: fd.get('difficulty'),
                    type: fd.get('type'),
                    explanation: fd.get('explanation')
                },
                options 
            });
        }}>
            <div className="space-y-2"><label className="text-xs font-bold">متن سؤال</label><Textarea name="body" defaultValue={question?.body} required /></div>
            <div className="grid grid-cols-2 gap-4">
                <Select name="difficulty" defaultValue={question?.difficulty || 'medium'}><SelectTrigger><SelectValue placeholder="سختی" /></SelectTrigger><SelectContent><SelectItem value="easy">آسان</SelectItem><SelectItem value="medium">متوسط</SelectItem><SelectItem value="hard">سخت</SelectItem></SelectContent></Select>
                <Select name="type" defaultValue={question?.type || 'multiple_choice'}><SelectTrigger><SelectValue placeholder="نوع سؤال" /></SelectTrigger><SelectContent><SelectItem value="multiple_choice">چهارگزینه‌ای</SelectItem><SelectItem value="true_false">صحیح/غلط</SelectItem><SelectItem value="calculation">محاسباتی</SelectItem><SelectItem value="conceptual">مفهومی</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold">گزینه‌ها</label>
                {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                        <Input value={opt.body} onChange={e => {
                            const newOpts = [...options];
                            newOpts[i].body = e.target.value;
                            setOptions(newOpts);
                        }} placeholder={`گزینه ${i+1}`} />
                        <Checkbox checked={opt.is_correct} onCheckedChange={checked => {
                            const newOpts = options.map((o, idx) => ({ ...o, is_correct: idx === i ? !!checked : false }));
                            setOptions(newOpts);
                        }} />
                    </div>
                ))}
            </div>
            <div className="space-y-2"><label className="text-xs font-bold">توضیح/پاسخ تشریحی</label><Textarea name="explanation" defaultValue={question?.explanation} /></div>
            <DialogFooter><Button type="submit">ذخیره</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const queryClient = useQueryClient();
  const { data: exams } = useQuery({ queryKey: ['admin-exams'], queryFn: adminGetExams });
  const { data: qData } = useQuery({ queryKey: ['admin-questions'], queryFn: () => adminGetQuestions({ data: {} }) });
  const allQuestions = qData?.questions || [];
  const [editingExam, setEditingExam] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQ, setSearchQ] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!allQuestions) return [];
    return allQuestions.filter(q => q.body.includes(searchQ) && !selectedQuestions.includes(q.id));
  }, [allQuestions, searchQ, selectedQuestions]);

  const mutation = useMutation({
    mutationFn: (data: any) => adminUpsertExam({ data: { exam: data, questionIds: selectedQuestions } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
      setIsDialogOpen(false);
      toast.success('آزمون ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت آزمون‌ها</h2>
        <Button onClick={() => { setEditingExam(null); setSelectedQuestions([]); setIsDialogOpen(true); }} size="sm" className="font-bold gap-2">
          <Plus className="size-4" /> آزمون جدید
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead className="text-right">عنوان</TableHead><TableHead className="text-right">مدت</TableHead><TableHead className="text-right">وضعیت</TableHead><TableHead className="text-right">عملیات</TableHead></TableRow></TableHeader>
          <TableBody>
            {exams?.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-bold">{e.title}</TableCell>
                <TableCell>{faNumber(e.duration_minutes)} دقیقه</TableCell>
                <TableCell><Badge>{e.is_published ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => {
                  setEditingExam(e);
                  // In real app, load existing question IDs
                  setSelectedQuestions([]); 
                  setIsDialogOpen(true);
                }}>ویرایش</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="font-black text-right">طراحی آزمون</DialogTitle></DialogHeader>
          <form className="space-y-6 py-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            mutation.mutate({
              ...editingExam,
              title: fd.get('title'),
              slug: fd.get('slug'),
              duration_minutes: Number(fd.get('duration')),
              is_published: fd.get('published') === 'on'
            });
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-xs font-bold">عنوان آزمون</label><Input name="title" defaultValue={editingExam?.title} required /></div>
              <div className="space-y-2"><label className="text-xs font-bold">نامک</label><Input name="slug" defaultValue={editingExam?.slug} required /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">زمان (دقیقه)</label>
                <Input name="duration" type="number" defaultValue={editingExam?.duration_minutes || 60} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">حداقل نمره قبولی (%)</label>
                <Input name="passing_score" type="number" defaultValue={editingExam?.passing_score || 50} />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold">نوع آزمون</label>
                 <Select name="type" defaultValue={editingExam?.exam_type || 'regular'}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="regular">معمولی</SelectItem>
                     <SelectItem value="konkur">شبیه‌ساز کنکور</SelectItem>
                     <SelectItem value="diagnostic">تعیین سطح</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 p-4 border rounded-xl bg-muted/5">
              <div className="flex items-center gap-2">
                <Checkbox id="neg_marking" name="negative_marking" defaultChecked={editingExam?.negative_marking} />
                <label htmlFor="neg_marking" className="text-xs font-bold">نمره منفی</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="rand_q" name="randomize_questions" defaultChecked={editingExam?.randomize_questions} />
                <label htmlFor="rand_q" className="text-xs font-bold">تصادفی‌سازی سوالات</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="rand_o" name="randomize_options" defaultChecked={editingExam?.randomize_options} />
                <label htmlFor="rand_o" className="text-xs font-bold">تصادفی‌سازی گزینه‌ها</label>
              </div>
            </div>

            
            <div className="space-y-4 border p-4 rounded-xl bg-muted/5">
              <h3 className="font-black text-sm flex items-center gap-2"><ClipboardList className="size-4" /> انتخاب سؤالات</h3>
              <div className="flex gap-2">
                <Input placeholder="جستجو در بانک سؤالات..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="text-xs" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 h-[300px]">
                <div className="border rounded-lg p-2 overflow-y-auto space-y-2 bg-white">
                  <p className="text-[10px] font-bold text-muted-foreground mb-2">سؤالات موجود</p>
                  {filteredQuestions.map(q => (
                    <div key={q.id} className="p-2 border rounded text-[10px] flex items-center justify-between hover:bg-muted/50">
                      <span className="truncate flex-1">{q.body}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedQuestions([...selectedQuestions, q.id])}><Plus className="size-3" /></Button>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-2 overflow-y-auto space-y-2 bg-primary/5 border-primary/20">
                  <p className="text-[10px] font-bold text-primary mb-2">سؤالات انتخاب شده ({selectedQuestions.length})</p>
                  {selectedQuestions.map((qid, idx) => {
                    const q = allQuestions?.find(x => x.id === qid);
                    return (
                      <div key={qid} className="p-2 border rounded text-[10px] flex items-center justify-between bg-white">
                        <span className="truncate flex-1 font-bold">{idx + 1}. {q?.body}</span>
                        <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => setSelectedQuestions(selectedQuestions.filter(id => id !== qid))}><Trash2 className="size-3" /></Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <Select name="status" defaultValue={editingExam?.status || 'draft'}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">پیش‌نویس</SelectItem>
                      <SelectItem value="published">منتشر شده</SelectItem>
                      <SelectItem value="archived">آرشیو</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
               <div className="flex items-center gap-2">
                 <Checkbox id="is_published_legacy" name="published" defaultChecked={editingExam?.is_published} />
                 <label htmlFor="is_published_legacy" className="text-xs font-bold">نمایش در لیست</label>
               </div>
            </div>

            
            <DialogFooter><Button type="submit" className="w-full font-bold">ذخیره نهایی آزمون</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">دسته‌بندی</label>
                  <Select name="category" defaultValue={editingArticle?.category}>
                    <SelectTrigger><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chemistry">شیمی دهم</SelectItem>
                      <SelectItem value="news">اخبار کنکور</SelectItem>
                      <SelectItem value="study">مشاوره تحصیلی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">لینک تصویر شاخص</label>
                  <Input name="featured_image" defaultValue={editingArticle?.featured_image} placeholder="https://..." />
                </div>
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

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="content">محتوا</TabsTrigger>
                  <TabsTrigger value="seo">تنظیمات سئو</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="space-y-4 pt-4">
                   <div className="flex items-center gap-2">
                    <Checkbox id="pub_article" name="published" defaultChecked={editingArticle?.is_published} />
                    <label htmlFor="pub_article" className="text-xs font-bold">انتشار فوری</label>
                  </div>
                </TabsContent>
                <TabsContent value="seo" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">عنوان سئو (SEO Title)</label>
                    <Input name="seo_title" defaultValue={editingArticle?.seo_title} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold">توضیحات متا (Meta Description)</label>
                    <Textarea name="meta_description" defaultValue={editingArticle?.meta_description} />
                  </div>
                </TabsContent>
              </Tabs>

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
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingArticle(a); setIsDialogOpen(true); }}>ویرایش</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                      if (confirm('حذف مقاله؟')) supabase.from('articles').delete().eq('id', a.id).then(() => queryClient.invalidateQueries({ queryKey: ['admin-articles'] }));
                    }}><Trash2 className="size-4" /></Button>
                  </div>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminHomepage() {
  const queryClient = useQueryClient();
  const { data: sections } = useQuery({ queryKey: ['admin-homepage'], queryFn: adminGetHomepageSections });
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت صفحه اصلی</h2>
      <div className="grid gap-4">
        {sections?.map(s => {
          const content = s.content as any;
          return (
            <div key={s.id} className="p-6 rounded-2xl border flex items-center justify-between hover:bg-muted/5 transition-colors">
              <div>
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.section_slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'فعال' : 'غیرفعال'}</Badge>
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" size="sm">ویرایش محتوا</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]" dir="rtl">
                    <DialogHeader><DialogTitle>ویرایش بخش: {s.title}</DialogTitle></DialogHeader>
                    <form className="space-y-4 py-4" onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      adminUpdateHomepageSection({ 
                        data: { 
                          id: s.id, 
                          updates: { 
                            title: fd.get('title'),
                            content: { ...content, description: fd.get('description') },
                            is_active: fd.get('active') === 'on'
                          } 
                        } 
                      }).then(() => {
                        queryClient.invalidateQueries({ queryKey: ['admin-homepage'] });
                        toast.success('تغییرات ذخیره شد');
                      });
                    }}>
                      <div className="space-y-2"><label className="text-xs font-bold">عنوان</label><Input name="title" defaultValue={s.title} /></div>
                      <div className="space-y-2"><label className="text-xs font-bold">توضیحات</label><Textarea name="description" defaultValue={content?.description || ''} /></div>
                      <div className="flex items-center gap-2"><Checkbox name="active" defaultChecked={!!s.is_active} /> <label className="text-xs font-bold">بخش فعال باشد</label></div>
                      <Button type="submit" className="w-full">ذخیره تغییرات</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
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
  const { data: curriculum } = useQuery({ 
    queryKey: ['admin-curriculum', courseId], 
    queryFn: () => adminGetCurriculum({ data: { courseId } }),
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
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingLesson(l); setIsDialogOpen(true); }}>ویرایش</Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          adminDuplicateLesson({ data: { id: l.id } }).then(() => {
                            queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
                            toast.success('درس کپی شد');
                          });
                        }}><Copy className="size-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                          if (confirm('حذف درس؟')) adminDeleteLesson({ data: { id: l.id } }).then(() => queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] }));
                        }}><Trash2 className="size-4" /></Button>
                      </div>
                    </TableCell>

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
            const chapterId = fd.get('chapter_id') as string;
            const topicId = fd.get('topic_id') as string;
            const subtopicId = fd.get('subtopic_id') as string;
            
            mutation.mutate({
              ...editingLesson,
              title: fd.get('title'),
              slug: fd.get('slug'),
              type: fd.get('type'),
              content: fd.get('content'),
              video_url: fd.get('video_url'),
              chapter_id: chapterId || null,
              topic_id: topicId || null,
              subtopic_id: subtopicId || null,
              is_free_preview: fd.get('is_free') === 'on'
            });
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-xs font-bold">عنوان</label><Input name="title" defaultValue={editingLesson?.title} required /></div>
              <div className="space-y-2"><label className="text-xs font-bold">نامک</label><Input name="slug" defaultValue={editingLesson?.slug} required /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">فصل</label>
                <Select name="chapter_id" defaultValue={editingLesson?.chapter_id}>
                  <SelectTrigger><SelectValue placeholder="انتخاب فصل..." /></SelectTrigger>
                  <SelectContent>
                    {curriculum?.chapters?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">موضوع</label>
                <Select name="topic_id" defaultValue={editingLesson?.topic_id}>
                  <SelectTrigger><SelectValue placeholder="انتخاب موضوع..." /></SelectTrigger>
                  <SelectContent>
                    {curriculum?.topics?.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">زیرمجموعه</label>
                <Select name="subtopic_id" defaultValue={editingLesson?.subtopic_id}>
                  <SelectTrigger><SelectValue placeholder="انتخاب زیرمجموعه..." /></SelectTrigger>
                  <SelectContent>
                    {curriculum?.subtopics?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">زمان تخمینی مطالعه (دقیقه)</label>
                <Input name="estimated_time" type="number" defaultValue={editingLesson?.estimated_time || 0} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">وضعیت انتشار</label>
                <Select name="status" defaultValue={editingLesson?.status || 'draft'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="published">منتشر شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><input type="checkbox" name="is_free" defaultChecked={editingLesson?.is_free_preview} /> <label className="text-xs font-bold">پیش‌نمایش رایگان</label></div>
            </div>
            <DialogFooter><Button type="submit" className="w-full font-bold">ذخیره درس</Button></DialogFooter>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminPages() {
  const queryClient = useQueryClient();
  const { data: pages, isLoading } = useQuery({ queryKey: ['admin-pages'], queryFn: adminGetPages });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => adminUpsertPage({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setIsDialogOpen(false);
      toast.success('برگه با موفقیت ذخیره شد');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeletePage({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success('برگه حذف شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">مدیریت برگه‌ها</h2>
        <Button onClick={() => { setEditingPage(null); setIsDialogOpen(true); }} size="sm" className="font-bold gap-2">
          <Plus className="size-4" /> برگه جدید
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader><DialogTitle className="text-right font-black">ویرایش برگه</DialogTitle></DialogHeader>
          <form className="space-y-4 py-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            mutation.mutate({
              ...editingPage,
              title: fd.get('title'),
              slug: fd.get('slug'),
              content: fd.get('content'),
              status: fd.get('status')
            });
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">عنوان برگه</label>
                <Input name="title" defaultValue={editingPage?.title} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">نامک (Slug)</label>
                <Input name="slug" defaultValue={editingPage?.slug} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">محتوا</label>
              <Textarea name="content" className="min-h-[300px]" defaultValue={editingPage?.content} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">وضعیت</label>
              <Select name="status" defaultValue={editingPage?.status || 'draft'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                  <SelectItem value="published">منتشر شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">ذخیره</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead className="text-right">عنوان</TableHead><TableHead className="text-right">نامک</TableHead><TableHead className="text-right">وضعیت</TableHead><TableHead className="text-right">عملیات</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">بارگذاری...</TableCell></TableRow> :
              pages?.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold">{p.title}</TableCell>
                  <TableCell>{p.slug}</TableCell>
                  <TableCell><Badge>{p.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</Badge></TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingPage(p); setIsDialogOpen(true); }}>ویرایش</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if(confirm('حذف شود؟')) deleteMutation.mutate(p.id) }}>حذف</Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminMenus() {
  const queryClient = useQueryClient();
  const { data: menus, isLoading } = useQuery({ queryKey: ['admin-menus'], queryFn: adminGetNavigationMenus });
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => adminUpdateNavigationMenu({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
      toast.success('فهرست با موفقیت ذخیره شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت فهرست‌ها</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold">فهرست‌های موجود</h3>
          {menus?.map(m => (
            <div key={m.id} className="p-4 rounded-xl border flex items-center justify-between cursor-pointer hover:border-primary" onClick={() => setSelectedMenu(m)}>
              <span>{m.name} ({m.location})</span>
              <ArrowRight className="size-4" />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setSelectedMenu({ name: 'فهرست جدید', location: 'header', items: [] })}>ایجاد فهرست جدید</Button>
        </div>

        {selectedMenu && (
          <div className="space-y-4 border p-6 rounded-2xl bg-white shadow-sm">
            <h3 className="font-bold">ویرایش {selectedMenu.name}</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold">نام فهرست</label>
              <Input value={selectedMenu.name} onChange={e => setSelectedMenu({...selectedMenu, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">مکان نمایش</label>
              <Select value={selectedMenu.location} onValueChange={v => setSelectedMenu({...selectedMenu, location: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">هدر (بالا)</SelectItem>
                  <SelectItem value="footer">فوتر (پایین)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold">آیتم‌های فهرست</label>
                <Button variant="ghost" className="h-7 text-[10px]" onClick={() => setSelectedMenu({...selectedMenu, items: [...selectedMenu.items, { label: 'آیتم جدید', url: '/' }]})}><Plus className="size-3" /> افزودن</Button>
              </div>
              <ScrollArea className="h-64 border rounded-lg p-2">
                {selectedMenu.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-2 border rounded mb-2 space-y-2 bg-muted/30">
                    <div className="flex gap-2">
                      <Input placeholder="عنوان" value={item.label} onChange={e => {
                        const newItems = [...selectedMenu.items];
                        newItems[idx].label = e.target.value;
                        setSelectedMenu({...selectedMenu, items: newItems});
                      }} />
                      <Input placeholder="لینک" value={item.url} onChange={e => {
                        const newItems = [...selectedMenu.items];
                        newItems[idx].url = e.target.value;
                        setSelectedMenu({...selectedMenu, items: newItems});
                      }} />
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                        const newItems = selectedMenu.items.filter((_: any, i: number) => i !== idx);
                        setSelectedMenu({...selectedMenu, items: newItems});
                      }}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <Button className="w-full" onClick={() => mutation.mutate(selectedMenu)}>ذخیره تغییرات فهرست</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSEO() {
  const { data: settings } = useQuery({ queryKey: ['admin-settings'], queryFn: adminGetSiteSettings });
  const mutation = useMutation({
    mutationFn: (data: any) => adminUpdateSiteSetting({ data }),
    onSuccess: () => {
      toast.success('تنظیمات سئو ذخیره شد');
    }
  });

  const getVal = (key: string) => settings?.find(s => s.key === key)?.value || "";

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-black">مدیریت سئو سراسری</h2>
      <div className="grid gap-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold">عنوان سایت</label>
          <Input defaultValue={getVal('site_title') as string} onBlur={e => mutation.mutate({ key: 'site_title', value: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold">توضیحات سایت (Meta Description)</label>
          <Textarea defaultValue={getVal('site_description') as string} onBlur={e => mutation.mutate({ key: 'site_description', value: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold">کلمات کلیدی (جدا شده با کاما)</label>
          <Input defaultValue={getVal('site_keywords') as string} onBlur={e => mutation.mutate({ key: 'site_keywords', value: e.target.value })} />
        </div>
      </div>
    </div>
  );
}


function AdminMedia() {
  const queryClient = useQueryClient();
  const { data: media, isLoading } = useQuery({ queryKey: ['admin-media'], queryFn: adminGetMedia });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteMedia({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('فایل حذف شد');
    }
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">کتابخانه رسانه</h2>
        <Button 
          size="sm" 
          className="font-bold gap-2"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = async (e: any) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              const toastId = toast.loading('در حال آپلود...');
              try {
                const filePath = `${Math.random()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                await adminAddMediaRecord({
                  data: {
                    filename: file.name,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_size: file.size
                  }
                });

                queryClient.invalidateQueries({ queryKey: ['admin-media'] });
                toast.success('فایل با موفقیت آپلود شد', { id: toastId });
              } catch (err: any) {
                toast.error(err.message || 'خطا در آپلود', { id: toastId });
              }
            };
            input.click();
          }}
        >
          <Plus className="size-4" /> آپلود رسانه
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? <div>در حال بارگذاری...</div> :
          media?.map(m => (
            <div key={m.id} className="group relative aspect-square rounded-xl border overflow-hidden bg-muted/20">
              {m.file_type.startsWith('image/') ? (
                <img src={m.file_url} alt={m.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <ImageIcon className="size-8 text-muted-foreground mb-2" />
                  <span className="text-[10px] font-bold text-center line-clamp-2">{m.filename}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="text-white" onClick={() => window.open(m.file_url, '_blank')}><Eye className="size-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if(confirm('حذف شود؟')) deleteMutation.mutate(m.id) }}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function AdminSettings() {

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <h2 className="text-xl font-black">تنظیمات پلتفرم</h2>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="general">عمومی</TabsTrigger>
          <TabsTrigger value="branding">برندینگ</TabsTrigger>
          <TabsTrigger value="learning">آموزش</TabsTrigger>
          <TabsTrigger value="security">امنیت</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6 space-y-4">
          <div className="p-6 border rounded-2xl bg-white shadow-sm max-w-md">
            <h3 className="font-bold mb-4">تنظیمات عمومی</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">نام پلتفرم</label>
                <Input defaultValue="ادیورَنک" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">ایمیل پشتیبانی</label>
                <Input defaultValue="support@edurank.ir" />
              </div>
              <Button size="sm" className="w-full">ذخیره تنظیمات</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}






