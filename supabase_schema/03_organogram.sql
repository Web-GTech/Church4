-- Organogram Roles
DROP TABLE IF EXISTS public.organogram_roles CASCADE;
CREATE TABLE public.organogram_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_role_id UUID REFERENCES public.organogram_roles(id) ON DELETE SET NULL,
  order_in_hierarchy INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_organogram_roles_updated BEFORE UPDATE ON public.organogram_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.organogram_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view organogram roles" ON public.organogram_roles FOR SELECT USING (true);
CREATE POLICY "Admin can manage organogram roles" ON public.organogram_roles FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'))
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Organogram Members
DROP TABLE IF EXISTS public.organogram_members CASCADE;
CREATE TABLE public.organogram_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.organogram_roles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, role_id)
);
CREATE TRIGGER on_organogram_members_updated BEFORE UPDATE ON public.organogram_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.organogram_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view organogram members" ON public.organogram_members FOR SELECT USING (true);
CREATE POLICY "Admin can manage organogram members" ON public.organogram_members FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'))
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));