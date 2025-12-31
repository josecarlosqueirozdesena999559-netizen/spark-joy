import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = (userId: string) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkOnboarding = async () => {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('feed_onboarding_seen')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking onboarding:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        // Create onboarding record and show modal
        await supabase
          .from('user_onboarding')
          .insert({ user_id: userId, feed_onboarding_seen: false });
        setShowOnboarding(true);
      } else if (!data.feed_onboarding_seen) {
        setShowOnboarding(true);
      }

      setLoading(false);
    };

    checkOnboarding();
  }, [userId]);

  const dismissOnboarding = async () => {
    setShowOnboarding(false);
    
    await supabase
      .from('user_onboarding')
      .update({ feed_onboarding_seen: true })
      .eq('user_id', userId);
  };

  return {
    showOnboarding,
    loading,
    dismissOnboarding,
  };
};
