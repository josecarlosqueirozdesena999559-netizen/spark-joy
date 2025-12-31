import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeed } from '@/hooks/useFeed';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import FeedHeader from '@/components/feed/FeedHeader';
import FeedOnboarding from '@/components/feed/FeedOnboarding';
import CreatePostForm from '@/components/feed/CreatePostForm';
import PostCard from '@/components/feed/PostCard';
import EditPostDialog from '@/components/feed/EditPostDialog';
import ReportDialog from '@/components/feed/ReportDialog';
import BottomNav from '@/components/layout/BottomNav';

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = user?.id || '';
  
  const { profile } = useUserProfile(userId);
  const { showOnboarding, dismissOnboarding } = useOnboarding(userId);
  const { posts, loading, fetchPosts, toggleSupport, deletePost, hidePost } = useFeed(userId);
  
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [reportData, setReportData] = useState<{ postId: string; userId: string } | null>(null);

  const handleEdit = (post: { id: string; content: string }) => {
    setEditingPost(post);
  };

  const handleReport = (postId: string, reportedUserId: string) => {
    setReportData({ postId, userId: reportedUserId });
  };

  const handleReportSuccess = () => {
    if (reportData) {
      hidePost(reportData.postId);
    }
    setReportData(null);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta.',
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Onboarding Modal */}
      {showOnboarding && <FeedOnboarding onClose={dismissOnboarding} />}

      {/* Header */}
      <FeedHeader 
        avatarIcon={profile?.avatar_icon || 'heart'}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto px-4 py-4 pb-24">
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
                onReport={handleReport}
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

      {/* Report Dialog */}
      <ReportDialog
        open={!!reportData}
        onOpenChange={(open) => !open && setReportData(null)}
        postId={reportData?.postId}
        reportedUserId={reportData?.userId}
        reporterId={userId}
        onReportSuccess={handleReportSuccess}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
