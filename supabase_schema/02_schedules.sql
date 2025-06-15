-- Schedules (Escalas)
DROP TABLE IF EXISTS public.schedules CASCADE;
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_schedules_updated BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view schedules" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin or creator can manage schedules" ON public.schedules FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR created_by = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR created_by = auth.uid());

-- Schedule Participants
DROP TABLE IF EXISTS public.schedule_participants CASCADE;
CREATE TABLE public.schedule_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_in_schedule TEXT,
  status TEXT DEFAULT 'pending', 
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(schedule_id, user_id, role_in_schedule)
);
CREATE TRIGGER on_schedule_participants_updated BEFORE UPDATE ON public.schedule_participants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.schedule_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view participants" ON public.schedule_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/creator can manage participants" ON public.schedule_participants FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR EXISTS (SELECT 1 FROM public.schedules WHERE id = schedule_id AND created_by = auth.uid()))
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR EXISTS (SELECT 1 FROM public.schedules WHERE id = schedule_id AND created_by = auth.uid()));
CREATE POLICY "Users can update own participation" ON public.schedule_participants FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());