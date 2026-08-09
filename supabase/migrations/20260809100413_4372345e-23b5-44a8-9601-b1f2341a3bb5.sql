
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('student','instructor','admin','super_admin');
CREATE TYPE public.course_status AS ENUM ('draft','published','archived');
CREATE TYPE public.difficulty AS ENUM ('beginner','intermediate','advanced');
CREATE TYPE public.lesson_type AS ENUM ('video','text','pdf','quiz');
CREATE TYPE public.access_type AS ENUM ('free','paid','subscription');
CREATE TYPE public.question_type AS ENUM ('multiple_choice','true_false','short_answer','numeric');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  grade TEXT,
  bio TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public profiles are viewable" ON public.profiles FOR SELECT USING (is_public OR auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('instructor','admin','super_admin'));
$$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'));
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_categories TO anon, authenticated;
GRANT ALL ON public.course_categories TO service_role;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "staff manage categories" ON public.course_categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  instructor_name TEXT,
  category_id UUID REFERENCES public.course_categories(id) ON DELETE SET NULL,
  grade TEXT,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  lesson_count INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  access public.access_type NOT NULL DEFAULT 'paid',
  status public.course_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  students_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  objectives TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category_id);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published courses readable" ON public.courses FOR SELECT USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage courses" ON public.courses FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CHAPTERS
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
GRANT SELECT ON public.chapters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chapters public read" ON public.chapters FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.status='published' OR public.is_staff(auth.uid()))));
CREATE POLICY "staff manage chapters" ON public.chapters FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- TOPICS
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, slug)
);
GRANT SELECT ON public.topics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics public read" ON public.topics FOR SELECT USING (true);
CREATE POLICY "staff manage topics" ON public.topics FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- LESSONS
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  type public.lesson_type NOT NULL DEFAULT 'video',
  video_url TEXT,
  video_provider TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  access public.access_type NOT NULL DEFAULT 'paid',
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
CREATE INDEX idx_lessons_course ON public.lessons(course_id);
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons public read" ON public.lessons FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.status='published' OR public.is_staff(auth.uid()))));
CREATE POLICY "staff manage lessons" ON public.lessons FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LESSON RESOURCES
CREATE TABLE public.lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lesson_resources TO authenticated;
GRANT ALL ON public.lesson_resources TO service_role;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resources public read" ON public.lesson_resources FOR SELECT USING (true);
CREATE POLICY "staff manage resources" ON public.lesson_resources FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ENROLLMENTS
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollments" ON public.enrollments FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid())) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_enroll_updated BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.lesson_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BOOKMARKS + NOTES
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QUESTION BANK
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  image_url TEXT,
  explanation TEXT,
  type public.question_type NOT NULL DEFAULT 'multiple_choice',
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  grade TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  correct_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions public read" ON public.questions FOR SELECT USING (true);
CREATE POLICY "staff manage questions" ON public.questions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.question_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.question_options TO authenticated;
GRANT ALL ON public.question_options TO service_role;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options public read" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "staff manage options" ON public.question_options FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- EXAMS
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  grade TEXT,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER NOT NULL DEFAULT 20,
  question_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exams TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exams public read" ON public.exams FOR SELECT USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage exams" ON public.exams FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (exam_id, question_id)
);
GRANT SELECT ON public.exam_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam questions public read" ON public.exam_questions FOR SELECT USING (true);
CREATE POLICY "staff manage exam questions" ON public.exam_questions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts" ON public.exam_attempts FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_staff(auth.uid())) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  answer_text TEXT,
  is_correct BOOLEAN,
  UNIQUE (attempt_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_answers TO authenticated;
GRANT ALL ON public.exam_answers TO service_role;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own answers" ON public.exam_answers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ARTICLES
CREATE TABLE public.article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.article_categories TO anon, authenticated;
GRANT ALL ON public.article_categories TO service_role;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article categories read" ON public.article_categories FOR SELECT USING (true);
CREATE POLICY "admin manage article categories" ON public.article_categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  views INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  related_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_articles_published ON public.articles(is_published, published_at DESC);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles public read" ON public.articles FOR SELECT USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage articles" ON public.articles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved reviews read" ON public.reviews FOR SELECT USING (is_approved OR auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "own review write" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own review update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "own review delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- TESTIMONIALS / FAQ
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  body TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials read" ON public.testimonials FOR SELECT USING (is_published);
CREATE POLICY "admin manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs read" ON public.faqs FOR SELECT USING (is_published);
CREATE POLICY "admin manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- GAMIFICATION
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 10
);
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "admin manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements" ON public.user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED
INSERT INTO public.course_categories (slug, title, description, icon, sort_order) VALUES
('grade-10','شیمی دهم','مفاهیم پایه شیمی برای دانش‌آموزان پایه دهم','beaker',1),
('grade-11','شیمی یازدهم','ادامه مسیر یادگیری شیمی در پایه یازدهم','flask',2),
('grade-12','شیمی دوازدهم','آمادگی کامل برای امتحان نهایی شیمی دوازدهم','atom',3),
('konkur','شیمی کنکور','جمع‌بندی و تست‌زنی حرفه‌ای شیمی کنکور','target',4);

