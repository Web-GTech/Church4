
-- Profiles Table
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY NOT NULL, 
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'membro' NOT NULL,
  ministries TEXT[],
  avatar_url TEXT, 
  church_name TEXT,
  instagram TEXT,
  whatsapp TEXT,
  is_first_time_user BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view any profile. This is generally needed for features like chat, member lists, etc.
-- If more restrictive access is needed for specific scenarios, it should be handled by more specific policies or by filtering in the application layer after fetching.
CREATE POLICY "Authenticated users can view any profile" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (true);

-- Policy: Users can view their own profile data. (This is somewhat redundant if the above is true, but good for clarity and specific "own data" scenarios)
CREATE POLICY "Users can view their own specific profile data" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile.
CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to insert their own profile (typically handled by trigger from auth.users).
CREATE POLICY "Allow authenticated users to insert their own profile" ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can manage all profiles (optional, add if needed for admin panel functionality)
-- CREATE POLICY "Admins can manage all profiles" ON public.profiles
--   FOR ALL TO authenticated
--   USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
--   WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
