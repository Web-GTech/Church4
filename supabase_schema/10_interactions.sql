-- General Comments
DROP TABLE IF EXISTS public.general_comments CASCADE;
CREATE TABLE public.general_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL, -- 'event', 'notice'
  target_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.general_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_general_comments_target ON public.general_comments(target_type, target_id);
CREATE TRIGGER on_general_comments_updated BEFORE UPDATE ON public.general_comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.general_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth can view general comments" ON public.general_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own general comments" ON public.general_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own general comments" ON public.general_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users/Admin can delete general comments" ON public.general_comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));

-- Likes
DROP TABLE IF EXISTS public.likes CASCADE;
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL, -- 'notice', 'event', 'ebd_study', 'comment'
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, target_type, target_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own likes" ON public.likes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Auth can see likes" ON public.likes FOR SELECT TO authenticated USING (true);