INSERT INTO public.courses (slug,title,short_description,description,instructor_name,category_id,grade,difficulty,duration_minutes,lesson_count,price,discount_price,access,status,is_featured,rating,students_count,tags,objectives,requirements,seo_title,seo_description) VALUES
('chemistry-grade-10','شیمی دهم — از کیهان تا اتم','یادگیری مفهومی کل کتاب شیمی پایه دهم با تمرین و آزمون','این دوره تمام فصل‌های کتاب شیمی دهم را به صورت مفهومی و گام‌به‌گام پوشش می‌دهد. هر درس شامل ویدیو آموزشی، جزوه متنی، تمرین و آزمون کوتاه است.','دکتر سارا احمدی',(SELECT id FROM public.course_categories WHERE slug='grade-10'),'دهم','beginner',1450,24,1490000,990000,'paid','published',true,4.80,3120,ARRAY['شیمی دهم','مفهومی','امتحان نهایی'],ARRAY['درک مفهومی ساختار اتم','تسلط بر جدول تناوبی','حل مسائل استوکیومتری پایه'],ARRAY['آشنایی با ریاضیات پایه نهم'],'آموزش شیمی دهم | دوره کامل مفهومی ادیورَنک','دوره کامل و مفهومی شیمی پایه دهم همراه با ویدیو، جزوه، تمرین و آزمون آنلاین.'),
('chemistry-grade-11','شیمی یازدهم — قدر هدایای زمینی','پوشش کامل شیمی یازدهم با تمرکز بر حل مسئله','دوره جامع شیمی یازدهم شامل آموزش مفهومی، حل تمرین‌های کتاب و آزمون‌های فصل به فصل.','مهندس رضا کریمی',(SELECT id FROM public.course_categories WHERE slug='grade-11'),'یازدهم','intermediate',1620,26,1690000,1190000,'paid','published',true,4.70,2480,ARRAY['شیمی یازدهم','حل مسئله'],ARRAY['تسلط بر آنتالپی و ترموشیمی','حل مسائل محلول‌ها','درک واکنش‌های اکسایش و کاهش'],ARRAY['گذراندن شیمی دهم'],'آموزش شیمی یازدهم | دوره جامع ادیورَنک','آموزش کامل شیمی یازدهم با ویدیو، حل تمرین و آزمون‌های استاندارد.'),
('chemistry-grade-12','شیمی دوازدهم — آمادگی امتحان نهایی','آمادگی کامل برای امتحان نهایی شیمی دوازدهم','دوره تخصصی شیمی دوازدهم با تمرکز بر امتحان نهایی، نمونه سوالات و تکنیک‌های پاسخ‌دهی.','دکتر سارا احمدی',(SELECT id FROM public.course_categories WHERE slug='grade-12'),'دوازدهم','advanced',1780,28,1890000,NULL,'paid','published',true,4.90,1960,ARRAY['شیمی دوازدهم','امتحان نهایی'],ARRAY['تسلط بر الکتروشیمی','حل مسائل سینتیک','آمادگی امتحان نهایی'],ARRAY['گذراندن شیمی یازدهم'],'آموزش شیمی دوازدهم | آمادگی امتحان نهایی','دوره آمادگی امتحان نهایی شیمی دوازدهم همراه با نمونه سوال و آزمون آنلاین.'),
('chemistry-konkur','شیمی کنکور — جمع‌بندی و تست','تست‌زنی حرفه‌ای و جمع‌بندی کل شیمی کنکور','دوره جمع‌بندی شیمی کنکور شامل تکنیک‌های تست‌زنی، زمان‌بندی و آزمون‌های شبیه‌ساز.','مهندس رضا کریمی',(SELECT id FROM public.course_categories WHERE slug='konkur'),'کنکور','advanced',2100,32,2490000,1790000,'paid','published',true,4.85,4310,ARRAY['کنکور','تست','جمع‌بندی'],ARRAY['افزایش سرعت تست‌زنی','تسلط بر مباحث پرتکرار کنکور','مدیریت زمان آزمون'],ARRAY['تسلط نسبی بر مباحث دهم تا دوازدهم'],'شیمی کنکور | دوره جمع‌بندی و تست ادیورَنک','دوره جمع‌بندی شیمی کنکور با تست‌های استاندارد، آزمون شبیه‌ساز و تحلیل عملکرد.');

