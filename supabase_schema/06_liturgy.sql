-- Liturgies
DROP TABLE IF EXISTS public.liturgies CASCADE;
CREATE TABLE public.liturgies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  date DATE NOT NULL,
  verse TEXT,
  is_active BOOLEAN DEFAULT FALSE NOT NULL,
  public_link_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  public_link_slug TEXT UNIQUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_liturgies_updated BEFORE UPDATE ON public.liturgies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.liturgies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active/public liturgies" ON public.liturgies FOR SELECT USING (is_active = TRUE AND public_link_enabled = TRUE);
CREATE POLICY "Auth can view all liturgies" ON public.liturgies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage liturgies" ON public.liturgies FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'))
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Liturgy Steps
DROP TABLE IF EXISTS public.liturgy_steps CASCADE;
CREATE TABLE public.liturgy_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liturgy_id UUID REFERENCES public.liturgies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, 
  responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_in_liturgy INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pendente', 
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_liturgy_steps_updated BEFORE UPDATE ON public.liturgy_steps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.liturgy_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View liturgy steps based on liturgy visibility" ON public.liturgy_steps FOR SELECT
  USING (
    (EXISTS (SELECT 1 FROM public.liturgies l WHERE l.id = liturgy_id AND l.is_active = TRUE AND l.public_link_enabled = TRUE))
    OR 
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.liturgies WHERE id = liturgy_id))
  );
CREATE POLICY "Admin can manage liturgy steps" ON public.liturgy_steps FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'))
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Liturgy Step Songs
DROP TABLE IF EXISTS public.liturgy_step_songs CASCADE;
CREATE TABLE public.liturgy_step_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liturgy_step_id UUID REFERENCES public.liturgy_steps(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.repertoire_songs(id) ON DELETE CASCADE NOT NULL,
  order_in_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(liturgy_step_id, song_id)
);
ALTER TABLE public.liturgy_step_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View songs in steps based on step visibility" ON public.liturgy_step_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.liturgy_steps ls
      JOIN public.liturgies l ON ls.liturgy_id = l.id
      WHERE ls.id = liturgy_step_id AND l.is_active = TRUE AND l.public_link_enabled = TRUE
    ) OR (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.liturgy_steps WHERE id = liturgy_step_id)
    )
  );
CREATE POLICY "Admin can manage songs in steps" ON public.liturgy_step_songs FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'))
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));