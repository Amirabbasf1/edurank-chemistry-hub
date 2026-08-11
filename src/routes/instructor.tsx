import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardList, Package, Users, Image as ImageIcon, Settings, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instructorGetStats, instructorGetCourses, instructorGetLessons, instructorGetQuestions, instructorGetExams, instructorGetStudents } from "@/lib/instructor.functions";
import { faNumber } from "@/lib/fa";

export const Route = createFileRoute("/instructor")({
  component: InstructorLayout,
});

const navItems = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'courses', label: 'دوره‌های من', icon: BookOpen },
  { id: 'lessons', label: 'مدیریت دروس', icon: GraduationCap },
  { id: 'questions', label: 'بانک سؤالات', icon: ClipboardList },
  { id: 'exams', label: 'مدیریت آزمون‌ها', icon: Package },
  { id: 'students', label: 'دانشجویان', icon: Users },
  { id: 'media', label: 'رسانه‌ها', icon: ImageIcon },
];

function InstructorLayout() {
  const { roles, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!roles.includes("instructor")) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-black text-destructive">دسترسی غیرمجاز</h1>
                <p className="mt-2">شما اجازه دسترسی به پنل اساتید را ندارید.</p>
                <Button className="mt-4" onClick={() => navigate({ to: '/' })}>بازگشت به خانه</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      <aside className="w-64 bg-white border-l shadow-sm hidden lg:block">
        <div className="h-16 flex items-center px-6 font-black text-primary text-xl">EduRank Instructor</div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === item.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-screen">
         <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <InstructorDashboard />}
            {activeTab === 'courses' && <InstructorCourses />}
            {activeTab === 'lessons' && <InstructorLessons />}
            {activeTab === 'questions' && <InstructorQuestions />}
            {activeTab === 'exams' && <InstructorExams />}
            {activeTab === 'students' && <InstructorStudents />}
            {activeTab === 'media' && <div className="p-10 text-center border-2 border-dashed rounded-2xl bg-white text-slate-500">مدیریت رسانه‌ها در نسخه بعدی فعال خواهد شد.</div>}
         </div>
      </main>
    </div>
  );
}

function InstructorDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['instructor-stats'], queryFn: instructorGetStats });
  
  if (isLoading) return <div>در حال بارگذاری آمار...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black">داشبورد مدرس</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'دوره‌های من', value: stats?.totalCourses || 0, icon: BookOpen },
          { label: 'دانشجویان فعال', value: stats?.totalStudents || 0, icon: Users },
          { label: 'دروس منتشر شده', value: stats?.totalLessons || 0, icon: GraduationCap },
          { label: 'آزمون‌ها', value: stats?.totalExams || 0, icon: Package },
        ].map((item, i) => (
          <Card key={i} className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><item.icon className="size-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold">{item.label}</p>
              <p className="text-2xl font-black">{faNumber(item.value)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InstructorCourses() {
  const { data: courses, isLoading } = useQuery({ queryKey: ['instructor-courses'], queryFn: instructorGetCourses });
  
  if (isLoading) return <div>در حال بارگذاری دوره‌ها...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-right">دوره‌های من</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map(course => (
          <Card key={course.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition">
            <div className="aspect-video bg-slate-200 relative">
              {course.image_url && <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />}
              <div className="absolute top-2 right-2">
                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>{course.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</Badge>
              </div>
            </div>
            <div className="p-6 text-right space-y-3">
              <h3 className="font-black text-lg">{course.title}</h3>
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{faNumber(course.students_count || 0)} دانشجو</span>
                <span>قیمت: {faPrice(course.price)}</span>
              </div>
              <Button variant="outline" className="w-full font-bold">مدیریت محتوا</Button>
            </div>
          </Card>
        ))}
        {courses?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-white text-slate-500">
            هنوز دوره‌ای به شما اختصاص نیافته است.
          </div>
        )}
      </div>
    </div>
  );
}

