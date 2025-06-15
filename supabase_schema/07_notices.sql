
-- Notices
DROP TABLE IF EXISTS public.notices CASCADE;
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, 
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  target_audience TEXT DEFAULT 'todos', 
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, 
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_notices_updated BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all notices.
CREATE POLICY "Authenticated users can view notices" ON public.notices 
  FOR SELECT TO authenticated 
  USING (true);

-- Policy: Admin or author can manage (insert, update, delete) notices.
CREATE POLICY "Admin or author can manage notices" ON public.notices 
  FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR author_id = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR author_id = auth.uid());

-- User Notifications (Related to notices, chat, etc.)
DROP TABLE IF EXISTS public.user_notifications CASCADE;
CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, 
  related_item_id UUID, 
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, type, related_item_id)
);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON public.user_notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
