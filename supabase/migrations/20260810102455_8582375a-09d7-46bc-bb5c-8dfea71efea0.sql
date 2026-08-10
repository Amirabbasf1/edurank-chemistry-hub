-- 1. Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    previous_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 2. Create media_library table
CREATE TABLE public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for published media" ON public.media_library
    FOR SELECT TO public USING (true);

CREATE POLICY "Staff can manage media" ON public.media_library
    FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- 3. Add status and metadata to existing content tables
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS status public.course_status DEFAULT 'draft';

-- 4. Create homepage_sections table
CREATE TABLE public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT ON public.homepage_sections TO public;
GRANT ALL ON public.homepage_sections TO authenticated;
GRANT ALL ON public.homepage_sections TO service_role;

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for homepage sections" ON public.homepage_sections
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage homepage sections" ON public.homepage_sections
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Seed default sections
INSERT INTO public.homepage_sections (section_slug, title, sort_order, content)
VALUES 
('hero', 'بخش هیرو', 1, '{"title": "آموزش شیمی به سبک مدرن", "subtitle": "از دهم تا کنکور با برترین اساتید"}'),
('featured_courses', 'دوره‌های ویژه', 2, '{"show_count": 4}'),
('stats', 'آمار پلتفرم', 3, '{"active": true}')
ON CONFLICT (section_slug) DO NOTHING;
