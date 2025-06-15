
-- Helper function to update 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Function to create a profile for a new user
-- This function should run with the permissions of the user who defined it (usually an admin/owner)
-- to be able to insert into public.profiles table when a new auth.users record is created.
-- Setting SECURITY DEFINER allows the function to run with the privileges of the function owner.
-- Ensure the owner of this function (typically 'postgres' role in Supabase) has INSERT rights on public.profiles.
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  profile_avatar_url TEXT;
  user_email TEXT;
BEGIN
  first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Novo');
  last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Usuário');
  profile_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  user_email := NEW.email;

  -- Check if email already exists in profiles to prevent duplicate key violation if somehow triggered multiple times or if email is not unique in auth.users but is in profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = user_email) THEN
    INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, role, is_first_time_user)
    VALUES (
      NEW.id,
      user_email,
      first_name_val,
      last_name_val,
      profile_avatar_url, 
      'membro', 
      TRUE 
    );
  ELSE
    -- Optionally, update existing profile if email matches but ID doesn't (should not happen with standard Supabase auth flow)
    -- Or simply log/ignore if profile already exists for that email.
    -- For now, we assume the trigger fires once per new user and email is unique.
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get chat rooms for a user with details
CREATE OR REPLACE FUNCTION public.get_user_chat_rooms_with_details(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  is_group_chat BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_message_content TEXT,
  last_message_at TIMESTAMPTZ,
  participants JSONB,
  is_global BOOLEAN
)
LANGUAGE plpgsql
AS $
BEGIN
  RETURN QUERY
  WITH room_participants AS (
    SELECT
      crp.room_id,
      jsonb_agg(jsonb_build_object('profiles', p.*)) AS participants_details
    FROM public.chat_room_participants crp
    JOIN public.profiles p ON crp.user_id = p.id
    GROUP BY crp.room_id
  ),
  latest_messages AS (
    SELECT
      cm.chat_room_id,
      cm.content AS last_message_content,
      cm.created_at AS last_message_at,
      ROW_NUMBER() OVER (PARTITION BY cm.chat_room_id ORDER BY cm.created_at DESC) as rn
    FROM public.chat_messages cm
  )
  SELECT
    cr.id,
    cr.name,
    cr.is_group_chat,
    cr.created_by,
    cr.created_at,
    cr.updated_at,
    lm.last_message_content,
    lm.last_message_at,
    rp.participants_details AS participants,
    (cr.id = '00000000-0000-0000-0000-000000000000') AS is_global 
  FROM public.chat_rooms cr
  JOIN public.chat_room_participants user_room_filter ON cr.id = user_room_filter.room_id AND user_room_filter.user_id = p_user_id
  LEFT JOIN room_participants rp ON cr.id = rp.room_id
  LEFT JOIN latest_messages lm ON cr.id = lm.chat_room_id AND lm.rn = 1
  ORDER BY lm.last_message_at DESC NULLS LAST, cr.updated_at DESC;
END;
$;

-- Function to get existing private chat room between two users
CREATE OR REPLACE FUNCTION public.get_existing_private_chat_room(user1_id UUID, user2_id UUID)
RETURNS UUID AS $
DECLARE
    room_id_result UUID;
BEGIN
    SELECT cr.id INTO room_id_result
    FROM public.chat_rooms cr
    JOIN public.chat_room_participants crp1 ON cr.id = crp1.room_id
    JOIN public.chat_room_participants crp2 ON cr.id = crp2.room_id
    WHERE cr.is_group_chat = FALSE
      AND crp1.user_id = user1_id
      AND crp2.user_id = user2_id
    LIMIT 1;

    RETURN room_id_result;
END;
$ LANGUAGE plpgsql;
