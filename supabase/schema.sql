-- Create tables for Bariátrica Caseira Members Area

-- 1. Profiles (extending Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Members (Application level member data)
CREATE TABLE public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  first_login_required BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Products
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kiwify_product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'upsell', 'bonus')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Purchases
CREATE TABLE public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  email TEXT NOT NULL,
  kiwify_order_id TEXT UNIQUE NOT NULL,
  kiwify_product_id TEXT NOT NULL,
  product_name TEXT,
  offer_id TEXT,
  status TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'BRL',
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Member Access
CREATE TABLE public.member_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'purchase',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(member_id, product_id)
);

-- 6. Webhook Events (for logging and debug)
CREATE TABLE public.webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT DEFAULT 'kiwify',
  event_type TEXT,
  event_id TEXT,
  order_id TEXT,
  email TEXT,
  status TEXT,
  processed BOOLEAN DEFAULT false,
  raw_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Member Profiles (Onboarding Data)
CREATE TABLE public.member_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  age INTEGER,
  height_cm NUMERIC,
  current_weight_kg NUMERIC,
  imc NUMERIC,
  preferred_time TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Formula Plans (Gemini generated)
CREATE TABLE public.formula_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  input_data JSONB,
  gemini_response JSONB,
  generated_text TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Measurements (Tracker)
CREATE TABLE public.measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  weight_kg NUMERIC,
  bust_cm NUMERIC,
  waist_cm NUMERIC,
  abdomen_cm NUMERIC,
  hip_cm NUMERIC,
  thigh_cm NUMERIC,
  arm_cm NUMERIC,
  energy_level TEXT CHECK (energy_level IN ('baixa', 'media', 'alta')),
  bloating_level TEXT CHECK (bloating_level IN ('muito', 'pouco', 'nenhum')),
  clothes_fit TEXT CHECK (clothes_fit IN ('apertadas', 'normais', 'folgadas')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Assistant Messages
CREATE TABLE public.assistant_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Knowledge Base
CREATE TABLE public.knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. PDF Assets
CREATE TABLE public.pdf_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products (id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  file_path TEXT,
  file_url TEXT,
  storage_provider TEXT DEFAULT 'supabase',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. App Logs
CREATE TABLE public.app_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Members: Users can only see their own member data
CREATE POLICY "Users can view own member data" ON public.members FOR SELECT USING (auth.uid() = user_id);

-- Products: Everyone can see active products
CREATE POLICY "Public view active products" ON public.products FOR SELECT USING (active = true);

-- Purchases: Only server can see/manage purchases (for security, but maybe members can see their own)
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);

-- Member Access: Users can see what they have access to
CREATE POLICY "Users can view own access" ON public.member_access FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.members WHERE id = member_access.member_id AND user_id = auth.uid())
);

-- Member Profiles: Users manage their own profile
CREATE POLICY "Users can manage own profile" ON public.member_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.members WHERE id = member_profiles.member_id AND user_id = auth.uid())
);

-- Formula Plans: Users see their own plans
CREATE POLICY "Users can view own plans" ON public.formula_plans FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.members WHERE id = formula_plans.member_id AND user_id = auth.uid())
);

-- Measurements: Users manage their own measurements
CREATE POLICY "Users can manage own measurements" ON public.measurements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.members WHERE id = measurements.member_id AND user_id = auth.uid())
);

-- Assistant Messages: Users manage their own chat history
CREATE POLICY "Users can manage own messages" ON public.assistant_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.members WHERE id = assistant_messages.member_id AND user_id = auth.uid())
);

-- Knowledge Base: Members can read knowledge base
CREATE POLICY "Members can view knowledge base" ON public.knowledge_base FOR SELECT USING (auth.uid() IS NOT NULL);

-- PDF Assets: Members can view assets they have access to
CREATE POLICY "Members can view own pdf assets" ON public.pdf_assets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.member_access ma
    JOIN public.members m ON ma.member_id = m.id
    WHERE ma.product_id = pdf_assets.product_id AND m.user_id = auth.uid() AND ma.status = 'active'
  )
);

-- App Logs: Only server (usually no client access)
-- No public policies for logs and webhook_events to ensure security.
