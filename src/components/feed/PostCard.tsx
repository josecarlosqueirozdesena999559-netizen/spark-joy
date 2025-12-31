import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PostComments from './PostComments';

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

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onSupport: (postId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
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

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onSupport,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [showComments, setShowComments] = useState(false);
  const isOwner = post.user_id === currentUserId;

  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-lg">
              {avatarIcons[post.profiles.avatar_icon] || '❤️'}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                @{post.profiles.username}
              </p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(post.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onReport(post.id)}>
                  <Flag className="w-4 h-4 mr-2" />
                  Denunciar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-foreground mb-3 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {/* Image */}
        {post.image_url && (
          <div className="rounded-2xl overflow-hidden mb-3 -mx-1">
            <img
              src={post.image_url}
              alt="Imagem do post"
              className="w-full h-auto object-cover max-h-80"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant={post.user_has_supported ? "default" : "ghost"}
            size="sm"
            className="rounded-full gap-2 h-9"
            onClick={() => onSupport(post.id)}
          >
            <Heart 
              className="w-4 h-4" 
              fill={post.user_has_supported ? "currentColor" : "none"} 
            />
            <span>{post.supports_count}</span>
            <span className="hidden sm:inline">Apoiar</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-2 h-9"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count}</span>
            <span className="hidden sm:inline">Responder</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <PostComments 
            postId={post.id} 
            currentUserId={currentUserId}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