function InstructorLessons() {
  const { data: courses } = useQuery({ queryKey: ['instructor-courses'], queryFn: instructorGetCourses });
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: lessons, isLoading } = useQuery({ 
    queryKey: ['instructor-lessons', selectedCourse], 
    queryFn: () => instructorGetLessons({ data: { courseId: selectedCourse } }),
    enabled: !!selectedCourse 
  });

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">مدیریت دروس</h2>
        <div className="w-64">
           <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger><SelectValue placeholder="انتخاب دوره..." /></SelectTrigger>
              <SelectContent>
                 {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
           </Select>
        </div>
      </div>
      
      {!selectedCourse ? (
        <Card className="p-20 text-center border-dashed bg-slate-50/50">
          <GraduationCap className="size-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-500">یک دوره را برای مشاهده دروس انتخاب کنید</p>
        </Card>
      ) : isLoading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold">عنوان درس</th>
                <th className="px-6 py-4 text-right text-sm font-bold">مدت</th>
                <th className="px-6 py-4 text-right text-sm font-bold">وضعیت</th>
                <th className="px-6 py-4 text-right text-sm font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {lessons?.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold">{l.title}</td>
                  <td className="px-6 py-4">{faNumber(l.duration_minutes || 0)} دقیقه</td>
                  <td className="px-6 py-4"><Badge variant={l.is_published ? 'default' : 'secondary'}>{l.is_published ? 'منتشر شده' : 'پیش‌نویس'}</Badge></td>
                  <td className="px-6 py-4"><Button variant="ghost" size="sm">ویرایش</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InstructorQuestions() {
  const { data: courses } = useQuery({ queryKey: ['instructor-courses'], queryFn: instructorGetCourses });
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: questions, isLoading } = useQuery({ 
    queryKey: ['instructor-questions', selectedCourse], 
    queryFn: () => instructorGetQuestions({ data: { courseId: selectedCourse } }),
    enabled: !!selectedCourse 
  });

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">بانک سؤالات</h2>
        <div className="w-64">
           <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger><SelectValue placeholder="انتخاب دوره..." /></SelectTrigger>
              <SelectContent>
                 {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
           </Select>
        </div>
      </div>
      
      {!selectedCourse ? (
        <Card className="p-20 text-center border-dashed bg-slate-50/50">
          <ClipboardList className="size-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-500">یک دوره را انتخاب کنید</p>
        </Card>
      ) : isLoading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions?.map(q => (
            <Card key={q.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="font-bold flex-1 text-right">{q.body}</div>
                <Badge variant="outline" className="mr-4">{q.difficulty === 'beginner' ? 'آسان' : q.difficulty === 'intermediate' ? 'متوسط' : 'سخت'}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">ویرایش</Button>
                <Button variant="ghost" size="sm">پیش‌نمایش</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InstructorExams() {
  const { data: courses } = useQuery({ queryKey: ['instructor-courses'], queryFn: instructorGetCourses });
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: exams, isLoading } = useQuery({ 
    queryKey: ['instructor-exams', selectedCourse], 
    queryFn: () => instructorGetExams({ data: { courseId: selectedCourse } }),
    enabled: !!selectedCourse 
  });

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">مدیریت آزمون‌ها</h2>
        <div className="w-64">
           <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger><SelectValue placeholder="انتخاب دوره..." /></SelectTrigger>
              <SelectContent>
                 {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
           </Select>
        </div>
      </div>
      
      {!selectedCourse ? (
        <Card className="p-20 text-center border-dashed bg-slate-50/50">
          <Package className="size-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-500">یک دوره را انتخاب کنید</p>
        </Card>
      ) : isLoading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams?.map(e => (
            <Card key={e.id} className="p-6 text-right space-y-4">
              <h3 className="font-black text-lg">{e.title}</h3>
              <div className="space-y-1 text-sm text-slate-500 font-bold">
                <p>مدت: {faNumber(e.duration_minutes)} دقیقه</p>
                <p>تعداد سؤالات: {faNumber(e.question_count || 0)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 font-bold">آمار</Button>
                <Button variant="outline" size="sm" className="flex-1 font-bold">ویرایش</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InstructorStudents() {
  const { data: courses } = useQuery({ queryKey: ['instructor-courses'], queryFn: instructorGetCourses });
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: enrollments, isLoading } = useQuery({ 
    queryKey: ['instructor-students', selectedCourse], 
    queryFn: () => instructorGetStudents({ data: { courseId: selectedCourse } }),
    enabled: !!selectedCourse 
  });

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">دانشجویان دوره</h2>
        <div className="w-64">
           <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger><SelectValue placeholder="انتخاب دوره..." /></SelectTrigger>
              <SelectContent>
                 {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
           </Select>
        </div>
      </div>
      
      {!selectedCourse ? (
        <Card className="p-20 text-center border-dashed bg-slate-50/50">
          <Users className="size-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-500">یک دوره را انتخاب کنید</p>
        </Card>
      ) : isLoading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold">دانشجو</th>
                <th className="px-6 py-4 text-right text-sm font-bold">تاریخ ثبت‌نام</th>
                <th className="px-6 py-4 text-right text-sm font-bold">پیشرفت</th>
                <th className="px-6 py-4 text-right text-sm font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {enrollments?.map(en => (
                <tr key={en.id} className="border-b last:border-0 hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">{(en as any).profiles?.full_name?.charAt(0)}</div>
                      <span className="font-bold">{(en as any).profiles?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">{(en as any).profiles?.created_at ? faDate((en as any).profiles.created_at) : '-'}</td>
                  <td className="px-6 py-4">{faNumber(en.progress_percent || 0)}%</td>
                  <td className="px-6 py-4"><Button variant="ghost" size="sm">تحلیل</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

