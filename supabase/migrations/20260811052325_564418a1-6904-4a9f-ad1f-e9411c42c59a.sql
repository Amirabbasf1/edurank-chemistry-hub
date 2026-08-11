-- Instructor Assignment Table
CREATE TABLE IF NOT EXISTS public.instructor_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'active', 'inactive'
    UNIQUE (instructor_id, course_id)
);

-- Grant Access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instructor_courses TO authenticated;
GRANT ALL ON public.instructor_courses TO service_role;

-- Enable RLS
ALTER TABLE public.instructor_courses ENABLE ROW LEVEL SECURITY;

-- Policies for instructor_courses
CREATE POLICY "Admins manage instructor_courses" 
ON public.instructor_courses 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Instructors view own assignments" 
ON public.instructor_courses 
FOR SELECT 
TO authenticated 
USING (auth.uid() = instructor_id);

-- Add author_id to questions if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'author_id') THEN
        ALTER TABLE public.questions ADD COLUMN author_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add instructor_id to exams if not exists (to track ownership)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'instructor_id') THEN
        ALTER TABLE public.exams ADD COLUMN instructor_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add uploader_id to media_library
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_library' AND column_name = 'uploader_id') THEN
        ALTER TABLE public.media_library ADD COLUMN uploader_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Policies for LMS tables

-- 1. Courses
CREATE POLICY "Instructors manage assigned courses" 
ON public.courses 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.instructor_courses 
        WHERE instructor_id = auth.uid() 
        AND course_id = public.courses.id
    )
);

-- 2. Chapters
CREATE POLICY "Instructors manage chapters of assigned courses" 
ON public.chapters 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.instructor_courses 
        WHERE instructor_id = auth.uid() 
        AND course_id = public.chapters.course_id
    )
);

-- 3. Topics
CREATE POLICY "Instructors manage topics of assigned courses" 
ON public.topics 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.chapters c
        JOIN public.instructor_courses ic ON ic.course_id = c.course_id
        WHERE ic.instructor_id = auth.uid() 
        AND c.id = public.topics.chapter_id
    )
);

-- 4. Subtopics
CREATE POLICY "Instructors manage subtopics of assigned courses" 
ON public.subtopics 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.topics t
        JOIN public.chapters c ON c.id = t.chapter_id
        JOIN public.instructor_courses ic ON ic.course_id = c.course_id
        WHERE ic.instructor_id = auth.uid() 
        AND t.id = public.subtopics.topic_id
    )
);

-- 5. Lessons
CREATE POLICY "Instructors manage lessons of assigned courses" 
ON public.lessons 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.instructor_courses 
        WHERE instructor_id = auth.uid() 
        AND course_id = public.lessons.course_id
    )
);

-- 6. Questions
CREATE POLICY "Instructors manage own questions" 
ON public.questions 
FOR ALL 
TO authenticated 
USING (
    (author_id = auth.uid()) OR 
    (course_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.instructor_courses 
        WHERE instructor_id = auth.uid() 
        AND course_id = public.questions.course_id
    ))
);

-- 7. Exams
CREATE POLICY "Instructors manage own exams" 
ON public.exams 
FOR ALL 
TO authenticated 
USING (
    (instructor_id = auth.uid()) OR 
    (course_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.instructor_courses 
        WHERE instructor_id = auth.uid() 
        AND course_id = public.exams.course_id
    ))
);

-- 8. Media
CREATE POLICY "Instructors manage own media" 
ON public.media_library 
FOR ALL 
TO authenticated 
USING (uploader_id = auth.uid());
