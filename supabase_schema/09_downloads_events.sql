-- Downloads
DROP TABLE IF EXISTS public.downloads CASCADE;
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_type TEXT, 
  file_name TEXT,
  file_size_kb INTEGER,
  file_url TEXT NOT NULL, 
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_downloads_updated BEFORE UPDATE ON public.downloads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view public downloads" ON public.downloads FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Auth can view all downloads" ON public.downloads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/uploader can manage downloads" ON public.downloads FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR uploader_id = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR uploader_id = auth.uid());

-- Events
DROP TABLE IF EXISTS public.events CASCADE;
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin/organizer can manage events" ON public.events FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR organizer_id = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR organizer_id = auth.uid());