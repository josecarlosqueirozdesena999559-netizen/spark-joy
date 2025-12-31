import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  postsCount: number;
  supportsReceived: number;
}

export const useProfileStats = (userId: string) => {
  const [stats, setStats] = useState<ProfileStats>({ postsCount: 0, supportsReceived: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      // Get user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setLoading(false);
        return;
      }

      const postsCount = postsData?.length || 0;
      const postIds = postsData?.map(p => p.id) || [];

      let supportsReceived = 0;
      
      if (postIds.length > 0) {
        const { data: supportsData, error: supportsError } = await supabase
          .from('post_supports')
          .select('id')
          .in('post_id', postIds);

        if (!supportsError) {
          supportsReceived = supportsData?.length || 0;
        }
      }

      setStats({ postsCount, supportsReceived });
      setLoading(false);
    };

    fetchStats();
  }, [userId]);

  return { stats, loading };
};
