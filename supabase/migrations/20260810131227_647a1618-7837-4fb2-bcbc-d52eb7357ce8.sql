-- Extend question_type enum
DO $$ BEGIN
    ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'calculation';
    ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'conceptual';
    ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'mixed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create concept_classification enum
DO $$ BEGIN
    CREATE TYPE public.concept_classification AS ENUM ('conceptual', 'calculation', 'memorization', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Extend questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS concept_type public.concept_classification DEFAULT 'conceptual',
ADD COLUMN IF NOT EXISTS konkur_year INTEGER,
ADD COLUMN IF NOT EXISTS exam_session TEXT,
ADD COLUMN IF NOT EXISTS chemistry_formula TEXT,
ADD COLUMN IF NOT EXISTS educational_tips TEXT,
ADD COLUMN IF NOT EXISTS estimated_solving_time INTEGER, -- in seconds
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Ensure status is using course_status enum (draft, published, archived)
-- If status was text, we might need to convert, but it seems it's already using it based on types.ts
-- Just to be safe, let's make sure it's linked if it wasn't
DO $$ BEGIN
    ALTER TABLE public.questions ALTER COLUMN status SET DEFAULT 'draft';
EXCEPTION
    WHEN others THEN null;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON public.questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_subtopic_id ON public.questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(type);

-- Grant permissions
GRANT ALL ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

-- Update RLS for questions (ensure managers can do everything)
-- Assuming app_role check is used
CREATE POLICY "Managers can manage all questions"
ON public.questions
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'content_manager') OR 
  public.has_role(auth.uid(), 'exam_manager')
);

CREATE POLICY "Students can view published questions"
ON public.questions
FOR SELECT
TO authenticated
USING (
  status = 'published' OR
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'content_manager') OR 
  public.has_role(auth.uid(), 'exam_manager')
);
