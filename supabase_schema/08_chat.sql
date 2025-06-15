
-- Chat Rooms
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group_chat BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_chat_rooms_updated BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see chat rooms they are part of, or any group chat if it's public (e.g. global chat).
CREATE POLICY "Users can see own or group chats" ON public.chat_rooms 
  FOR SELECT TO authenticated
  USING (
    (is_group_chat = TRUE AND id = '00000000-0000-0000-0000-000000000000') -- Allow access to global chat
    OR 
    EXISTS (
      SELECT 1 FROM public.chat_room_participants crp 
      WHERE crp.room_id = public.chat_rooms.id AND crp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create chat rooms" ON public.chat_rooms 
  FOR INSERT TO authenticated 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admin or creator can manage chat rooms" ON public.chat_rooms 
  FOR UPDATE, DELETE TO authenticated
  USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR created_by = auth.uid())
  WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') OR created_by = auth.uid());


-- Chat Room Participants
DROP TABLE IF EXISTS public.chat_room_participants CASCADE;
CREATE TABLE public.chat_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen_message_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);
ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see participants of rooms they are in. Admins/Creators can see all for rooms they manage.
CREATE POLICY "Users can see participants of their rooms" ON public.chat_room_participants 
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_participants self_crp
      WHERE self_crp.room_id = public.chat_room_participants.room_id AND self_crp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin or Room Creator can manage participants" ON public.chat_room_participants 
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr 
      WHERE cr.id = public.chat_room_participants.room_id AND cr.created_by = auth.uid()
    ) OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr 
      WHERE cr.id = public.chat_room_participants.room_id AND cr.created_by = auth.uid()
    ) OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  );


-- Chat Messages
DROP TABLE IF EXISTS public.chat_messages CASCADE;
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER on_chat_messages_updated BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in rooms they are part of.
CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages 
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_participants crp 
      WHERE crp.room_id = public.chat_messages.room_id AND crp.user_id = auth.uid()
    )
  );

-- Policy: Users can send messages in rooms they are part of.
CREATE POLICY "Users can send messages in their rooms" ON public.chat_messages 
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.chat_room_participants crp 
      WHERE crp.room_id = public.chat_messages.room_id AND crp.user_id = auth.uid()
    )
  );

-- Policy: Users can update/delete their own messages. Admins can manage all.
CREATE POLICY "Users can manage own messages, Admins can manage all" ON public.chat_messages 
  FOR UPDATE, DELETE TO authenticated 
  USING (
    sender_id = auth.uid() OR 
    ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  );
