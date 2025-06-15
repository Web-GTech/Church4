-- Repertoire Songs
DROP TABLE IF EXISTS public.repertoire_songs CASCADE;
CREATE TABLE public.repertoire_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  song_key TEXT,
  bpm INTEGER,
  ministry TEXT, 
  video_url TEXT,
  cifra_url TEXT,
  letra_url TEXT,
  tags TEXT[],
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_repertoire_songs_updated BEFORE UPDATE ON public.repertoire_songs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.repertoire_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view repertoire" ON public.repertoire_songs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/creator can manage repertoire" ON public.repertoire_songs FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR created_by = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR created_by = auth.uid());