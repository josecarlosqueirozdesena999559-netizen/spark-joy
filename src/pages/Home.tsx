import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useFeed } from '@/hooks/useFeed';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUserProfile } from '@/hooks/useUserProfile';
import FeedOnboarding from '@/components/feed/FeedOnboarding';
import CreatePostForm from '@/components/feed/CreatePostForm';
import PostCard from '@/components/feed/PostCard';
import EditPostDialog from '@/components/feed/EditPostDialog';
import BottomNav from '@/components/layout/BottomNav';

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

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || '';
  
  const { profile } = useUserProfile(userId);
  const { showOnboarding, dismissOnboarding } = useOnboarding(userId);
  const { posts, loading, fetchPosts, toggleSupport, deletePost, reportPost } = useFeed(userId);
  
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);

  const handleEdit = (post: { id: string; content: string }) => {
    setEditingPost(post);
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      {/* Onboarding Modal */}
      {showOnboarding && <FeedOnboarding onClose={dismissOnboarding} />}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
            <h1 className="text-xl font-bold text-foreground">PorElas</h1>
          </div>
          
          <button 
            onClick={() => navigate('/perfil')}
            className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-lg hover:ring-2 ring-primary transition-all"
          >
            {avatarIcons[profile?.avatar_icon || 'heart']}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Create Post */}
        <CreatePostForm
          userId={userId}
          userAvatar={profile?.avatar_icon || 'heart'}
          onPostCreated={fetchPosts}
        />

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Nenhuma publicação ainda</h3>
            <p className="text-muted-foreground text-sm">
              Seja a primeira a compartilhar sua história!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userId}
                onSupport={toggleSupport}
                onEdit={handleEdit}
                onDelete={deletePost}
                onReport={reportPost}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      {editingPost && (
        <EditPostDialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          postId={editingPost.id}
          initialContent={editingPost.content}
          onPostUpdated={fetchPosts}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
