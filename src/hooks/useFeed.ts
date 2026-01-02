import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_icon: string;
  };
  supports_count: number;
  comments_count: number;
  user_has_supported: boolean;
}

export const useFeed = (currentUserId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());
  const [pendingSupports, setPendingSupports] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    
    // Fetch posts with profiles (profiles RLS already filters deleted_at IS NULL)
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        image_url,
        created_at,
        profiles!posts_user_id_fkey (
          username,
          avatar_icon,
          deleted_at
        )
      `)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      setLoading(false);
      return;
    }

    // Filter out posts from deleted users (deleted_at is not null)
    const activePostsData = postsData?.filter(post => {
      const profile = post.profiles as { username: string; avatar_icon: string; deleted_at: string | null } | null;
      return profile && profile.deleted_at === null;
    }) || [];

    // Fetch supports count for each post
    const postIds = activePostsData.map(p => p.id);
    
    if (postIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const { data: supportsData } = await supabase
      .from('post_supports')
      .select('post_id, user_id')
      .in('post_id', postIds);

    const { data: commentsData } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    // Fetch user's reported posts to hide them
    const { data: reportedData } = await supabase
      .from('reports')
      .select('post_id')
      .eq('reporter_id', currentUserId)
      .not('post_id', 'is', null);

    const reportedPostIds = new Set(reportedData?.map(r => r.post_id) || []);

    // Transform data
    const transformedPosts: Post[] = activePostsData
      .filter(post => !reportedPostIds.has(post.id))
      .map(post => {
        const supports = supportsData?.filter(s => s.post_id === post.id) || [];
        const comments = commentsData?.filter(c => c.post_id === post.id) || [];
        
        return {
          ...post,
          profiles: post.profiles as { username: string; avatar_icon: string },
          supports_count: supports.length,
          comments_count: comments.length,
          user_has_supported: supports.some(s => s.user_id === currentUserId),
        };
      });

    setPosts(transformedPosts);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId && !initialLoadDone) {
      setLoading(true);
      fetchPosts().finally(() => {
        setInitialLoadDone(true);
      });
    }
  }, [currentUserId, fetchPosts, initialLoadDone]);

  // Real-time subscription for posts, supports, and comments
  useEffect(() => {
    if (!currentUserId) return;

    // Clean up previous channel if exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`feed-realtime-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          console.log('New post detected, refreshing feed...');
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        () => {
          console.log('Post updated, refreshing feed...');
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        () => {
          console.log('Post deleted, refreshing feed...');
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_supports' },
        () => {
          console.log('Support changed, refreshing feed...');
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          console.log('Comment changed, refreshing feed...');
          fetchPosts();
        }
      )
      .subscribe((status) => {
        console.log('Feed realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to feed realtime updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId, fetchPosts]);

  const toggleSupport = async (postId: string) => {
    // Prevent multiple clicks while operation is pending
    if (pendingSupports.has(postId)) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Mark as pending
    setPendingSupports(prev => new Set([...prev, postId]));

    // Optimistic update
    const wasSupported = post.user_has_supported;
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            supports_count: wasSupported ? p.supports_count - 1 : p.supports_count + 1, 
            user_has_supported: !wasSupported 
          }
        : p
    ));

    try {
      if (wasSupported) {
        const { error } = await supabase
          .from('post_supports')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_supports')
          .insert({ post_id: postId, user_id: currentUserId });

        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              supports_count: wasSupported ? p.supports_count + 1 : p.supports_count - 1, 
              user_has_supported: wasSupported 
            }
          : p
      ));
      console.error('Error toggling support:', error);
    } finally {
      // Remove from pending
      setPendingSupports(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a publicação.',
        variant: 'destructive',
      });
    } else {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: 'Excluído',
        description: 'Publicação removida com sucesso.',
      });
    }
  };

  const hidePost = (postId: string) => {
    // Immediately hide the post from the feed (Level 1 - Suspension simulation)
    setPosts(prev => prev.filter(p => p.id !== postId));
    setHiddenPosts(prev => new Set([...prev, postId]));
  };

  return {
    posts,
    loading,
    fetchPosts,
    toggleSupport,
    deletePost,
    hidePost,
    pendingSupports,
  };
};
