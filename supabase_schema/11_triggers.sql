
-- TRIGGERS FOR COUNTS (Likes and Comments) AND PROFILE CREATION

-- Trigger function to update likes_count on relevant tables
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.target_type = 'notice') THEN
      UPDATE public.notices SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF (NEW.target_type = 'ebd_study') THEN
      UPDATE public.ebd_studies SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF (NEW.target_type = 'event') THEN
      UPDATE public.events SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.target_type = 'notice') THEN
      UPDATE public.notices SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    ELSIF (OLD.target_type = 'ebd_study') THEN
      UPDATE public.ebd_studies SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    ELSIF (OLD.target_type = 'event') THEN
      UPDATE public.events SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL; 
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_like_change ON public.likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_likes_count();


-- Trigger function to update comments_count on ebd_studies
CREATE OR REPLACE FUNCTION public.update_ebd_comments_count()
RETURNS TRIGGER AS $
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.ebd_studies SET comments_count = comments_count + 1 WHERE id = NEW.study_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.ebd_studies SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.study_id;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_ebd_comment_change ON public.ebd_comments;
CREATE TRIGGER on_ebd_comment_change
  AFTER INSERT OR DELETE ON public.ebd_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ebd_comments_count();


-- Trigger function to update comments_count on notices and events
CREATE OR REPLACE FUNCTION public.update_general_comments_count()
RETURNS TRIGGER AS $
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.target_type = 'notice') THEN
      UPDATE public.notices SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    ELSIF (NEW.target_type = 'event') THEN
      UPDATE public.events SET comments_count = comments_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.target_type = 'notice') THEN
      UPDATE public.notices SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.target_id;
    ELSIF (OLD.target_type = 'event') THEN
      UPDATE public.events SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL; 
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_general_comment_change ON public.general_comments;
CREATE TRIGGER on_general_comment_change
  AFTER INSERT OR DELETE ON public.general_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_general_comments_count();

-- Trigger to create a profile when a new user signs up in auth.users
-- Ensures the function public.create_profile_for_new_user (defined with SECURITY DEFINER) is called.
-- The owner of the function 'create_profile_for_new_user' must have INSERT privileges on 'public.profiles'.
-- In Supabase, this is typically the 'postgres' role.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();
