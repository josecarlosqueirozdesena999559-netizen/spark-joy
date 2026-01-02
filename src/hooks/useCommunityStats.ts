import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CommunityStats {
  usersOnline: number;
  activeAlerts: number;
  citiesCovered: number;
  donationProgress: number;
  donationGoal: number;
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats>({
    usersOnline: 0,
    activeAlerts: 0,
    citiesCovered: 0,
    donationProgress: 0,
    donationGoal: 10000,
  });
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchStats = async () => {
    try {
      // Count active users (profiles created in the last 30 days as proxy for active users)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Count active alerts (reports in pending status from last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: alertsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Count posts as a proxy for community activity/cities
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Simulated donation progress (in a real app, this would come from a payments table)
      const donationProgress = Math.min(7500, (postsCount || 0) * 50);

      setStats({
        usersOnline: usersCount || 0,
        activeAlerts: alertsCount || 0,
        citiesCovered: Math.min(150, Math.floor((usersCount || 0) / 10) + 50),
        donationProgress,
        donationGoal: 10000,
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up realtime subscriptions for live updates
    channelRef.current = supabase
      .channel('community-stats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
}