INSERT INTO public.chapters (course_id,title,slug,description,sort_order)
SELECT id,'فصل اول: کیهان زادگاه الفبای هستی','chapter-1','آشنایی با ساختار اتم، طیف نشری و آرایش الکترونی',1 FROM public.courses WHERE slug='chemistry-grade-10'
UNION ALL SELECT id,'فصل دوم: ردپای گازها در زندگی','chapter-2','خواص گازها، قوانین گازی و مول',2 FROM public.courses WHERE slug='chemistry-grade-10'
UNION ALL SELECT id,'فصل سوم: آب، آهنگ زندگی','chapter-3','ساختار آب، محلول‌ها و انحلال‌پذیری',3 FROM public.courses WHERE slug='chemistry-grade-10'
UNION ALL SELECT id,'فصل اول: قدر هدایای زمینی را بدانیم','chapter-1','منابع زمین، آلکان‌ها و ترکیبات آلی',1 FROM public.courses WHERE slug='chemistry-grade-11'
UNION ALL SELECT id,'فصل دوم: در پی غذای سالم','chapter-2','ترموشیمی و آنتالپی',2 FROM public.courses WHERE slug='chemistry-grade-11'
UNION ALL SELECT id,'فصل اول: مولکول‌ها در خدمت تندرستی','chapter-1','استوکیومتری پیشرفته و بازده واکنش',1 FROM public.courses WHERE slug='chemistry-grade-12'
UNION ALL SELECT id,'فصل دوم: آسایش و رفاه در سایه شیمی','chapter-2','الکتروشیمی و سلول‌های گالوانی',2 FROM public.courses WHERE slug='chemistry-grade-12'
UNION ALL SELECT id,'جمع‌بندی مباحث پرتکرار','chapter-1','مرور سریع مباحث پرتکرار کنکور',1 FROM public.courses WHERE slug='chemistry-konkur';

INSERT INTO public.topics (chapter_id,title,slug,sort_order)
SELECT id,'ساختار اتم','atomic-structure',1 FROM public.chapters WHERE slug='chapter-1' AND course_id=(SELECT id FROM public.courses WHERE slug='chemistry-grade-10')
UNION ALL SELECT id,'جدول تناوبی','periodic-table',2 FROM public.chapters WHERE slug='chapter-1' AND course_id=(SELECT id FROM public.courses WHERE slug='chemistry-grade-10')
UNION ALL SELECT id,'استوکیومتری','stoichiometry',1 FROM public.chapters WHERE slug='chapter-1' AND course_id=(SELECT id FROM public.courses WHERE slug='chemistry-grade-12');

