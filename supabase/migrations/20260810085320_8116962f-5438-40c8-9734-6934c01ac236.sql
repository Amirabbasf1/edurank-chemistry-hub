-- 1. Extend Course/Lesson Hierarchy
DO $$ BEGIN
    CREATE TYPE public.chemistry_grade AS ENUM ('grade_10', 'grade_11', 'grade_12', 'konkur');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.lesson_type AS ENUM ('conceptual', 'memorization', 'calculation', 'test_taking');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to existing courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS grade_type public.chemistry_grade;

-- 2. Topics Table (New Hierarchy Level)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT ON public.topics TO authenticated, anon;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add topic_id to lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id);
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS type public.lesson_type DEFAULT 'conceptual';

-- 3. Topic Mastery (Analytics)
CREATE TABLE IF NOT EXISTS public.topic_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
    mastery_score FLOAT DEFAULT 0 NOT NULL, -- 0 to 100
    last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, topic_id)
);

GRANT SELECT, INSERT, UPDATE ON public.topic_mastery TO authenticated;
GRANT ALL ON public.topic_mastery TO service_role;
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users view own mastery" ON public.topic_mastery FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users update own mastery" ON public.topic_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users upsert own mastery" ON public.topic_mastery FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Mistake Notebook
CREATE TABLE IF NOT EXISTS public.mistake_notebook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    attempts_count INTEGER DEFAULT 1 NOT NULL,
    last_attempt_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    error_pattern TEXT,
    is_resolved BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, question_id)
);

GRANT SELECT, INSERT, UPDATE ON public.mistake_notebook TO authenticated;
GRANT ALL ON public.mistake_notebook TO service_role;
ALTER TABLE public.mistake_notebook ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own mistakes" ON public.mistake_notebook FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Spaced Repetition (Reviews)
CREATE TABLE IF NOT EXISTS public.spaced_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL, -- 'topic' or 'question'
    item_id UUID NOT NULL,
    next_review_at TIMESTAMPTZ NOT NULL,
    last_interval_days INTEGER DEFAULT 1 NOT NULL,
    ease_factor FLOAT DEFAULT 2.5 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE ON public.spaced_reviews TO authenticated;
GRANT ALL ON public.spaced_reviews TO service_role;
ALTER TABLE public.spaced_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own reviews" ON public.spaced_reviews FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'system', 'course', 'exam', 'achievement'
    link TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users update read status" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Periodic Table Cache / Metadata
CREATE TABLE IF NOT EXISTS public.periodic_table (
    atomic_number INTEGER PRIMARY KEY,
    symbol TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    name_en TEXT NOT NULL,
    atomic_mass FLOAT,
    period INTEGER,
    group_num INTEGER,
    electron_configuration TEXT,
    electronegativity FLOAT,
    physical_state TEXT,
    description_fa TEXT,
    uses_fa TEXT[]
);

GRANT SELECT ON public.periodic_table TO authenticated, anon;
GRANT ALL ON public.periodic_table TO service_role;
ALTER TABLE public.periodic_table ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read periodic table" ON public.periodic_table FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. Chemistry Tools Usage Log
CREATE TABLE IF NOT EXISTS public.tool_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    tool_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT INSERT ON public.tool_usage TO authenticated, anon;
GRANT ALL ON public.tool_usage TO service_role;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Anyone log usage" ON public.tool_usage FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. AI Conversations
CREATE TABLE IF NOT EXISTS public.ai_tutor_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics(id),
    context_type TEXT, -- 'lesson', 'question', 'general'
    context_id UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_tutor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.ai_tutor_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT ON public.ai_tutor_conversations TO authenticated;
GRANT SELECT, INSERT ON public.ai_tutor_messages TO authenticated;
GRANT ALL ON public.ai_tutor_conversations TO service_role;
GRANT ALL ON public.ai_tutor_messages TO service_role;

ALTER TABLE public.ai_tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users own conversations" ON public.ai_tutor_conversations FOR ALL USING (auth.uid() = user_id);
    CREATE POLICY "Users messages in own conversations" ON public.ai_tutor_messages FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.ai_tutor_conversations WHERE id = conversation_id AND user_id = auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Update Questions with deeper metadata
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS subtopic TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type public.lesson_type;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS estimated_time_seconds INTEGER;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation_tips TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS alternative_solutions TEXT;
