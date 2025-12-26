-- GALORAS DATABASE SCHEMA
-- Full MVP: Users, Coaches, Categories, Events, Messages, Leads

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'coach', 'admin');

-- Create enum for coach status
CREATE TYPE public.coach_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for message status
CREATE TYPE public.message_status AS ENUM ('sent', 'read', 'archived');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'closed');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER ROLES TABLE
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Users can view own roles" 
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- COACHING CATEGORIES TABLE
-- ============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- Seed initial categories
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
  ('Leadership', 'leadership', 'Executive and leadership development coaching', 'crown', 1),
  ('Career', 'career', 'Career transitions, growth, and professional development', 'briefcase', 2),
  ('Performance', 'performance', 'Peak performance, productivity, and execution', 'target', 3),
  ('Mindset & Well-Being', 'mindset', 'Mental resilience, burnout recovery, and wellness', 'brain', 4),
  ('Communication & Confidence', 'communication', 'Public speaking, presence, and interpersonal skills', 'message-circle', 5),
  ('Life Transitions', 'transitions', 'Life changes, identity shifts, and personal growth', 'compass', 6);

-- ============================================
-- COACHES TABLE
-- ============================================
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  specialties TEXT[],
  coaching_style TEXT,
  signature_framework TEXT,
  experience_years INTEGER,
  hourly_rate INTEGER,
  location TEXT,
  timezone TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  linkedin_url TEXT,
  website_url TEXT,
  status coach_status DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  is_enterprise_ready BOOLEAN DEFAULT false,
  total_sessions INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- Coaches policies
CREATE POLICY "Approved coaches are viewable by everyone" 
  ON public.coaches FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own coach profile" 
  ON public.coaches FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own coach profile" 
  ON public.coaches FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach profile" 
  ON public.coaches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COACH CATEGORIES JUNCTION TABLE
-- ============================================
CREATE TABLE public.coach_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (coach_id, category_id)
);

ALTER TABLE public.coach_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach categories are viewable by everyone" 
  ON public.coach_categories FOR SELECT USING (true);

CREATE POLICY "Coaches can manage own categories" 
  ON public.coach_categories FOR ALL USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

-- ============================================
-- COACH TESTIMONIALS TABLE
-- ============================================
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_company TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone" 
  ON public.testimonials FOR SELECT USING (true);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  event_type TEXT NOT NULL, -- 'workshop', 'webinar', 'retreat', 'circle'
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT true,
  registration_url TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are viewable by everyone" 
  ON public.events FOR SELECT USING (is_published = true);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" 
  ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" 
  ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================
-- B2B LEADS TABLE
-- ============================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_size TEXT,
  industry TEXT,
  interest TEXT[], -- Array of interested services
  message TEXT,
  source TEXT DEFAULT 'website',
  status lead_status DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads are insertable by anyone (public form)
CREATE POLICY "Anyone can submit a lead" 
  ON public.leads FOR INSERT WITH CHECK (true);

-- ============================================
-- COACH APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.coach_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  experience_years INTEGER,
  specialties TEXT[],
  bio TEXT,
  why_galoras TEXT,
  certifications TEXT,
  status coach_status DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.coach_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can apply to be a coach
CREATE POLICY "Anyone can submit coach application" 
  ON public.coach_applications FOR INSERT WITH CHECK (true);

-- ============================================
-- ARTICLES/CONTENT TABLE
-- ============================================
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author_name TEXT,
  author_avatar TEXT,
  category TEXT,
  tags TEXT[],
  read_time INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone" 
  ON public.articles FOR SELECT USING (is_published = true);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
