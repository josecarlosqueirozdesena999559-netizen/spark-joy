import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUsernameCheck = (username: string) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      try {
        const { data, error } = await supabase
          .rpc('check_username_available', { username_to_check: username });
        
        if (error) throw error;
        setIsAvailable(data as boolean);
      } catch (error) {
        console.error('Error checking username:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [username]);

  return { isAvailable, isChecking };
};