INSERT INTO public.lessons (course_id,chapter_id,slug,title,summary,content,type,duration_seconds,access,is_free_preview,sort_order)
SELECT c.id, ch.id, 'atom-structure','ساختار اتم و ذرات زیراتمی','آشنایی با پروتون، نوترون و الکترون و مدل‌های اتمی','در این درس با ساختار اتم آشنا می‌شویم. اتم از هسته‌ای شامل پروتون و نوترون و ابری از الکترون‌ها تشکیل شده است. عدد اتمی برابر تعداد پروتون‌ها و عدد جرمی برابر مجموع پروتون‌ها و نوترون‌هاست.','video'::public.lesson_type,920,'free'::public.access_type,true,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-1' WHERE c.slug='chemistry-grade-10'
UNION ALL
SELECT c.id, ch.id, 'emission-spectrum','طیف نشری خطی','چرا هر عنصر طیف منحصربه‌فرد دارد؟','طیف نشری خطی نتیجه بازگشت الکترون‌های برانگیخته به ترازهای پایین‌تر است. هر گذار الکترونی فوتونی با انرژی مشخص آزاد می‌کند.','video',780,'paid',false,2
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-1' WHERE c.slug='chemistry-grade-10'
UNION ALL
SELECT c.id, ch.id, 'electron-configuration','آرایش الکترونی','قواعد پرشدن اوربیتال‌ها','آرایش الکترونی بر اساس اصل آفبا، قاعده هوند و اصل طرد پاولی نوشته می‌شود.','video',1010,'paid',false,3
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-1' WHERE c.slug='chemistry-grade-10'
UNION ALL
SELECT c.id, ch.id, 'gas-laws','قوانین گازها','رابطه فشار، حجم و دما','قانون بویل، شارل و گیلوساک رفتار گازهای ایده‌آل را توصیف می‌کنند و در معادله PV=nRT خلاصه می‌شوند.','video',860,'paid',false,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-2' WHERE c.slug='chemistry-grade-10'
UNION ALL
SELECT c.id, ch.id, 'mole-concept','مفهوم مول','پل ارتباطی جرم و تعداد ذرات','یک مول برابر عدد آووگادرو ذره است. مول پل میان دنیای ماکروسکوپی و ذرات است.','video',940,'free',true,2
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-2' WHERE c.slug='chemistry-grade-10'
UNION ALL
SELECT c.id, ch.id, 'water-structure','ساختار مولکول آب','قطبیت و پیوند هیدروژنی','قطبیت مولکول آب باعث تشکیل پیوند هیدروژنی و خواص ویژه آب می‌شود.','video',700,'paid',false,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-3' WHERE c.slug='chemistry-grade-10'
UNION ALL
SELECT c.id, ch.id, 'alkanes','آلکان‌ها و نام‌گذاری','ساختار و نام‌گذاری هیدروکربن‌ها','آلکان‌ها هیدروکربن‌های سیرشده با فرمول عمومی CnH2n+2 هستند.','video',890,'free',true,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-1' WHERE c.slug='chemistry-grade-11'
UNION ALL
SELECT c.id, ch.id, 'enthalpy','آنتالپی واکنش','گرماگیر یا گرماده؟','آنتالپی تغییر محتوای گرمایی سامانه در فشار ثابت است.','video',1120,'paid',false,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-2' WHERE c.slug='chemistry-grade-11'
UNION ALL
SELECT c.id, ch.id, 'stoichiometry-advanced','استوکیومتری و بازده واکنش','محاسبه بازده درصدی','بازده درصدی نسبت مقدار عملی به مقدار نظری ضربدر صد است.','video',1240,'free',true,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-1' WHERE c.slug='chemistry-grade-12'
UNION ALL
SELECT c.id, ch.id, 'electrochemistry','سلول‌های گالوانی','تبدیل انرژی شیمیایی به الکتریکی','در سلول گالوانی واکنش اکسایش-کاهش خودبه‌خودی جریان الکتریکی تولید می‌کند.','video',1330,'paid',false,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-2' WHERE c.slug='chemistry-grade-12'
UNION ALL
SELECT c.id, ch.id, 'konkur-review','مرور سریع مباحث پرتکرار','۲۰ نکته کلیدی کنکور','در این درس مهم‌ترین نکات پرتکرار کنکور شیمی مرور می‌شود.','video',1500,'free',true,1
FROM public.courses c JOIN public.chapters ch ON ch.course_id=c.id AND ch.slug='chapter-1' WHERE c.slug='chemistry-konkur';

