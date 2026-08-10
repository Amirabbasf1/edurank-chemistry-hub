-- Extend Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_type') THEN
        CREATE TYPE public.exam_type AS ENUM ('practice', 'chapter', 'topic', 'grade', 'konkur', 'custom');
    END IF;
END $$;

-- Update Exams table
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS type public.exam_type DEFAULT 'custom';
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES public.topics(id);
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS subtopic_id uuid REFERENCES public.subtopics(id);
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS negative_marking boolean DEFAULT false;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS passing_score numeric DEFAULT 50;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS ends_at timestamptz;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS randomize_questions boolean DEFAULT false;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS randomize_options boolean DEFAULT false;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS status public.course_status DEFAULT 'draft';

-- Update Exam Attempts
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS expected_end_at timestamptz;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS question_order uuid[]; -- Array of question IDs
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS flagged_questions uuid[] DEFAULT '{}';
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress'; -- in_progress, completed, expired

-- Update Exam Answers
ALTER TABLE public.exam_answers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);

-- RLS for exam_attempts (Safety first)
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own attempts" ON public.exam_attempts;
CREATE POLICY "Users can see their own attempts"
ON public.exam_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own attempts" ON public.exam_attempts;
CREATE POLICY "Users can create their own attempts"
ON public.exam_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own in_progress attempts" ON public.exam_attempts;
CREATE POLICY "Users can update their own in_progress attempts"
ON public.exam_attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'in_progress');

-- RLS for exam_answers
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own answers" ON public.exam_answers;
CREATE POLICY "Users can see their own answers"
ON public.exam_answers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own answers" ON public.exam_answers;
CREATE POLICY "Users can manage their own answers"
ON public.exam_answers FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.exam_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_answers TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
GRANT ALL ON public.exam_answers TO service_role;
