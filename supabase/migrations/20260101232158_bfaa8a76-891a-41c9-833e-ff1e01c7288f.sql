-- Drop existing trigger to recreate with duplicate check
DROP TRIGGER IF EXISTS on_post_support_notify ON public.post_supports;

-- Update the function to check for existing notification before creating
CREATE OR REPLACE FUNCTION public.create_support_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  post_owner_id UUID;
  supporter_username TEXT;
  existing_notification UUID;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user supports their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Check if notification already exists for this support
  SELECT id INTO existing_notification 
  FROM public.notifications 
  WHERE user_id = post_owner_id 
    AND type = 'support' 
    AND (data->>'post_id')::uuid = NEW.post_id 
    AND (data->>'supporter_id')::uuid = NEW.user_id;
  
  -- Only create if no existing notification
  IF existing_notification IS NULL THEN
    -- Get supporter username
    SELECT username INTO supporter_username FROM public.profiles WHERE id = NEW.user_id;
    
    -- Insert notification record
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      post_owner_id,
      'support',
      'Novo apoio recebido 💜',
      supporter_username || ' apoiou sua publicação',
      jsonb_build_object('post_id', NEW.post_id, 'supporter_id', NEW.user_id)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create function to delete notification when support is removed
CREATE OR REPLACE FUNCTION public.delete_support_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = OLD.post_id;
  
  -- Delete the notification for this support
  DELETE FROM public.notifications 
  WHERE user_id = post_owner_id 
    AND type = 'support' 
    AND (data->>'post_id')::uuid = OLD.post_id 
    AND (data->>'supporter_id')::uuid = OLD.user_id;
  
  RETURN OLD;
END;
$function$;

-- Recreate trigger for creating notifications
CREATE TRIGGER on_post_support_notify
  AFTER INSERT ON public.post_supports
  FOR EACH ROW
  EXECUTE FUNCTION public.create_support_notification();

-- Create trigger for deleting notifications when support is removed
DROP TRIGGER IF EXISTS on_post_support_remove_notify ON public.post_supports;
CREATE TRIGGER on_post_support_remove_notify
  AFTER DELETE ON public.post_supports
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_support_notification();