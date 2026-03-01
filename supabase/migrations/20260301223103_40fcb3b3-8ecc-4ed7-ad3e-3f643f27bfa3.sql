
-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'reporter', 'reader');

-- User roles table (FIRST - before has_role function references it)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking (BEFORE policies that use it)
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

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Reporters table
CREATE TABLE public.reporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  nid TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  designation TEXT NOT NULL DEFAULT 'সংবাদদাতা',
  photo_url TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  reporter_id TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters can view own data" ON public.reporters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Reporters can insert own data" ON public.reporters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reporters can update own data" ON public.reporters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reporters" ON public.reporters FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view approved reporters" ON public.reporters FOR SELECT USING (status = 'approved');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'reader');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reporters_updated_at BEFORE UPDATE ON public.reporters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate unique reporter ID function
CREATE OR REPLACE FUNCTION public.generate_reporter_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.reporters;
  new_id := 'BK-' || LPAD(counter::TEXT, 4, '0');
  WHILE EXISTS (SELECT 1 FROM public.reporters WHERE reporter_id = new_id) LOOP
    counter := counter + 1;
    new_id := 'BK-' || LPAD(counter::TEXT, 4, '0');
  END LOOP;
  RETURN new_id;
END;
$$;

-- Storage bucket for reporter photos
INSERT INTO storage.buckets (id, name, public) VALUES ('reporter-photos', 'reporter-photos', true);

CREATE POLICY "Anyone can view reporter photos" ON storage.objects FOR SELECT USING (bucket_id = 'reporter-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reporter-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (bucket_id = 'reporter-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
