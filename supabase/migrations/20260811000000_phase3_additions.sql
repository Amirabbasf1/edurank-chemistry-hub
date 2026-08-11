-- Formulas Table
CREATE TABLE IF NOT EXISTS public.formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    formula_latex TEXT NOT NULL,
    variables JSONB,
    explanation TEXT,
    example_problem TEXT,
    grade public.chemistry_grade,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT ON public.formulas TO authenticated, anon;
GRANT ALL ON public.formulas TO service_role;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read formulas" ON public.formulas FOR SELECT USING (true);

-- Commerce Tables
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    discount_price INTEGER,
    image_url TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

GRANT SELECT ON public.products TO authenticated, anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
