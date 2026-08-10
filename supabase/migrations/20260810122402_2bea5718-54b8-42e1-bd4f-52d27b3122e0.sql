-- 1. Create Subtopics Table (if not exists with correct relations)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtopics') THEN
        CREATE TABLE public.subtopics (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
            title text NOT NULL,
            slug text NOT NULL,
            description text,
            sort_order integer DEFAULT 0,
            is_published boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtopics TO authenticated;
        GRANT ALL ON public.subtopics TO service_role;
        GRANT SELECT ON public.subtopics TO anon;
        
        ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public read access for subtopics" ON public.subtopics FOR SELECT TO public USING (true);
        CREATE POLICY "Allow staff to manage subtopics" ON public.subtopics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));
    END IF;
END $$;

-- 2. Add subtopic_id to lessons
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='subtopic_id') THEN
        ALTER TABLE public.lessons ADD COLUMN subtopic_id uuid REFERENCES public.subtopics(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='topic_id') THEN
        ALTER TABLE public.lessons ADD COLUMN topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Add topic_id to subtopics if it was missing or named differently
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subtopics' AND column_name='topic_id') THEN
        ALTER TABLE public.subtopics ADD COLUMN topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE;
    END IF;
END $$;
