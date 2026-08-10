-- 1. Create subtopics table
CREATE TABLE IF NOT EXISTS public.subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(topic_id, slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtopics TO authenticated;
GRANT ALL ON public.subtopics TO service_role;
GRANT SELECT ON public.subtopics TO anon;

ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subtopics" ON public.subtopics FOR SELECT TO public USING (true);
CREATE POLICY "Staff manage subtopics" ON public.subtopics FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- 2. Add subtopic_id and new fields to content tables
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES public.subtopics(id);
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS chemistry_formula TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS practice_questions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES public.subtopics(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- 3. Create permissions table for granular control
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    resource TEXT NOT NULL, -- 'courses', 'lessons', 'users', etc.
    action TEXT NOT NULL, -- 'view', 'create', 'edit', 'delete', 'publish', 'manage'
    UNIQUE(role, resource, action)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissions" ON public.permissions
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Staff can view permissions" ON public.permissions
    FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- 4. Helper function for granular permissions
CREATE OR REPLACE FUNCTION public.check_permission(_user_id UUID, _resource TEXT, _action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.permissions p ON ur.role = p.role
    WHERE ur.user_id = _user_id
    AND p.resource = _resource
    AND p.action = _action
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'super_admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_permission(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_permission(UUID, TEXT, TEXT) TO authenticated, service_role;

-- 5. Seed default permissions
INSERT INTO public.permissions (role, resource, action)
VALUES 
('admin', 'users', 'manage'),
('admin', 'courses', 'manage'),
('content_manager', 'courses', 'edit'),
('content_manager', 'lessons', 'manage'),
('content_manager', 'articles', 'manage'),
('exam_manager', 'questions', 'manage'),
('exam_manager', 'exams', 'manage'),
('seo_manager', 'courses', 'edit'),
('seo_manager', 'articles', 'edit'),
('seo_manager', 'seo', 'manage')
ON CONFLICT DO NOTHING;
