-- 1. Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'media' bucket
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

-- 2. Schema Enhancements
-- Ensure lessons has proper columns for the builder
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS rich_content JSONB,
ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'conceptual',
ADD COLUMN IF NOT EXISTS difficulty public.difficulty DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS prerequisites UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS related_lessons UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status public.course_status DEFAULT 'draft';

-- Grant on media_library just in case it was missed
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;

-- 3. Security Definer for deletion check
CREATE OR REPLACE FUNCTION public.check_file_usage(file_url TEXT)
RETURNS TABLE (target_type TEXT, target_id UUID, title TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 'lesson'::TEXT, id, title FROM public.lessons WHERE video_url = file_url OR content LIKE '%' || file_url || '%'
  UNION ALL
  SELECT 'course'::TEXT, id, title FROM public.courses WHERE thumbnail_url = file_url
  UNION ALL
  SELECT 'article'::TEXT, id, title FROM public.articles WHERE cover_url = file_url OR content LIKE '%' || file_url || '%';
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_file_usage(TEXT) TO authenticated;
