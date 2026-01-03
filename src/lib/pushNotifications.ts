import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

let listenersRegistered = false;

/**
 * Registers push notifications and saves the FCM token to push_tokens table.
 * Only works on native platforms (Android/iOS).
 * Must be called after user authentication.
 */
export const registerPushToken = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No authenticated user, skipping push registration');
      return;
    }

    const permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive !== 'granted') {
      const request = await PushNotifications.requestPermissions();
      if (request.receive !== 'granted') {
        console.log('Push permission denied');
        return;
      }
    }

    if (!listenersRegistered) {
      PushNotifications.addListener('registration', async (token) => {
        console.log('FCM token received:', token.value);

        const platform = Capacitor.getPlatform(); // 'android' or 'ios'

        const { error } = await supabase
          .from('push_tokens')
          .upsert(
            {
              user_id: user.id,
              token: token.value,
              platform: platform
            },
            { onConflict: 'token' }
          );

        if (error) {
          console.error('Error saving push token:', error);
        } else {
          console.log('Push token saved successfully');
        }
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration error:', err);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });

      listenersRegistered = true;
    }

    await PushNotifications.register();

  } catch (error) {
    console.error('Failed to register push notifications:', error);
  }
};

/**
 * Removes all push notification listeners and resets registration state.
 * Call this on logout.
 */
export const cleanupPushNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await PushNotifications.removeAllListeners();
    listenersRegistered = false;
    console.log('Push notification listeners cleaned up');
  } catch (error) {
    console.error('Error cleaning up push notifications:', error);
  }
};

/**
 * Removes the current user's push token from the database.
 * Call this on logout to stop receiving notifications on this device.
 */
export const removePushToken = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing push token:', error);
      } else {
        console.log('Push token removed successfully');
      }
    }
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};
