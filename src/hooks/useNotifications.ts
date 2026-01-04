import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: unknown;
  read_at: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read_at).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      toast({
        title: 'Notificações marcadas como lidas',
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user?.id, toast]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [user?.id, notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime updates for notifications
  useEffect(() => {
    if (!user?.id) return;

    // Clean up previous channel if exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          
          // Update state immediately with new notification
          setNotifications(prev => {
            // Check if notification already exists to prevent duplicates
            if (prev.some(n => n.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
          setUnreadCount(prev => prev + 1);
          
          // Note: Removed toast for in-app notifications to avoid interruption
          // Push notifications are handled separately for native platforms
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification updated:', payload);
          const updatedNotification = payload.new as Notification;
          setNotifications(prev =>
            prev.map(n =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
          // Recalculate unread count
          setNotifications(prev => {
            setUnreadCount(prev.filter(n => !n.read_at).length);
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification deleted:', payload);
          const deletedNotification = payload.old as { id: string };
          setNotifications(prev => {
            const notification = prev.find(n => n.id === deletedNotification.id);
            if (notification && !notification.read_at) {
              setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== deletedNotification.id);
          });
        }
      )
      .subscribe((status) => {
        console.log('Notifications realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications realtime updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, toast]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
