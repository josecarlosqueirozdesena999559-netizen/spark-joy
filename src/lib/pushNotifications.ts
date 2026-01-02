import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

/**
 * Registers push notifications and saves the token for a specific user.
 * This function can be called imperatively after signup.
 */
export const registerPushToken = async (userId: string): Promise<void> => {
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

    // Create a promise that resolves when we get the token
    const tokenPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Push token registration timeout'));
      }, 10000); // 10 second timeout

      PushNotifications.addListener('registration', (token) => {
        clearTimeout(timeout);
        console.log('Push registration success, token:', token.value);
        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        clearTimeout(timeout);
        console.error('Push registration error:', error);
        reject(error);
      });
    });

    // Register for push notifications
    await PushNotifications.register();

    // Wait for the token
    const token = await tokenPromise;

    // Save the token to the user's profile using upsert pattern
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('Error saving push token:', error);
    } else {
      console.log('Push token saved successfully for user:', userId);
    }
  } catch (err) {
    console.error('Error registering push token:', err);
    // Don't throw - we don't want to block the signup flow
  }
};
