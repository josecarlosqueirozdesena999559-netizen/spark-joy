import React, { useState, useEffect } from 'react';
import { Send, MoreHorizontal, Pencil, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_icon: string;
  };
}

interface PostCommentsProps {
  postId: string;
  currentUserId: string;
}

const avatarIcons: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  flower: '🌸',
  butterfly: '🦋',
  rainbow: '🌈',
  moon: '🌙',
  sun: '☀️',
  leaf: '🍃',
};

const PostComments: React.FC<PostCommentsProps> = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { toast } = useToast();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        profiles!comments_user_id_fkey (
          username,
          avatar_icon
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    setComments(data?.map(c => ({
      ...c,
      profiles: c.profiles as { username: string; avatar_icon: string }
    })) || []);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário.',
        variant: 'destructive',
      });
    } else {
      setNewComment('');
      fetchComments();
    }
    setLoading(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível editar o comentário.',
        variant: 'destructive',
      });
    } else {
      setEditingId(null);
      setEditContent('');
      fetchComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comentário.',
        variant: 'destructive',
      });
    } else {
      fetchComments();
    }
  };

  const handleReport = async (commentId: string) => {
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: currentUserId,
        comment_id: commentId,
        reason: 'Conteúdo inapropriado',
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a denúncia.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Denúncia enviada',
        description: 'Obrigada por ajudar a manter nossa comunidade segura.',
      });
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4">
      {/* Comment List */}
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm shrink-0">
            {avatarIcons[comment.profiles.avatar_icon] || '❤️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm text-foreground truncate">
                  @{comment.profiles.username}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {comment.user_id === currentUserId ? (
                    <>
                      <DropdownMenuItem onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(comment.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => handleReport(comment.id)}>
                      <Flag className="w-4 h-4 mr-2" />
                      Denunciar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {editingId === comment.id ? (
              <div className="flex gap-2 mt-1">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-8 text-sm rounded-full"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleEdit(comment.id)}
                  className="h-8 rounded-full"
                >
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  className="h-8 rounded-full"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
            )}
          </div>
        </div>
      ))}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 rounded-full h-10"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !newComment.trim()}
          className="rounded-full h-10 w-10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default PostComments;
