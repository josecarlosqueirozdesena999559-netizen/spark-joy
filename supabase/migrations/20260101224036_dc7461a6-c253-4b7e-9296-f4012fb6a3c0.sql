-- Create function to call push notification edge function
CREATE OR REPLACE FUNCTION public.send_push_on_support()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_owner_id UUID;
  supporter_username TEXT;
  push_token TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user supports their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get supporter username
  SELECT username INTO supporter_username FROM public.profiles WHERE id = NEW.user_id;
  
  -- Check if user has push token
  SELECT p.push_token INTO push_token FROM public.profiles p WHERE p.id = post_owner_id;
  
  -- If user has push token, call edge function via http extension
  IF push_token IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://mmgaqfddxoliltgjpfzk.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userId', post_owner_id,
        'title', 'Novo apoio recebido 💜',
        'body', supporter_username || ' apoiou sua publicação',
        'data', jsonb_build_object('post_id', NEW.post_id, 'type', 'support')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for push notifications on new supports
DROP TRIGGER IF EXISTS trigger_push_on_support ON public.post_supports;
CREATE TRIGGER trigger_push_on_support
  AFTER INSERT ON public.post_supports
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_on_support();

-- Create function to call push notification on new comment
CREATE OR REPLACE FUNCTION public.send_push_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_owner_id UUID;
  commenter_username TEXT;
  push_token TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter username
  SELECT username INTO commenter_username FROM public.profiles WHERE id = NEW.user_id;
  
  -- Check if user has push token
  SELECT p.push_token INTO push_token FROM public.profiles p WHERE p.id = post_owner_id;
  
  -- If user has push token, call edge function via http extension
  IF push_token IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://mmgaqfddxoliltgjpfzk.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userId', post_owner_id,
        'title', 'Novo comentário 💬',
        'body', commenter_username || ' comentou na sua publicação',
        'data', jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'type', 'comment')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for push notifications on new comments
DROP TRIGGER IF EXISTS trigger_push_on_comment ON public.comments;
CREATE TRIGGER trigger_push_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_on_comment();