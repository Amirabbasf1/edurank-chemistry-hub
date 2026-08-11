import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardList, Package, Users, Image as ImageIcon, Settings, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instructorGetStats } from "@/lib/instructor.functions";
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
      <main className="flex-1 p-6 lg:p-10">
         <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <InstructorDashboard />}
            {activeTab !== 'dashboard' && <div className="p-10 text-center border-2 border-dashed rounded-2xl bg-white text-slate-500">این بخش در حال توسعه است.</div>}
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
