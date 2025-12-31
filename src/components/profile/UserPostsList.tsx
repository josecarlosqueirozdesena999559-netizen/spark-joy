import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, MessageCircle, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EditPostDialog from '@/components/feed/EditPostDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  supports_count: number;
  comments_count: number;
}

interface UserPostsListProps {
  userId: string;
}

const UserPostsList: React.FC<UserPostsListProps> = ({ userId }) => {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchUserPosts = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('id, content, image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    const postIds = postsData?.map(p => p.id) || [];
    
    if (postIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const { data: supportsData } = await supabase
      .from('post_supports')
      .select('post_id')
      .in('post_id', postIds);

    const { data: commentsData } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const transformedPosts: UserPost[] = (postsData || []).map(post => ({
      ...post,
      supports_count: supportsData?.filter(s => s.post_id === post.id).length || 0,
      comments_count: commentsData?.filter(c => c.post_id === post.id).length || 0,
    }));

    setPosts(transformedPosts);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const handleDelete = async () => {
    if (!deletingPostId) return;
    
    setDeleting(true);
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', deletingPostId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a publicação.',
        variant: 'destructive',
      });
    } else {
      setPosts(prev => prev.filter(p => p.id !== deletingPostId));
      toast({
        title: 'Excluído',
        description: 'Publicação removida com sucesso.',
      });
    }
    
    setDeleting(false);
    setDeletingPostId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Você ainda não fez nenhuma publicação.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {posts.map(post => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.supports_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments_count}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setEditingPost({ id: post.id, content: post.content })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                    onClick={() => setDeletingPostId(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPost && (
        <EditPostDialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          postId={editingPost.id}
          initialContent={editingPost.content}
          onPostUpdated={fetchUserPosts}
        />
      )}

      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A publicação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserPostsList;
