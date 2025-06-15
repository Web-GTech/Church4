-- EBD Studies
DROP TABLE IF EXISTS public.ebd_studies CASCADE;
CREATE TABLE public.ebd_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  base_text TEXT,
  category TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  pdf_url TEXT,
  attachment_type TEXT, -- 'upload', 'link', 'none'
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_ebd_studies_updated BEFORE UPDATE ON public.ebd_studies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.ebd_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view EBD studies" ON public.ebd_studies FOR SELECT USING (true);
CREATE POLICY "Admin or author can manage EBD studies" ON public.ebd_studies FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR author_id = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR author_id = auth.uid());

-- EBD Comments
DROP TABLE IF EXISTS public.ebd_comments CASCADE;
CREATE TABLE public.ebd_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID REFERENCES public.ebd_studies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.ebd_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_ebd_comments_updated BEFORE UPDATE ON public.ebd_comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.ebd_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view EBD comments" ON public.ebd_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own EBD comments" ON public.ebd_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own EBD comments" ON public.ebd_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users/Admin can delete EBD comments" ON public.ebd_comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));