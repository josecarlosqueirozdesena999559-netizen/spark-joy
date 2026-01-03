import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';
import { registerPushToken, cleanupPushNotifications } from '@/lib/pushNotifications';

/**
 * Hook to manage push notifications lifecycle.
 * Automatically registers for push when user is authenticated on native platforms.
 * Cleans up listeners on logout.
 */
export const usePushNotifications = () => {
  const { user } = useAuth();
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Register when user is authenticated and hasn't registered yet
    if (user?.id && !hasRegistered.current) {
      console.log('User authenticated, registering push notifications...');
      hasRegistered.current = true;
      registerPushToken();
    }

    // Cleanup when user logs out
    if (!user && hasRegistered.current) {
      console.log('User logged out, cleaning up push notifications...');
      hasRegistered.current = false;
      cleanupPushNotifications();
    }
  }, [user?.id]);

  return { registerPushToken };
};
