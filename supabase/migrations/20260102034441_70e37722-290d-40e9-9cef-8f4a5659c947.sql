-- Enable REPLICA IDENTITY for realtime updates on notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;