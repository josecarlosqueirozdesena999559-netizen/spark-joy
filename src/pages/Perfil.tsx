import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Pencil, Shield, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/layout/BottomNav';
import DeleteAccountDialog from '@/components/profile/DeleteAccountDialog';
import EditAvatarDialog from '@/components/profile/EditAvatarDialog';
import UserPostsList from '@/components/profile/UserPostsList';

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

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, refetch } = useUserProfile(user?.id || '');
  const { stats, loading: statsLoading } = useProfileStats(user?.id || '');
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditAvatarDialog, setShowEditAvatarDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta.',
    });
    navigate('/auth');
  };

  const handleAccountDeleted = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-secondary/30 safe-area-inset pb-24">
      {/* Header */}
      <header className="gradient-primary pb-20 pt-4">
        <div className="flex items-center gap-3 px-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary-foreground">Meu Perfil</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-16 space-y-4">
        {/* Profile Card */}
        <Card className="shadow-md">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-5xl mx-auto mb-4 ring-4 ring-background -mt-16 shadow-lg">
                {avatarIcons[profile?.avatar_icon || 'heart']}
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-3 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => setShowEditAvatarDialog(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              @{profile?.username || 'usuária'}
            </h2>

            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : stats.postsCount}
                </p>
                <p className="text-xs text-muted-foreground">Postagens feitas</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : stats.supportsReceived}
                </p>
                <p className="text-xs text-muted-foreground">Apoios recebidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Posts */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Minhas Publicações</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <UserPostsList userId={user?.id || ''} />
          </CardContent>
        </Card>

        {/* Security & Data Section */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança e Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start rounded-xl h-12 text-foreground hover:bg-secondary"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair da conta
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full justify-start rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Excluir minha conta
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
          <p className="font-medium">PorElas v1.0.0</p>
          <a 
            href="/termos" 
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Termos de Uso
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </main>

      <BottomNav />

      {/* Dialogs */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onAccountDeleted={handleAccountDeleted}
      />

      {user && (
        <EditAvatarDialog
          open={showEditAvatarDialog}
          onOpenChange={setShowEditAvatarDialog}
          currentAvatar={profile?.avatar_icon || 'heart'}
          userId={user.id}
          onAvatarUpdated={refetch}
        />
      )}
    </div>
  );
};

export default Perfil;
