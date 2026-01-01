import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();

  const savePushToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (err) {
      console.error('Error saving push token:', err);
    }
  }, [user?.id]);

  const requestPermission = useCallback(async () => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    try {
      // Check current permission status
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        // Request permission
        const result = await PushNotifications.requestPermissions();
        
        if (result.receive !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }
      } else if (permStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();
    } catch (err) {
      console.error('Error requesting push notification permission:', err);
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user?.id) return;

    // Listen for registration success
    const registrationListener = PushNotifications.addListener(
      'registration',
      (token) => {
        console.log('Push registration success, token:', token.value);
        savePushToken(token.value);
      }
    );

    // Listen for registration errors
    const registrationErrorListener = PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('Push registration error:', error);
      }
    );

    // Listen for push notifications received
    const pushReceivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push notification received:', notification);
      }
    );

    // Listen for push notification action performed
    const pushActionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push notification action performed:', notification);
      }
    );

    // Request permission when user is logged in
    requestPermission();

    return () => {
      registrationListener.then(l => l.remove());
      registrationErrorListener.then(l => l.remove());
      pushReceivedListener.then(l => l.remove());
      pushActionListener.then(l => l.remove());
    };
  }, [user?.id, requestPermission, savePushToken]);

  return { requestPermission };
};
