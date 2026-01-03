-- Recriar a função com URL hardcoded (não depende de current_setting)
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Chamar edge function via pg_net (requisição HTTP assíncrona)
  PERFORM net.http_post(
    url := 'https://mmgaqfddxoliltgjpfzk.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2FxZmRkeG9saWx0Z2pwZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTM1MTgsImV4cCI6MjA4Mjc2OTUxOH0.lF2elnUw_xI_ZBrYcvNpFH89wETZzyI1vpP-W1L6AxE'
    ),
    body := jsonb_build_object(
      'userId', NEW.user_id,
      'title', NEW.title,
      'body', NEW.message,
      'data', NEW.data
    )
  );
  
  RETURN NEW;
END;
$$;