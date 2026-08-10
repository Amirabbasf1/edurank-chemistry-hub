CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.navigation_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT UNIQUE NOT NULL, -- e.g. 'header', 'footer'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    featured_image TEXT,
    status TEXT DEFAULT 'draft',
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure SEO columns exist in articles and courses if not already there
-- (They were mentioned as existing in context, but let's be sure)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}'::jsonb;

-- Grants
GRANT ALL ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT SELECT ON public.site_settings TO anon;

GRANT ALL ON public.navigation_menus TO authenticated;
GRANT ALL ON public.navigation_menus TO service_role;
GRANT SELECT ON public.navigation_menus TO anon;

GRANT ALL ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
GRANT SELECT ON public.pages TO anon;

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins Manage Settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Public Read Menus" ON public.navigation_menus FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins Manage Menus" ON public.navigation_menus FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Public Read Pages" ON public.pages FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins Manage Pages" ON public.pages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