INSERT INTO public.article_categories (slug,title,description,sort_order) VALUES
('chemistry-10','شیمی دهم','آموزش و نکات شیمی پایه دهم',1),
('chemistry-11','شیمی یازدهم','آموزش و نکات شیمی پایه یازدهم',2),
('chemistry-12','شیمی دوازدهم','آموزش و نکات شیمی پایه دوازدهم',3),
('konkur','شیمی کنکور','نکات تستی و راهبردهای کنکور',4),
('study-methods','روش مطالعه','بهترین روش‌های مطالعه شیمی',5);

INSERT INTO public.articles (slug,title,excerpt,content,category_id,author_name,tags,reading_minutes,views,is_featured,related_course_id,seo_title,seo_description) VALUES
('stoichiometry','آموزش استوکیومتری از صفر تا صد','استوکیومتری چیست و چگونه مسائل آن را گام‌به‌گام حل کنیم؟','## استوکیومتری چیست؟
استوکیومتری شاخه‌ای از شیمی است که به بررسی روابط کمی میان مواد شرکت‌کننده در یک واکنش شیمیایی می‌پردازد.

## مفاهیم پایه
برای حل مسائل استوکیومتری باید با مفهوم مول، جرم مولی و موازنه واکنش آشنا باشید.

## مراحل حل مسئله
۱. واکنش را موازنه کنید.
۲. مقدار داده‌شده را به مول تبدیل کنید.
۳. با ضرایب استوکیومتری به مول ماده خواسته‌شده برسید.
۴. مول را به جرم یا حجم تبدیل کنید.

## اشتباهات رایج
موازنه نکردن واکنش، فراموش کردن ماده محدودکننده و اشتباه در جرم مولی.

## تمرین
اگر ۴ گرم هیدروژن با اکسیژن کافی واکنش دهد، چند گرم آب تولید می‌شود؟',(SELECT id FROM public.article_categories WHERE slug='chemistry-12'),'دکتر سارا احمدی',ARRAY['استوکیومتری','حل مسئله','شیمی دوازدهم'],8,1240,true,(SELECT id FROM public.courses WHERE slug='chemistry-grade-12'),'آموزش استوکیومتری | حل مسئله گام‌به‌گام','آموزش کامل استوکیومتری، مفهوم مول، موازنه واکنش و روش حل مسائل به زبان ساده.'),
('periodic-table','جدول تناوبی را چگونه یاد بگیریم؟','راهنمای کامل درک روندهای تناوبی به جای حفظ کردن','## چرا جدول تناوبی مهم است؟
جدول تناوبی نقشه راه شیمی است.

## روندهای تناوبی
شعاع اتمی، انرژی یونش و الکترونگاتیوی مهم‌ترین روندها هستند.

## روش یادگیری
به جای حفظ، منطق ساختار الکترونی را درک کنید.',(SELECT id FROM public.article_categories WHERE slug='chemistry-10'),'دکتر سارا احمدی',ARRAY['جدول تناوبی','شیمی دهم'],6,980,false,(SELECT id FROM public.courses WHERE slug='chemistry-grade-10'),'آموزش جدول تناوبی عناصر | ادیورَنک','یادگیری مفهومی جدول تناوبی، روندهای تناوبی و روش درست مطالعه آن.'),
('konkur-chemistry-tips','چگونه در شیمی کنکور درصد بالا بزنیم؟','راهبردهای عملی برای افزایش درصد شیمی کنکور','## اولویت‌بندی مباحث
مباحث پرتکرار را زودتر جمع‌بندی کنید.

## تست‌زنی هدفمند
هر تست را تحلیل کنید، نه فقط پاسخ دهید.

## مدیریت زمان
برای هر تست شیمی حدود ۵۰ ثانیه در نظر بگیرید.',(SELECT id FROM public.article_categories WHERE slug='konkur'),'مهندس رضا کریمی',ARRAY['کنکور','تست','روش مطالعه'],7,2310,false,(SELECT id FROM public.courses WHERE slug='chemistry-konkur'),'نکات شیمی کنکور | افزایش درصد','راهبردهای عملی تست‌زنی و جمع‌بندی برای رسیدن به درصد بالا در شیمی کنکور.'),
('acid-base','اسید و باز چیست؟','تعریف‌های آرنیوس، برونستد-لوری و لوئیس به زبان ساده','## تعریف آرنیوس
اسید در آب یون H+ آزاد می‌کند.

## تعریف برونستد-لوری
اسید دهنده پروتون و باز گیرنده پروتون است.

## تعریف لوئیس
اسید گیرنده جفت الکترون است.',(SELECT id FROM public.article_categories WHERE slug='chemistry-11'),'مهندس رضا کریمی',ARRAY['اسید و باز','شیمی یازدهم'],5,760,false,(SELECT id FROM public.courses WHERE slug='chemistry-grade-11'),'اسید و باز چیست؟ | آموزش مفهومی','آشنایی با تعریف‌های اسید و باز و کاربرد آن‌ها در حل مسائل شیمی.'),
('how-to-study-chemistry','بهترین روش مطالعه شیمی','برنامه‌ریزی مؤثر برای یادگیری عمیق شیمی','## یادگیری مفهومی
شیمی حفظیات نیست؛ زنجیره مفاهیم است.

## تمرین روزانه
روزی ۳۰ دقیقه تمرین بهتر از ۵ ساعت در آخر هفته است.

## مرور فاصله‌دار
از تکنیک مرور فاصله‌دار استفاده کنید.',(SELECT id FROM public.article_categories WHERE slug='study-methods'),'دکتر سارا احمدی',ARRAY['روش مطالعه','برنامه‌ریزی'],6,1520,false,NULL,'بهترین روش مطالعه شیمی | راهنمای کامل','راهنمای عملی برنامه‌ریزی و مطالعه مؤثر شیمی برای دانش‌آموزان و کنکوری‌ها.');

INSERT INTO public.faqs (question,answer,scope,sort_order) VALUES
('دوره‌های ادیورَنک برای چه پایه‌هایی است؟','دوره‌ها برای پایه‌های دهم، یازدهم، دوازدهم و داوطلبان کنکور طراحی شده‌اند.','general',1),
('آیا امکان مشاهده نمونه درس رایگان وجود دارد؟','بله، در هر دوره چند درس به صورت پیش‌نمایش رایگان در دسترس است.','general',2),
('پس از ثبت‌نام تا چه مدت به دوره دسترسی دارم؟','دسترسی شما به دوره دائمی است و محدودیت زمانی ندارد.','general',3),
('آیا آزمون‌ها استاندارد هستند؟','آزمون‌ها بر اساس بودجه‌بندی کتاب درسی و الگوی کنکور طراحی شده‌اند.','general',4),
('آیا گواهی پایان دوره صادر می‌شود؟','بله، پس از تکمیل دوره گواهی معتبر با کد رهگیری صادر می‌شود.','general',5);

INSERT INTO public.testimonials (name,role,body,rating,sort_order) VALUES
('نگار موسوی','دانش‌آموز پایه دوازدهم','با ادیورَنک بالاخره استوکیومتری برام جا افتاد. آزمون‌ها دقیقاً نقاط ضعفم رو نشون داد.',5,1),
('امیرحسین رضایی','داوطلب کنکور','درصد شیمی من از ۳۵ به ۷۸ رسید. تحلیل عملکرد بعد از هر آزمون فوق‌العاده بود.',5,2),
('فاطمه کاظمی','دانش‌آموز پایه یازدهم','ویدیوها کوتاه و دقیق هستن و می‌تونم هر جا موندم دوباره ادامه بدم.',5,3);

INSERT INTO public.achievements (code,title,description,icon,xp_reward) VALUES
('first_lesson','اولین قدم','اولین درس خود را کامل کردید','play',20),
('first_exam','اولین آزمون','در اولین آزمون شرکت کردید','clipboard',30),
('ten_lessons','ده درس','ده درس را کامل کردید','layers',60),
('streak_7','هفت روز متوالی','۷ روز پیاپی مطالعه کردید','flame',100),
('perfect_score','نمره کامل','در یک آزمون نمره کامل گرفتید','trophy',150);

INSERT INTO public.exams (slug,title,description,course_id,grade,difficulty,duration_minutes,question_count) VALUES
('grade-10-chapter-1','آزمون فصل اول شیمی دهم','آزمون چهار سؤالی از ساختار اتم و آرایش الکترونی',(SELECT id FROM public.courses WHERE slug='chemistry-grade-10'),'دهم','beginner',10,4),
('konkur-mini-test','آزمون کوتاه شیمی کنکور','آزمون سریع از مباحث پرتکرار کنکور',(SELECT id FROM public.courses WHERE slug='chemistry-konkur'),'کنکور','advanced',10,3);

INSERT INTO public.questions (body,explanation,type,difficulty,grade,course_id,points,tags) VALUES
('عدد اتمی یک عنصر برابر با کدام کمیت است؟','عدد اتمی برابر تعداد پروتون‌های هسته است.','multiple_choice','beginner','دهم',(SELECT id FROM public.courses WHERE slug='chemistry-grade-10'),1,ARRAY['ساختار اتم']),
('آرایش الکترونی عنصر با عدد اتمی ۱۱ کدام است؟','سدیم با ۱۱ الکترون آرایش 1s2 2s2 2p6 3s1 دارد.','multiple_choice','beginner','دهم',(SELECT id FROM public.courses WHERE slug='chemistry-grade-10'),1,ARRAY['آرایش الکترونی']),
('طیف نشری خطی هر عنصر منحصربه‌فرد است.','هر عنصر ترازهای انرژی ویژه خود را دارد، پس طیف آن یکتاست.','true_false','beginner','دهم',(SELECT id FROM public.courses WHERE slug='chemistry-grade-10'),1,ARRAY['طیف نشری']),
('در یک دوره جدول تناوبی، شعاع اتمی از چپ به راست چگونه تغییر می‌کند؟','با افزایش بار مؤثر هسته، شعاع اتمی کاهش می‌یابد.','multiple_choice','intermediate','دهم',(SELECT id FROM public.courses WHERE slug='chemistry-grade-10'),1,ARRAY['جدول تناوبی']),
('در سلول گالوانی، اکسایش در کدام الکترود رخ می‌دهد؟','اکسایش همواره در آند انجام می‌شود.','multiple_choice','advanced','کنکور',(SELECT id FROM public.courses WHERE slug='chemistry-konkur'),1,ARRAY['الکتروشیمی']),
('بازده درصدی یک واکنش می‌تواند بیشتر از ۱۰۰ درصد باشد.','بازده واقعی هیچ‌گاه از مقدار نظری بیشتر نمی‌شود.','true_false','intermediate','کنکور',(SELECT id FROM public.courses WHERE slug='chemistry-konkur'),1,ARRAY['استوکیومتری']),
('کدام گزینه درباره پیوند هیدروژنی در آب درست است؟','پیوند هیدروژنی عامل نقطه جوش بالای آب است.','multiple_choice','intermediate','کنکور',(SELECT id FROM public.courses WHERE slug='chemistry-konkur'),1,ARRAY['آب']);

INSERT INTO public.question_options (question_id,body,is_correct,sort_order)
SELECT id,'تعداد پروتون‌ها',true,1 FROM public.questions WHERE body LIKE 'عدد اتمی%'
UNION ALL SELECT id,'تعداد نوترون‌ها',false,2 FROM public.questions WHERE body LIKE 'عدد اتمی%'
UNION ALL SELECT id,'مجموع پروتون و نوترون',false,3 FROM public.questions WHERE body LIKE 'عدد اتمی%'
UNION ALL SELECT id,'جرم اتمی میانگین',false,4 FROM public.questions WHERE body LIKE 'عدد اتمی%'
UNION ALL SELECT id,'1s2 2s2 2p6 3s1',true,1 FROM public.questions WHERE body LIKE 'آرایش الکترونی عنصر%'
UNION ALL SELECT id,'1s2 2s2 2p6',false,2 FROM public.questions WHERE body LIKE 'آرایش الکترونی عنصر%'
UNION ALL SELECT id,'1s2 2s2 2p5 3s2',false,3 FROM public.questions WHERE body LIKE 'آرایش الکترونی عنصر%'
UNION ALL SELECT id,'1s2 2s2 2p6 3s2',false,4 FROM public.questions WHERE body LIKE 'آرایش الکترونی عنصر%'
UNION ALL SELECT id,'درست',true,1 FROM public.questions WHERE body LIKE 'طیف نشری خطی%'
UNION ALL SELECT id,'نادرست',false,2 FROM public.questions WHERE body LIKE 'طیف نشری خطی%'
UNION ALL SELECT id,'کاهش می‌یابد',true,1 FROM public.questions WHERE body LIKE 'در یک دوره جدول تناوبی%'
UNION ALL SELECT id,'افزایش می‌یابد',false,2 FROM public.questions WHERE body LIKE 'در یک دوره جدول تناوبی%'
UNION ALL SELECT id,'تغییر نمی‌کند',false,3 FROM public.questions WHERE body LIKE 'در یک دوره جدول تناوبی%'
UNION ALL SELECT id,'ابتدا افزایش سپس کاهش',false,4 FROM public.questions WHERE body LIKE 'در یک دوره جدول تناوبی%'
UNION ALL SELECT id,'آند',true,1 FROM public.questions WHERE body LIKE 'در سلول گالوانی%'
UNION ALL SELECT id,'کاتد',false,2 FROM public.questions WHERE body LIKE 'در سلول گالوانی%'
UNION ALL SELECT id,'پل نمکی',false,3 FROM public.questions WHERE body LIKE 'در سلول گالوانی%'
UNION ALL SELECT id,'هر دو الکترود',false,4 FROM public.questions WHERE body LIKE 'در سلول گالوانی%'
UNION ALL SELECT id,'درست',false,1 FROM public.questions WHERE body LIKE 'بازده درصدی%'
UNION ALL SELECT id,'نادرست',true,2 FROM public.questions WHERE body LIKE 'بازده درصدی%'
UNION ALL SELECT id,'باعث نقطه جوش بالای آب می‌شود',true,1 FROM public.questions WHERE body LIKE 'کدام گزینه درباره پیوند هیدروژنی%'
UNION ALL SELECT id,'یک پیوند کووالانسی قوی است',false,2 FROM public.questions WHERE body LIKE 'کدام گزینه درباره پیوند هیدروژنی%'
UNION ALL SELECT id,'در یخ وجود ندارد',false,3 FROM public.questions WHERE body LIKE 'کدام گزینه درباره پیوند هیدروژنی%'
UNION ALL SELECT id,'باعث کاهش گرمای ویژه آب می‌شود',false,4 FROM public.questions WHERE body LIKE 'کدام گزینه درباره پیوند هیدروژنی%';

INSERT INTO public.exam_questions (exam_id,question_id,sort_order)
SELECT (SELECT id FROM public.exams WHERE slug='grade-10-chapter-1'), q.id, row_number() OVER (ORDER BY q.created_at)
FROM public.questions q WHERE q.grade='دهم';
INSERT INTO public.exam_questions (exam_id,question_id,sort_order)
SELECT (SELECT id FROM public.exams WHERE slug='konkur-mini-test'), q.id, row_number() OVER (ORDER BY q.created_at)
FROM public.questions q WHERE q.grade='کنکور';
